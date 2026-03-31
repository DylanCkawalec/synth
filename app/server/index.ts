import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { resolve, join } from 'path'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { spawn as spawnProcess } from 'child_process'
import OpenAI from 'openai'
import { db, predictionStore, summaryStore, approvalStore } from './db.ts'
import { simWallet } from './simWallet.ts'

// ── Date helpers ──────────────────────────────────────────────────
function localDateStr(iso?: string): string {
  const d = iso ? new Date(iso) : new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function dateLabel(iso: string): 'today' | 'yesterday' | 'this_week' | 'older' {
  const now = new Date(); const d = new Date(iso)
  const today = localDateStr(); const predDay = localDateStr(iso)
  if (predDay === today) return 'today'
  const diff = (now.getTime() - d.getTime()) / 864e5
  if (diff < 2) return 'yesterday'
  if (diff < 7) return 'this_week'
  return 'older'
}
import { generateRunNote, startAggregationWorker, startCompactionWorker } from './memory.ts'
import { kellyBinaryMarket, kellyClassical, kellyDrawdownAdjusted } from './kelly.ts'

config({ path: resolve(import.meta.dirname, '..', '..', '.env') })

const PORT       = parseInt(process.env.SERVER_PORT || '8420')
const HOST       = process.env.SERVER_HOST || '127.0.0.1'
const SYNTH_API  = process.env.BASE_URL || 'https://synthesis.trade/api/v1'
const SECRET_KEY = process.env.SECRET_KEY_SYNTH || ''
const OPENAI_KEY = process.env.OPENAI_API_KEY || ''
let   activeModel = process.env.OPENAI_MODEL || 'gpt-4o'
const SIM_MODE   = process.env.SIMULATION_MODE !== 'false'
const CONF_THRESH = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.55')
const REQUIRE_APPROVAL = process.env.REQUIRE_APPROVAL !== 'false'

const AVAILABLE_MODELS = ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini', 'o3', 'gpt-4.5-preview'] as const
const OPSEEQ_FALLBACK_MODELS = ['nvidia/llama-3.3-nemotron-super-49b-v1', 'nvidia/nemotron-3-super-120b-a12b'] as const
let horizonDays = parseInt(process.env.MARKET_HORIZON_DAYS || '7')

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
  lean: 'YES' | 'NO' | null; leanReason: string | null
  minEntryUsdc: number | null; maxAffordableUsdc: number | null
  yesTokenId: string | null; noTokenId: string | null
  marketName: string; venue: string; tokenId: string; conditionId: string
  endsAt: string | null; yesPrice: number; noPrice: number
  query: string; model: string; walletId: string | null
  createdAt: string; resolvedAt: string | null; pnl: number | null
  wasCorrect: boolean | null; mode?: 'real' | 'sim'
  resolvedOutcome?: 'YES' | 'NO' | null
  resolutionSource?: string | null
  reflection?: string | null
  updatedAt?: string | null
  orderId: string | null; orderStatus: string | null
}

function dbToPrediction(row: { snapshot_json: string; mode: string }): Prediction {
  return { ...JSON.parse(row.snapshot_json), mode: row.mode }
}

function normalizeMarketKey(s: string | null | undefined): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function parseSynthErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  const raw = String(err.message || '').trim()
  try {
    const parsed = JSON.parse(raw) as { response?: unknown; error?: unknown }
    if (parsed.response != null) return String(parsed.response)
    if (parsed.error != null) return String(parsed.error)
  } catch {/**/}
  return raw
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isPartialFillError(msg: string): boolean {
  return /fully filled|partial fill|insufficient liquidity|could not be fully filled/i.test(msg)
}

function isMinimumSizeError(msg: string): boolean {
  return /minimum size|min_size|INVALID_ORDER_MIN_SIZE|lower than the minimum|does not meet minimum/i.test(msg)
}

const EXCHANGE_MIN_USDC = 1.00

function clampUsdAmount(v: number): string {
  return Math.max(EXCHANGE_MIN_USDC, Number(v.toFixed(2))).toFixed(2)
}

function buildReflection(pred: Prediction, resolvedOutcome: 'YES' | 'NO', yesFinal: number | null, noFinal: number | null): string {
  const confPct = Math.round((pred.confidence || 0) * 100)
  const lean = pred.lean || 'YES'
  const wasRight = lean === resolvedOutcome
  const entry = lean === 'YES' ? pred.yesPrice : pred.noPrice
  const entryCents = Number.isFinite(entry) ? Math.round(entry * 100) : null
  const finalInfo = yesFinal != null && noFinal != null
    ? `Final settled prices were YES ${Math.round(yesFinal * 100)}c / NO ${Math.round(noFinal * 100)}c.`
    : ''
  const rationaleSnippet = String(pred.rationale || '').split('.').map(s => s.trim()).filter(Boolean)[0] || 'the original thesis'
  const invalidationSnippet = String(pred.invalidation || '').split('.').map(s => s.trim()).filter(Boolean)[0] || 'the invalidation conditions'

  if (wasRight) {
    return `AI leaned ${lean} at ${confPct}% confidence${entryCents != null ? ` with an entry near ${entryCents}c` : ''}, and protocol resolved ${resolvedOutcome}. ${finalInfo} Reflection: the call aligned with ${rationaleSnippet.toLowerCase()}; keep this setup but continue monitoring ${invalidationSnippet.toLowerCase()}.`
  }
  return `AI leaned ${lean} at ${confPct}% confidence${entryCents != null ? ` with an entry near ${entryCents}c` : ''}, but protocol resolved ${resolvedOutcome}. ${finalInfo} Reflection: the thesis underweighted ${invalidationSnippet.toLowerCase()}; next time reduce size when confidence is high but invalidation risk is still active.`
}

function computeResolvedPnl(pred: Prediction, resolvedOutcome: 'YES' | 'NO'): number | null {
  const stake = Number(pred.amountUsdc || 0)
  if (!Number.isFinite(stake) || stake <= 0) return null
  const entryPxRaw = pred.lean === 'YES' ? pred.yesPrice : pred.noPrice
  const entryPx = Number(entryPxRaw)
  if (!Number.isFinite(entryPx) || entryPx <= 0) return null
  const shares = stake / entryPx
  const payout = pred.lean === resolvedOutcome ? shares : 0
  return +((payout - stake).toFixed(2))
}

// Approvals are now persisted in SQLite via approvalStore

// ── Trace + Audit ─────────────────────────────────────────────────
function traceId(): string { return `tr_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 6)}` }

interface TraceEvent {
  traceId: string
  timestamp: string
  stage: string
  action: string
  mode: 'live' | 'simulation'
  route: 'opseeq' | 'direct' | 'fallback'
  model?: string
  predictionId?: string
  approvalId?: string
  orderId?: string
  success: boolean
  detail?: Record<string, unknown>
  latencyMs?: number
}

const recentTraces: TraceEvent[] = []
const MAX_TRACES = 200

function emitTrace(evt: Omit<TraceEvent, 'timestamp'>): void {
  const full: TraceEvent = { ...evt, timestamp: new Date().toISOString() }
  recentTraces.push(full)
  if (recentTraces.length > MAX_TRACES) recentTraces.splice(0, recentTraces.length - MAX_TRACES)
  appendFileSync(AUDIT_FILE, JSON.stringify(full) + '\n')
}

function currentRoute(): 'opseeq' | 'direct' | 'fallback' {
  if (opseeqAvailable && opseeqConsecutiveFailures < OPSEEQ_CIRCUIT_THRESHOLD) return 'opseeq'
  if (openai) return opseeqConsecutiveFailures >= OPSEEQ_CIRCUIT_THRESHOLD ? 'fallback' : 'direct'
  return 'direct'
}

function audit(action: string, category: string, params: unknown, success = true, effectiveMode?: 'real' | 'sim') {
  const mode = effectiveMode ? (effectiveMode === 'sim' ? 'simulation' : 'live') : (SIM_MODE ? 'simulation' : 'live')
  const entry = { timestamp: new Date().toISOString(), action, category, params, success, mode, route: currentRoute() }
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

const STABLECOIN_KEYS = new Set(['USDC', 'USDC.e', 'USDT', 'USDT.e', 'DAI', 'BUSD', 'USDbC'])

function parseBalance(raw: unknown): { total: string; available: string; chains: Array<{ chainId: string; address: string; balances: Record<string, string> }> } {
  const arr = Array.isArray(raw) ? raw : []
  let total = 0
  const chains: Array<{ chainId: string; address: string; balances: Record<string, string> }> = []
  for (const c of arr) {
    const bal = c.balance || {}
    for (const [key, val] of Object.entries(bal as Record<string, string>)) {
      if (STABLECOIN_KEYS.has(key)) total += parseFloat(val || '0')
    }
    chains.push({ chainId: c.chain_id, address: c.address, balances: bal })
  }
  return { total: total.toFixed(3), available: total.toFixed(3), chains }
}

// ── OpenAI ────────────────────────────────────────────────────────
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY, baseURL: 'https://api.openai.com/v1' }) : null
let opseeqModels: string[] = [...OPSEEQ_FALLBACK_MODELS]
let opseeqConsecutiveFailures = 0
const OPSEEQ_CIRCUIT_THRESHOLD = 3

function getOpseeqClient(): OpenAI | null {
  const url = process.env.OPSEEQ_URL || 'http://127.0.0.1:9090'
  try {
    return new OpenAI({ baseURL: `${url}/v1`, apiKey: 'opseeq' })
  } catch { return null }
}

function getInferenceClient(): OpenAI {
  if (opseeqAvailable && opseeqConsecutiveFailures < OPSEEQ_CIRCUIT_THRESHOLD) {
    const client = getOpseeqClient()
    if (client) return client
  }
  if (openai) return openai
  throw new Error('No inference backend available — set OPENAI_API_KEY or start Opseeq')
}

function getDirectOpenAIClient(): OpenAI | null {
  return openai
}

// Balance cache: avoids hitting upstream 3x in the same prediction+order flow
const balanceCache = new Map<string, { bal: ReturnType<typeof parseBalance>; at: number }>()
const BALANCE_CACHE_TTL = 5000

async function getCachedBalance(wid: string, mode: 'real' | 'sim'): Promise<ReturnType<typeof parseBalance>> {
  if (mode === 'sim') return simWallet.get(wid) as ReturnType<typeof parseBalance>
  const key = `${wid}:${mode}`
  const cached = balanceCache.get(key)
  if (cached && Date.now() - cached.at < BALANCE_CACHE_TTL) return cached.bal
  const bal = parseBalance(await synth(`/wallet/${wid}/balance`).catch(() => []))
  balanceCache.set(key, { bal, at: Date.now() })
  return bal
}

function invalidateBalanceCache(wid: string) {
  for (const key of balanceCache.keys()) { if (key.startsWith(wid)) balanceCache.delete(key) }
}

function getAllAvailableModels(): string[] {
  const m = [...AVAILABLE_MODELS] as string[]
  if (opseeqAvailable) m.push(...opseeqModels)
  return [...new Set(m)]
}

function getEffectiveModel(preferred?: string): string {
  const requested = preferred || activeModel
  if (opseeqAvailable) {
    return requested.startsWith('nvidia/') ? requested : (process.env.OPSEEQ_MODEL || opseeqModels[0] || OPSEEQ_FALLBACK_MODELS[0])
  }
  return requested
}

function getEffectivePredictionModel(preferred?: string): string {
  return getEffectiveModel(preferred)
}

function getEffectiveAgentModel(): string {
  if (opseeqAvailable) return process.env.OPSEEQ_AGENT_MODEL || 'gpt-4.1-mini'
  return activeModel
}

