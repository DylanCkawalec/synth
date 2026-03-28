import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { resolve, join } from 'path'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import OpenAI from 'openai'
import { db, predictionStore, summaryStore } from './db.ts'
import { simWallet } from './simWallet.ts'
import { generateRunNote, startAggregationWorker, startCompactionWorker } from './memory.ts'
import { kellyBinaryMarket, kellyClassical, kellyDrawdownAdjusted } from './kelly.ts'

config({ path: resolve(import.meta.dirname, '..', '..', '.env') })

const PORT       = parseInt(process.env.SERVER_PORT || '8420')
const HOST       = process.env.SERVER_HOST || '127.0.0.1'
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
const AUDIT_FILE = join(DATA_DIR, 'audit.jsonl')
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

// ── Prediction type (shared) ──────────────────────────────────────
interface Prediction {
  id: string; thesis: string; confidence: number; rationale: string
  invalidation: string; riskNote: string; status: string
  action: string; side: string; amountUsdc: number; orderType: string
  price: number | null; kellyFraction: number | null
  marketName: string; venue: string; tokenId: string; conditionId: string
  endsAt: string | null; yesPrice: number; noPrice: number
  query: string; model: string; walletId: string | null
  createdAt: string; resolvedAt: string | null; pnl: number | null
  wasCorrect: boolean | null; mode?: 'real' | 'sim'
}

function dbToPrediction(row: { snapshot_json: string; mode: string }): Prediction {
  return { ...JSON.parse(row.snapshot_json), mode: row.mode }
}

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

// ── Wallet Cache (auto-detected on startup) ───────────────────────
interface WalletInfo { wallet_id: string; name: string; chains: Record<string, { address: string }> }
let cachedWallets: WalletInfo[] = []
let defaultWalletId = ''

async function refreshWallets() {
  try {
    const wallets = await synth('/wallet') as WalletInfo[]
    cachedWallets = Array.isArray(wallets) ? wallets : []
    if (cachedWallets.length > 0 && !defaultWalletId) {
      defaultWalletId = cachedWallets[0].wallet_id
    }
    console.log(`  💳 ${cachedWallets.length} wallet(s) detected. Default: ${defaultWalletId || 'none'}`)
  } catch (e) { console.error('  ⚠ Wallet fetch failed:', e) }
}

function parseBalance(raw: unknown): { total: string; available: string; chains: Array<{ chainId: string; address: string; balances: Record<string, string> }> } {
  const arr = Array.isArray(raw) ? raw : []
  let total = 0
  const chains: Array<{ chainId: string; address: string; balances: Record<string, string> }> = []
  for (const c of arr) {
    const bal = c.balance || {}
    const chainTotal = Object.values(bal as Record<string, string>).reduce((s: number, v: string) => s + parseFloat(v || '0'), 0)
    total += chainTotal
    chains.push({ chainId: c.chain_id, address: c.address, balances: bal })
  }
  return { total: total.toFixed(3), available: total.toFixed(3), chains }
}

// ── OpenAI ────────────────────────────────────────────────────────
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null

