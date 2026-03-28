import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { resolve, join } from 'path'
import { readFileSync, appendFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import OpenAI from 'openai'

config({ path: resolve(import.meta.dirname, '..', '..', '.env') })

const PORT       = parseInt(process.env.SERVER_PORT || '8420')
const SYNTH_API  = process.env.BASE_URL || 'https://synthesis.trade/api/v1'
const SECRET_KEY = process.env.SECRET_KEY_SYNTH || ''
const OPENAI_KEY = process.env.OPENAI_API_KEY || ''
const MODEL      = process.env.OPENAI_MODEL || 'gpt-4o'
const SIM_MODE   = process.env.SIMULATION_MODE !== 'false'
const CONF_THRESH = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.55')
const REQUIRE_APPROVAL = process.env.REQUIRE_APPROVAL !== 'false'

const RISK = {
  maxPositionUsdc:    parseFloat(process.env.MAX_POSITION_USDC || '1000'),
  maxSingleOrderUsdc: parseFloat(process.env.MAX_SINGLE_ORDER_USDC || '100'),
  maxDailyLossUsdc:   parseFloat(process.env.MAX_DAILY_LOSS_USDC || '200'),
  maxOpenPositions:   parseInt(process.env.MAX_OPEN_POSITIONS || '20'),
  maxPerPredictionPct: 0.10,
  maxTotalUtilizationPct: 0.50,
}

const DATA_DIR = resolve(import.meta.dirname, '..', '..', 'data')
const PRED_FILE = join(DATA_DIR, 'predictions.jsonl')
const AUDIT_FILE = join(DATA_DIR, 'audit.jsonl')
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

// ── Prediction Store ──────────────────────────────────────────────
interface Prediction {
  id: string; thesis: string; confidence: number; rationale: string
  invalidation: string; riskNote: string; status: string
  action: string; side: string; amountUsdc: number; orderType: string
  price: number | null; kellyFraction: number | null
  marketName: string; venue: string; tokenId: string; conditionId: string
  endsAt: string | null; yesPrice: number; noPrice: number
  query: string; model: string; walletId: string | null
  createdAt: string; resolvedAt: string | null; pnl: number | null
  wasCorrect: boolean | null
}

function loadPredictions(): Prediction[] {
  if (!existsSync(PRED_FILE)) return []
  return readFileSync(PRED_FILE, 'utf-8').trim().split('\n')
    .filter(Boolean).map(line => JSON.parse(line))
}

function savePrediction(p: Prediction) {
  appendFileSync(PRED_FILE, JSON.stringify(p) + '\n')
}

function updatePrediction(id: string, patch: Partial<Prediction>) {
  const all = loadPredictions()
  const idx = all.findIndex(p => p.id === id)
  if (idx === -1) return null
  Object.assign(all[idx], patch)
  writeFileSync(PRED_FILE, all.map(p => JSON.stringify(p)).join('\n') + '\n')
  return all[idx]
}

let predictions = loadPredictions()

// ── Approval Store ────────────────────────────────────────────────
interface PendingAction {
  id: string; type: string; params: Record<string, unknown>
  predictionId: string | null; createdAt: string; status: string
}
const pendingActions: PendingAction[] = []

// ── Audit ─────────────────────────────────────────────────────────
function audit(action: string, category: string, params: unknown, success = true) {
  const entry = { timestamp: new Date().toISOString(), action, category, params, success, mode: SIM_MODE ? 'simulation' : 'live' }
  appendFileSync(AUDIT_FILE, JSON.stringify(entry) + '\n')
}

// ── Synthesis.trade API Client ────────────────────────────────────
async function synth(path: string, opts: RequestInit = {}): Promise<unknown> {
  const url = `${SYNTH_API}${path}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (SECRET_KEY) headers['X-API-KEY'] = SECRET_KEY
  const res = await fetch(url, { ...opts, headers: { ...headers, ...(opts.headers as Record<string, string> || {}) } })
  const json = await res.json() as { success?: boolean; response?: unknown }
  if (json.success === false) throw new Error(JSON.stringify(json))
  return json.response ?? json
}

// ── OpenAI Prediction Engine ──────────────────────────────────────
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null

const SYSTEM_PROMPT = `You are Synth, an expert prediction-market analyst. Return ONLY valid JSON:
{
  "thesis": "<string>", "confidence": <0-1>, "rationale": "<string>",
  "invalidation": "<string>", "risk_note": "<string>",
  "suggested_execution": {
    "action": "BUY|SELL|HOLD|SKIP", "side": "BUY|SELL|",
    "amount_usdc": <number>, "order_type": "MARKET|LIMIT",
    "price": <number|null>, "kelly_fraction": <number|null>
  }
}
Rules: Ground thesis in data. Confidence 0.7+ = strong. State invalidation. Note liquidity/expiry risks. Use Kelly when possible. SKIP if insufficient data.`

async function generatePrediction(query: string, markets: unknown[], walletId?: string): Promise<Prediction> {
  if (!openai) throw new Error('OPENAI_API_KEY not set')
  const userMsg = `Query: ${query}\n\nMarkets:\n${JSON.stringify(markets.slice(0, 8), null, 2)}`
  const resp = await openai.chat.completions.create({
    model: MODEL, temperature: 0.4, max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userMsg }],
  })
  const data = JSON.parse(resp.choices[0].message.content || '{}')
  const exec = data.suggested_execution || {}
  const top = (markets[0] || {}) as Record<string, unknown>
  const pred: Prediction = {
    id: crypto.randomUUID().slice(0, 12),
    thesis: data.thesis || '', confidence: Math.max(0, Math.min(1, data.confidence || 0)),
    rationale: data.rationale || '', invalidation: data.invalidation || '',
    riskNote: data.risk_note || '', status: 'generated',
    action: exec.action || 'SKIP', side: exec.side || '', amountUsdc: exec.amount_usdc || 0,
    orderType: exec.order_type || 'MARKET', price: exec.price ?? null,
    kellyFraction: exec.kelly_fraction ?? null,
    marketName: String(top.market_name || top.event_title || query),
    venue: String(top.venue || ''), tokenId: String(top.token_id || ''),
    conditionId: String(top.condition_id || ''), endsAt: (top.ends_at as string) || null,
    yesPrice: parseFloat(String(top.yes_price || top.left_price || 0)),
    noPrice: parseFloat(String(top.no_price || top.right_price || 0)),
    query, model: MODEL, walletId: walletId || null,
    createdAt: new Date().toISOString(), resolvedAt: null, pnl: null, wasCorrect: null,
  }
  savePrediction(pred)
  predictions = loadPredictions()
  audit('generate_prediction', 'predict', { query, id: pred.id })
  return pred
}

// ── Express App ───────────────────────────────────────────────────
const app = express()
app.use(cors())
app.use(express.json())

// Health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok', version: '1.0.0', simulation: SIM_MODE,
    approvalRequired: REQUIRE_APPROVAL, aiAvailable: !!openai,
    predictions: predictions.length,
  })
})

// Config
app.get('/api/config', (_req, res) => {
  res.json({ simulation: SIM_MODE, confidenceThreshold: CONF_THRESH, requireApproval: REQUIRE_APPROVAL, model: MODEL, risk: RISK })
})

// Markets — proxy to synthesis.trade
app.get('/api/markets', async (req, res) => {
  try {
    const { query, venue, limit } = req.query
    let path = query ? `/markets/search/${encodeURIComponent(String(query))}` : '/markets'
    const params = new URLSearchParams()
    if (venue) params.set('venue', String(venue))
    if (limit) params.set('limit', String(limit))
    const qs = params.toString()
    if (qs) path += `?${qs}`
    const data = await synth(path)
    res.json(data)
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Wallet balance
app.get('/api/wallet/:id/balance', async (req, res) => {
  try { res.json(await synth(`/wallet/pol/${req.params.id}/balance`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Positions
app.get('/api/wallet/:id/positions', async (req, res) => {
  try { res.json(await synth(`/wallet/pol/${req.params.id}/positions`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// PnL
app.get('/api/wallet/:id/pnl', async (req, res) => {
  try { res.json(await synth(`/wallet/pol/${req.params.id}/pnl`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Orders
app.get('/api/wallet/:id/orders', async (req, res) => {
  try { res.json(await synth(`/wallet/pol/${req.params.id}/orders`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Wallets
app.get('/api/wallets', async (_req, res) => {
  try {
    const pol = await synth('/wallet/pol').catch(() => [])
    const sol = await synth('/wallet/sol').catch(() => [])
    res.json({ polygon: pol, solana: sol })
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Predictions — generate
app.post('/api/predictions/generate', async (req, res) => {
  try {
    const { query, walletId } = req.body
    if (!query) return res.status(400).json({ error: 'query required' })
    const events = await synth(`/markets/search/${encodeURIComponent(query)}?limit=10`) as Array<{ event: { title: string; ends_at?: string }; venue?: string; markets: Array<Record<string, unknown>> }>
    const flat = events.flatMap(ev => ev.markets.map(m => ({ ...m, event_title: ev.event.title, venue: ev.venue, ends_at: m.ends_at || ev.event.ends_at })))
    const pred = await generatePrediction(query, flat, walletId)
    res.json(pred)
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Predictions — list
app.get('/api/predictions', (_req, res) => {
  const limit = parseInt(String(_req.query.limit) || '50')
  res.json(predictions.slice(-limit).reverse())
})

// Predictions — get by id
app.get('/api/predictions/:id', (req, res) => {
  const p = predictions.find(x => x.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'not found' })
  res.json(p)
})

// Predictions — resolve (mark as correct/incorrect)
app.post('/api/predictions/:id/resolve', (req, res) => {
  const { wasCorrect, pnl } = req.body
  const updated = updatePrediction(req.params.id, {
    wasCorrect, pnl: pnl ?? null, status: 'resolved', resolvedAt: new Date().toISOString(),
  })
  if (!updated) return res.status(404).json({ error: 'not found' })
  predictions = loadPredictions()
  audit('resolve_prediction', 'predict', { id: req.params.id, wasCorrect })
  res.json(updated)
})

// Approvals
app.get('/api/approvals', (_req, res) => {
  res.json(pendingActions.filter(a => a.status === 'pending'))
})

app.post('/api/approvals/:id/approve', (req, res) => {
  const a = pendingActions.find(x => x.id === req.params.id)
  if (!a) return res.status(404).json({ error: 'not found' })
  a.status = 'approved'
  audit('approve', 'approve', { id: a.id })
  res.json(a)
})

app.post('/api/approvals/:id/reject', (req, res) => {
  const a = pendingActions.find(x => x.id === req.params.id)
  if (!a) return res.status(404).json({ error: 'not found' })
  a.status = 'rejected'
  audit('reject', 'approve', { id: a.id, reason: req.body.reason })
  res.json(a)
})

// Audit log
app.get('/api/audit', (_req, res) => {
  if (!existsSync(AUDIT_FILE)) return res.json([])
  const lines = readFileSync(AUDIT_FILE, 'utf-8').trim().split('\n').filter(Boolean)
  const limit = parseInt(String(_req.query.limit) || '100')
  res.json(lines.slice(-limit).reverse().map(l => JSON.parse(l)))
})

// Serve frontend in production
const distDir = resolve(import.meta.dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('/{*path}', (_req, res) => { res.sendFile(join(distDir, 'index.html')) })
}

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ⚡ Synth server running at http://127.0.0.1:${PORT}`)
  console.log(`  📊 ${SIM_MODE ? 'SIMULATION' : 'LIVE'} mode | AI: ${openai ? '✓' : '✗'} | Predictions: ${predictions.length}\n`)
})