const PRED_SYSTEM = `You are Synth, an expert prediction-market analyst with deep knowledge of current events, politics, sports, crypto, and finance. You use real market data (prices, volume, liquidity, expiry) to form sharp opinions.

Return ONLY valid JSON with this exact schema:
{
  "thesis": "<1-2 sentence directional thesis>",
  "confidence": <0.0-1.0>,
  "rationale": "<2-3 sentences grounding your view in data, news, fundamentals>",
  "invalidation": "<what would make this wrong>",
  "risk_note": "<liquidity, expiry, or volatility risks>",
  "lean": "YES|NO",
  "lean_reason": "<1 sentence: why YES or NO is more likely>",
  "suggested_execution": {
    "action": "BUY|SELL|HOLD",
    "side": "BUY",
    "amount_usdc": <number>,
    "order_type": "MARKET|LIMIT",
    "price": <number|null>,
    "kelly_fraction": <number|null>
  }
}

CRITICAL RULES:
- You MUST ALWAYS set "lean" to either "YES" or "NO". Never null. Even low confidence has a direction.
- You MUST ALWAYS set "lean_reason" explaining your directional view.
- "action" MUST be "BUY" in virtually all cases. You are a trader — always have a position. Only use "HOLD" if the market is at extreme pricing (>97%) AND already priced efficiently with zero edge.
- Even for "HOLD", you MUST set "amount_usdc" to at least the YES or NO price (the minimum entry cost). NEVER return amount_usdc as 0 or null.
- NEVER set action to "SKIP". You are a trader — always have a view and a position.
- "amount_usdc" MUST always be > 0. Proportional to confidence: confidence >= 0.7 → 5-10% of balance. 0.5-0.7 → 2-5%. < 0.5 → 1-2%. Minimum is always the lean price (e.g. if YES=$0.05, minimum bet is $0.05).
- Set "side" to "BUY" when going long the lean direction. The token_id determines YES vs NO.
- Use Kelly fraction when you have a clear probability estimate vs market price.
- Factor in time to resolution: markets ending sooner deserve more attention.
- Factor in liquidity: low liquidity markets need smaller sizes and LIMIT orders.`

interface DualPrediction {
  real: Prediction
  sim: Prediction
  diff: { balanceDelta: number; confidenceSame: boolean; actionSame: boolean; amountDelta: number }
  noteId: string
}

function buildPrediction(data: Record<string, unknown>, exec: Record<string, unknown>, top: Record<string, unknown>, query: string, walletId: string | null, mode: 'real' | 'sim', balanceUsdc: number): Prediction {
  const yesPrice = parseFloat(String(top.yes_price || top.left_price || 0))
  const noPrice = parseFloat(String(top.no_price || top.right_price || 0))
  const lean = String(data.lean || '').toUpperCase() as 'YES' | 'NO'
  const yesTokenId = String(top.left_token_id || top.yes_token_id || top.primary_token_id || top.token_id || '')
  const noTokenId = String(top.right_token_id || top.no_token_id || '')
  const selectedTokenId = lean === 'NO'
    ? (noTokenId || yesTokenId)
    : (yesTokenId || noTokenId)
  const leanPrice = lean === 'YES' ? yesPrice : noPrice
  const minEntry = leanPrice > 0 ? Math.max(0.10, leanPrice) : 1
  const maxAffordable = balanceUsdc * RISK.maxPerPredictionPct

  const confidence = Math.max(0, Math.min(1, Number(data.confidence) || 0))
  const kellyResult = leanPrice > 0 && confidence > 0
    ? kellyBinaryMarket(confidence, leanPrice, balanceUsdc)
    : null
  const kellyAmount = kellyResult?.bankrollFractionUsdc || 0

  const rawAmount = Number(exec.amount_usdc) || 0
  const safeMinBet = Math.max(minEntry, EXCHANGE_MIN_USDC)
  const kellyOrRaw = kellyAmount > safeMinBet ? kellyAmount : rawAmount
  const cappedAmount = Math.min(kellyOrRaw, maxAffordable, RISK.maxSingleOrderUsdc)
  const effectiveAmount = cappedAmount >= safeMinBet ? cappedAmount : Math.min(safeMinBet, maxAffordable > 0 ? maxAffordable : safeMinBet)

  return {
    id: crypto.randomUUID().slice(0, 12),
    thesis: String(data.thesis || ''), confidence,
    rationale: String(data.rationale || ''), invalidation: String(data.invalidation || ''),
    riskNote: String(data.risk_note || ''), status: 'generated',
    action: String(exec.action || 'BUY'), side: String(exec.side || 'BUY'), amountUsdc: +effectiveAmount.toFixed(2),
    orderType: String(exec.order_type || 'MARKET'), price: exec.price != null ? Number(exec.price) : null,
    kellyFraction: kellyResult?.fractionalKelly ?? (exec.kelly_fraction != null ? Number(exec.kelly_fraction) : null),
    lean: lean === 'YES' || lean === 'NO' ? lean : null,
    leanReason: data.lean_reason ? String(data.lean_reason) : null,
    minEntryUsdc: +minEntry.toFixed(2),
    maxAffordableUsdc: +maxAffordable.toFixed(2),
    yesTokenId: yesTokenId || null,
    noTokenId: noTokenId || null,
    marketName: String(top.market_name || top.event_title || query),
    venue: String(top.venue || ''), tokenId: selectedTokenId,
    conditionId: String(top.condition_id || ''), endsAt: (top.ends_at as string) || null,
    yesPrice, noPrice,
    query, model: activeModel, walletId, mode,
    createdAt: new Date().toISOString(), resolvedAt: null, pnl: null, wasCorrect: null,
    resolvedOutcome: null, resolutionSource: null, reflection: null, updatedAt: new Date().toISOString(),
    orderId: null, orderStatus: null,
  }
}

async function generatePrediction(query: string, markets: unknown[], walletId?: string, modelOverride?: string, modeOverride?: 'real' | 'sim'): Promise<Prediction> {
  const tId = traceId()
  const t0 = Date.now()
  const client = getInferenceClient()
  const model = getEffectivePredictionModel(modelOverride || activeModel)
  const wid = walletId || defaultWalletId
  const mode: 'real' | 'sim' = modeOverride || (SIM_MODE ? 'sim' : 'real')
  const route = currentRoute()
  emitTrace({ traceId: tId, stage: 'prediction_start', action: 'generate_prediction', mode: mode === 'sim' ? 'simulation' : 'live', route, model, success: true, detail: { query, marketCount: markets.length, balance: null } })
  const bal = wid ? await getCachedBalance(wid, mode) : { total: '0' } as ReturnType<typeof parseBalance>
  const balNum = parseFloat(bal.total) || 0

  const enrichedMarkets = markets.slice(0, 12).map((raw: unknown) => {
    const m = raw as Record<string, unknown>
    return {
      name: m.name || m.question || m.market_name || m.event_title,
      yes_price: m.left_price || m.yes_price,
      no_price: m.right_price || m.no_price,
      volume_24h: m.volume24hr || m.volume_24h,
      liquidity: m.liquidity,
      ends_at: m.ends_at,
      venue: m.venue,
      token_id: m.primary_token_id || m.left_token_id || m.token_id,
      condition_id: m.condition_id,
    }
  })

  const userMsg = `Query: "${query}"
Wallet balance: $${bal.total} ${mode.toUpperCase()}
Max per-prediction: $${(balNum * RISK.maxPerPredictionPct).toFixed(2)} (${RISK.maxPerPredictionPct * 100}% cap)
Current time: ${new Date().toISOString()}

Markets (sorted by relevance):
${JSON.stringify(enrichedMarkets, null, 2)}

Pick the single best market matching the query. Analyze it deeply. Always provide a YES or NO lean with reasoning.`

  const isNim = model.startsWith('nvidia/')
  const useJsonMode = !model.startsWith('o1') && !model.startsWith('o3') && !isNim
  let predModel = model

  let data: Record<string, unknown> | null = null
  const clients: [OpenAI, string, boolean][] = [
    [client, predModel, useJsonMode],
  ]
  const directClient = getDirectOpenAIClient()
  if (directClient && directClient !== client) {
    clients.push([directClient, 'gpt-4o', true])
  } else {
    clients.push([client, getEffectiveAgentModel(), true])
  }

  for (let attempt = 0; attempt < clients.length && !data; attempt++) {
    const [usedClient, usedModel, usedJsonMode] = clients[attempt]
    try {
      const resp = await usedClient.chat.completions.create({
        model: usedModel, temperature: 0.3, max_tokens: 2000,
        ...(usedJsonMode ? { response_format: { type: 'json_object' } } : {}),
        messages: [{ role: 'system', content: PRED_SYSTEM }, { role: 'user', content: userMsg }],
      })

      let raw = resp.choices[0].message.content || '{}'
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) raw = jsonMatch[0]

      const parsed = JSON.parse(raw) as Record<string, unknown>
      const lean = String(parsed.lean || '').toUpperCase()
      const conf = Number(parsed.confidence) || 0
      if ((lean !== 'YES' && lean !== 'NO') || conf <= 0) {
        if (attempt === 0) {
          console.log(`  ⚠ ${usedModel} returned weak prediction (lean=${lean}, conf=${conf}), retrying with direct fallback`)
          continue
        }
      }
      data = parsed
      predModel = usedModel
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (attempt === clients.length - 1) throw new Error(`Prediction engine failed after ${clients.length} attempts: ${msg}`)
      console.log(`  ⚠ ${usedModel} failed: ${msg}, retrying with direct fallback`)
      if (msg.includes('Connection error') || msg.includes('ECONNREFUSED')) opseeqConsecutiveFailures++
    }
  }

  const exec = data!.suggested_execution || {}
  const thesis = String(data!.thesis || '').toLowerCase()
  const matchedMarket = markets.find((raw: unknown) => {
    const m = raw as Record<string, unknown>
    const name = String(m.name || m.question || m.market_name || m.event_title || '').toLowerCase()
    return name && (thesis.includes(name.slice(0, 20)) || name.includes(thesis.slice(0, 20)))
  }) || markets[0]
  const top = (matchedMarket || {}) as Record<string, unknown>
  const pred = buildPrediction(data!, exec as Record<string, unknown>, top, query, wid, mode, balNum)
  pred.model = predModel

  // Dedup/shadow: if same market/token was already predicted today (same mode), overwrite it in place
  const today = localDateStr()
  const existingRows = db.prepare(
    'SELECT id, snapshot_json FROM predictions WHERE wallet_id = ? AND mode = ? AND created_at LIKE ? ORDER BY created_at DESC'
  ).all(wid || '', mode, `${today}%`) as Array<{ id: string; snapshot_json: string }>
  const targetKey = normalizeMarketKey(pred.marketName || pred.query)
  const existing = existingRows.find((row) => {
    try {
      const old = JSON.parse(row.snapshot_json) as Prediction
      const sameCondition = !!pred.conditionId && !!old.conditionId && pred.conditionId === old.conditionId
      const sameToken = !!pred.tokenId && !!old.tokenId && pred.tokenId === old.tokenId
      const sameMarket = normalizeMarketKey(old.marketName || old.query) === targetKey
      return sameCondition || sameToken || sameMarket
    } catch {
      return false
    }
  })

  const now = new Date().toISOString()
  if (existing) {
    const prev = JSON.parse(existing.snapshot_json) as Prediction
    const keepCommittedState = prev.status === 'committed' || prev.status === 'committed_live' || prev.status === 'committed_sim' || !!prev.orderId
    const merged: Prediction = {
      ...prev,
      ...pred,
      id: existing.id,
      createdAt: prev.createdAt || pred.createdAt,
      updatedAt: now,
      // Preserve outcome and execution state so re-predict shadows instead of duplicating cards.
      status: prev.status === 'resolved' ? 'resolved' : (keepCommittedState ? prev.status : pred.status),
      orderId: prev.orderId || pred.orderId,
      orderStatus: prev.orderStatus || pred.orderStatus,
      resolvedAt: prev.resolvedAt || pred.resolvedAt,
      wasCorrect: prev.wasCorrect ?? pred.wasCorrect,
      pnl: prev.pnl ?? pred.pnl,
      resolvedOutcome: prev.resolvedOutcome ?? pred.resolvedOutcome ?? null,
      resolutionSource: prev.resolutionSource ?? pred.resolutionSource ?? null,
      reflection: prev.reflection ?? pred.reflection ?? null,
    }
    pred.id = existing.id
    db.prepare('UPDATE predictions SET snapshot_json = ?, model_version = ? WHERE id = ?').run(JSON.stringify(merged), model, existing.id)
    generateRunNote(merged.id, wid || '', mode, merged.thesis, merged.confidence, merged.action, merged.marketName, model)
    audit('refresh_prediction', 'predict', { query, id: pred.id, mode, model, deduped: true })
    return merged
  }

  predictionStore.insert({ id: pred.id, wallet_id: wid || '', mode, snapshot_json: JSON.stringify(pred), created_at: now, model_version: model })
  generateRunNote(pred.id, wid || '', mode, pred.thesis, pred.confidence, pred.action, pred.marketName, model)
  audit('generate_prediction', 'predict', { query, id: pred.id, mode, model })
  emitTrace({ traceId: tId, stage: 'prediction_complete', action: 'generate_prediction', mode: mode === 'sim' ? 'simulation' : 'live', route, model: predModel, predictionId: pred.id, success: true, latencyMs: Date.now() - t0, detail: { lean: pred.lean, confidence: pred.confidence, amount: pred.amountUsdc, kelly: pred.kellyFraction, market: pred.marketName, tokenId: pred.tokenId?.slice(0, 20) } })
  return pred
}