const PRED_SYSTEM = `You are Synth, an expert prediction-market analyst. Return ONLY valid JSON:
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

interface DualPrediction {
  real: Prediction
  sim: Prediction
  diff: { balanceDelta: number; confidenceSame: boolean; actionSame: boolean; amountDelta: number }
  noteId: string
}

function buildPrediction(data: Record<string, unknown>, exec: Record<string, unknown>, top: Record<string, unknown>, query: string, walletId: string | null, mode: 'real' | 'sim'): Prediction {
  return {
    id: crypto.randomUUID().slice(0, 12),
    thesis: String(data.thesis || ''), confidence: Math.max(0, Math.min(1, Number(data.confidence) || 0)),
    rationale: String(data.rationale || ''), invalidation: String(data.invalidation || ''),
    riskNote: String(data.risk_note || ''), status: 'generated',
    action: String(exec.action || 'SKIP'), side: String(exec.side || ''), amountUsdc: Number(exec.amount_usdc) || 0,
    orderType: String(exec.order_type || 'MARKET'), price: exec.price != null ? Number(exec.price) : null,
    kellyFraction: exec.kelly_fraction != null ? Number(exec.kelly_fraction) : null,
    marketName: String(top.market_name || top.event_title || query),
    venue: String(top.venue || ''), tokenId: String(top.token_id || ''),
    conditionId: String(top.condition_id || ''), endsAt: (top.ends_at as string) || null,
    yesPrice: parseFloat(String(top.yes_price || top.left_price || 0)),
    noPrice: parseFloat(String(top.no_price || top.right_price || 0)),
    query, model: MODEL, walletId, mode,
    createdAt: new Date().toISOString(), resolvedAt: null, pnl: null, wasCorrect: null,
  }
}

async function generatePrediction(query: string, markets: unknown[], walletId?: string): Promise<Prediction> {
  if (!openai) throw new Error('OPENAI_API_KEY not set')
  const wid = walletId || defaultWalletId
  const mode: 'real' | 'sim' = SIM_MODE ? 'sim' : 'real'
  const bal = mode === 'sim' && wid ? simWallet.get(wid) : (wid ? parseBalance(await synth(`/wallet/${wid}/balance`).catch(() => [])) : { total: '0' })
  const userMsg = `Query: ${query}\nBalance: $${bal.total}\n\nMarkets:\n${JSON.stringify(markets.slice(0, 8), null, 2)}`
  const resp = await openai.chat.completions.create({
    model: MODEL, temperature: 0.4, max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: PRED_SYSTEM }, { role: 'user', content: userMsg }],
  })
  const data = JSON.parse(resp.choices[0].message.content || '{}')
  const exec = data.suggested_execution || {}
  const top = (markets[0] || {}) as Record<string, unknown>
  const pred = buildPrediction(data, exec, top, query, wid, mode)
  const now = new Date().toISOString()
  predictionStore.insert({ id: pred.id, wallet_id: wid || '', mode, snapshot_json: JSON.stringify(pred), created_at: now, model_version: MODEL })
  generateRunNote(pred.id, wid || '', mode, pred.thesis, pred.confidence, pred.action, pred.marketName, MODEL)
  audit('generate_prediction', 'predict', { query, id: pred.id, mode })
  return pred
}

async function generateDualPrediction(query: string, markets: unknown[], walletId?: string): Promise<DualPrediction> {
  if (!openai) throw new Error('OPENAI_API_KEY not set')

  const wid = walletId || defaultWalletId
  const realBal = wid ? parseBalance(await synth(`/wallet/${wid}/balance`).catch(() => [])) : { total: '0' }
  const simBal = wid ? simWallet.get(wid) : { total: '10000' }

  const userMsg = `Query: ${query}\nReal balance: $${realBal.total}\nSim balance: $${simBal.total}\n\nMarkets:\n${JSON.stringify(markets.slice(0, 8), null, 2)}`
  const resp = await openai.chat.completions.create({
    model: MODEL, temperature: 0.4, max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: PRED_SYSTEM }, { role: 'user', content: userMsg }],
  })
  const data = JSON.parse(resp.choices[0].message.content || '{}')
  const exec = data.suggested_execution || {}
  const top = (markets[0] || {}) as Record<string, unknown>

  const realPred = buildPrediction(data, exec, top, query, wid, 'real')
  const simExec = { ...exec, amount_usdc: Math.min(Number(exec.amount_usdc) || 0, parseFloat(simBal.total) * RISK.maxPerPredictionPct) }
  const simPred = buildPrediction(data, simExec, top, query, wid, 'sim')

  const now = new Date().toISOString()
  predictionStore.insert({ id: realPred.id, wallet_id: wid || '', mode: 'real', snapshot_json: JSON.stringify(realPred), created_at: now, model_version: MODEL })
  predictionStore.insert({ id: simPred.id, wallet_id: wid || '', mode: 'sim', snapshot_json: JSON.stringify(simPred), created_at: now, model_version: MODEL })

  const noteId = generateRunNote(realPred.id, wid || '', 'real', realPred.thesis, realPred.confidence, realPred.action, realPred.marketName, MODEL)

  audit('generate_prediction', 'predict', { query, realId: realPred.id, simId: simPred.id, mode: 'both' })

  return {
    real: realPred, sim: simPred,
    diff: {
      balanceDelta: parseFloat(realBal.total) - parseFloat(simBal.total),
      confidenceSame: realPred.confidence === simPred.confidence,
      actionSame: realPred.action === simPred.action,
      amountDelta: realPred.amountUsdc - simPred.amountUsdc,
    },
    noteId,
  }
}

// ── NemoClaw Agent Tools ──────────────────────────────────────────
const AGENT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  { type: 'function', function: { name: 'fetch_markets', description: 'Search and score prediction markets. Returns top markets ranked by urgency, liquidity, volume, dislocation.', parameters: { type: 'object', properties: { query: { type: 'string', description: 'Search query (empty for trending)' }, limit: { type: 'number', description: 'Max results (default 20)' } } } } },
  { type: 'function', function: { name: 'fetch_balance', description: 'Get current wallet balance across all chains.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'fetch_positions', description: 'Get open positions across all chains.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'generate_prediction', description: 'Run AI prediction engine on a market. Returns thesis, confidence, suggested action.', parameters: { type: 'object', properties: { market_name: { type: 'string', description: 'Market name or query to predict on' } }, required: ['market_name'] } } },
  { type: 'function', function: { name: 'switch_tab', description: 'Navigate the dashboard to a specific tab.', parameters: { type: 'object', properties: { tab: { type: 'string', enum: ['dashboard', 'markets', 'predictions', 'approvals', 'audit', 'settings'] } }, required: ['tab'] } } },
  { type: 'function', function: { name: 'highlight', description: 'Highlight a UI element with a gold glow to draw user attention. Auto-fades after 3 seconds.', parameters: { type: 'object', properties: { element: { type: 'string', description: 'Element ID: wallet-strip, next-best, ending-soon, recent-preds, positions, market-table, prediction-list, calendar' }, message: { type: 'string', description: 'Tooltip message to show on the highlight' } }, required: ['element'] } } },
  { type: 'function', function: { name: 'fetch_recommendations', description: 'Get personalized market recommendations from synthesis.trade based on account interests.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'fetch_news', description: 'Get recent prediction-market-related news for context and research.', parameters: { type: 'object', properties: { limit: { type: 'number', description: 'Number of articles (default 5)' } } } } },
]

const AGENT_SYSTEM = `You are NemoClaw, the AI prediction agent powering the Synth dashboard. You are calm, precise, and decisive. Short sentences. Always explain what you're doing.