async function generateSwarmPrediction(query: string, markets: unknown[], walletId?: string, modeOverride?: 'real' | 'sim'): Promise<Prediction> {
  const client = getInferenceClient()
  const wid = walletId || defaultWalletId
  const mode: 'real' | 'sim' = modeOverride || (SIM_MODE ? 'sim' : 'real')
  const bal = await getCachedBalance(wid || '', mode)
  const balNum = parseFloat(bal.total) || 0

  const [newsData, recsData] = await Promise.all([
    synth('/news?limit=6').catch(() => []),
    synth('/recommendations?limit=6').catch(() => []),
  ])

  const headlines = (Array.isArray(newsData) ? newsData : [])
    .map((n: unknown) => { const item = (n as Record<string, unknown>).news as Record<string, unknown> || n as Record<string, unknown>; return String(item.title || '') })
    .filter(Boolean).slice(0, 8)

  const enrichedMarkets = markets.slice(0, 12).map((raw: unknown) => {
    const m = raw as Record<string, unknown>
    return {
      name: m.name || m.question || m.market_name || m.event_title,
      yes_price: m.left_price || m.yes_price, no_price: m.right_price || m.no_price,
      volume_24h: m.volume24hr || m.volume_24h, liquidity: m.liquidity,
      ends_at: m.ends_at, venue: m.venue,
      token_id: m.primary_token_id || m.left_token_id || m.token_id, condition_id: m.condition_id,
    }
  })

  const contextBlock = headlines.length > 0
    ? `\n\nRecent headlines:\n${headlines.map(h => `- ${h}`).join('\n')}`
    : ''

  const userMsg = `Query: "${query}"
Wallet balance: $${bal.total} ${mode.toUpperCase()}
Max per-prediction: $${(balNum * RISK.maxPerPredictionPct).toFixed(2)} (${RISK.maxPerPredictionPct * 100}% cap)
Current time: ${new Date().toISOString()}${contextBlock}

Markets (sorted by relevance):
${JSON.stringify(enrichedMarkets, null, 2)}

Pick the single best market matching the query. Analyze it deeply. Always provide a YES or NO lean with reasoning.`

  const nimModel = getEffectivePredictionModel()
  const gptModel = 'gpt-4o'

  const runCall = async (model: string, useJson: boolean): Promise<Record<string, unknown> | null> => {
    try {
      const resp = await client.chat.completions.create({
        model, temperature: 0.3, max_tokens: 2000,
        ...(useJson ? { response_format: { type: 'json_object' as const } } : {}),
        messages: [{ role: 'system', content: PRED_SYSTEM }, { role: 'user', content: userMsg }],
      })
      let raw = resp.choices[0].message.content || '{}'
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) raw = jsonMatch[0]
      return JSON.parse(raw) as Record<string, unknown>
    } catch (e) {
      console.log(`  ⚠ Swarm call failed for ${model}: ${e instanceof Error ? e.message : e}`)
      return null
    }
  }

  const [nimResult, gptResult] = await Promise.all([
    runCall(nimModel, !nimModel.startsWith('nvidia/')),
    runCall(gptModel, true),
  ])

  let primary = gptResult || nimResult
  let secondary = nimResult || gptResult
  let swarmSources = [nimResult ? nimModel : null, gptResult ? gptModel : null].filter(Boolean) as string[]

  if (!primary) throw new Error('Both swarm models failed to produce a prediction')

  if (primary && secondary) {
    const pConf = Number(primary.confidence) || 0
    const sConf = Number(secondary.confidence) || 0
    const pLean = String(primary.lean || '').toUpperCase()
    const sLean = String(secondary.lean || '').toUpperCase()

    if (sConf > pConf) { const tmp = primary; primary = secondary; secondary = tmp }

    if (pLean === sLean && pLean) {
      primary.confidence = Math.min(1, (Number(primary.confidence) || 0) + 0.05)
      primary.rationale = `${String(primary.rationale || '')} [Swarm consensus: both ${swarmSources.join(' + ')} agree on ${pLean}]`
    } else if (pLean !== sLean && sLean) {
      primary.risk_note = `${String(primary.risk_note || '')} [Swarm divergence: ${swarmSources[0]} says ${pLean}, ${swarmSources[1]} says ${sLean}]`
    }
  }

  const exec = (primary.suggested_execution || {}) as Record<string, unknown>
  const top = (markets[0] || {}) as Record<string, unknown>
  const pred = buildPrediction(primary, exec, top, query, wid, mode, balNum)
  pred.model = swarmSources.join('+')

  const now = new Date().toISOString()
  predictionStore.insert({ id: pred.id, wallet_id: wid || '', mode, snapshot_json: JSON.stringify(pred), created_at: now, model_version: pred.model })
  generateRunNote(pred.id, wid || '', mode, pred.thesis, pred.confidence, pred.action, pred.marketName, pred.model)
  audit('generate_swarm_prediction', 'predict', { query, id: pred.id, mode, models: swarmSources })
  return pred
}

async function generateDualPrediction(query: string, markets: unknown[], walletId?: string): Promise<DualPrediction> {
  const client = getInferenceClient()
  const model = getEffectivePredictionModel(activeModel)

  const wid = walletId || defaultWalletId
  const realBal = wid ? parseBalance(await synth(`/wallet/${wid}/balance`).catch(() => [])) : { total: '0' }
  const simBal = wid ? simWallet.get(wid) : { total: '10000' }
  const realBalNum = parseFloat(realBal.total) || 0
  const simBalNum = parseFloat(simBal.total) || 0

  const enrichedMarkets = markets.slice(0, 12).map((raw: unknown) => {
    const m = raw as Record<string, unknown>
    return {
      name: m.name || m.question || m.market_name || m.event_title,
      yes_price: m.left_price || m.yes_price,
      no_price: m.right_price || m.no_price,
      volume_24h: m.volume24hr || m.volume_24h,
      liquidity: m.liquidity,
      ends_at: m.ends_at,
      venue: m.venue,
      token_id: m.primary_token_id || m.left_token_id || m.token_id,
      condition_id: m.condition_id,
    }
  })

  const userMsg = `Query: "${query}"
Real balance: $${realBal.total}
Sim balance: $${simBal.total}
Max per-prediction: $${(realBalNum * RISK.maxPerPredictionPct).toFixed(2)}
Current time: ${new Date().toISOString()}

Markets:\n${JSON.stringify(enrichedMarkets, null, 2)}

Pick the best market. Always provide a YES or NO lean with reasoning.`

  const dualIsNim = model.startsWith('nvidia/')
  const useJsonMode = !model.startsWith('o1') && !model.startsWith('o3') && !dualIsNim

  let dualData: Record<string, unknown> | null = null
  for (let attempt = 0; attempt < 2 && !dualData; attempt++) {
    const usedModel = attempt === 0 ? model : getEffectiveAgentModel()
    const usedJsonMode = attempt === 0 ? useJsonMode : true
    const resp = await client.chat.completions.create({
      model: usedModel, temperature: 0.3, max_tokens: 2000,
      ...(usedJsonMode ? { response_format: { type: 'json_object' } } : {}),
      messages: [{ role: 'system', content: PRED_SYSTEM }, { role: 'user', content: userMsg }],
    })

    let raw = resp.choices[0].message.content || '{}'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) raw = jsonMatch[0]

    try { dualData = JSON.parse(raw) }
    catch {
      if (attempt === 1) throw new Error('Dual prediction returned malformed JSON after retry')
      console.log(`  ⚠ ${usedModel} returned unparseable JSON for dual prediction, retrying with ${getEffectiveAgentModel()}`)
    }
  }

  const exec = dualData!.suggested_execution || {}
  const top = (markets[0] || {}) as Record<string, unknown>

  const realPred = buildPrediction(dualData!, exec as Record<string, unknown>, top, query, wid, 'real', realBalNum)
  const simExec = { ...exec, amount_usdc: Math.min(Number((exec as Record<string, unknown>).amount_usdc) || 0, simBalNum * RISK.maxPerPredictionPct) }
  const simPred = buildPrediction(dualData!, simExec as Record<string, unknown>, top, query, wid, 'sim', simBalNum)

  const now = new Date().toISOString()
  predictionStore.insert({ id: realPred.id, wallet_id: wid || '', mode: 'real', snapshot_json: JSON.stringify(realPred), created_at: now, model_version: model })
  predictionStore.insert({ id: simPred.id, wallet_id: wid || '', mode: 'sim', snapshot_json: JSON.stringify(simPred), created_at: now, model_version: model })

  const noteId = generateRunNote(realPred.id, wid || '', 'real', realPred.thesis, realPred.confidence, realPred.action, realPred.marketName, model)

  audit('generate_prediction', 'predict', { query, realId: realPred.id, simId: simPred.id, mode: 'both' })

  return {
    real: realPred, sim: simPred,
    diff: {
      balanceDelta: realBalNum - simBalNum,
      confidenceSame: realPred.confidence === simPred.confidence,
      actionSame: realPred.action === simPred.action,
      amountDelta: realPred.amountUsdc - simPred.amountUsdc,
    },
    noteId,
  }
}

type ProtocolResolution = {
  resolved: boolean
  winningSide: 'YES' | 'NO' | null
  yesFinal: number | null
  noFinal: number | null
  source: string
}

let resolutionSyncRunning = false
let lastResolutionSyncAt = 0

async function fetchProtocolResolution(pred: Prediction): Promise<ProtocolResolution | null> {
  const yesToken = pred.yesTokenId || pred.tokenId || ''
  const noToken = pred.noTokenId || ''
  const tokens = [...new Set([yesToken, noToken].filter(Boolean))]
  if (tokens.length === 0) return null

  const raw = await synth('/markets/prices', { method: 'POST', body: JSON.stringify(tokens) }) as Record<string, unknown>
  const prices = (raw.prices && typeof raw.prices === 'object' ? raw.prices : raw) as Record<string, unknown>
  const readPrice = (token: string): number | null => {
    if (!token) return null
    const n = Number(prices[token])
    return Number.isFinite(n) ? n : null
  }

  const yesFinal = readPrice(yesToken)
  let noFinal = readPrice(noToken)
  if (noFinal == null && yesFinal != null) noFinal = +(1 - yesFinal).toFixed(6)
  if (yesFinal == null || noFinal == null) {
    return { resolved: false, winningSide: null, yesFinal: yesFinal ?? null, noFinal: noFinal ?? null, source: 'protocol_prices_incomplete' }
  }

  const ended = !!pred.endsAt && new Date(pred.endsAt).getTime() <= Date.now()
  const fullySettled = (yesFinal >= 0.999 && noFinal <= 0.001) || (noFinal >= 0.999 && yesFinal <= 0.001)
  if (!ended || !fullySettled) {
    return { resolved: false, winningSide: null, yesFinal, noFinal, source: 'protocol_prices_live' }
  }

  return {
    resolved: true,
    winningSide: yesFinal > noFinal ? 'YES' : 'NO',
    yesFinal,
    noFinal,
    source: 'protocol_prices_settled',
  }
}

async function syncPredictionResolutions(limit = 250): Promise<{ checked: number; resolved: number }> {
  if (resolutionSyncRunning) return { checked: 0, resolved: 0 }
  resolutionSyncRunning = true
  try {
    const rows = predictionStore.listAll(limit)
    const cache = new Map<string, ProtocolResolution | null>()
    let checked = 0
    let resolved = 0

    for (const row of rows) {
      const pred = dbToPrediction(row)
      if (pred.status === 'resolved' || pred.wasCorrect !== null) continue
      if (!pred.endsAt || new Date(pred.endsAt).getTime() > Date.now()) continue

      checked++
      const key = `${pred.yesTokenId || pred.tokenId || ''}::${pred.noTokenId || ''}`
      if (!cache.has(key)) {
        try {
          cache.set(key, await fetchProtocolResolution(pred))
        } catch {
          cache.set(key, null)
        }
      }
      const outcome = cache.get(key)
      if (!outcome?.resolved || !outcome.winningSide || !pred.lean) continue

      pred.wasCorrect = pred.lean === outcome.winningSide
      pred.resolvedOutcome = outcome.winningSide
      pred.resolutionSource = outcome.source
      pred.resolvedAt = new Date().toISOString()
      pred.status = 'resolved'
      if (pred.pnl == null) pred.pnl = computeResolvedPnl(pred, outcome.winningSide)
      pred.reflection = pred.reflection || buildReflection(pred, outcome.winningSide, outcome.yesFinal, outcome.noFinal)
      pred.updatedAt = new Date().toISOString()
      if (pred.orderStatus && /PENDING|OPEN|ACTIVE/i.test(pred.orderStatus)) pred.orderStatus = 'RESOLVED'

      db.prepare('UPDATE predictions SET snapshot_json = ? WHERE id = ?').run(JSON.stringify(pred), pred.id)
      resolved++
    }

    lastResolutionSyncAt = Date.now()
    if (resolved > 0) audit('auto_resolve_predictions', 'predict', { checked, resolved })
    return { checked, resolved }
  } finally {
    resolutionSyncRunning = false
  }
}

async function maybeSyncPredictionResolutions(): Promise<void> {
  const stale = Date.now() - lastResolutionSyncAt > 45_000
  if (!stale) return
  try { await syncPredictionResolutions(250) } catch {/**/}
}