## OODA Protocol

When asked for a prediction or starting a session:

1. **OBSERVE** — Call fetch_markets AND fetch_balance AND fetch_news simultaneously. Highlight the wallet-strip to show you're checking balance.
2. **ORIENT** — Analyze: which markets end soonest? Which have the most volume/liquidity? Cross-reference news. Call fetch_recommendations for personalized picks. Highlight the relevant UI panel.
3. **DECIDE** — Pick the single best near-term opportunity. Call generate_prediction on it. Explain your reasoning in 2-3 sentences.
4. **ACT** — Present the prediction clearly: **Market**, **Confidence %**, **Thesis** (1 sentence), **Action** (BUY/SELL/SKIP), **Amount**. Switch to the predictions tab. Ask: "Approve this prediction? (yes/no)"

## Rules
- Prioritize markets ending in < 60 minutes over all others
- Never suggest more than 10% of wallet balance on a single prediction
- If balance is < $1, say so and recommend depositing first
- Use highlight() on every step so the user sees where you're looking
- Use switch_tab() to guide the user through the flow
- When user says "yes", confirm the prediction is logged
- When user says "auto", run the OODA loop automatically every 90 seconds
- Keep responses under 150 words
- CRITICAL: After gathering data with tools, you MUST respond with a text summary. Do NOT end your turn with only tool calls. Always give the user a clear answer.`

async function runAgentTurn(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<{ messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]; commands: Array<{ type: string; payload: unknown }> }> {
  if (!openai) throw new Error('OPENAI_API_KEY not set')
  const commands: Array<{ type: string; payload: unknown }> = []

  const resp = await openai.chat.completions.create({
    model: MODEL, temperature: 0.3, max_tokens: 2000,
    tools: AGENT_TOOLS,
    messages: [{ role: 'system', content: AGENT_SYSTEM }, ...messages],
  })

  const choice = resp.choices[0]
  const out: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [...messages]

  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    out.push(choice.message)
    for (const tc of choice.message.tool_calls) {
      const args = JSON.parse(tc.function.arguments || '{}')
      let result: unknown
      try {
        switch (tc.function.name) {
          case 'fetch_markets': {
            const q = args.query || ''
            const path = q ? `/markets/search/${encodeURIComponent(q)}?limit=${args.limit || 20}` : `/markets?limit=${args.limit || 20}`
            const data = await synth(path) as unknown[]
            result = { markets: data.slice(0, 10).map((ev: Record<string, unknown>) => {
              const e = ev.event as Record<string, unknown> || {}
              return { title: e.title, venue: ev.venue, ends_at: e.ends_at, markets: ((ev.markets || []) as Record<string, unknown>[]).slice(0, 3).map(m => ({ name: m.name || m.question, yes: m.left_price, no: m.right_price, volume24h: m.volume24hr, liquidity: m.liquidity, ends_at: m.ends_at })) }
            })}
            commands.push({ type: 'tool', payload: { name: 'fetch_markets', query: q } })
            break
          }
          case 'fetch_balance': {
            const wid = defaultWalletId
            if (!wid) { result = { error: 'No wallet detected' }; break }
            result = parseBalance(await synth(`/wallet/${wid}/balance`))
            commands.push({ type: 'tool', payload: { name: 'fetch_balance' } })
            break
          }
          case 'fetch_positions': {
            const wid = defaultWalletId
            if (!wid) { result = { error: 'No wallet detected' }; break }
            result = await synth(`/wallet/${wid}/positions`)
            commands.push({ type: 'tool', payload: { name: 'fetch_positions' } })
            break
          }
          case 'generate_prediction': {
            const events = await synth(`/markets/search/${encodeURIComponent(args.market_name)}?limit=10`) as Array<{ event: { title: string; ends_at?: string }; venue?: string; markets: Array<Record<string, unknown>> }>
            const flat = events.flatMap(ev => ev.markets.map(m => ({ ...m, event_title: ev.event.title, venue: ev.venue, ends_at: m.ends_at || ev.event.ends_at })))
            const pred = await generatePrediction(args.market_name, flat, defaultWalletId || undefined)
            result = { id: pred.id, thesis: pred.thesis, confidence: pred.confidence, action: pred.action, side: pred.side, amount: pred.amountUsdc, market: pred.marketName }
            commands.push({ type: 'tool', payload: { name: 'generate_prediction', prediction: result } })
            break
          }
          case 'switch_tab':
            result = { switched: args.tab }
            commands.push({ type: 'switch_tab', payload: args.tab })
            break
          case 'highlight':
            result = { highlighted: args.element }
            commands.push({ type: 'highlight', payload: { element: args.element, message: args.message || '' } })
            break
          case 'fetch_recommendations': {
            const recs = await synth('/recommendations?limit=8') as unknown[]
            result = { recommendations: (Array.isArray(recs) ? recs : []).slice(0, 5).map((ev: Record<string, unknown>) => {
              const e = ev.event as Record<string, unknown> || {}
              return { title: e.title, venue: ev.venue, ends_at: e.ends_at }
            })}
            commands.push({ type: 'tool', payload: { name: 'fetch_recommendations' } })
            break
          }
          case 'fetch_news': {
            const news = await synth(`/news?limit=${args.limit || 5}`) as Array<{ news?: { title?: string; source?: string; description?: string } }>
            result = { articles: (Array.isArray(news) ? news : []).slice(0, 5).map(n => ({ title: n.news?.title, source: n.news?.source })) }
            commands.push({ type: 'tool', payload: { name: 'fetch_news' } })
            break
          }
          default:
            result = { error: `Unknown tool: ${tc.function.name}` }
        }
      } catch (e) { result = { error: String(e) } }

      out.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) })
    }

    for (let round = 0; round < 4; round++) {
      const followUp = await openai.chat.completions.create({
        model: MODEL, temperature: 0.3, max_tokens: 2000,
        tools: AGENT_TOOLS,
        messages: [{ role: 'system', content: AGENT_SYSTEM }, ...out],
      })
      const msg = followUp.choices[0].message
      out.push(msg)

      if (!msg.tool_calls || msg.tool_calls.length === 0) break

      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments || '{}')
        let result: unknown
        try {
          switch (tc.function.name) {
            case 'fetch_markets': {
              const q = args.query || ''
              const path = q ? `/markets/search/${encodeURIComponent(q)}?limit=${args.limit || 20}` : `/markets?limit=${args.limit || 20}`
              const data = await synth(path) as unknown[]
              result = { markets: data.slice(0, 5).map((ev: Record<string, unknown>) => { const e = ev.event as Record<string, unknown> || {}; return { title: e.title, venue: ev.venue, ends_at: e.ends_at } }) }
              commands.push({ type: 'tool', payload: { name: 'fetch_markets', query: q } }); break
            }
            case 'fetch_balance': {
              const wid = defaultWalletId; if (!wid) { result = { error: 'No wallet' }; break }
              result = parseBalance(await synth(`/wallet/${wid}/balance`))
              commands.push({ type: 'tool', payload: { name: 'fetch_balance' } }); break
            }
            case 'fetch_positions': {
              const wid = defaultWalletId; if (!wid) { result = { error: 'No wallet' }; break }
              result = await synth(`/wallet/${wid}/positions`)
              commands.push({ type: 'tool', payload: { name: 'fetch_positions' } }); break
            }
            case 'generate_prediction': {
              const events = await synth(`/markets/search/${encodeURIComponent(args.market_name)}?limit=10`) as Array<{ event: { title: string; ends_at?: string }; venue?: string; markets: Array<Record<string, unknown>> }>
              const flat = events.flatMap(ev => ev.markets.map(m => ({ ...m, event_title: ev.event.title, venue: ev.venue, ends_at: m.ends_at || ev.event.ends_at })))
              const pred = await generatePrediction(args.market_name, flat, defaultWalletId || undefined)
              result = { id: pred.id, thesis: pred.thesis, confidence: pred.confidence, action: pred.action, side: pred.side, amount: pred.amountUsdc, market: pred.marketName }
              commands.push({ type: 'tool', payload: { name: 'generate_prediction', prediction: result } }); break
            }
            case 'fetch_recommendations': {
              const recs = await synth('/recommendations?limit=5') as unknown[]
              result = { recommendations: (Array.isArray(recs) ? recs : []).slice(0, 5).map((ev: Record<string, unknown>) => ({ title: (ev.event as Record<string, unknown>)?.title, venue: ev.venue })) }
              commands.push({ type: 'tool', payload: { name: 'fetch_recommendations' } }); break
            }
            case 'fetch_news': {
              const news = await synth(`/news?limit=${args.limit || 5}`) as Array<{ news?: { title?: string; source?: string } }>
              result = { articles: (Array.isArray(news) ? news : []).slice(0, 5).map(n => ({ title: n.news?.title, source: n.news?.source })) }
              commands.push({ type: 'tool', payload: { name: 'fetch_news' } }); break
            }
            case 'switch_tab': result = { switched: args.tab }; commands.push({ type: 'switch_tab', payload: args.tab }); break
            case 'highlight': result = { highlighted: args.element }; commands.push({ type: 'highlight', payload: { element: args.element, message: args.message || '' } }); break
            default: result = { error: `Unknown tool: ${tc.function.name}` }
          }
        } catch (e) { result = { error: String(e) } }
        out.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) })
      }
    }
  } else {
    out.push(choice.message)
  }

  return { messages: out, commands }
}

// ── Express App ───────────────────────────────────────────────────
const app = express()
app.use(cors())
app.use(express.json())

// Auth verification — checks if the synthesis.trade API key is valid
app.get('/api/auth/verify', async (_req, res) => {
  try {
    const result = await synth('/account/session') as { authenticated: boolean }
    res.json({ authenticated: true, walletId: defaultWalletId, walletName: cachedWallets[0]?.name || '', simulation: SIM_MODE })
  } catch { res.json({ authenticated: false }) }
})

app.get('/api/health', (_req, res) => {
  let predCount = 0; try { predCount = predictionStore.listAll(1).length } catch {/**/}
  res.json({ status: 'ok', version: '1.0.0', simulation: SIM_MODE, approvalRequired: REQUIRE_APPROVAL, aiAvailable: !!openai, predictions: predCount, defaultWallet: defaultWalletId, authenticated: !!SECRET_KEY })
})

app.get('/api/config', (_req, res) => {
  res.json({ simulation: SIM_MODE, confidenceThreshold: CONF_THRESH, requireApproval: REQUIRE_APPROVAL, model: MODEL, risk: RISK })
})

// Wallets -- correct API: GET /wallet
app.get('/api/wallets', async (_req, res) => {
  try {
    await refreshWallets()
    res.json({ wallets: cachedWallets, defaultWalletId })
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Deposit address — must be before shorter /api/wallet/:id/* routes
app.get('/api/wallet/:walletId/deposit/:chainId/:chain', async (req, res) => {
  try {
    const { walletId, chainId, chain } = req.params
    const result = await synth(`/wallet/${chainId}/${walletId}/deposit/${chain}`)
    res.json(result)
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Withdrawal request
app.post('/api/wallet/:walletId/withdraw', async (req, res) => {
  try {
    const { chain, token, amount, address } = req.body
    if (!chain || !token || !amount || !address) return res.status(400).json({ error: 'chain, token, amount, and address are required' })
    audit('withdraw_request', 'wallet', { walletId: req.params.walletId, chain, token, amount, address })
    const result = await synth(`/wallet/pol/${req.params.walletId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ chain, token, amount, address }),
    })
    res.json({ success: true, result })
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Balance -- mode-aware: ?mode=sim returns sim wallet, ?mode=real (default) returns synthesis.trade
app.get('/api/wallet/:id/balance', async (req, res) => {
  try {
    const mode = String(req.query.mode || (SIM_MODE ? 'sim' : 'real'))
    if (mode === 'sim') {
      simWallet.ensureExists(req.params.id)
      return res.json(simWallet.get(req.params.id))
    }
    const raw = await synth(`/wallet/${req.params.id}/balance`)
    res.json(parseBalance(raw))
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Positions -- correct API: GET /wallet/{wallet_id}/positions
app.get('/api/wallet/:id/positions', async (req, res) => {
  try { res.json(await synth(`/wallet/${req.params.id}/positions`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// PnL -- correct API: GET /wallet/{wallet_id}/pnl
app.get('/api/wallet/:id/pnl', async (req, res) => {
  try {
    const raw = await synth(`/wallet/${req.params.id}/pnl`) as Array<{ total: string; realized: string; unrealized: string }>
    const latest = Array.isArray(raw) && raw.length > 0 ? raw[raw.length - 1] : { total: '0', realized: '0', unrealized: '0' }
    res.json({ total_pnl: latest.total || '0', realized_pnl: latest.realized || '0', unrealized_pnl: latest.unrealized || '0' })
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Orders
app.get('/api/wallet/:id/orders', async (req, res) => {
  try { res.json(await synth(`/wallet/${req.params.id}/orders`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Markets -- multi-source aggregation with event-level deduplication
app.get('/api/markets', async (req, res) => {
  try {
    const { query, venue, limit } = req.query
    if (query) {
      return res.json(await synth(`/markets/search/${encodeURIComponent(String(query))}?limit=${limit || 20}`))
    }
    const n = Math.min(parseInt(String(limit) || '30') || 30, 50)
    const [trending, kalshi, recs] = await Promise.all([
      synth(`/markets?limit=${Math.ceil(n * 0.5)}${venue ? `&venue=${venue}` : ''}`).catch(() => []),
      venue === 'polymarket' ? Promise.resolve([]) : synth(`/kalshi/markets?limit=${Math.ceil(n * 0.3)}`).catch(() => []),
      synth(`/recommendations?limit=${Math.ceil(n * 0.3)}`).catch(() => []),
    ])
    const all = [...(Array.isArray(trending) ? trending : []), ...(Array.isArray(kalshi) ? kalshi : []), ...(Array.isArray(recs) ? recs : [])]
    const seen = new Map<string, unknown>()
    for (const ev of all) {
      const e = (ev as Record<string, unknown>).event as Record<string, unknown> | undefined
      const slug = String(e?.slug || e?.title || '')
      if (slug && !seen.has(slug)) seen.set(slug, ev)
    }
    res.json([...seen.values()].slice(0, n))
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Dual-mode prediction pipeline
app.post('/api/predict', async (req, res) => {
  try {
    const { query, walletId, mode } = req.body
    if (!query) return res.status(400).json({ error: 'query required' })
    const events = await synth(`/markets/search/${encodeURIComponent(query)}?limit=10`) as Array<{ event: { title: string; ends_at?: string }; venue?: string; markets: Array<Record<string, unknown>> }>
    const flat = events.flatMap(ev => ev.markets.map(m => ({ ...m, event_title: ev.event.title, venue: ev.venue, ends_at: m.ends_at || ev.event.ends_at })))
    if (mode === 'both' || !mode) {
      res.json(await generateDualPrediction(query, flat, walletId || defaultWalletId))
    } else {
      res.json(await generatePrediction(query, flat, walletId || defaultWalletId))
    }
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Legacy generate endpoint (convenience alias)
app.post('/api/predictions/generate', async (req, res) => {
  try {
    const { query, walletId } = req.body
    if (!query) return res.status(400).json({ error: 'query required' })
    const events = await synth(`/markets/search/${encodeURIComponent(query)}?limit=10`) as Array<{ event: { title: string; ends_at?: string }; venue?: string; markets: Array<Record<string, unknown>> }>
    const flat = events.flatMap(ev => ev.markets.map(m => ({ ...m, event_title: ev.event.title, venue: ev.venue, ends_at: m.ends_at || ev.event.ends_at })))
    res.json(await generatePrediction(query, flat, walletId || defaultWalletId))
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Predictions list -- mode-aware: ?mode=real|sim|both (default: both)
app.get('/api/predictions', (_req, res) => {
  try {
    const limit = Math.max(1, parseInt(String(_req.query.limit || '50')) || 50)
    const mode = String(_req.query.mode || 'both')
    const rows = mode === 'both' ? predictionStore.listAll(limit) : predictionStore.listByMode(mode, limit)
    res.json(rows.map(dbToPrediction))
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

app.get('/api/predictions/:id', (req, res) => {
  const row = predictionStore.getById(req.params.id)
  if (!row) return res.status(404).json({ error: 'not found' })
  res.json(dbToPrediction(row))
})

app.post('/api/predictions/:id/resolve', (req, res) => {
  const { wasCorrect, pnl: pnlVal } = req.body
  const row = predictionStore.getById(req.params.id)
  if (!row) return res.status(404).json({ error: 'not found' })
  const pred = JSON.parse(row.snapshot_json)
  pred.wasCorrect = wasCorrect; pred.pnl = pnlVal ?? null; pred.status = 'resolved'; pred.resolvedAt = new Date().toISOString()
  db.prepare('UPDATE predictions SET snapshot_json = ? WHERE id = ?').run(JSON.stringify(pred), req.params.id)
  audit('resolve_prediction', 'predict', { id: req.params.id, wasCorrect })
  res.json(pred)
})

// Delete prediction
app.delete('/api/predictions/:id', (req, res) => {
  try {
    const { id } = req.params
    db.prepare('DELETE FROM predictions WHERE id = ?').run(id)
    audit('delete_prediction', 'predict', { id })
    res.json({ deleted: true, id })
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Notes / summaries
app.get('/api/notes', (_req, res) => {
  const { tag, period, limit } = _req.query
  const n = parseInt(String(limit) || '50')
  if (tag) return res.json(summaryStore.getByTag(String(tag), n))
  if (period) return res.json(summaryStore.listByPeriod(String(period), n))
  res.json(summaryStore.listRecent(n))
})

// Approvals
app.get('/api/approvals', (_req, res) => res.json(pendingActions.filter(a => a.status === 'pending')))

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

// Audit
app.get('/api/audit', (_req, res) => {
  if (!existsSync(AUDIT_FILE)) return res.json([])
  const lines = readFileSync(AUDIT_FILE, 'utf-8').trim().split('\n').filter(Boolean)
  const limit = parseInt(String(_req.query.limit) || '100')
  res.json(lines.slice(-limit).reverse().map(l => JSON.parse(l)))
})

// Recommendations (personalized)
app.get('/api/recommendations', async (_req, res) => {
  try { res.json(await synth('/recommendations?limit=10')) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// News feed
app.get('/api/news', async (req, res) => {
  try { res.json(await synth(`/news?limit=${req.query.limit || 10}`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})


// Kelly Criterion — unified sizing endpoint
app.post('/api/kelly', (req, res) => {
  const { win_prob, market_price, odds, bankroll_usdc, drawdown_pct, max_drawdown_pct, method } = req.body
  try {
    if (method === 'classical' && odds) {
      res.json(kellyClassical(win_prob, odds, bankroll_usdc || 0))
    } else if (method === 'drawdown' && drawdown_pct != null) {
      res.json(kellyDrawdownAdjusted(win_prob, market_price, drawdown_pct, max_drawdown_pct || 20, bankroll_usdc || 0))
    } else {
      res.json(kellyBinaryMarket(win_prob, market_price, bankroll_usdc || 0))
    }
  } catch (e) { res.status(400).json({ error: String(e) }) }
})

// NemoClaw Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' })
    const result = await runAgentTurn(messages)
    let content = ''
    for (let i = result.messages.length - 1; i >= 0; i--) {
      const msg = result.messages[i]
      if (typeof msg === 'object' && 'role' in msg && msg.role === 'assistant' && typeof msg.content === 'string' && msg.content && !msg.content.startsWith('{')) {
        content = msg.content; break
      }
    }
    if (!content) {
      for (let i = result.messages.length - 1; i >= 0; i--) {
        const msg = result.messages[i]
        if (typeof msg === 'object' && 'role' in msg && msg.role === 'assistant' && typeof msg.content === 'string' && msg.content) {
          content = msg.content; break
        }
      }
    }
    res.json({ reply: content || 'Analysis complete. Check the highlighted panels.', commands: result.commands, messageCount: result.messages.length })
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Serve frontend
const distDir = resolve(import.meta.dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('/{*path}', (_req, res) => { res.sendFile(join(distDir, 'index.html')) })
}

// Start
refreshWallets().then(() => {
  if (defaultWalletId) simWallet.ensureExists(defaultWalletId, cachedWallets[0]?.name)
  const predCount = predictionStore.listAll(1).length
  startAggregationWorker(openai, MODEL)
  startCompactionWorker()
  app.listen(PORT, HOST, () => {
    console.log(`\n  ⚡ Synth server running at http://127.0.0.1:${PORT}`)
    console.log(`  📊 ${SIM_MODE ? 'SIMULATION' : 'LIVE'} mode | AI: ${openai ? '✓' : '✗'} | DB predictions: ${predCount}`)
    console.log(`  💰 Sim wallet: $${defaultWalletId ? simWallet.getTotal(defaultWalletId) : 0}\n`)
  })
})