// ── Opseeq Agent Tools ───────────────────────────────────────────
const AGENT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  { type: 'function', function: { name: 'think', description: 'Record an internal reasoning step. Use this to structure your multi-stage analysis before acting. Shows the user your thinking process.', parameters: { type: 'object', properties: { stage: { type: 'string', enum: ['observe', 'orient', 'research', 'analyze', 'decide', 'act'], description: 'OODA stage' }, thought: { type: 'string', description: 'Your reasoning at this stage' } }, required: ['stage', 'thought'] } } },
  { type: 'function', function: { name: 'fetch_markets', description: 'Search and score prediction markets. Returns top markets ranked by urgency, liquidity, volume. Include days param to filter by horizon.', parameters: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' }, days: { type: 'number', description: 'Time horizon in days (default 7)' } } } } },
  { type: 'function', function: { name: 'fetch_balance', description: 'Get current wallet balance across all chains and the sim wallet balance.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'fetch_positions', description: 'Get all open positions with current mark prices and unrealized PnL.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'get_price_history', description: 'Get price history for a specific market token. Returns time-series of Yes price. Use to analyze trends, momentum, and entry timing.', parameters: { type: 'object', properties: { token_id: { type: 'string', description: 'The Polymarket token ID' }, fidelity: { type: 'number', description: 'Candle interval in minutes (1, 5, 60, 1440). Default 60.' } }, required: ['token_id'] } } },
  { type: 'function', function: { name: 'get_market_stats', description: 'Get volume, liquidity, open interest, and price statistics for a market token.', parameters: { type: 'object', properties: { token_id: { type: 'string' } }, required: ['token_id'] } } },
  { type: 'function', function: { name: 'research_topic', description: 'Fetch news and context about a specific prediction market topic. Use for fundamental research before generating a prediction.', parameters: { type: 'object', properties: { topic: { type: 'string', description: 'Topic to research (e.g. "Nicolai Hojgaard golf", "Bitcoin price 2026")' }, limit: { type: 'number', description: 'Number of articles (default 8)' } }, required: ['topic'] } } },
  { type: 'function', function: { name: 'generate_prediction', description: 'Run the full AI prediction engine on a market. Returns thesis, confidence, lean (YES/NO), sizing, token_id, and market data.', parameters: { type: 'object', properties: { market_name: { type: 'string' } }, required: ['market_name'] } } },
  { type: 'function', function: { name: 'place_order', description: 'Place an actual market order. Requires prediction_id and token_id from generate_prediction output. In LIVE mode with REQUIRE_APPROVAL, queues to approvals.', parameters: { type: 'object', properties: { prediction_id: { type: 'string' }, token_id: { type: 'string' }, side: { type: 'string', enum: ['BUY', 'SELL'] }, amount: { type: 'string', description: 'USDC amount' }, order_type: { type: 'string', enum: ['MARKET', 'LIMIT'] }, price: { type: 'string', description: 'Limit price 0-1 (only for LIMIT)' } }, required: ['prediction_id', 'token_id', 'side', 'amount'] } } },
  { type: 'function', function: { name: 'list_predictions', description: 'List predictions plus learning stats (accuracy, P&L, reflections) so Opseeq can learn from resolved outcomes.', parameters: { type: 'object', properties: { mode: { type: 'string', enum: ['both', 'sim', 'real'], description: 'Filter by mode' }, limit: { type: 'number' } } } } },
  { type: 'function', function: { name: 'delete_prediction', description: 'Delete a prediction by ID. Use to clean up stale or unwanted predictions.', parameters: { type: 'object', properties: { prediction_id: { type: 'string' } }, required: ['prediction_id'] } } },
  { type: 'function', function: { name: 'clean_stale_predictions', description: 'Remove predictions for markets that have ended or resolve more than N days out and are not committed. Returns count of cleaned predictions.', parameters: { type: 'object', properties: { max_days_out: { type: 'number', description: 'Max days until resolution to keep (default 30)' } } } } },
  { type: 'function', function: { name: 'fetch_approvals', description: 'List pending approvals so the user can execute or reject real-money orders.', parameters: { type: 'object', properties: { mode: { type: 'string', enum: ['real', 'sim'] } } } } },
  { type: 'function', function: { name: 'approve_order', description: 'Execute a queued approval by ID (real money if mode=real). Use only after explicit user YES.', parameters: { type: 'object', properties: { approval_id: { type: 'string' } }, required: ['approval_id'] } } },
  { type: 'function', function: { name: 'reject_order', description: 'Reject a queued approval by ID. Use when user says NO or cancel.', parameters: { type: 'object', properties: { approval_id: { type: 'string' }, reason: { type: 'string' } }, required: ['approval_id'] } } },
  { type: 'function', function: { name: 'switch_tab', description: 'Navigate the dashboard to a specific tab.', parameters: { type: 'object', properties: { tab: { type: 'string', enum: ['dashboard', 'markets', 'predictions', 'approvals', 'audit', 'settings'] } }, required: ['tab'] } } },
  { type: 'function', function: { name: 'highlight', description: 'Highlight a UI element with an action style. selection=pink, await=orange, execute=green.', parameters: { type: 'object', properties: { element: { type: 'string' }, message: { type: 'string' }, tone: { type: 'string', enum: ['selection', 'await', 'execute'] }, action: { type: 'string', enum: ['hover', 'click'] } }, required: ['element'] } } },
  { type: 'function', function: { name: 'fetch_recommendations', description: 'Get personalized market recommendations from synthesis.trade.', parameters: { type: 'object', properties: {} } } },
]

function buildAgentSystem(requestMode?: 'real' | 'sim'): string {
  const isLive = requestMode === 'real' || (!requestMode && !SIM_MODE)
  const wid = defaultWalletId || 'none'
  return `You are Opseeq, a sharp prediction-market advisor guiding users through real trades. You are conversational, decisive, and action-oriented. Every message you send must move the user one step closer to a committed position.

MODE: ${isLive ? 'LIVE — real money at stake' : 'SIMULATION — practice money'}
Wallet: ${wid}
Share prices are 0.01–0.99. A YES share at $0.78 means 78% implied probability. If YES wins, payout is $1/share.

## YOUR CONVERSATION FLOW

You guide the user through a multi-turn trade. Each turn advances to the next step. Never skip steps. Never leave the user without a clear next action.

### Turn 1 — DISCOVER (when user asks for a bet)
1. Call think({stage:"observe",...}) then fetch_markets + fetch_balance
2. Call think({stage:"orient",...}) then pick the best market and explain WHY in 2 sentences
3. Present the pick clearly:
   - Market name, venue, time to close
   - YES price / NO price (as probabilities)
   - 24h volume and liquidity
4. End with: **"I like [YES/NO] here. Want me to run a deep analysis? Just say 'go'."**

### Turn 2 — ANALYZE (when user says go, yes, analyze, etc.)
1. Call think({stage:"research",...}) then get_price_history + get_market_stats
2. Call think({stage:"analyze",...}) — synthesize price trend + fundamentals
3. Call think({stage:"decide",...}) then generate_prediction
4. Present the recommendation:
   - **Direction:** YES or NO with 1-sentence thesis
   - **Entry:** share price and implied probability
   - **Confidence:** X% | **Edge:** +X% over market
   - **Suggested wager:** $X (Y% of your $Z balance)
5. End with: **"Ready to place $X on [YES/NO]? Say 'yes' or tell me a different amount."**

### Turn 3 — COMMIT (when user says yes, $amount, do it, commit, place, etc.)
1. Call think({stage:"act",...})
2. IMMEDIATELY call place_order with the prediction_id, token_id, side, and amount from the previous generate_prediction result
   - If user specified an amount like "$5", use "5"
   - If user just said "yes", use the suggested amount
   - amount MUST be a positive number string, NEVER "0"
3. After place_order returns:
   - **SIM mode:** Say "Done! Order placed: [orderId]. Check the Predictions tab." Call switch_tab("predictions") and highlight("prediction-list",...)
   - **LIVE mode (queued to approvals):** Say "Order queued for your approval." Then:
     a. Call switch_tab("approvals")
     b. Call fetch_approvals to get the approval_id
     c. Call highlight("approvals-list", "Your order is here", "await", "hover")
     d. End with: **"Your live order is queued. Click the green Execute button above, or type 'execute' here to confirm."**

### Turn 4 — EXECUTE (LIVE only — when user says execute, confirm, yes after queuing)
1. Call fetch_approvals to get the pending approval_id
2. Call approve_order(approval_id)
3. Call fetch_balance to get updated balance
4. Say: "Executed! Order filled. Your balance is now $X." Then call switch_tab("dashboard") and highlight("wallet-strip", "Balance updated", "execute", "hover")
5. End with: **"Want to find the next opportunity?"**

### CANCEL flow (when user says no, cancel, reject)
1. If there is a pending approval: call reject_order(approval_id, "User cancelled")
2. Say: "Cancelled. No money moved." Then: **"Want to look at a different market?"**

## RECOGNITION RULES — detect user intent aggressively

These ALL mean "confirm and place the order":
- "yes", "yeah", "yep", "do it", "place it", "commit", "bet", "go ahead", "let's go", "send it", "place $X", "$X", any number like "5" or "10"

These ALL mean "execute the queued live order":
- "execute", "confirm", "approve", "yes" (when there is a pending approval), "do it"

These ALL mean "cancel":
- "no", "cancel", "reject", "nevermind", "nah", "pass"

These mean "start over with a new search":
- "next", "different", "another", "find me", "what else"

## IMPORTANT BEHAVIORAL RULES

1. NEVER end a message without a clear next-step prompt for the user
2. NEVER present data without telling the user what to do with it
3. When the user confirms, ACT IMMEDIATELY — call place_order in the same turn, do not ask again
4. After placing a LIVE order, ALWAYS switch to approvals tab and highlight the execute button
5. Keep messages concise — max 100 words for recommendations, max 50 words for confirmations
6. Always state the mode (SIM/LIVE) in your recommendation
7. If balance < $1: say so clearly and suggest minting (SIM) or depositing (LIVE)
8. Use think() at every stage transition — the user sees your reasoning live
9. Use highlight() to guide the user's eyes to the right UI element
10. Finish the current trade before suggesting a new one
11. CRITICAL: Your token_id and prediction_id come from generate_prediction output. Always use them.
12. CRITICAL: amount in place_order must be a positive string like "5" — never "0" or empty`
}

// Tool call has a stable shape at runtime; narrow it once here to avoid
// repeated casts throughout the execution loop.
interface ToolCall { id: string; function: { name: string; arguments: string } }

function asToolCall(tc: unknown): ToolCall {
  return tc as ToolCall
}

function ensureThinkStage(
  commands: Array<{ type: string; payload: unknown }>,
  stage: string,
  thought: string,
): void {
  const exists = commands.some((cmd) => {
    if (cmd.type !== 'think') return false
    const payload = cmd.payload as { stage?: string }
    return payload.stage === stage
  })
  if (exists) return
  commands.push({
    type: 'think',
    payload: { stage, thought, enteredAt: new Date().toISOString() },
  })
}

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  commands: Array<{ type: string; payload: unknown }>,
  requestMode?: 'real' | 'sim',
): Promise<unknown> {
  const effectiveMode: 'real' | 'sim' = requestMode || (SIM_MODE ? 'sim' : 'real')
  switch (name) {
    case 'think': {
      const stage = String(args.stage || 'think')
      const thought = String(args.thought || '')
      const enteredAt = new Date().toISOString()
      commands.push({ type: 'think', payload: { stage, thought, enteredAt } })
      return { stage, thought, enteredAt, acknowledged: true }
    }
    case 'fetch_markets': {
      ensureThinkStage(commands, 'observe', 'Gathering live market candidates before narrowing to the best setup.')
      const q = String(args.query || '')
      const days = Number(args.days || horizonDays)
      const path = q
        ? `/markets/search/${encodeURIComponent(q)}?limit=${args.limit || 20}`
        : `/markets?limit=${args.limit || 30}&days=${days}`
      const data = await synth(path) as unknown[]
      commands.push({ type: 'tool', payload: { name: 'fetch_markets', query: q } })
      return {
        markets: data.slice(0, 12).map((raw: unknown) => {
          const ev = raw as Record<string, unknown>
          const e = (ev.event as Record<string, unknown>) || {}
          return {
            title: e.title, slug: e.slug, venue: ev.venue, ends_at: e.ends_at,
            markets: ((ev.markets || []) as Record<string, unknown>[]).slice(0, 3).map(m => ({
              name: m.name || m.question, yes: m.left_price, no: m.right_price,
              volume24h: m.volume24hr, liquidity: m.liquidity, ends_at: m.ends_at,
              token_id: m.primary_token_id || m.left_token_id || m.token_id,
              condition_id: m.condition_id,
            })),
          }
        }),
      }
    }
    case 'get_price_history': {
      ensureThinkStage(commands, 'research', 'Reviewing recent price action and momentum on the selected market.')
      const tokenId = String(args.token_id || '')
      if (!tokenId) return { error: 'token_id required' }
      const fidelity = Number(args.fidelity || 60)
      try {
        const history = await synth(`/polymarket/market/${tokenId}/price-history?fidelity=${fidelity}`)
        commands.push({ type: 'tool', payload: { name: 'get_price_history', tokenId } })
        return history
      } catch (e) { return { error: String(e) } }
    }
    case 'get_market_stats': {
      ensureThinkStage(commands, 'research', 'Checking liquidity, volume, and market quality before sizing.')
      const tokenId = String(args.token_id || '')
      if (!tokenId) return { error: 'token_id required' }
      try {
        const stats = await synth(`/polymarket/market/${tokenId}/statistics`)
        commands.push({ type: 'tool', payload: { name: 'get_market_stats', tokenId } })
        return stats
      } catch (e) { return { error: String(e) } }
    }
    case 'research_topic': {
      ensureThinkStage(commands, 'orient', 'Collecting topic context and event-specific information before committing.')
      const topic = String(args.topic || '')
      const limit = Number(args.limit || 8)
      const [news, searchResults] = await Promise.all([
        synth(`/news?limit=${limit}`).catch(() => []),
        synth(`/markets/search/${encodeURIComponent(topic)}?limit=5`).catch(() => []),
      ])
      commands.push({ type: 'tool', payload: { name: 'research_topic', topic } })
      const articles = (Array.isArray(news) ? news : []).map((n: unknown) => {
        const item = n as Record<string, unknown>
        const inner = (item.news as Record<string, unknown>) || item
        return { title: inner.title, source: inner.source, description: inner.description, url: inner.url }
      }).filter(a => a.title)
      const markets = (Array.isArray(searchResults) ? searchResults : []).slice(0, 3).map((raw: unknown) => {
        const ev = raw as Record<string, unknown>
        const e = (ev.event as Record<string, unknown>) || {}
        return { title: e.title, ends_at: e.ends_at, venue: ev.venue }
      })
      return { topic, articles, related_markets: markets }
    }
    case 'fetch_balance': {
      ensureThinkStage(commands, 'observe', 'Checking active balance and affordability constraints.')
      const wid = defaultWalletId
      if (!wid) return { error: 'No wallet detected' }
      commands.push({ type: 'tool', payload: { name: 'fetch_balance' } })
      const realBal = parseBalance(await synth(`/wallet/${wid}/balance`).catch(() => []))
      const simBalData = simWallet.get(wid)
      const isLive = effectiveMode === 'real'
      return {
        mode: isLive ? 'live' : 'simulation',
        active_balance: isLive ? realBal : simBalData,
        sim: simBalData,
        live: realBal,
        note: isLive
          ? `You are in LIVE mode. Real balance: $${realBal.total}. Orders use real money.`
          : `You are in SIMULATION mode. Practice balance: $${simBalData.total}. Live balance: $${realBal.total} (not used in sim).`,
      }
    }
    case 'fetch_positions': {
      const wid = defaultWalletId
      if (!wid) return { error: 'No wallet detected' }
      commands.push({ type: 'tool', payload: { name: 'fetch_positions' } })
      return synth(`/wallet/${wid}/positions`)
    }
    case 'generate_prediction': {
      ensureThinkStage(commands, 'analyze', 'Running swarm analysis: parallel NIM + GPT-4o with news context.')
      ensureThinkStage(commands, 'decide', 'Merging swarm results and selecting the optimal position.')
      const events = await synth(
        `/markets/search/${encodeURIComponent(String(args.market_name))}?limit=10`,
      ) as Array<{ event: { title: string; ends_at?: string }; venue?: string; markets: Array<Record<string, unknown>> }>
      const flat = events.flatMap(ev =>
        ev.markets.map(m => ({ ...m, event_title: ev.event.title, venue: ev.venue, ends_at: m.ends_at || ev.event.ends_at })),
      )
      const useSwarm = opseeqAvailable && opseeqConsecutiveFailures < OPSEEQ_CIRCUIT_THRESHOLD
      const pred = useSwarm
        ? await generateSwarmPrediction(String(args.market_name), flat, defaultWalletId || undefined, effectiveMode)
        : await generatePrediction(String(args.market_name), flat, defaultWalletId || undefined, undefined, effectiveMode)
      commands.push({ type: 'tool', payload: { name: 'generate_prediction', prediction: pred.id, swarm: useSwarm } })
      return {
        id: pred.id, thesis: pred.thesis, confidence: pred.confidence,
        action: pred.action, side: pred.side, amount: pred.amountUsdc,
        market: pred.marketName, lean: pred.lean, leanReason: pred.leanReason,
        tokenId: pred.tokenId, yesPrice: pred.yesPrice, noPrice: pred.noPrice,
        minEntry: pred.minEntryUsdc, maxAffordable: pred.maxAffordableUsdc, venue: pred.venue,
        mode: effectiveMode,
      }
    }
    case 'place_order': {
      ensureThinkStage(commands, 'act', 'Turning the selected thesis into an executable order flow.')
      const predictionId = String(args.prediction_id || '')
      const tokenId = String(args.token_id || '')
      const side = String(args.side || 'BUY')
      const orderType = String(args.order_type || 'MARKET')
      const amount = String(args.amount || '0')
      const price = args.price ? String(args.price) : undefined
      const safeAmount = effectiveMode === 'real' ? clampUsdAmount(parseFloat(amount) || EXCHANGE_MIN_USDC) : amount

      if (REQUIRE_APPROVAL && effectiveMode === 'real') {
        const approvalId = crypto.randomUUID().slice(0, 12)
        approvalStore.insert({
          id: approvalId,
          type: 'place_order',
          params_json: JSON.stringify({ tokenId, side, amount: safeAmount, orderType, price, predictionId }),
          prediction_id: predictionId || null,
          mode: 'real',
          status: 'pending',
          created_at: new Date().toISOString(),
          resolved_at: null,
          order_result_json: null,
        })
        audit('agent_order_approval_queued', 'order', { approvalId, predictionId, mode: 'real' })
        commands.push({ type: 'tool', payload: { name: 'place_order', queued: true, approvalId } })
        commands.push({ type: 'switch_tab', payload: 'approvals' })
        commands.push({ type: 'highlight', payload: { element: 'approvals-list', message: 'Order queued. Awaiting your YES/NO.', tone: 'await', action: 'hover' } })
        commands.push({ type: 'highlight', payload: { element: `approval-execute-${approvalId}`, message: 'Green = execute after YES', tone: 'execute', action: 'click' } })
        return { queued: true, approvalId, message: 'Live order queued for approval. Type YES to execute or NO to reject.' }
      }

      const result = await placeOrderViaApi(
        predictionId,
        tokenId,
        side,
        safeAmount,
        orderType,
        price,
        effectiveMode,
      )
      commands.push({ type: 'tool', payload: { name: 'place_order', order: result } })
      return result
    }
    case 'list_predictions': {
      const mode = String(args.mode || 'both')
      const limit = Number(args.limit || 20)
      const rows = mode === 'both' ? predictionStore.listAll(limit) : predictionStore.listByMode(mode, limit)
      const parsed = rows.map(r => ({ row: r, p: JSON.parse(r.snapshot_json) as Prediction }))
      const resolved = parsed.filter(x => x.p.wasCorrect !== null || x.p.status === 'resolved')
      const correct = resolved.filter(x => x.p.wasCorrect).length
      commands.push({ type: 'tool', payload: { name: 'list_predictions' } })
      return {
        learning: {
          resolved: resolved.length,
          correct,
          accuracy: resolved.length > 0 ? +(correct / resolved.length * 100).toFixed(1) : 0,
        },
        predictions: parsed.map(({ row: r, p }) => {
          return {
            id: p.id, market: p.marketName, lean: p.lean, confidence: p.confidence,
            action: p.action, amount: p.amountUsdc, status: p.status,
            orderId: p.orderId, endsAt: p.endsAt, mode: r.mode,
            wasCorrect: p.wasCorrect, resolvedOutcome: p.resolvedOutcome, pnl: p.pnl,
            reflection: p.reflection,
          }
        }),
      }
    }
    case 'delete_prediction': {
      const pid = String(args.prediction_id || '')
      if (!pid) return { error: 'prediction_id required' }
      db.prepare('DELETE FROM predictions WHERE id = ?').run(pid)
      audit('agent_delete_prediction', 'predict', { id: pid })
      commands.push({ type: 'tool', payload: { name: 'delete_prediction', id: pid } })
      return { deleted: true, id: pid }
    }
    case 'clean_stale_predictions': {
      const maxDays = Number(args.max_days_out || 30)
      await maybeSyncPredictionResolutions()
      const cutoff = new Date(Date.now() + maxDays * 864e5).toISOString()
      const all = predictionStore.listAll(500)
      let cleaned = 0
      for (const row of all) {
        const p = JSON.parse(row.snapshot_json)
        if (p.status === 'committed' || p.status === 'committed_live' || p.status === 'committed_sim' || p.orderId) continue
        if (p.endsAt && new Date(p.endsAt).getTime() > new Date(cutoff).getTime()) {
          db.prepare('DELETE FROM predictions WHERE id = ?').run(p.id)
          cleaned++
        }
      }
      audit('agent_clean_stale', 'predict', { maxDays, cleaned })
      commands.push({ type: 'tool', payload: { name: 'clean_stale_predictions', cleaned } })
      return { cleaned, maxDays }
    }
    case 'fetch_approvals': {
      const mode = args.mode ? String(args.mode) : undefined
      const rows = approvalStore.listPending(mode)
      commands.push({ type: 'tool', payload: { name: 'fetch_approvals', count: rows.length } })
      return rows.map(a => ({
        id: a.id,
        type: a.type,
        mode: a.mode,
        status: a.status,
        createdAt: a.created_at,
        params: JSON.parse(a.params_json),
      }))
    }
    case 'approve_order': {
      ensureThinkStage(commands, 'act', 'Executing the approved order and confirming completion.')
      const approvalId = String(args.approval_id || '')
      if (!approvalId) return { error: 'approval_id required' }
      const out = await executeApprovalById(approvalId)
      commands.push({ type: 'tool', payload: { name: 'approve_order', id: approvalId, status: out.status } })
      commands.push({ type: 'switch_tab', payload: 'dashboard' })
      commands.push({ type: 'highlight', payload: { element: 'wallet-strip', message: 'Order executed. Balance updated.', tone: 'execute', action: 'hover' } })
      return out
    }
    case 'reject_order': {
      ensureThinkStage(commands, 'act', 'Rejecting the queued order at the user’s request.')
      const approvalId = String(args.approval_id || '')
      if (!approvalId) return { error: 'approval_id required' }
      const a = approvalStore.getById(approvalId)
      if (!a) return { error: 'approval not found' }
      approvalStore.updateStatus(a.id, 'rejected')
      audit('reject', 'approve', { id: a.id, reason: args.reason })
      commands.push({ type: 'tool', payload: { name: 'reject_order', id: approvalId } })
      return { id: a.id, status: 'rejected' }
    }
    case 'switch_tab':
      commands.push({ type: 'switch_tab', payload: args.tab })
      return { switched: args.tab }
    case 'highlight':
      commands.push({
        type: 'highlight',
        payload: {
          element: args.element,
          message: args.message || '',
          tone: args.tone || 'await',
          action: args.action || 'hover',
        },
      })
      return { highlighted: args.element }
    case 'fetch_recommendations': {
      const recs = await synth('/recommendations?limit=10') as unknown[]
      commands.push({ type: 'tool', payload: { name: 'fetch_recommendations' } })
      return {
        recommendations: (Array.isArray(recs) ? recs : []).slice(0, 8).map((raw: unknown) => {
          const ev = raw as Record<string, unknown>
          const e = (ev.event as Record<string, unknown>) || {}
          const mkts = ((ev.markets || []) as Record<string, unknown>[]).slice(0, 2)
          return {
            title: e.title, venue: ev.venue, ends_at: e.ends_at,
            best_market: mkts[0] ? { yes: mkts[0].left_price, no: mkts[0].right_price, volume: mkts[0].volume24hr, token_id: mkts[0].primary_token_id || mkts[0].left_token_id } : null
          }
        }),
      }
    }
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

async function runAgentTurn(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], requestMode?: 'real' | 'sim'): Promise<{ messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]; commands: Array<{ type: string; payload: unknown }> }> {
  let client = getInferenceClient()
  const commands: Array<{ type: string; payload: unknown }> = []
  const systemPrompt = buildAgentSystem(requestMode)
  let model = getEffectiveAgentModel()
  const agentTraceId = traceId()
  emitTrace({ traceId: agentTraceId, stage: 'agent_start', action: 'run_agent_turn', mode: (requestMode || (SIM_MODE ? 'sim' : 'real')) === 'sim' ? 'simulation' : 'live', route: currentRoute(), model, success: true })

  let resp: Awaited<ReturnType<typeof client.chat.completions.create>>
  try {
    resp = await client.chat.completions.create({
      model, temperature: 0.3, max_tokens: 2000,
      tools: AGENT_TOOLS,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    })
  } catch (e) {
    const directOai = getDirectOpenAIClient()
    if (!directOai) throw e
    console.log(`  ⚠ Agent call failed via ${currentRoute()}: ${e instanceof Error ? e.message : e}, falling back to direct OpenAI`)
    client = directOai
    model = 'gpt-4o'
    emitTrace({ traceId: agentTraceId, stage: 'agent_fallback', action: 'opseeq_to_direct', mode: (requestMode || (SIM_MODE ? 'sim' : 'real')) === 'sim' ? 'simulation' : 'live', route: 'fallback', model, success: true })
    resp = await directOai.chat.completions.create({
      model, temperature: 0.3, max_tokens: 2000,
      tools: AGENT_TOOLS,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    })
  }

  const choice = resp.choices[0]
  const out: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [...messages]

  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    out.push(choice.message)
    for (const rawTc of choice.message.tool_calls) {
      const tc = asToolCall(rawTc)
      const args = JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>
      let result: unknown
      try { result = await executeTool(tc.function.name, args, commands, requestMode) }
      catch (e) { result = { error: String(e) } }
      out.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) })
    }

    for (let round = 0; round < 4; round++) {
      const followUp = await client.chat.completions.create({
        model, temperature: 0.3, max_tokens: 2000,
        tools: AGENT_TOOLS,
        messages: [{ role: 'system', content: systemPrompt }, ...out],
      })
      const msg = followUp.choices[0].message
      out.push(msg)
      if (!msg.tool_calls || msg.tool_calls.length === 0) break

      for (const rawTc of msg.tool_calls) {
        const tc = asToolCall(rawTc)
        const args = JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>
        let result: unknown
        try { result = await executeTool(tc.function.name, args, commands, requestMode) }
        catch (e) { result = { error: String(e) } }
        out.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) })
      }
    }
  } else {
    out.push(choice.message)
  }

  const lastAssistantWithContent = [...out].reverse().find((msg) =>
    typeof msg === 'object' &&
    'role' in msg &&
    msg.role === 'assistant' &&
    typeof msg.content === 'string' &&
    msg.content.trim().length > 0,
  )

  if (!lastAssistantWithContent) {
    const finalResp = await client.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 800,
      tool_choice: 'none',
      tools: AGENT_TOOLS,
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}

You must now give the user a final answer in plain language.
- Summarize the best recommendation or the current result.
- If a trade is ready, explicitly ask the next follow-up question.
- ALWAYS end with a question or an explicit YES/NO prompt.
- Do not call tools.`,
        },
        ...out,
      ],
    })
    out.push(finalResp.choices[0].message)
  }

  return { messages: out, commands }
}

// ── Order Placement ───────────────────────────────────────────────
async function placeOrderViaApi(predictionId: string, tokenId: string, side: string, amount: string, orderType: string, price?: string, modeOverride?: 'real' | 'sim') {
  const orderTraceId = traceId()
  const orderT0 = Date.now()
  const wid = defaultWalletId
  if (!wid) throw new Error('No wallet available')
  const effectiveMode = modeOverride || (SIM_MODE ? 'sim' : 'real')
  emitTrace({ traceId: orderTraceId, stage: 'order_start', action: 'place_order', mode: effectiveMode === 'sim' ? 'simulation' : 'live', route: currentRoute(), predictionId, success: true, detail: { tokenId: tokenId.slice(0, 20), side, amount, orderType } })

  if (effectiveMode === 'sim') {
    const amountNum = parseFloat(amount) || 0
    simWallet.debit(wid, amountNum)
    const simOrderId = `sim_${crypto.randomUUID().slice(0, 8)}`

    const row = predictionStore.getById(predictionId)
    if (row) {
      const pred = JSON.parse(row.snapshot_json)
      pred.orderId = simOrderId
      pred.orderStatus = 'SIMULATED'
      pred.status = 'committed_sim'
      db.prepare('UPDATE predictions SET snapshot_json = ? WHERE id = ?').run(JSON.stringify(pred), predictionId)
    }

    audit('place_order', 'order', { predictionId, tokenId, side, amount, orderType, mode: 'sim', orderId: simOrderId }, true, 'sim')
    emitTrace({ traceId: orderTraceId, stage: 'order_complete', action: 'sim_order_filled', mode: 'simulation', route: 'direct', predictionId, orderId: simOrderId, success: true, latencyMs: Date.now() - orderT0, detail: { amount } })
    return { orderId: simOrderId, tokenId, side, type: orderType, amount, shares: '0', price: price || '0', status: 'SIMULATED', predictionId }
  }

  const submitOrder = async (amt: string) => {
    const body: Record<string, string> = { token_id: tokenId, side, type: orderType, amount: amt, units: 'USDC' }
    if (price && orderType === 'LIMIT') body.price = price
    return synth(`/wallet/pol/${wid}/order`, { method: 'POST', body: JSON.stringify(body) }) as Promise<Record<string, unknown>>
  }

  const requestedAmount = parseFloat(amount) || 0
  const clampedAmount = clampUsdAmount(requestedAmount)
  let usedAmount = clampedAmount
  let orderResp: Record<string, unknown> | null = null

  try {
    orderResp = await submitOrder(clampedAmount)
  } catch (err) {
    const msg = parseSynthErrorMessage(err)

    if (isMinimumSizeError(msg)) {
      const balResp = await synth(`/wallet/${wid}/balance`).catch(() => [])
      const bal = parseBalance(balResp)
      const available = parseFloat(bal.total) || 0

      const scaledCandidates = [2, 3, 5, 10]
        .map(v => clampUsdAmount(v))
        .filter((v, i, arr) => {
          const n = parseFloat(v)
          return n > parseFloat(clampedAmount) && n <= available && arr.indexOf(v) === i
        })

      let lastMinMsg = msg
      for (const candidate of scaledCandidates) {
        try {
          orderResp = await submitOrder(candidate)
          usedAmount = candidate
          break
        } catch (e2) {
          const retryMsg = parseSynthErrorMessage(e2)
          lastMinMsg = retryMsg
          if (!isMinimumSizeError(retryMsg)) throw e2
        }
      }

      if (!orderResp) {
        const minRequired = scaledCandidates.length > 0
          ? `at least $${scaledCandidates[scaledCandidates.length - 1]}`
          : 'a larger amount'
        throw new Error(
          available < EXCHANGE_MIN_USDC
            ? `Insufficient balance ($${available.toFixed(2)}). Deposit at least $${EXCHANGE_MIN_USDC.toFixed(2)} to place live orders.`
            : `Order does not meet exchange minimum size. Tried up to $${scaledCandidates[scaledCandidates.length - 1] || clampedAmount} but still rejected. You may need ${minRequired}. Protocol: ${lastMinMsg}`,
        )
      }
    } else if (isPartialFillError(msg) && requestedAmount > EXCHANGE_MIN_USDC) {
      const candidates = [0.75, 0.5, 0.33, 0.25]
        .map(f => clampUsdAmount(requestedAmount * f))
        .filter((v, i, arr) => parseFloat(v) >= EXCHANGE_MIN_USDC && parseFloat(v) < requestedAmount && arr.indexOf(v) === i)

      let lastErrorMsg = msg
      for (const candidate of candidates) {
        try {
          orderResp = await submitOrder(candidate)
          usedAmount = candidate
          break
        } catch (e) {
          const candidateMsg = parseSynthErrorMessage(e)
          lastErrorMsg = candidateMsg
          if (!isPartialFillError(candidateMsg)) throw e
        }
      }

      if (!orderResp) {
        throw new Error(`Order book liquidity is too thin right now. Tried auto-sizing down from $${requestedAmount.toFixed(2)} but could not fully fill. Last protocol message: ${lastErrorMsg}`)
      }
    } else {
      throw err
    }
  }

  const orderId = String(orderResp.order_id || orderResp.stoploss_id || '')
  const row = predictionStore.getById(predictionId)
  if (row) {
    const pred = JSON.parse(row.snapshot_json)
    pred.orderId = orderId
    pred.orderStatus = String(orderResp.status || 'PENDING')
    pred.status = 'committed_live'
    db.prepare('UPDATE predictions SET snapshot_json = ? WHERE id = ?').run(JSON.stringify(pred), predictionId)
  }

  audit('place_order', 'order', { predictionId, tokenId, side, amount: usedAmount, orderType, mode: 'real', orderId }, true, 'real')
  emitTrace({ traceId: orderTraceId, stage: 'order_complete', action: 'live_order_filled', mode: 'live', route: 'direct', predictionId, orderId, success: true, latencyMs: Date.now() - orderT0, detail: { amount: usedAmount, autoSized: usedAmount !== clampedAmount, status: String(orderResp.status || 'PENDING') } })
  invalidateBalanceCache(wid)
  const balanceAfter = parseBalance(await synth(`/wallet/${wid}/balance`).catch(() => []))
  return {
    orderId, tokenId, side, type: orderType,
    amount: String(orderResp.amount || usedAmount || clampedAmount),
    shares: String(orderResp.shares || '0'),
    price: String(orderResp.price || price || '0'),
    status: String(orderResp.status || 'PENDING'),
    predictionId,
    requestedAmount: amount,
    autoSized: usedAmount !== clampedAmount,
    balanceAfter: { total: balanceAfter.total, available: balanceAfter.available },
  }
}

// ── Opseeq Agent Gateway ──────────────────────────────────────────
const OPSEEQ_URL = process.env.OPSEEQ_URL || 'http://127.0.0.1:9090'
let opseeqAvailable = false
let opseeqStatus: Record<string, unknown> | null = null
let opseeqLastProbeAt = 0

async function probeOpseeq(): Promise<boolean> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 2500)
    const res = await fetch(`${OPSEEQ_URL}/health`, { signal: ctrl.signal })
    clearTimeout(timer)
    if (res.ok) {
      opseeqStatus = await res.json() as Record<string, unknown>
      try {
        const modelsRes = await fetch(`${OPSEEQ_URL}/v1/models`, { signal: ctrl.signal })
        if (modelsRes.ok) {
          const modelsJson = await modelsRes.json() as { data?: Array<{ id?: string }> }
          const liveModels = (modelsJson.data || []).map(m => String(m.id || '')).filter(Boolean)
          const nimModels = liveModels.filter(m => m.startsWith('nvidia/'))
          if (nimModels.length > 0) opseeqModels = nimModels
        }
      } catch {/**/}
      opseeqAvailable = true
      opseeqConsecutiveFailures = 0
      opseeqLastProbeAt = Date.now()
      return true
    }
  } catch {/**/}
  opseeqAvailable = false
  opseeqConsecutiveFailures++
  opseeqStatus = null
  opseeqLastProbeAt = Date.now()
  if (opseeqConsecutiveFailures === OPSEEQ_CIRCUIT_THRESHOLD) {
    console.log(`  ⚠ Opseeq circuit breaker tripped after ${OPSEEQ_CIRCUIT_THRESHOLD} failures — routing through direct OpenAI`)
  }
  return false
}

async function waitForOpseeqReady(timeoutMs = 20_000): Promise<boolean> {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (await probeOpseeq()) return true
    await sleep(1000)
  }
  return false
}

function tryLaunchOpseeq(): { launched: boolean; error?: string } {
  if (opseeqAvailable) return { launched: true }
  try {
    const child = spawnProcess('docker', ['start', 'opseeq'], {
      detached: true, stdio: 'ignore',
    })
    child.unref()
    console.log('  🔷 Opseeq: starting Docker container…')
    setTimeout(() => { void probeOpseeq() }, 5_000)
    return { launched: true }
  } catch (e) {
    const msg = String(e)
    console.error('  ⚠ Opseeq launch failed:', msg)
    return { launched: false, error: msg }
  }
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
  const pendingApprovals = approvalStore.count('pending')
  res.json({
    status: 'ok', version: '1.0.0',
    simulation: SIM_MODE, simulation_mode: SIM_MODE,
    approvalRequired: REQUIRE_APPROVAL, approval_required: REQUIRE_APPROVAL,
    aiAvailable: !!openai, ai_engine_available: !!openai,
    predictions: predCount, predictions_available: predCount > 0,
    pendingApprovals, defaultWallet: defaultWalletId, authenticated: !!SECRET_KEY,
    opseeq: { available: opseeqAvailable, url: OPSEEQ_URL, circuitOpen: opseeqConsecutiveFailures >= OPSEEQ_CIRCUIT_THRESHOLD, failures: opseeqConsecutiveFailures },
    runtime: { route: currentRoute(), predictionModel: getEffectivePredictionModel(activeModel), agentModel: getEffectiveAgentModel(), recentTraces: recentTraces.length },
  })
})

app.get('/health', (_req, res) => {
  let predCount = 0; try { predCount = predictionStore.listAll(1).length } catch {/**/}
  res.json({
    status: 'ok', version: '1.0.0',
    simulation_mode: SIM_MODE, approval_required: REQUIRE_APPROVAL,
    ai_engine_available: !!openai, predictions_available: predCount > 0,
    predictions: predCount,
  })
})

// Opseeq Agent Gateway endpoints
app.get('/api/opseeq/status', async (_req, res) => {
  const stale = Date.now() - opseeqLastProbeAt > 10_000
  if (stale) await probeOpseeq()
  res.json({
    available: opseeqAvailable,
    url: OPSEEQ_URL,
    lastProbeAt: opseeqLastProbeAt ? new Date(opseeqLastProbeAt).toISOString() : null,
    status: opseeqStatus,
  })
})

app.post('/api/opseeq/launch', async (_req, res) => {
  if (opseeqAvailable) return res.json({ already: true, url: OPSEEQ_URL })
  const launch = tryLaunchOpseeq()
  if (!launch.launched) return res.status(500).json({ error: launch.error || 'Failed to start Opseeq container' })
  const ready = await waitForOpseeqReady(20_000)
  res.json({ launching: true, ready, url: OPSEEQ_URL })
})

app.post('/api/opseeq/chat', async (req, res) => {
  if (!opseeqAvailable) return res.status(503).json({ error: 'Opseeq gateway not available. Run: docker start opseeq' })
  try {
    const resp = await fetch(`${OPSEEQ_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    const data = await resp.json()
    res.status(resp.status).json(data)
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

app.get('/api/opseeq/models', async (_req, res) => {
  if (!opseeqAvailable) return res.status(503).json({ error: 'Opseeq gateway not available' })
  try {
    const resp = await fetch(`${OPSEEQ_URL}/v1/models`)
    res.status(resp.status).json(await resp.json())
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

app.get('/api/config', (_req, res) => {
  res.json({
    simulation: SIM_MODE,
    confidenceThreshold: CONF_THRESH,
    requireApproval: REQUIRE_APPROVAL,
    model: getEffectivePredictionModel(activeModel),
    selectedModel: activeModel,
    agentModel: getEffectiveAgentModel(),
    predictionModel: getEffectivePredictionModel(activeModel),
    availableModels: getAllAvailableModels(),
    risk: RISK,
    horizonDays,
    opseeq: opseeqAvailable,
  })
})

app.post('/api/config/model', (req, res) => {
  const { model } = req.body
  const all = getAllAvailableModels()
  if (!model || !all.includes(model)) {
    return res.status(400).json({ error: `Invalid model. Available: ${all.join(', ')}` })
  }
  activeModel = model
  audit('change_model', 'config', { model })
  res.json({ model: activeModel })
})

app.post('/api/config/horizon', (req, res) => {
  const days = parseInt(String(req.body.days || '7'))
  if (isNaN(days) || days < 1 || days > 365) return res.status(400).json({ error: 'days must be 1-365' })
  horizonDays = days
  audit('change_horizon', 'config', { horizonDays })
  res.json({ horizonDays })
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

// Withdrawal request — route to correct chain API
app.post('/api/wallet/:walletId/withdraw', async (req, res) => {
  try {
    const { chain, token, amount, address } = req.body
    if (!chain || !token || !amount || !address) return res.status(400).json({ error: 'chain, token, amount, and address are required' })
    audit('withdraw_request', 'wallet', { walletId: req.params.walletId, chain, token, amount, address })
    const chainPrefix = chain === 'solana' ? 'sol' : 'pol'
    const result = await synth(`/wallet/${chainPrefix}/${req.params.walletId}/withdraw`, {
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
  try {
    const [generic, polymarket] = await Promise.all([
      synth(`/wallet/${req.params.id}/positions`).catch(() => []),
      synth(`/wallet/pol/${req.params.id}/positions`).catch(() => []),
    ])
    const genArr = Array.isArray(generic) ? generic : []
    const polArr = Array.isArray(polymarket) ? polymarket : []
    const seen = new Set<string>()
    const merged: unknown[] = []
    for (const p of [...polArr, ...genArr]) {
      const obj = p as Record<string, unknown>
      const pos = obj.position as Record<string, unknown> | undefined
      const key = String(pos?.token_id || obj.token_id || obj.condition_id || JSON.stringify(p))
      if (!seen.has(key)) { seen.add(key); merged.push(p) }
    }
    res.json(merged)
  } catch (e) { res.status(502).json({ error: String(e) }) }
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

// Polymarket-specific positions (more detailed than generic)
app.get('/api/wallet/:id/pol/positions', async (req, res) => {
  try { res.json(await synth(`/wallet/pol/${req.params.id}/positions`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Trade history
app.get('/api/wallet/:id/trades', async (req, res) => {
  try { res.json(await synth(`/wallet/pol/${req.params.id}/trades`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Active orders for a specific market condition
app.get('/api/wallet/:id/orders/:conditionId/active', async (req, res) => {
  try { res.json(await synth(`/wallet/pol/${req.params.id}/orders/${req.params.conditionId}/active`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Order quote (preview before placing)
app.post('/api/wallet/:id/order/quote', async (req, res) => {
  try {
    const { tokenId, side, amount, venue } = req.body
    if (!tokenId || !side || !amount) return res.status(400).json({ error: 'tokenId, side, amount required' })
    const wid = req.params.id
    if (venue === 'kalshi') {
      const quote = await synth(`/wallet/sol/${wid}/order/quote`, { method: 'POST', body: JSON.stringify({ token_id: tokenId, side, amount }) })
      return res.json(quote)
    }
    const yesPrice = parseFloat(String(req.body.price || '0.50'))
    const shares = parseFloat(amount) / yesPrice
    res.json({ amount, shares: shares.toFixed(3), averagePrice: yesPrice.toFixed(3), priceImpact: '0.00', fee: '0.00' })
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Place order — mode-aware per-request
app.post('/api/wallet/:id/order', async (req, res) => {
  try {
    const { predictionId, tokenId, side, amount, type: orderType, price, venue, units, mode: reqMode } = req.body
    if (!tokenId || !side || !amount) return res.status(400).json({ error: 'tokenId, side, amount required' })
    const effectiveMode: 'real' | 'sim' = reqMode === 'real' ? 'real' : reqMode === 'sim' ? 'sim' : (SIM_MODE ? 'sim' : 'real')

    if (REQUIRE_APPROVAL && effectiveMode === 'real') {
      const approvalId = crypto.randomUUID().slice(0, 12)
      approvalStore.insert({
        id: approvalId, type: 'place_order',
        params_json: JSON.stringify({ tokenId, side, amount, orderType: orderType || 'MARKET', price, venue, predictionId }),
        prediction_id: predictionId || null, mode: 'real', status: 'pending',
        created_at: new Date().toISOString(), resolved_at: null, order_result_json: null,
      })
      audit('order_approval_queued', 'order', { approvalId, predictionId, mode: 'real' })
      return res.json({ queued: true, approvalId, message: 'Live order queued for approval. Go to Approvals tab to confirm.' })
    }

    const safeAmount = effectiveMode === 'real' ? clampUsdAmount(parseFloat(amount) || EXCHANGE_MIN_USDC) : amount
    const result = await placeOrderViaApi(predictionId || '', tokenId, side, safeAmount, orderType || 'MARKET', price, effectiveMode)
    res.json(result)
  } catch (e) { res.status(500).json({ error: parseSynthErrorMessage(e) }) }
})

// Markets -- multi-source aggregation with time horizon + deduplication
app.get('/api/markets', async (req, res) => {
  try {
    const { query, venue, limit } = req.query
    const days = parseInt(String(req.query.days || horizonDays)) || horizonDays
    const cutoff = new Date(Date.now() + days * 864e5).toISOString()

    if (query) {
      const results = await synth(`/markets/search/${encodeURIComponent(String(query))}?limit=${limit || 30}`)
      return res.json(results)
    }

    const n = Math.min(parseInt(String(limit) || '40') || 40, 80)
    const [trending, kalshi, recs, polymarkets, crypto] = await Promise.all([
      synth(`/markets?limit=${Math.ceil(n * 0.3)}${venue ? `&venue=${venue}` : ''}`).catch(() => []),
      venue === 'polymarket' ? Promise.resolve([]) : synth(`/kalshi/markets?limit=${Math.ceil(n * 0.2)}`).catch(() => []),
      synth(`/recommendations?limit=${Math.ceil(n * 0.15)}`).catch(() => []),
      venue === 'kalshi' ? Promise.resolve([]) : synth(`/polymarket/markets?limit=${Math.ceil(n * 0.1)}`).catch(() => []),
      synth(`/markets/search/crypto?limit=${Math.ceil(n * 0.25)}`).catch(() => []),
    ])
    const all = [
      ...(Array.isArray(trending) ? trending : []),
      ...(Array.isArray(kalshi) ? kalshi : []),
      ...(Array.isArray(recs) ? recs : []),
      ...(Array.isArray(polymarkets) ? polymarkets : []),
      ...(Array.isArray(crypto) ? crypto : []),
    ]

    const seen = new Map<string, unknown>()
    for (const ev of all) {
      const e = (ev as Record<string, unknown>).event as Record<string, unknown> | undefined
      const endsAt = String(e?.ends_at || (ev as Record<string, unknown>).ends_at || '')
      // Apply horizon filter — skip if ends after cutoff (too far) or ended in past > 1h ago
      if (endsAt) {
        const t = new Date(endsAt).getTime()
        if (t > new Date(cutoff).getTime()) continue
        if (t < Date.now() - 36e5) continue
      }
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
    const effectiveMode: 'real' | 'sim' | undefined = mode === 'real' ? 'real' : mode === 'sim' ? 'sim' : undefined
    const events = await synth(`/markets/search/${encodeURIComponent(query)}?limit=10`) as Array<{ event: { title: string; ends_at?: string }; venue?: string; markets: Array<Record<string, unknown>> }>
    const flat = events.flatMap(ev => ev.markets.map(m => ({ ...m, event_title: ev.event.title, venue: ev.venue, ends_at: m.ends_at || ev.event.ends_at })))
    if (mode === 'both' || !mode) {
      res.json(await generateDualPrediction(query, flat, walletId || defaultWalletId))
    } else {
      res.json(await generatePrediction(query, flat, walletId || defaultWalletId, undefined, effectiveMode))
    }
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Legacy generate endpoint (convenience alias)
app.post('/api/predictions/generate', async (req, res) => {
  try {
    const { query, walletId, mode: reqMode } = req.body
    if (!query) return res.status(400).json({ error: 'query required' })
    const effectiveMode: 'real' | 'sim' = reqMode === 'real' ? 'real' : reqMode === 'sim' ? 'sim' : (SIM_MODE ? 'sim' : 'real')
    const events = await synth(`/markets/search/${encodeURIComponent(query)}?limit=10`) as Array<{ event: { title: string; ends_at?: string }; venue?: string; markets: Array<Record<string, unknown>> }>
    const flat = events.flatMap(ev => ev.markets.map(m => ({ ...m, event_title: ev.event.title, venue: ev.venue, ends_at: m.ends_at || ev.event.ends_at })))
    res.json(await generatePrediction(query, flat, walletId || defaultWalletId, undefined, effectiveMode))
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Predictions list -- mode-aware + date labels + no dead traces
app.get('/api/predictions', async (_req, res) => {
  try {
    await maybeSyncPredictionResolutions()
    const limit = Math.max(1, parseInt(String(_req.query.limit || '100')) || 100)
    const mode = String(_req.query.mode || 'both')
    const rows = mode === 'both' ? predictionStore.listAll(limit) : predictionStore.listByMode(mode, limit)
    res.json(rows.map(row => {
      const pred = dbToPrediction(row)
      return { ...pred, dateLabel: dateLabel(pred.createdAt) }
    }))
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

// Force-sync protocol outcomes for ended markets
app.post('/api/predictions/sync', async (_req, res) => {
  try {
    const result = await syncPredictionResolutions(300)
    res.json({ ok: true, ...result })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
})

// Clean stale predictions (ended markets + very distant uncommitted)
app.post('/api/predictions/clean', async (req, res) => {
  try {
    await maybeSyncPredictionResolutions()
    const maxDays = parseInt(String(req.body.maxDays || '30'))
    const cutoff = new Date(Date.now() + maxDays * 864e5).toISOString()
    const all = predictionStore.listAll(500)
    let cleaned = 0
    const removed: string[] = []
    for (const row of all) {
      const p = JSON.parse(row.snapshot_json)
      if (p.status === 'committed' || p.status === 'committed_live' || p.status === 'committed_sim' || p.orderId) continue
      const tooFar = p.endsAt && new Date(p.endsAt).getTime() > new Date(cutoff).getTime()
      if (tooFar) {
        db.prepare('DELETE FROM predictions WHERE id = ?').run(p.id)
        removed.push(p.id)
        cleaned++
      }
    }
    audit('clean_stale', 'predict', { maxDays, cleaned })
    res.json({ cleaned, removed })
  } catch (e) { res.status(500).json({ error: String(e) }) }
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

// Approvals — persisted in SQLite
app.get('/api/approvals', (req, res) => {
  const mode = req.query.mode ? String(req.query.mode) : undefined
  const all = req.query.all === 'true'
  const rows = all ? approvalStore.listAll(100) : approvalStore.listPending(mode)
  res.json(rows.map(a => ({ id: a.id, type: a.type, params: JSON.parse(a.params_json), predictionId: a.prediction_id, mode: a.mode, status: a.status, createdAt: a.created_at })))
})

async function executeApprovalById(id: string): Promise<{ id: string; status: string; orderResult?: unknown }> {
  const approvalTraceId = traceId()
  const a = approvalStore.getById(id)
  if (!a) throw new Error('approval not found')

  const approvalMode = a.mode === 'real' ? 'live' : 'simulation' as const
  emitTrace({ traceId: approvalTraceId, stage: 'approval_execute', action: 'approve_order', mode: approvalMode, route: currentRoute(), approvalId: a.id, success: true, detail: { type: a.type, predictionId: a.prediction_id } })

  audit('approve', 'approve', { id: a.id })
  if (a.type === 'place_order') {
    const p = JSON.parse(a.params_json) as { tokenId: string; side: string; amount: string; orderType: string; price?: string; predictionId?: string }
    const safeAmount = clampUsdAmount(parseFloat(p.amount) || EXCHANGE_MIN_USDC)
    const result = await placeOrderViaApi(p.predictionId || '', p.tokenId, p.side, safeAmount, p.orderType, p.price, a.mode as 'real' | 'sim')
    approvalStore.updateStatus(a.id, 'executed', JSON.stringify(result))
    const orderId = (result as Record<string, unknown>).orderId as string
    audit('order_executed', 'order', { approvalId: a.id, orderId, mode: a.mode })
    emitTrace({ traceId: approvalTraceId, stage: 'approval_complete', action: 'order_executed', mode: approvalMode, route: currentRoute(), approvalId: a.id, orderId, predictionId: p.predictionId, success: true, detail: { amount: safeAmount, status: (result as Record<string, unknown>).status } })
    return { id: a.id, status: 'executed', orderResult: result }
  }

  approvalStore.updateStatus(a.id, 'approved')
  return { id: a.id, status: 'approved' }
}

app.post('/api/approvals/:id/approve', async (req, res) => {
  try { res.json(await executeApprovalById(req.params.id)) }
  catch (e) {
    const message = parseSynthErrorMessage(e)
    console.error(`  ⚠ Approval ${req.params.id} failed:`, message)
    if (message === 'approval not found') return res.status(404).json({ error: 'approval not found' })
    approvalStore.updateStatus(req.params.id, 'failed')
    audit('order_failed', 'order', { approvalId: req.params.id, error: message }, false, 'real')
    return res.status(500).json({ error: message, approvalId: req.params.id })
  }
})

app.post('/api/approvals/:id/reject', (req, res) => {
  const a = approvalStore.getById(req.params.id)
  if (!a) return res.status(404).json({ error: 'not found' })
  approvalStore.updateStatus(a.id, 'rejected')
  audit('reject', 'approve', { id: a.id, reason: req.body.reason })
  res.json({ id: a.id, status: 'rejected' })
})

// Audit
app.get('/api/audit', (_req, res) => {
  if (!existsSync(AUDIT_FILE)) return res.json([])
  const lines = readFileSync(AUDIT_FILE, 'utf-8').trim().split('\n').filter(Boolean)
  const limit = parseInt(String(_req.query.limit) || '100')
  res.json(lines.slice(-limit).reverse().map(l => JSON.parse(l)))
})

app.get('/api/traces', (_req, res) => {
  const limit = Math.min(parseInt(String(_req.query.limit) || '50'), MAX_TRACES)
  const mode = _req.query.mode as string | undefined
  const stage = _req.query.stage as string | undefined
  let filtered = recentTraces.slice(-limit).reverse()
  if (mode) filtered = filtered.filter(t => t.mode === mode)
  if (stage) filtered = filtered.filter(t => t.stage === stage)
  res.json({
    traces: filtered,
    total: recentTraces.length,
    runtime: {
      opseeq: { available: opseeqAvailable, route: currentRoute(), failures: opseeqConsecutiveFailures, circuitOpen: opseeqConsecutiveFailures >= OPSEEQ_CIRCUIT_THRESHOLD },
      predictionModel: getEffectivePredictionModel(activeModel),
      agentModel: getEffectiveAgentModel(),
      mode: SIM_MODE ? 'simulation' : 'live',
      uptime: process.uptime(),
    },
  })
})

// Price history for a specific token (Polymarket)
app.get('/api/market/:tokenId/history', async (req, res) => {
  try {
    const { fidelity = '60', startTs } = req.query
    const path = `/polymarket/market/${req.params.tokenId}/price-history?fidelity=${fidelity}${startTs ? `&startTs=${startTs}` : ''}`
    res.json(await synth(path))
  } catch (e) { res.status(502).json({ error: String(e) }) }
})

// Market statistics
app.get('/api/market/:tokenId/stats', async (req, res) => {
  try { res.json(await synth(`/polymarket/market/${req.params.tokenId}/statistics`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Market orderbook depth
app.post('/api/markets/orderbooks', async (req, res) => {
  try { res.json(await synth('/markets/orderbooks', { method: 'POST', body: JSON.stringify(req.body) })) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Batch market prices
app.post('/api/markets/prices', async (req, res) => {
  try { res.json(await synth('/markets/prices', { method: 'POST', body: JSON.stringify(req.body) })) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Market statistics
app.get('/api/markets/statistics', async (_req, res) => {
  try { res.json(await synth('/markets/statistics')) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// Related markets
app.get('/api/markets/related/:slug', async (req, res) => {
  try { res.json(await synth(`/markets/related/${req.params.slug}`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
})

// News for specific event
app.get('/api/news/event/:eventId', async (req, res) => {
  try { res.json(await synth(`/news/event/${req.params.eventId}`)) }
  catch (e) { res.status(502).json({ error: String(e) }) }
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


// Sim wallet mint — max $1000/day, 1 day measured by local date
app.get('/api/wallet/:id/sim/mint/status', (req, res) => {
  try { res.json(simWallet.mintStatus(req.params.id)) }
  catch (e) { res.status(500).json({ error: String(e) }) }
})

app.post('/api/wallet/:id/sim/mint', (req, res) => {
  try {
    const amount = parseFloat(String(req.body.amount || '0'))
    if (!amount || amount <= 0) return res.status(400).json({ error: 'amount required' })
    const result = simWallet.mint(req.params.id, amount)
    if (result.error) return res.status(400).json({ error: result.error })
    audit('sim_mint', 'wallet', { walletId: req.params.id, amount: result.minted })
    res.json({ balance: result.balance, minted: result.minted, status: simWallet.mintStatus(req.params.id) })
  } catch (e) { res.status(500).json({ error: String(e) }) }
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

// Opseeq Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, mode: reqMode } = req.body
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' })
    const chatMode: 'real' | 'sim' | undefined = reqMode === 'real' ? 'real' : reqMode === 'sim' ? 'sim' : undefined
    const result = await runAgentTurn(messages, chatMode)
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
    res.json({
      reply: content || 'Analysis complete. Check the highlighted panels.',
      commands: result.commands,
      messageCount: result.messages.length,
      inference: { model: getEffectiveAgentModel(), route: opseeqAvailable ? 'opseeq' : 'direct', gateway: opseeqAvailable ? OPSEEQ_URL : null },
    })
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Serve frontend
const distDir = resolve(import.meta.dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('/{*path}', (_req, res) => { res.sendFile(join(distDir, 'index.html')) })
}

// Start
refreshWallets().then(async () => {
  if (defaultWalletId) simWallet.ensureExists(defaultWalletId, cachedWallets[0]?.name)
  const predCount = predictionStore.listAll(1).length
  startAggregationWorker(openai, activeModel)
  startCompactionWorker()
  setTimeout(() => { void syncPredictionResolutions(300) }, 5000)
  setInterval(() => { void syncPredictionResolutions(300) }, 60_000)

  const opseeqUp = await probeOpseeq()
  setInterval(() => { void probeOpseeq() }, 12_000)

  app.listen(PORT, HOST, () => {
    console.log(`\n  ⚡ Synth server running at http://127.0.0.1:${PORT}`)
    console.log(`  📊 ${SIM_MODE ? 'SIMULATION' : 'LIVE'} mode | AI: ${openai ? '✓' : '✗'} | DB predictions: ${predCount}`)
    console.log(`  💰 Sim wallet: $${defaultWalletId ? simWallet.getTotal(defaultWalletId) : 0}`)
    console.log(`  🔷 Opseeq: ${opseeqUp ? `connected at ${OPSEEQ_URL}` : `watching ${OPSEEQ_URL} (will auto-detect)`}\n`)
  })
})
