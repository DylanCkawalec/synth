import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Tab, Prediction, ScoredMarket, Balance, Position, PNL, HealthStatus, DeskConfig, PendingAction, AuditEntry, ChatMessage, HighlightCommand, WalletMode, MetaMaskState, MetaMaskToken, DepositAddress, Wallet, SupportedToken, MintStatus, PricePoint, ThinkCommand } from './types.ts'
import { SUPPORTED_CHAINS, CHAIN_IDS, SUPPORTED_TOKENS } from './types.ts'
import * as api from './api.ts'
import { scoreMarkets } from './scoring.ts'

// ── Celebration particle system ───────────────────────────────────
type CelebType = 'fireworks' | 'confetti' | 'money'
interface Particle { id: number; x: number; y: number; emoji: string; delay: number; dur: number; dx: number }
const FIREWORK_EMOJIS = ['🎆','🎇','✨','💥','⭐','🌟','💫']
const CONFETTI_EMOJIS  = ['🎊','🎉','🥳','🏆','⭐','💰','🎈','🥂']
const MONEY_EMOJIS     = ['💵','💸','💴','💶','💷','🪙','💎']

function makeParticles(count: number, emojis: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 30,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    delay: Math.random() * 1.2, dur: 1.5 + Math.random() * 1.5,
    dx: (Math.random() - 0.5) * 200,
  }))
}

function Celebration({ type, onDone }: { type: CelebType; onDone: () => void }) {
  const emojis = type === 'fireworks' ? FIREWORK_EMOJIS : type === 'confetti' ? CONFETTI_EMOJIS : MONEY_EMOJIS
  const count  = type === 'money' ? 18 : 30
  const particles = useMemo(() => makeParticles(count, emojis), [count, emojis])
  const isDown = type !== 'money'

  useEffect(() => {
    const t = setTimeout(onDone, 3800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      {particles.map(p => (
        <span key={p.id} className="absolute text-2xl select-none"
          style={{
            left: `${p.x}%`, top: isDown ? `${p.y}%` : '90%',
            animation: `${isDown ? 'celebFall' : 'celebRise'} ${p.dur}s ease-out ${p.delay}s both`,
            '--dx': `${p.dx}px`,
          } as React.CSSProperties}>
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

// ── Formatters ────────────────────────────────────────────────────
const f = (n: string | number, d = 2) => { const v = typeof n === 'string' ? parseFloat(n) : n; return isNaN(v) ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) }
const ago = (iso: string) => { const d = Date.now() - new Date(iso).getTime(); return d < 6e4 ? 'now' : d < 36e5 ? `${Math.floor(d / 6e4)}m` : d < 864e5 ? `${Math.floor(d / 36e5)}h` : `${Math.floor(d / 864e5)}d` }
const tl = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso).getTime() - Date.now(); return d <= 0 ? 'ended' : d < 6e4 ? '<1m' : d < 36e5 ? `${Math.floor(d / 6e4)}m` : d < 864e5 ? `${Math.floor(d / 36e5)}h` : `${Math.floor(d / 864e5)}d` }
const cc = (c: number) => c >= .75 ? 'bg-s-green' : c >= .5 ? 'bg-s-accent' : c >= .3 ? 'bg-s-warn' : 'bg-s-danger'
const uIcons: Record<string, string> = { critical: '🔴', soon: '🟡', normal: '🟢', distant: '⚪', ended: '⚫' }
const pct = (price: string | number) => { const v = typeof price === 'string' ? parseFloat(price) : price; return isNaN(v) ? '—' : `${Math.round(v * 100)}%` }
const cost = (price: string | number) => { const v = typeof price === 'string' ? parseFloat(price) : price; return isNaN(v) ? '—' : `${Math.round(v * 100)}¢` }
const ts = (iso?: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
}

function truncAddr(addr: string, n = 6) { return addr ? `${addr.slice(0, n)}...${addr.slice(-4)}` : '' }
function isValidEvmAddress(addr: string) { return /^0x[a-fA-F0-9]{40}$/.test(addr) }
function isValidSolAddress(addr: string) { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr) }

// Learning metrics from prediction history
function computeLearningMetrics(preds: Prediction[]) {
  const resolved = preds.filter(p => p.wasCorrect !== null && p.status === 'resolved')
  const correct = resolved.filter(p => p.wasCorrect).length
  const total = resolved.length
  const accuracy = total > 0 ? (correct / total) * 100 : 0
  const avgConfidence = resolved.length > 0
    ? resolved.reduce((sum, p) => sum + p.confidence, 0) / resolved.length
    : 0
  const totalPnl = resolved.reduce((sum, p) => sum + (p.pnl || 0), 0)
  const byLean = {
    YES: { total: 0, correct: 0 },
    NO: { total: 0, correct: 0 }
  }
  for (const p of resolved) {
    if (p.lean === 'YES' || p.lean === 'NO') {
      byLean[p.lean].total++
      if (p.wasCorrect) byLean[p.lean].correct++
    }
  }
  return { total, correct, accuracy, avgConfidence, totalPnl, byLean }
}

function normalizePredictionMarketKey(s: string | null | undefined): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function predictionShadowKey(p: Prediction): string {
  return `${p.mode || 'real'}::${normalizePredictionMarketKey(p.marketName || p.query)}`
}

function upsertPredictionList(prev: Prediction[], incoming: Prediction): Prediction[] {
  const incomingKey = predictionShadowKey(incoming)
  const rest = prev.filter(p => p.id !== incoming.id && predictionShadowKey(p) !== incomingKey)
  return [incoming, ...rest]
}

// ── Wallet connection helpers (MetaMask / Phantom / any EIP-1193) ──
type EthProvider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on: (event: string, cb: (...args: unknown[]) => void) => void; removeListener: (event: string, cb: (...args: unknown[]) => void) => void }

function getEthProvider(): EthProvider | null {
  const w = window as { ethereum?: EthProvider; phantom?: { ethereum?: EthProvider } }
  return w.ethereum || w.phantom?.ethereum || null
}

const USDC_CONTRACTS: Record<number, string> = {
  137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',  // Polygon USDC
  1:   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',  // Ethereum USDC
  8453:'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // Base USDC
  42161:'0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
  10:  '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',  // Optimism USDC
}

async function connectExternalWallet(): Promise<MetaMaskState> {
  const eth = getEthProvider()
  if (!eth) throw new Error('No wallet detected. Install MetaMask or Phantom.')

  const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[]
  if (!accounts || accounts.length === 0) throw new Error('No accounts returned. Unlock your wallet and try again.')

  const address = accounts[0]
  const chainHex = await eth.request({ method: 'eth_chainId' }) as string
  const chainId = parseInt(chainHex, 16)

  let ethBalance = '0'
  try {
    const balHex = await eth.request({ method: 'eth_getBalance', params: [address, 'latest'] }) as string
    ethBalance = (parseInt(balHex, 16) / 1e18).toFixed(4)
  } catch { /* non-fatal */ }

  const tokens: MetaMaskToken[] = []
  const usdcAddr = USDC_CONTRACTS[chainId]
  if (usdcAddr) {
    try {
      const balData = await eth.request({
        method: 'eth_call',
        params: [{ to: usdcAddr, data: `0x70a08231000000000000000000000000${address.slice(2)}` }, 'latest'],
      }) as string
      const usdcBal = (parseInt(balData, 16) / 1e6).toFixed(2)
      tokens.push({ symbol: 'USDC', balance: usdcBal, contract: usdcAddr, canDeposit: true })
    } catch { /* non-fatal */ }
  }

  return {
    connected: true, address, chainId,
    chainName: CHAIN_IDS[chainId] || `Chain ${chainId}`,
    balance: ethBalance,
    supportedTokens: tokens,
  }
}

// ── Sparkline SVG ─────────────────────────────────────────────────
function Sparkline({ points, width = 120, height = 32, color = '#00ffb4' }: { points: PricePoint[]; width?: number; height?: number; color?: string }) {
  if (!points || points.length < 2) return <span className="text-[10px] text-s-muted">No chart data</span>
  const min = Math.min(...points.map(p => p.p)); const max = Math.max(...points.map(p => p.p))
  const range = max - min || 0.01
  const xs = points.map((_, i) => (i / (points.length - 1)) * width)
  const ys = points.map(p => height - ((p.p - min) / range) * (height - 4) - 2)
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const fill = `${d} L${width},${height} L0,${height} Z`
  const trend = points[points.length-1].p - points[0].p
  const trendColor = trend >= 0 ? '#00ffb4' : '#ff4d6d'
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={fill} fill={`${trendColor}18`} stroke="none" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="2.5" fill={trendColor} />
    </svg>
  )
}

// Stage icons for Opseeq thinking
const STAGE_ICONS: Record<string, string> = { observe: '👁', orient: '🧭', research: '🔍', analyze: '📊', decide: '⚡', act: '🎯' }
const STAGE_COLORS: Record<string, string> = { observe: 'text-s-blue', orient: 'text-s-accent', research: 'text-purple-400', analyze: 'text-yellow-400', decide: 'text-s-warn', act: 'text-s-green' }

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [wid, setWid] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [wMode, setWMode] = useState<WalletMode>('real')
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [config, setConfig] = useState<DeskConfig | null>(null)
  const [bal, setBal] = useState<Balance | null>(null)
  const [simBal, setSimBal] = useState<Balance | null>(null)
  const [liveBal, setLiveBal] = useState<Balance | null>(null)
  const [pos, setPos] = useState<Position[]>([])
  const [pnl, setPnl] = useState<PNL | null>(null)
  const [preds, setPreds] = useState<Prediction[]>([])
  const [pending, setPending] = useState<PendingAction[]>([])
  const [mkts, setMkts] = useState<ScoredMarket[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  // Chat
  const [chatOpen, setChatOpen] = useState(true)
  const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Opseeq Agent Gateway integration
  const [opseeqAvailable, setOpseeqAvailable] = useState(false)
  const [opseeqUrl, setOpseeqUrl] = useState('http://127.0.0.1:9090')
  const [opseeqPanel, setOpseeqPanel] = useState(false)
  const [lastInference, setLastInference] = useState<{ model: string; route: string; gateway: string | null } | null>(null)

  // Celebrations
  const [celebration, setCelebration] = useState<CelebType | null>(null)
  const triggerCelebration = useCallback((type: CelebType) => {
    setCelebration(type)
  }, [])

  // Think messages from Opseeq
  const [thinkLog, setThinkLog] = useState<ThinkCommand[]>([])

  // Price history cache per tokenId
  const [priceHistories, setPriceHistories] = useState<Record<string, PricePoint[]>>({})
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null)

  // Approvals filter
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'live' | 'sim'>('all')

  // Predictions mode filter
  const [predModeFilter, setPredModeFilter] = useState<'all' | 'live' | 'sim'>('all')

  // Position view tabs
  const [positionView, setPositionView] = useState<'open' | 'closed'>('open')

  // Sim mint
  const [mintStatus, setMintStatus] = useState<MintStatus | null>(null)
  const [mintAmount, setMintAmount] = useState('100')
  const [mintLoading, setMintLoading] = useState(false)

  // Highlights
  const [highlights, setHighlights] = useState<Map<string, HighlightCommand>>(new Map())

  // Wallet/Deposit/Withdraw
  const [settingsTab, setSettingsTab] = useState<'wallet' | 'deposit' | 'withdraw' | 'config'>('wallet')
  const [metaMask, setMetaMask] = useState<MetaMaskState>({ connected: false, address: null, chainId: null, chainName: null, balance: null, supportedTokens: [] })
  const [depositChain, setDepositChain] = useState('polygon')
  const [depositToken, setDepositToken] = useState<SupportedToken>('USDC')
  const [depositAddresses, setDepositAddresses] = useState<DepositAddress[]>([])
  const [depositLoading, setDepositLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [withdrawChain, setWithdrawChain] = useState('polygon')
  const [withdrawToken, setWithdrawToken] = useState<SupportedToken>('USDC')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawUseMetaMask, setWithdrawUseMetaMask] = useState(true)
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  // Commit approval modal
  const [commitModal, setCommitModal] = useState<Prediction | null>(null)
  const [commitAmt, setCommitAmt] = useState('')
  const [commitDir, setCommitDir] = useState<'YES' | 'NO'>('YES')

  // Crypto auto-predict state
  const [cryptoPredicting, setCryptoPredicting] = useState<Set<string>>(new Set())
  const [predictAllLoading, setPredictAllLoading] = useState(false)

  const openCommitModal = (p: Prediction) => {
    const sugAmt = p.amountUsdc > 0 ? p.amountUsdc : Math.max(p.minEntryUsdc || 0.50, 1)
    setCommitAmt(String(sugAmt.toFixed(2)))
    setCommitDir((p.lean as 'YES' | 'NO') || 'YES')
    setCommitModal(p)
  }

  const confirmCommit = async () => {
    if (!commitModal) return
    const amt = parseFloat(commitAmt) || 0
    if (amt <= 0) { flash('Enter a valid amount'); return }
    if (wMode === 'real' && amt < 1) { flash('Live orders require at least $1.00'); return }
    await placeOrder(commitModal, amt, commitDir)
    setCommitModal(null)
  }

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  // Theme: sim = light, real = dark
  const theme = wMode === 'sim' ? 'light' : 'dark'
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  const addHighlight = useCallback((cmd: HighlightCommand) => {
    setHighlights(prev => new Map(prev).set(cmd.element, cmd))
    setTimeout(() => setHighlights(prev => { const n = new Map(prev); n.delete(cmd.element); return n }), 3500)
  }, [])

  useEffect(() => {
    api.getWallets().then(({ wallets: w, defaultWalletId }) => {
      setWallets(w)
      if (defaultWalletId) setWid(defaultWalletId)
      else if (w.length > 0) setWid(w[0].wallet_id)
    }).catch(() => {})
    api.getConfig().then(c => {
      setConfig(c)
      if (c.simulation) setWMode('sim')
    }).catch(() => {})
  }, [])

  const refresh = useCallback(async () => {
    try { const [h, c] = await Promise.all([api.getHealth(), api.getConfig()]); setHealth(h); setConfig(c) } catch {/**/}
    if (wid) {
      try { setBal(await api.getBalance(wid, wMode)) } catch {/**/}
      try { setSimBal(await api.getBalance(wid, 'sim')) } catch {/**/}
      try { setLiveBal(await api.getBalance(wid, 'real')) } catch {/**/}
      try { setPos(await api.getPositions(wid)) } catch {/**/}
      try { setPnl(await api.getPnl(wid)) } catch {/**/}
    }
    try { setPreds(await api.getPredictions(100)) } catch {/**/}
    try { setPending(await api.getApprovals()) } catch {/**/}
    const days = config?.horizonDays || 7
    try { setMkts(scoreMarkets(await api.getMarkets('', '', 40, days) as Record<string, unknown>[])) } catch {/**/}
    setLastRefresh(Date.now())
  }, [wid, wMode, config?.horizonDays])

  const refreshingRef = useRef(false)
  const debouncedRefresh = useCallback(async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    try { await refresh() } finally { refreshingRef.current = false }
  }, [refresh])

  useEffect(() => { debouncedRefresh() }, [debouncedRefresh])
  useEffect(() => {
    let iv: ReturnType<typeof setInterval>
    const start = () => { iv = setInterval(debouncedRefresh, document.hidden ? 60_000 : 15_000) }
    const onVis = () => { clearInterval(iv); start() }
    start()
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVis) }
  }, [debouncedRefresh])

  useEffect(() => {
    let mounted = true
    const poll = async () => {
      try {
        const s = await api.getOpseeqStatus()
        if (!mounted) return
        setOpseeqAvailable(!!s.available)
        setOpseeqUrl(s.url || 'http://127.0.0.1:9090')
      } catch {
        if (!mounted) return
        setOpseeqAvailable(false)
      }
    }
    void poll()
    const iv = setInterval(() => { void poll() }, 15_000)
    return () => { mounted = false; clearInterval(iv) }
  }, [])

  const predict = async (query: string, navigate = true) => {
    setLoading(true)
    try {
      const p = await api.generatePrediction(query, wid || undefined, wMode === 'sim' ? 'sim' : 'real')
      setPreds(prev => upsertPredictionList(prev, p))
      if (navigate) setTab('predictions')
      flash('Prediction generated')
      return p
    }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Unknown'}`); return null }
    finally { setLoading(false) }
  }

  const predictAndCommit = async (query: string) => {
    setLoading(true)
    try {
      const p = await api.generatePrediction(query, wid || undefined, wMode === 'sim' ? 'sim' : 'real')
      setPreds(prev => upsertPredictionList(prev, p))
      openCommitModal(p)
    }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Unknown'}`) }
    finally { setLoading(false) }
  }

  const cryptoPredict = async (market: ScoredMarket) => {
    const tid = market.token_id
    setCryptoPredicting(prev => new Set(prev).add(tid))
    try {
      const p = await api.generatePrediction(market.market_name || market.event_title, wid || undefined, wMode === 'sim' ? 'sim' : 'real')
      setPreds(prev => upsertPredictionList(prev, p))
      openCommitModal(p)
    } catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Unknown'}`) }
    finally { setCryptoPredicting(prev => { const n = new Set(prev); n.delete(tid); return n }) }
  }

  const predictAllCrypto = async (markets: ScoredMarket[]) => {
    setPredictAllLoading(true)
    const results: Prediction[] = []
    for (const m of markets.slice(0, 6)) {
      try {
        const p = await api.generatePrediction(m.market_name || m.event_title, wid || undefined, wMode === 'sim' ? 'sim' : 'real')
        results.push(p)
        setPreds(prev => upsertPredictionList(prev, p))
      } catch { /* continue */ }
    }
    setPredictAllLoading(false)
    if (results.length > 0) {
      setTab('predictions')
      flash(`${results.length} crypto predictions generated — review and commit`)
    }
  }

  const deletePred = async (id: string) => {
    try { await api.deletePrediction(id); setPreds(prev => prev.filter(p => p.id !== id)); flash('Prediction removed') }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Failed'}`) }
  }

  const [orderLoading, setOrderLoading] = useState<string | null>(null)

  const placeOrder = async (p: Prediction, amountOverride?: number, directionOverride?: 'YES' | 'NO') => {
    const direction = directionOverride || (p.lean as 'YES' | 'NO') || 'YES'
    const chosenTokenId = direction === 'NO' ? (p.noTokenId || p.tokenId) : (p.yesTokenId || p.tokenId)
    if (!wid || !chosenTokenId) { flash('Missing wallet or token ID'); return }
    setOrderLoading(p.id)
    try {
      const rawAmt = amountOverride ?? p.amountUsdc
      const amount = String(wMode === 'real' ? Math.max(rawAmt, 1) : rawAmt)
      const result = await api.placeOrder(wid, {
        predictionId: p.id,
        tokenId: chosenTokenId,
        side: 'BUY',
        type: (p.orderType as 'MARKET' | 'LIMIT') || 'MARKET',
        amount,
        units: 'USDC',
        venue: (p.venue?.toLowerCase().includes('kalshi') ? 'kalshi' : 'polymarket') as 'polymarket' | 'kalshi',
        mode: wMode === 'sim' ? 'sim' : 'real',
      })
      setCommitModal(null)
      if (result.queued) {
        flash('Live order queued — approve it in the Approvals tab to execute')
        setTab('approvals')
        await refresh()
      } else {
        const isSim = wMode === 'sim'
        const autoSizedMsg = result.autoSized && result.amount
          ? ` (auto-sized to $${result.amount} for available liquidity)`
          : ''
        flash(isSim
          ? `Practice bet placed: ${result.orderId?.slice(0, 12)}...${autoSizedMsg}`
          : `🎆 Live order executed: ${result.orderId?.slice(0, 12)}...${autoSizedMsg}${result.balanceAfter?.total ? ` • Balance: $${f(result.balanceAfter.total)}` : ''}`)
        triggerCelebration(isSim ? 'confetti' : 'fireworks')
        setTab('dashboard')
        await refresh()
      }
    } catch (e) { flash(`Order failed: ${e instanceof Error ? e.message : 'Unknown'}`) }
    finally { setOrderLoading(null) }
  }

  const changeModel = async (model: string) => {
    try { await api.setModel(model); setConfig(prev => prev ? { ...prev, model } : prev); flash(`Model → ${model}`) }
    catch (e) { flash(`Failed: ${e instanceof Error ? e.message : ''}`) }
  }

  const changeHorizon = async (days: number) => {
    try {
      await api.setHorizon(days)
      setConfig(prev => prev ? { ...prev, horizonDays: days } : prev)
      await refresh()
      flash(`Horizon → ${days}d`)
    } catch (e) { flash(`Failed: ${e instanceof Error ? e.message : ''}`) }
  }

  const loadPriceHistory = useCallback(async (tokenId: string) => {
    if (!tokenId || priceHistories[tokenId] || loadingHistory === tokenId) return
    setLoadingHistory(tokenId)
    try {
      const result = await api.getPriceHistory(tokenId, 60) as Record<string, unknown>
      // Handle various API response shapes: {history:[...]}, {ohlc:[...]}, or direct array
      let pts: PricePoint[] = []
      if (Array.isArray((result as { history?: unknown }).history)) {
        pts = (result as { history: PricePoint[] }).history
      } else if (Array.isArray((result as { ohlc?: unknown }).ohlc)) {
        pts = ((result as { ohlc: Array<{ time: number; close: number }> }).ohlc)
          .map(c => ({ t: c.time * 1000, p: c.close }))
      } else if (Array.isArray(result)) {
        pts = result as PricePoint[]
      }
      setPriceHistories(prev => ({ ...prev, [tokenId]: pts }))
    } catch { /* non-fatal */ }
    finally { setLoadingHistory(null) }
  }, [priceHistories, loadingHistory])

  const handleMint = async () => {
    if (!wid || mintLoading) return
    setMintLoading(true)
    try {
      const amount = parseFloat(mintAmount) || 0
      if (amount <= 0 || amount > 1000) { flash('Enter an amount between $1 and $1,000'); return }
      const result = await api.mintSimFunds(wid, amount)
      if (result.error) { flash(result.error); return }
      setMintStatus(result.status)
      setBal(await api.getBalance(wid, 'sim'))
      triggerCelebration('money')
      flash(`💵 +$${result.minted.toFixed(2)} added to practice wallet!`)
    } catch (e) { flash(`Mint failed: ${e instanceof Error ? e.message : ''}`) }
    finally { setMintLoading(false) }
  }

  // Load mint status when in sim mode
  useEffect(() => {
    if (wid && wMode === 'sim') {
      api.getMintStatus(wid).then(setMintStatus).catch(() => {})
    }
  }, [wid, wMode])

  const confLabel = (c: number) => {
    const pct = Math.round(c * 100)
    if (c >= 0.75) return { text: `HIGH ${pct}%`, cls: 'bg-s-green/20 text-s-green border-s-green/30' }
    if (c >= 0.50) return { text: `MEDIUM ${pct}%`, cls: 'bg-s-accent/20 text-s-accent border-s-accent/30' }
    if (c >= 0.25) return { text: `LOW ${pct}%`, cls: 'bg-s-warn/20 text-s-warn border-s-warn/30' }
    return { text: `VERY LOW ${pct}%`, cls: 'bg-s-danger/20 text-s-danger border-s-danger/30' }
  }

  const marketEnded = (endsAt: string | null) => {
    if (!endsAt) return false
    return new Date(endsAt).getTime() < Date.now()
  }

  // Opseeq chat
  const sendChat = async (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    const newMsgs = [...chatMsgs, userMsg]
    setChatMsgs(newMsgs)
    setChatInput('')
    setChatLoading(true)
    try {
      setThinkLog([])
      const resp = await api.chat(newMsgs.map(m => ({ role: m.role, content: m.content })), wMode === 'sim' ? 'sim' : 'real')
      const { reply, commands } = resp
      if ((resp as Record<string, unknown>).inference) setLastInference((resp as Record<string, unknown>).inference as typeof lastInference)
      const thinks: ThinkCommand[] = []
      for (const cmd of commands || []) {
        if (cmd.type === 'switch_tab') setTab(cmd.payload as Tab)
        if (cmd.type === 'highlight') addHighlight(cmd.payload as HighlightCommand)
        if (cmd.type === 'think') thinks.push(cmd.payload as ThinkCommand)
      }
      setThinkLog(thinks)
      setChatMsgs(prev => [...prev, { role: 'assistant', content: reply || 'Done.' }])
      debouncedRefresh()
    } catch (e) { setChatMsgs(prev => [...prev, { role: 'assistant', content: `Error: ${e instanceof Error ? e.message : 'Failed'}` }]) }
    finally { setChatLoading(false) }
  }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs, thinkLog, chatLoading])

  useEffect(() => {
    if (!autoMode) return
    const run = () => sendChat('Run the full OODA loop end-to-end: learn from recent prediction outcomes, pick the best market, generate a prediction, queue/place the order, and finish the current trade lifecycle before moving on.')
    const iv = setInterval(run, 90_000)
    run()
    return () => clearInterval(iv)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode])

  const handleConnectWallet = async () => {
    try {
      const state = await connectExternalWallet()
      setMetaMask(state)
      if (state.address) setWithdrawAddress(state.address)
      const usdcBal = state.supportedTokens.find(t => t.symbol === 'USDC')
      flash(`Wallet connected${usdcBal ? ` — ${usdcBal.balance} USDC` : ''}`)
    } catch (e) { flash(e instanceof Error ? e.message : 'Wallet connection failed') }
  }

  useEffect(() => {
    const eth = getEthProvider()
    if (!eth) return
    const handleChainChange = () => { if (metaMask.connected) handleConnectWallet() }
    const handleAccountChange = () => { if (metaMask.connected) handleConnectWallet() }
    eth.on('chainChanged', handleChainChange)
    eth.on('accountsChanged', handleAccountChange)
    return () => {
      eth.removeListener('chainChanged', handleChainChange)
      eth.removeListener('accountsChanged', handleAccountChange)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaMask.connected])

  // Fetch deposit addresses when chain selection changes
  const fetchDepositAddress = useCallback(async () => {
    if (!wid) return
    setDepositLoading(true)
    try {
      const chainIdParam = depositChain === 'solana' ? 'SOL' : 'POL'
      const chainParam = depositChain === 'solana' ? 'SOL' : 'EVM'
      const result = await api.getDepositAddress(wid, chainIdParam, chainParam)
      setDepositAddresses(Array.isArray(result) ? result : [])
    } catch { setDepositAddresses([]) }
    finally { setDepositLoading(false) }
  }, [wid, depositChain])

  useEffect(() => { if (settingsTab === 'deposit') fetchDepositAddress() }, [settingsTab, fetchDepositAddress])

  // Withdraw handler
  const handleWithdraw = async () => {
    const addr = withdrawUseMetaMask && metaMask.address ? metaMask.address : withdrawAddress
    if (!addr) { flash('Enter a withdrawal address'); return }
    if (withdrawChain !== 'solana' && !isValidEvmAddress(addr)) { flash('Invalid EVM address'); return }
    if (withdrawChain === 'solana' && !isValidSolAddress(addr)) { flash('Invalid Solana address'); return }
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) { flash('Enter a valid amount'); return }

    // Chain mismatch warning
    if (metaMask.connected && metaMask.chainName && withdrawUseMetaMask) {
      const mmChain = metaMask.chainName.toLowerCase()
      if (mmChain !== withdrawChain && withdrawChain !== 'solana') {
        const proceed = confirm(`Warning: Your MetaMask is on ${metaMask.chainName} but you're withdrawing on ${withdrawChain}. The funds may be lost if sent to the wrong network. Continue?`)
        if (!proceed) return
      }
    }

    setWithdrawLoading(true)
    try {
      await api.requestWithdrawal(wid, { chain: withdrawChain, token: withdrawToken, amount: withdrawAmount, address: addr })
      flash('Withdrawal submitted')
      setWithdrawAmount('')
    } catch (e) { flash(`Withdrawal failed: ${e instanceof Error ? e.message : 'Unknown error'}`) }
    finally { setWithdrawLoading(false) }
  }

  // Computed values
  const totalPnl = parseFloat(pnl?.total_pnl || '0')
  const total = parseFloat(bal?.total || '0')
  const avail = parseFloat(bal?.available || '0')
  const committed = total - avail
  const util = total > 0 ? (committed / total) * 100 : 0
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const refreshAge = Math.round((Date.now() - lastRefresh) / 1000)

  // Live Polymarket positions split by whether market has ended
  const liveOpenPos = useMemo(() => pos.filter(pp => {
    const endsAt = pp.market?.ends_at || pp.event?.ends_at || null
    if (!endsAt) return true
    return new Date(endsAt).getTime() > Date.now()
  }), [pos])
  const liveClosedPos = useMemo(() => pos.filter(pp => {
    const endsAt = pp.market?.ends_at || pp.event?.ends_at || null
    return !!endsAt && new Date(endsAt).getTime() <= Date.now()
  }), [pos])

  // Sim/practice positions: committed bets. Split into open vs ended.
  const simPositions = useMemo(() => {
    const isSim = (p: Prediction) => p.mode === 'sim' || (p.orderId && String(p.orderId).startsWith('sim_'))
    return preds.filter(p => isSim(p) && (p.status === 'committed' || !!p.orderId) && p.status !== 'resolved')
  }, [preds])
  const simOpenPos = useMemo(() => simPositions.filter(p =>
    !p.endsAt || new Date(p.endsAt).getTime() > Date.now()
  ), [simPositions])
  const simClosedPos = useMemo(() => simPositions.filter(p =>
    !!p.endsAt && new Date(p.endsAt).getTime() <= Date.now()
  ), [simPositions])

  // Resolved predictions (outcome known)
  const resolvedPreds = useMemo(() =>
    preds.filter(p => p.status === 'resolved' || p.wasCorrect !== null)
      .sort((a, b) => new Date(b.resolvedAt || b.createdAt).getTime() - new Date(a.resolvedAt || a.createdAt).getTime())
  , [preds])

  // Deduplicate: one card per market+mode combination, latest wins
  // Committed positions are always kept; generated are deduped by market+day
  const dedupedPreds = useMemo(() => {
    const modeMatch = (p: Prediction) =>
      predModeFilter === 'all' ||
      (predModeFilter === 'live' && p.mode !== 'sim') ||
      (predModeFilter === 'sim' && p.mode === 'sim')
    const isCommittedStatus = (s: string) => s === 'committed' || s === 'committed_live' || s === 'committed_sim'
    const committed = preds.filter(p => (isCommittedStatus(p.status) || !!p.orderId) && modeMatch(p))
    const seen = new Map<string, Prediction>()
    const maxDaysOut = 60
    for (const p of preds) {
      if (isCommittedStatus(p.status) || !!p.orderId) continue
      if (p.status === 'resolved') continue
      if (!modeMatch(p)) continue
      if (p.endsAt) {
        const daysOut = (new Date(p.endsAt).getTime() - Date.now()) / 864e5
        if (daysOut > maxDaysOut || daysOut < 0) continue
      }
      const dayKey = p.createdAt.slice(0, 10)
      const key = `${p.mode || 'real'}::${normalizePredictionMarketKey(p.marketName || p.query)}::${dayKey}`
      if (!seen.has(key)) seen.set(key, p)
    }
    const generated = [...seen.values()]
    const filteredResolved = resolvedPreds.filter(modeMatch)
    const all = [...committed, ...generated, ...filteredResolved].sort((a, b) => {
      const aResolved = a.status === 'resolved'
      const bResolved = b.status === 'resolved'
      if (aResolved !== bResolved) return aResolved ? 1 : -1
      const aEnds = a.endsAt ? new Date(a.endsAt).getTime() : Infinity
      const bEnds = b.endsAt ? new Date(b.endsAt).getTime() : Infinity
      return aEnds - bEnds
    })
    const ids = new Set<string>()
    return all.filter(p => { if (ids.has(p.id)) return false; ids.add(p.id); return true })
  }, [preds, resolvedPreds, predModeFilter])

  // Group by dateLabel for section headers
  const groupedPreds = useMemo(() => {
    const groups: Record<string, Prediction[]> = { today: [], yesterday: [], this_week: [], older: [] }
    for (const p of dedupedPreds) {
      const lbl = p.dateLabel || 'older'
      groups[lbl].push(p)
    }
    return groups
  }, [dedupedPreds])

  const GROUP_LABELS: Record<string, string> = {
    today: 'Today', yesterday: 'Yesterday', this_week: 'This Week', older: 'Older',
  }

  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const currentDepositAddr = useMemo(() => {
    if (depositAddresses.length === 0) return null
    const match = depositAddresses.find(d => d.tokens.some(t => t.token === depositToken))
    return match || depositAddresses[0]
  }, [depositAddresses, depositToken])

  // Network mismatch indicator
  const networkMismatch = useMemo(() => {
    if (!metaMask.connected || !metaMask.chainName) return null
    const mmChain = metaMask.chainName.toLowerCase()
    if (settingsTab === 'deposit' && mmChain !== depositChain && depositChain !== 'solana') {
      return `MetaMask is on ${metaMask.chainName}. Switch to ${depositChain} in MetaMask to deposit directly.`
    }
    if (settingsTab === 'withdraw' && mmChain !== withdrawChain && withdrawChain !== 'solana' && withdrawUseMetaMask) {
      return `MetaMask is on ${metaMask.chainName}, but you're withdrawing on ${withdrawChain}. Funds could be lost.`
    }
    return null
  }, [metaMask, settingsTab, depositChain, withdrawChain, withdrawUseMetaMask])

  const hl = (id: string) => {
    const h = highlights.get(id)
    if (!h) return 'transition-all duration-500'
    const tone = h.tone || 'await'
    const toneCls = tone === 'selection'
      ? 'ring-pink-400/80 shadow-[0_0_24px_rgba(244,114,182,0.35)]'
      : tone === 'execute'
        ? 'ring-emerald-400/80 shadow-[0_0_24px_rgba(16,185,129,0.35)]'
        : 'ring-orange-300/80 shadow-[0_0_24px_rgba(251,146,60,0.35)]'
    const actionCls = h.action === 'click' ? 'animate-pulse' : 'animate-[pulse_1.6s_ease-in-out_infinite]'
    return `ring-2 ${toneCls} ${actionCls} transition-all duration-500`
  }
  const hlTooltip = (id: string) => {
    const h = highlights.get(id)
    if (!h) return null
    const tone = h.tone || 'await'
    const tipCls = tone === 'selection'
      ? 'bg-pink-400 text-black'
      : tone === 'execute'
        ? 'bg-emerald-400 text-black'
        : 'bg-orange-300 text-black'
    return <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap z-50 animate-pulse ${tipCls}`}>{h.message || 'Focus here'}</div>
  }

  const toggleMode = () => setWMode(prev => prev === 'real' ? 'sim' : 'real')
  const rightDockPx = (chatOpen ? 360 : 0) + (opseeqPanel ? 560 : 0)

  return (
    <div className="min-h-screen flex flex-col font-sans text-[13px]">
      {celebration && <Celebration type={celebration} onDone={() => setCelebration(null)} />}

      {/* ── COMMIT APPROVAL MODAL ── */}
      {commitModal && (() => {
        const p = commitModal
        const isSim = wMode === 'sim'
        const modeBal = isSim ? simBal : liveBal
        const modeTotal = parseFloat(modeBal?.total || '0')
        const leanPrice = commitDir === 'YES' ? p.yesPrice : p.noPrice
        const amt = parseFloat(commitAmt) || 0
        const exchangeMin = isSim ? 0.10 : 1.00
        const shareFloor = leanPrice > 0 && leanPrice < 1 ? leanPrice : 0
        const minE = Math.max(exchangeMin, shareFloor, p.minEntryUsdc || 0)
        const maxA = Math.max(minE, Math.min(p.maxAffordableUsdc || 1000, modeTotal))
        const canAffordAnything = modeTotal >= minE
        const estShares = leanPrice > 0 ? (amt / leanPrice) : 0
        const quickAmts = [1, 2, 5, 10, 25, 50, 100].filter(a => a >= minE && a <= maxA)
        const isPlacing = orderLoading === p.id
        return (
          <div className="fixed inset-0 z-[900] flex items-center justify-center" onClick={() => !isPlacing && setCommitModal(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Mode banner */}
              <div className={`px-5 py-3 text-center text-sm font-black tracking-wider ${
                isSim ? 'bg-s-blue text-white' : 'bg-s-warn text-black'
              }`}>
                {isSim ? '🔵 PRACTICE MODE — No Real Money' : '🔴 LIVE MODE — Real Money'}
              </div>

              <div className="bg-s-surface p-5 space-y-4">
                {/* Balance bar */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${isSim ? 'bg-s-blue/10 border border-s-blue/20' : 'bg-s-warn/10 border border-s-warn/20'}`}>
                  <span className="text-s-muted">Your {isSim ? 'practice' : 'live'} balance</span>
                  <span className="font-black text-base">${f(modeTotal)}</span>
                </div>
                {!canAffordAnything && (
                  <div className="bg-s-danger/10 border border-s-danger/30 rounded-lg px-3 py-2 text-xs text-s-danger font-semibold">
                    Insufficient balance. Min bet is ${f(minE)}. {isSim ? 'Mint practice funds in Settings.' : 'Deposit funds in Settings > Deposit.'}
                  </div>
                )}

                {/* Market name */}
                <div>
                  <div className="text-[10px] text-s-muted uppercase tracking-wider mb-1">Market</div>
                  <div className="text-sm font-bold">{p.marketName || p.query}</div>
                  <div className="flex gap-3 mt-1 text-[10px] text-s-muted">
                    <span>{p.venue}</span>
                    <span>Ends {tl(p.endsAt)}</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded ${cc(p.confidence)} text-black`}>{Math.round(p.confidence * 100)}%</span>
                  </div>
                  {p.thesis && <div className="text-[10px] text-s-muted mt-1 italic">"{p.thesis.slice(0, 100)}"</div>}
                </div>

                {/* STEP 1: Direction — big prominent YES / NO */}
                <div>
                  <div className="text-[10px] text-s-muted uppercase tracking-wider mb-1">Step 1 — Pick your side</div>
                  <div className="flex gap-3">
                    <button onClick={() => setCommitDir('YES')}
                      className={`flex-1 py-4 rounded-xl transition-all ${
                        commitDir === 'YES'
                          ? 'bg-s-green text-black ring-2 ring-s-green shadow-lg shadow-s-green/30 scale-[1.02]'
                          : 'bg-s-elevated text-s-muted hover:text-s-green hover:bg-s-green/10 border-2 border-s-border hover:border-s-green/40'
                      }`}>
                      <div className="text-base font-black">YES — It happens</div>
                      <div className="text-[10px] opacity-80">{pct(p.yesPrice)} chance · {cost(p.yesPrice)}/share</div>
                    </button>
                    <button onClick={() => setCommitDir('NO')}
                      className={`flex-1 py-4 rounded-xl transition-all ${
                        commitDir === 'NO'
                          ? 'bg-s-danger text-white ring-2 ring-s-danger shadow-lg shadow-s-danger/30 scale-[1.02]'
                          : 'bg-s-elevated text-s-muted hover:text-s-danger hover:bg-s-danger/10 border-2 border-s-border hover:border-s-danger/40'
                      }`}>
                      <div className="text-base font-black">NO — It doesn't</div>
                      <div className="text-[10px] opacity-80">{pct(p.noPrice)} chance · {cost(p.noPrice)}/share</div>
                    </button>
                  </div>
                  {p.lean && (
                    <div className={`mt-2 text-[10px] px-3 py-1.5 rounded-lg border ${
                      p.lean === 'YES' ? 'bg-s-green/10 border-s-green/20 text-s-green' : 'bg-s-danger/10 border-s-danger/20 text-s-danger'
                    }`}>
                      AI leans <strong>{p.lean}</strong>: {p.leanReason?.slice(0, 80) || p.thesis?.slice(0, 80)}
                    </div>
                  )}
                </div>

                {/* STEP 2: Amount */}
                <div>
                  <div className="text-[10px] text-s-muted uppercase tracking-wider mb-2">Step 2 — How much?</div>
                  <div className="flex items-center gap-2 bg-s-bg border-2 border-s-border rounded-lg px-4 py-3 focus-within:border-s-accent transition-colors">
                    <span className="text-lg font-bold text-s-muted">$</span>
                    <input type="number" step="0.01" min={minE} max={maxA} value={commitAmt}
                      onChange={e => setCommitAmt(e.target.value)}
                      className="flex-1 bg-transparent text-2xl font-black text-s-text outline-none" autoFocus />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {quickAmts.slice(0, 6).map(a => (
                      <button key={a} onClick={() => setCommitAmt(String(a))}
                        className={`flex-1 py-1.5 rounded text-[11px] font-bold transition-all ${
                          Math.round(amt) === a
                            ? 'bg-s-accent text-black'
                            : 'bg-s-elevated text-s-muted border border-s-border hover:border-s-accent hover:text-s-text'
                        }`}>
                        ${a}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-s-muted">
                    <span>Min: ${f(minE)} · Max: ${f(maxA)}</span>
                    <span>~{f(estShares, 1)} shares @ ${f(leanPrice)}</span>
                  </div>
                </div>

                {/* STEP 3: Review & Confirm */}
                <div>
                  <div className="text-[10px] text-s-muted uppercase tracking-wider mb-2">Step 3 — Confirm</div>
                  <div className="bg-s-panel rounded-xl p-4 border border-s-border space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-s-muted">Position</span>
                      <span className="font-black text-base">
                        <span className={commitDir === 'YES' ? 'text-s-green' : 'text-s-danger'}>{commitDir}</span>
                        {' '}${f(amt)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-s-muted">Entry price</span>
                      <span className="font-mono font-bold">${f(leanPrice)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-s-muted">Est. shares</span>
                      <span className="font-mono font-bold">{f(estShares, 2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-s-muted">Potential payout if correct</span>
                      <span className="font-bold text-s-green text-base">${f(leanPrice > 0 ? amt / leanPrice : 0)}</span>
                    </div>
                    <div className="h-px bg-s-border my-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-s-muted">Mode</span>
                      <span className={`font-black ${isSim ? 'text-s-blue' : 'text-s-warn'}`}>{isSim ? '🔵 PRACTICE' : '🔴 LIVE'}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button onClick={() => setCommitModal(null)} disabled={isPlacing}
                    className="py-3 px-4 rounded-lg text-xs font-bold bg-s-elevated text-s-muted border border-s-border hover:text-s-text transition-all">
                    Cancel
                  </button>
                  <button onClick={() => { setCommitModal(null); predict(p.marketName || p.query, true) }} disabled={isPlacing}
                    className="py-3 px-4 rounded-lg text-xs font-bold bg-s-elevated text-s-muted border border-s-border hover:text-s-accent transition-all"
                    title="Generate a new AI analysis for this market">
                    ↻ Re-predict
                  </button>
                  <button onClick={confirmCommit} disabled={isPlacing || amt <= 0 || amt > maxA || !canAffordAnything}
                    className={`flex-1 py-3.5 rounded-lg text-sm font-black transition-all disabled:opacity-40 ${
                      isSim
                        ? 'bg-s-green text-black hover:brightness-110 shadow-lg shadow-s-green/20'
                        : 'bg-s-warn text-black hover:brightness-110 shadow-lg shadow-s-warn/20'
                    }`}>
                    {isPlacing ? 'Placing Order...' : isSim
                      ? `✓ Place Practice Bet — $${f(amt)} ${commitDir}`
                      : `✓ Place Live Order — $${f(amt)} ${commitDir}`
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Header */}
      <header className="flex items-center justify-between px-5 h-12 bg-s-surface border-b border-s-border sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-[3px] text-s-accent">SYNTH</h1>
        </div>
        <nav className="flex gap-0.5">
          {(['dashboard','markets','predictions','approvals','audit','settings'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'audit') api.getAudit().then(setAudit).catch(() => {}) }}
              className={`px-3 py-1.5 rounded text-xs transition-all duration-200 ${tab === t ? 'text-s-accent bg-s-panel border-b-2 border-s-accent' : 'text-s-muted hover:text-s-text hover:bg-s-panel/50'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'approvals' && ((health as (HealthStatus & { pendingApprovals?: number }))?.pendingApprovals || pending.length) > 0 && (
                <span className="ml-1.5 bg-s-danger text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {(health as (HealthStatus & { pendingApprovals?: number }))?.pendingApprovals || pending.length}
                </span>
              )}
              {t === 'predictions' && preds.length > 0 && <span className="ml-1 bg-s-blue text-white text-[9px] px-1.5 rounded-full font-bold">{preds.length}</span>}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setOpseeqPanel(!opseeqPanel)}
            className={`text-[10px] px-2 py-1 rounded font-semibold transition-all ${opseeqPanel ? 'bg-s-blue text-black' : 'bg-s-elevated text-s-muted hover:text-s-text'}`}>
            Console
          </button>
          {!opseeqAvailable && (
            <button onClick={() => api.launchOpseeq().then(() => flash('Starting Opseeq...')).catch(() => flash('Failed to start Opseeq'))}
              className="text-[10px] px-2 py-1 rounded font-semibold bg-s-warn/20 text-s-warn hover:brightness-110">
              Start Opseeq
            </button>
          )}
          <button onClick={() => setChatOpen(!chatOpen)} className={`text-[10px] px-2 py-1 rounded font-semibold transition-all ${chatOpen ? 'bg-s-accent text-black' : 'bg-s-elevated text-s-muted hover:text-s-text'}`}>
            Opseeq
          </button>
          <span className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-s-green shadow-[0_0_6px] shadow-s-green' : 'bg-s-danger'}`} />
        </div>
      </header>

      {/* Wallet Strip */}
      <div data-synth-id="wallet-strip" className={`relative flex items-center px-5 h-9 bg-s-surface border-b border-s-border overflow-x-auto gap-0 text-xs ${hl('wallet-strip')}`}>
        {hlTooltip('wallet-strip')}
        {/* Mode Toggle */}
        <div className="flex items-center gap-0.5 px-3 border-r border-s-border">
          <button onClick={toggleMode}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
              wMode === 'real'
                ? 'bg-s-accent text-black'
                : 'bg-s-elevated text-s-muted'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${wMode === 'real' ? 'bg-black' : 'bg-s-accent'} transition-colors`} />
            {wMode === 'real' ? 'LIVE' : 'PRACTICE'}
          </button>
        </div>

        {/* Active balance (mode-specific) */}
        <div className="flex items-center gap-1.5 px-3 border-r border-s-border whitespace-nowrap">
          <span className="text-[10px] text-s-muted uppercase tracking-wide">{wMode === 'sim' ? 'Practice $' : 'Live $'}</span>
          <span className="font-bold font-mono text-s-text">{f(bal?.total || '0')}</span>
        </div>

        {/* Other mode balance (dimmed) */}
        <div className="flex items-center gap-1.5 px-3 border-r border-s-border whitespace-nowrap opacity-50">
          <span className="text-[10px] text-s-muted uppercase tracking-wide">{wMode === 'sim' ? 'Live $' : 'Practice $'}</span>
          <span className="font-semibold font-mono text-s-muted">{f(wMode === 'sim' ? (liveBal?.total || '0') : (simBal?.total || '0'))}</span>
        </div>

        {[
          ['P&L', `${totalPnl >= 0 ? '+' : ''}$${f(Math.abs(totalPnl))}`],
          ['Positions', String(preds.filter(p => (p.orderId || p.status === 'committed') && p.wasCorrect === null).length + liveOpenPos.length)],
        ].map(([label, value], i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 border-r border-s-border last:border-r-0 whitespace-nowrap">
            <span className="text-[10px] text-s-muted uppercase tracking-wide">{label}</span>
            <span className={`font-semibold font-mono ${label === 'P&L' ? (totalPnl >= 0 ? 'text-s-green' : 'text-s-danger') : 'text-s-text'}`}>{value}</span>
          </div>
        ))}

        {/* Last updated */}
        <div className="flex items-center gap-1.5 px-3 border-r border-s-border whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full bg-s-green ${refreshAge < 3 ? 'animate-ping' : ''}`} />
          <span className="text-[10px] text-s-muted">{refreshAge < 5 ? 'Live' : `${refreshAge}s ago`}</span>
        </div>

        {/* MetaMask indicator */}
        {metaMask.connected && (
          <div className="flex items-center gap-1.5 px-3 ml-auto whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-s-green" />
            <span className="text-[10px] text-s-muted">{truncAddr(metaMask.address || '')}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 p-3 overflow-y-auto transition-all duration-300 min-h-0" style={{ marginRight: rightDockPx > 0 ? `${rightDockPx}px` : undefined }}>
          {toast && <div className="fixed top-14 right-5 bg-s-panel border border-s-accent text-s-text px-4 py-2.5 rounded text-xs z-50 animate-[slideIn_0.2s_ease-out]">{toast}</div>}

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (() => {
            const metrics = computeLearningMetrics(preds)
            const livePnl = parseFloat(pnl?.total_pnl || '0')
            const liveBal$ = parseFloat(liveBal?.total || '0')
            const simBal$ = parseFloat(simBal?.total || '0')
            const allOpenCount = liveOpenPos.length + simOpenPos.length
            const closedCount = liveClosedPos.length + simClosedPos.length + resolvedPreds.length
            const closingSoon = mkts.filter(m => m.minutesLeft !== null && m.minutesLeft > 0 && m.minutesLeft <= 2880)
              .sort((a, b) => (a.minutesLeft ?? 9999) - (b.minutesLeft ?? 9999))
            const cryptoMkts = mkts
              .filter(m => (m.market_name || m.event_title || '').match(/\b(btc|eth|sol|doge|xrp|bnb|bitcoin|ethereum|solana|crypto|hype|hyperliquid)\b/i))
              .sort((a, b) => (a.minutesLeft ?? 99999) - (b.minutesLeft ?? 99999))
              .slice(0, 8)
            return (
            <div className="flex flex-col gap-3">

              {/* ── METRIC ROW — compact single-line KPI strip ── */}
              <div className="flex items-center gap-px bg-s-border rounded-xl overflow-hidden border border-s-border">
                {[
                  { label: 'Live', value: `$${f(liveBal$)}`, sub: `${liveOpenPos.length} pos`, color: 'text-s-warn', dot: 'bg-s-warn' },
                  { label: 'Practice', value: `$${f(simBal$)}`, sub: `${simOpenPos.length} bets`, color: 'text-s-blue', dot: 'bg-s-blue' },
                  { label: 'Unrealized P&L', value: `${livePnl >= 0 ? '+' : ''}$${f(Math.abs(livePnl))}`, sub: livePnl < 0 ? 'loss' : 'gain', color: livePnl >= 0 ? 'text-s-green' : 'text-s-danger', dot: livePnl >= 0 ? 'bg-s-green' : 'bg-s-danger' },
                  { label: 'AI Accuracy', value: metrics.total > 0 ? `${metrics.accuracy.toFixed(0)}%` : '—', sub: `${metrics.correct}/${metrics.total} calls`, color: metrics.accuracy >= 55 ? 'text-s-green' : 'text-s-warn', dot: 'bg-s-accent' },
                  { label: 'Open Positions', value: String(allOpenCount), sub: `${closedCount} closed`, color: 'text-s-text', dot: 'bg-s-muted' },
                ].map((s, i) => (
                  <div key={i} className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-s-surface">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="min-w-0 flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-sm font-black font-mono leading-none ${s.color}`}>{s.value}</span>
                      <span className="text-[9px] text-s-muted uppercase tracking-wide leading-none">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── BODY: 3-island grid — Positions | Feed | (Crypto stacked below feed) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">

                {/* ─── LEFT: MY POSITIONS ─── */}
                <div className="bg-s-surface border border-s-border rounded-xl overflow-hidden flex flex-col">
                  {/* Island header */}
                  <div className="flex items-center gap-3 px-3 py-2.5 border-b border-s-border flex-shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-s-muted">Positions</span>
                    <div className="flex bg-s-elevated rounded p-0.5 ml-auto">
                      <button onClick={() => setPositionView('open')} className={`px-2.5 py-0.5 rounded text-[9px] font-bold transition-all ${positionView === 'open' ? 'bg-s-accent text-black' : 'text-s-muted hover:text-s-text'}`}>
                        Open ({allOpenCount})
                      </button>
                      <button onClick={() => setPositionView('closed')} className={`px-2.5 py-0.5 rounded text-[9px] font-bold transition-all ${positionView === 'closed' ? 'bg-s-accent text-black' : 'text-s-muted hover:text-s-text'}`}>
                        Closed ({closedCount})
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 p-2 overflow-y-auto" style={{maxHeight:'calc(100vh - 260px)'}}>
                    {positionView === 'open' && (
                      <>
                        {liveOpenPos.length === 0 && simOpenPos.length === 0 && (
                          <div className="text-center py-8 text-s-muted">
                            <div className="text-2xl mb-2">🎯</div>
                            <p className="text-xs">No open positions — click a market in the feed to predict &amp; commit</p>
                          </div>
                        )}
                        {liveOpenPos.length > 0 && (
                          <div className="rounded-lg overflow-hidden border border-s-warn/30">
                            <div className="px-2.5 py-1.5 bg-s-warn/10 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-s-warn animate-pulse" />
                              <span className="text-[8px] font-bold text-s-warn uppercase tracking-widest">Live · Real Money</span>
                            </div>
                            {liveOpenPos.map((pp, i) => {
                              const po = pp.position; const ev = pp.event; const mk = pp.market
                              const title = ev?.title || mk?.question || pp.title || '—'
                              const outcome = po?.outcome || pp.side || '—'
                              const pnlNum = parseFloat(po?.amount_pnl || pp.pnl || '0')
                              const pnlPct = parseFloat(po?.percent_pnl || '0')
                              const endsAt = mk?.ends_at || ev?.ends_at || null
                              return (
                                <div key={`lp-${i}`} className="flex items-center gap-2 px-2.5 py-2 bg-s-panel border-t border-s-border/50">
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${outcome === 'Yes' ? 'bg-s-green/20 text-s-green' : 'bg-s-danger/20 text-s-danger'}`}>{outcome.toUpperCase()}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate leading-tight">{title}</div>
                                    <div className="text-[9px] text-s-muted mt-0.5">{f(po?.shares || pp.size || '0', 1)} sh · avg {cost(po?.avg_price || '0')} → {cost(po?.current_price || '0')} · val ${f(po?.current_value || '0')}{endsAt ? ` · ⏱${tl(endsAt)}` : ''}</div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className={`text-sm font-black leading-tight ${pnlNum >= 0 ? 'text-s-green' : 'text-s-danger'}`}>{pnlNum >= 0 ? '+' : ''}${f(Math.abs(pnlNum))}</div>
                                    <div className={`text-[9px] ${pnlPct >= 0 ? 'text-s-green' : 'text-s-danger'}`}>{pnlPct.toFixed(0)}%</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {simOpenPos.length > 0 && (
                          <div className="rounded-lg overflow-hidden border border-s-blue/20">
                            <div className="px-2.5 py-1.5 bg-s-blue/10 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-s-blue" />
                              <span className="text-[8px] font-bold text-s-blue uppercase tracking-widest">Practice · Simulated</span>
                            </div>
                            {simOpenPos.map(p => (
                              <div key={p.id} className="flex items-center gap-2 px-2.5 py-2 bg-s-panel border-t border-s-border/50">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${p.lean === 'YES' ? 'bg-s-green/20 text-s-green' : 'bg-s-danger/20 text-s-danger'}`}>{p.lean}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate leading-tight">{p.marketName || p.query}</div>
                                  <div className="text-[9px] text-s-muted mt-0.5">Wager ${f(p.amountUsdc)} · {pct(p.lean === 'YES' ? p.yesPrice : p.noPrice)} implied · {Math.round(p.confidence * 100)}% conf</div>
                                </div>
                                <span className={`text-[9px] font-bold flex-shrink-0 ${(p.endsAt && (new Date(p.endsAt).getTime() - Date.now()) < 36e5) ? 'text-s-danger' : 'text-s-warn'}`}>{tl(p.endsAt)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {positionView === 'closed' && (
                      <>
                        {simClosedPos.length === 0 && liveClosedPos.length === 0 && resolvedPreds.length === 0 && (
                          <div className="text-center py-8 text-s-muted">
                            <div className="text-2xl mb-2">📊</div>
                            <p className="text-xs">No closed positions yet</p>
                          </div>
                        )}
                        {simClosedPos.length > 0 && (
                          <div className="rounded-lg overflow-hidden border border-s-border">
                            <div className="px-2.5 py-1.5 bg-s-elevated flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-s-muted" />
                              <span className="text-[8px] font-bold text-s-muted uppercase tracking-widest">Practice · Awaiting result</span>
                            </div>
                            {simClosedPos.map(p => (
                              <div key={p.id} className="flex items-center gap-2 px-2.5 py-2 bg-s-panel border-t border-s-border/50">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${p.lean === 'YES' ? 'bg-s-green/20 text-s-green' : 'bg-s-danger/20 text-s-danger'}`}>{p.lean}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate leading-tight">{p.marketName || p.query}</div>
                                  <div className="text-[9px] text-s-muted">Wager ${f(p.amountUsdc)} · ended {ago(p.endsAt || p.createdAt)}</div>
                                </div>
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted">Syncing…</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {liveClosedPos.length > 0 && (
                          <div className="rounded-lg overflow-hidden border border-s-warn/20">
                            <div className="px-2.5 py-1.5 bg-s-warn/10 flex items-center gap-1.5">
                              <span className="text-[8px] font-bold text-s-warn uppercase tracking-widest">Live · Closed</span>
                            </div>
                            {liveClosedPos.map((lp, i) => {
                              const po = lp.position; const title = lp.event?.title || lp.market?.question || lp.title || '—'
                              const pnlNum = parseFloat(po?.amount_pnl || lp.pnl || '0')
                              return (
                                <div key={`clp-${i}`} className="flex items-center gap-2 px-2.5 py-2 bg-s-panel border-t border-s-border/50">
                                  <span className="text-sm">{pnlNum >= 0 ? '✅' : '❌'}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate">{title}</div>
                                    <div className="text-[9px] text-s-muted">{po?.outcome || '—'} · {f(po?.shares || '0', 1)} shares</div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className={`text-xs font-bold ${pnlNum >= 0 ? 'text-s-green' : 'text-s-danger'}`}>{pnlNum >= 0 ? '+' : ''}${f(Math.abs(pnlNum))}</div>
                                    <div className="text-[9px] text-s-muted">{po?.percent_pnl || '—'}%</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        {resolvedPreds.length > 0 && (
                          <div className="rounded-lg overflow-hidden border border-s-border">
                            <div className="px-2.5 py-1.5 bg-s-elevated flex items-center gap-1.5">
                              <span className="text-[8px] font-bold text-s-accent uppercase tracking-widest">Resolved · Outcome known</span>
                            </div>
                            {resolvedPreds.slice(0, 20).map(p => (
                              <div key={p.id} className="flex items-center gap-2 px-2.5 py-2 bg-s-panel border-t border-s-border/50">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${p.wasCorrect ? 'bg-s-green/20 text-s-green' : 'bg-s-danger/20 text-s-danger'}`}>{p.wasCorrect ? '✓' : '✗'}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate leading-tight">{p.marketName || p.query}</div>
                                  <div className="text-[9px] text-s-muted">{p.lean} · {p.mode === 'sim' ? 'Practice' : 'Live'} · {ago(p.resolvedAt || p.createdAt)}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className={`text-xs font-bold ${(p.pnl || 0) >= 0 ? 'text-s-green' : 'text-s-danger'}`}>{(p.pnl || 0) >= 0 ? '+' : ''}${f(Math.abs(p.pnl || 0))}</div>
                                  <div className="text-[9px] text-s-muted">{Math.round(p.confidence * 100)}% conf</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ─── RIGHT: Feed (Closing Soon + Crypto stacked) ─── */}
                <div className="flex flex-col gap-3 min-w-0">

                  {/* Closing Soon feed */}
                  <div data-synth-id="closing-soon" className={`bg-s-surface border border-s-border rounded-xl overflow-hidden flex flex-col flex-1 ${hl('closing-soon')}`}>
                    {hlTooltip('closing-soon')}
                    <div className="px-3 py-2.5 border-b border-s-border flex-shrink-0 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-s-muted">Closing Soon</span>
                      <span className="text-[8px] text-s-accent">tap → predict</span>
                    </div>
                    <div className="overflow-y-auto flex-1" style={{maxHeight:'calc(100vh - 400px)', minHeight:'160px'}}>
                      {closingSoon.slice(0, 15).map(m => (
                        <div key={m.token_id} onClick={() => predictAndCommit(m.market_name || m.event_title)}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-s-panel border-b border-s-border/40 last:border-0 transition-colors">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${(m.minutesLeft ?? 9999) < 60 ? 'bg-s-danger' : (m.minutesLeft ?? 9999) < 360 ? 'bg-s-warn' : 'bg-s-accent'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-medium truncate leading-tight">{m.market_name || m.event_title}</div>
                            <div className="flex gap-2 mt-0.5 text-[8px] text-s-muted">
                              <span className="text-s-green font-semibold">Y {pct(m.yes_price)}</span>
                              <span className="text-s-danger font-semibold">N {pct(m.no_price)}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black flex-shrink-0 ${(m.minutesLeft ?? 9999) < 60 ? 'text-s-danger' : (m.minutesLeft ?? 9999) < 360 ? 'text-s-warn' : 'text-s-accent'}`}>{tl(m.ends_at)}</span>
                        </div>
                      ))}
                      {closingSoon.length === 0 && <div className="text-center py-6 text-[10px] text-s-muted">Loading…</div>}
                    </div>
                  </div>

                  {/* Crypto quick bets — compact list */}
                  {cryptoMkts.length > 0 && (
                    <div data-synth-id="crypto-bets" className={`bg-s-surface border border-s-border rounded-xl overflow-hidden flex-shrink-0 ${hl('crypto-bets')}`}>
                      {hlTooltip('crypto-bets')}
                      <div className="px-3 py-2 border-b border-s-border flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-s-muted">⚡ Crypto</span>
                        <button onClick={() => predictAllCrypto(cryptoMkts)} disabled={predictAllLoading || loading}
                          className="text-[8px] px-2 py-0.5 bg-s-accent text-black font-bold rounded hover:brightness-110 disabled:opacity-40">
                          {predictAllLoading ? '…' : `Predict All (${cryptoMkts.length})`}
                        </button>
                      </div>
                      <div>
                        {cryptoMkts.map(m => {
                          const isPredicting = cryptoPredicting.has(m.token_id)
                          const hasPred = preds.some(p => normalizePredictionMarketKey(p.marketName || p.query) === normalizePredictionMarketKey(m.market_name || m.event_title))
                          return (
                            <div key={m.token_id} onClick={() => !isPredicting && cryptoPredict(m)}
                              className={`flex items-center gap-2 px-3 py-2 border-b border-s-border/40 last:border-0 cursor-pointer transition-colors ${isPredicting ? 'bg-s-accent/10 animate-pulse' : 'hover:bg-s-panel'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasPred ? 'bg-s-green' : 'bg-s-accent'}`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-medium truncate leading-tight">{m.market_name || m.event_title}</div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 text-[9px]">
                                <span className="text-s-green font-bold">Y {pct(m.yes_price)}</span>
                                <span className="text-s-danger font-bold">N {pct(m.no_price)}</span>
                                <span className={`font-black ${(m.minutesLeft ?? 9999) < 60 ? 'text-s-danger' : 'text-s-warn'}`}>{tl(m.ends_at)}</span>
                                {hasPred && <span className="text-s-green">✓</span>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          })()}

          {/* ── MARKETS ── */}
          {tab === 'markets' && (
            <div data-synth-id="market-table" className={`relative bg-s-surface border border-s-border rounded-lg p-4 ${hl('market-table')}`}>
              {hlTooltip('market-table')}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider">Market Discovery</h2>
                <div className="flex gap-2">
                  <input className="bg-s-bg border border-s-border rounded px-2.5 py-1.5 text-xs text-s-text outline-none focus:border-s-accent flex-1 min-w-[200px]"
                    placeholder="Search markets..." value={q} onChange={e => setQ(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') api.getMarkets(q).then(r => setMkts(scoreMarkets(r as Record<string, unknown>[]))).catch(() => {}) }} />
                  <button className="px-3 py-1.5 bg-s-accent text-black font-semibold rounded text-xs" onClick={() => api.getMarkets(q).then(r => setMkts(scoreMarkets(r as Record<string, unknown>[]))).catch(() => {})}>Search</button>
                </div>
              </div>
              <table className="w-full text-xs"><thead><tr className="text-[10px] uppercase text-s-muted tracking-wide border-b border-s-border">
                <th className="py-1.5 px-2 text-left w-6"></th><th className="py-1.5 px-2 text-left">Market</th><th className="py-1.5 px-2 text-left">Venue</th>
                <th className="py-1.5 px-2 text-right">Yes %</th><th className="py-1.5 px-2 text-right">No %</th><th className="py-1.5 px-2 text-right">Ends</th>
                <th className="py-1.5 px-2 text-right">Score</th><th className="py-1.5 px-2 w-16"></th>
              </tr></thead><tbody>{mkts.slice(0, 40).map(m => (
                <tr key={m.token_id} className="border-b border-s-border/50 hover:bg-s-panel/50">
                  <td className="py-1.5 px-2">{uIcons[m.urgency]}</td>
                  <td className="py-1.5 px-2 truncate max-w-[280px]">{m.market_name || m.event_title}</td>
                  <td className="py-1.5 px-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{m.venue}</span>
                    {m.subMarketCount > 1 && <span className="ml-1 text-[9px] text-s-muted">{m.subMarketCount} outcomes</span>}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-s-green">{pct(m.yes_price)}</td><td className="py-1.5 px-2 text-right font-mono text-s-danger">{pct(m.no_price)}</td>
                  <td className="py-1.5 px-2 text-right">{tl(m.ends_at)}</td><td className="py-1.5 px-2 text-right font-semibold font-mono">{m.score}</td>
                  <td className="py-1.5 px-2"><button disabled={loading} onClick={() => predict(m.market_name || m.event_title)}
                    title="Generate AI analysis for this market"
                    className="px-2 py-1 bg-s-accent text-black font-semibold rounded text-[10px] hover:brightness-110 disabled:opacity-50">Predict</button></td>
                </tr>
              ))}</tbody></table>
            </div>
          )}

          {/* ── MY PREDICTIONS ── */}
          {tab === 'predictions' && (
            <div data-synth-id="prediction-list" className={`relative bg-s-surface border border-s-border rounded-lg p-4 ${hl('prediction-list')}`}>
              {hlTooltip('prediction-list')}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider">My Predictions</h2>
                  <span className="text-[10px] text-s-muted">{dedupedPreds.length} active</span>
                  <button onClick={async () => {
                    try {
                      const r = await api.syncPredictionResolutions()
                      flash(`Synced outcomes: ${r.resolved} resolved (${r.checked} checked)`)
                      await refresh()
                    } catch {
                      flash('Outcome sync failed')
                    }
                  }} className="text-[10px] text-s-muted hover:text-s-accent px-1.5 py-0.5 rounded bg-s-elevated" title="Query protocol outcomes for ended markets">
                    Sync outcomes
                  </button>
                  <button onClick={async () => {
                    try { const r = await api.cleanStalePredictions(30); flash(`Cleaned ${r.cleaned} stale predictions`); await refresh() }
                    catch { flash('Cleanup failed') }
                  }} className="text-[10px] text-s-muted hover:text-s-danger px-1.5 py-0.5 rounded bg-s-elevated" title="Remove distant uncommitted predictions">
                    Clean up
                  </button>
                  <div className="flex bg-s-elevated rounded p-0.5 ml-2">
                    {(['all', 'live', 'sim'] as const).map(fm => (
                      <button key={fm} onClick={() => setPredModeFilter(fm)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                          predModeFilter === fm
                            ? fm === 'live' ? 'bg-s-warn text-black' : fm === 'sim' ? 'bg-s-blue text-white' : 'bg-s-accent text-black'
                            : 'text-s-muted hover:text-s-text'
                        }`}>{fm === 'all' ? 'ALL' : fm === 'live' ? 'LIVE' : 'SIM'}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input className="bg-s-bg border border-s-border rounded px-2.5 py-1.5 text-xs text-s-text outline-none focus:border-s-accent min-w-[250px]"
                    placeholder="Predict any market... (e.g. 'BTC 15min', 'golf', 'ETH price')" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') predict(q) }} />
                  <button disabled={loading} onClick={() => predict(q)}
                    className="px-3 py-1.5 bg-s-accent text-black font-semibold rounded text-xs disabled:opacity-50">{loading ? 'Generating...' : 'Generate'}</button>
                </div>
              </div>
              <div className="space-y-3">
                {(['today', 'yesterday', 'this_week', 'older'] as const).flatMap(group =>
                  groupedPreds[group].length === 0 ? [] : [
                    <div key={`hdr-${group}`} className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-s-muted uppercase tracking-widest">{GROUP_LABELS[group]}</span>
                      <span className="flex-1 h-px bg-s-border" />
                      <span className="text-[10px] text-s-muted">{groupedPreds[group].length}</span>
                    </div>,
                    ...groupedPreds[group].map(p => {
                  const cl = confLabel(p.confidence)
                  const ended = marketEnded(p.endsAt)
                  const isExpanded = expanded.has(p.id)
                  const isCommitted = p.status === 'committed' || p.status === 'committed_live' || p.status === 'committed_sim' || !!p.orderId
                  const isLiveCommitted = isCommitted && p.mode !== 'sim'
                  return (
                  <div key={p.id} data-synth-id={`prediction-${p.id}`} className={`bg-s-panel border rounded-lg overflow-hidden ${
                    isLiveCommitted ? 'border-purple-500/60 shadow-[0_0_16px_rgba(168,85,247,0.25)]'
                    : isCommitted ? 'border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                    : 'border-s-border'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center gap-2 p-4 pb-3">
                      {isLiveCommitted && <span className="text-purple-400 text-xs" title="LIVE money committed">💎</span>}
                      {isCommitted && !isLiveCommitted && <span className="text-yellow-400 text-xs" title="Practice money committed">💰</span>}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0 ${
                        p.mode === 'sim'
                          ? 'bg-s-blue/20 text-s-blue border border-s-blue/30'
                          : 'bg-s-warn/20 text-s-warn border border-s-warn/30'
                      }`}>{p.mode === 'sim' ? 'SIM' : 'LIVE'}</span>
                      <span className="text-sm font-semibold flex-1">{p.marketName || p.query}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{p.venue || '—'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${cl.cls}`}>{cl.text}</span>
                      <button onClick={() => deletePred(p.id)} title="Remove this prediction" className="text-s-muted hover:text-s-danger text-xs px-1">✕</button>
                    </div>

                    {/* AI Lean + Recommendation */}
                    <div className="mx-4 mb-3 p-3 rounded-lg border border-s-accent/30 bg-s-accent/5">
                      {p.lean && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-black px-2 py-0.5 rounded ${p.lean === 'YES' ? 'bg-s-green/20 text-s-green' : 'bg-s-danger/20 text-s-danger'}`}>
                            {p.lean}
                          </span>
                          <span className="text-xs text-s-muted flex-1">{p.leanReason || p.thesis}</span>
                        </div>
                      )}
                      <div className="text-xs font-semibold">
                        AI recommends: <span className={p.lean === 'YES' ? 'text-s-green font-bold' : 'text-s-danger font-bold'}>{p.lean || 'YES'}</span> ({pct(p.lean === 'YES' ? p.yesPrice : p.noPrice)} chance, {cost(p.lean === 'YES' ? p.yesPrice : p.noPrice)}/share)
                        {p.amountUsdc > 0 && <span className="text-s-muted ml-1">— wager <span className="font-mono text-s-text font-bold">${f(p.amountUsdc)}</span></span>}
                      </div>
                      {p.kellyFraction != null && p.kellyFraction > 0 && (
                        <div className="text-[10px] text-s-muted mt-1">Kelly fraction: {(p.kellyFraction * 100).toFixed(1)}%</div>
                      )}
                    </div>

                    {/* Position info: min entry, max affordable */}
                    {!ended && !isCommitted && (
                      <div className="mx-4 mb-3 flex gap-4 text-[10px]">
                        <div className="flex items-center gap-1">
                          <span className="text-s-muted">Min entry:</span>
                          <span className="font-mono font-semibold">${f(Math.max(wMode === 'real' ? 1 : 0.10, p.minEntryUsdc || 0.10))}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-s-muted">You can bet up to:</span>
                          <span className={`font-mono font-semibold ${(p.maxAffordableUsdc || 0) >= Math.max(wMode === 'real' ? 1 : 0.10, p.minEntryUsdc || 0.10) ? 'text-s-green' : 'text-s-danger'}`}>${f(p.maxAffordableUsdc || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-s-muted">Yes:</span>
                          <span className="font-mono">${f(p.yesPrice)}</span>
                          <span className="text-s-muted ml-1">No:</span>
                          <span className="font-mono">${f(p.noPrice)}</span>
                        </div>
                      </div>
                    )}

                    {/* Review & Commit button → opens approval modal */}
                    {!ended && p.status !== 'resolved' && !isCommitted && (
                      <div className="mx-4 mb-3">
                        <button data-synth-id={`commit-btn-${p.id}`} onClick={() => openCommitModal(p)}
                          className={`w-full px-4 py-3.5 rounded-lg text-sm font-bold transition-all hover:brightness-110 ${
                            wMode === 'sim'
                              ? 'bg-gradient-to-r from-s-green to-emerald-500 text-black'
                              : 'bg-gradient-to-r from-s-accent to-cyan-400 text-black'
                          }`}>
                          Review & Commit →
                          <span className="ml-2 opacity-80 text-xs">
                            {p.lean || 'YES'} ${f(p.amountUsdc > 0 ? p.amountUsdc : Math.max(p.minEntryUsdc || 0.50, 1))} • {wMode === 'sim' ? 'PRACTICE' : 'LIVE'}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Committed status */}
                    {isCommitted && (
                      <div className="mx-4 mb-3 p-2.5 rounded-lg border border-yellow-400/30 bg-yellow-400/5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-yellow-400 font-bold">COMMITTED</span>
                          {p.orderId && <span className="text-[10px] text-s-muted font-mono">{p.orderId.slice(0, 16)}...</span>}
                          {p.orderStatus && <span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted">{p.orderStatus}</span>}
                        </div>
                      </div>
                    )}

                    {/* Analysis (collapsible) — includes sparkline + real stats */}
                    <div className="mx-4 mb-3">
                      <button onClick={() => {
                        setExpanded(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n })
                        if (!expanded.has(p.id) && p.tokenId) loadPriceHistory(p.tokenId)
                      }} className="text-[10px] text-s-muted hover:text-s-text transition-colors">
                        {isExpanded ? '▾ Hide analysis' : '▸ Show analysis + chart'}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 space-y-3 text-xs">
                          {/* Price chart */}
                          {p.tokenId && (
                            <div className="bg-s-elevated/50 rounded-lg p-3 border border-s-border/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-s-muted uppercase">Price History (YES)</span>
                                <div className="flex gap-3 text-[10px] font-mono">
                                  <span>Yes: <strong className="text-s-green">{pct(p.yesPrice)}</strong> ({cost(p.yesPrice)})</span>
                                  <span>No: <strong className="text-s-danger">{pct(p.noPrice)}</strong> ({cost(p.noPrice)})</span>
                                  {p.kellyFraction != null && p.kellyFraction > 0 && (
                                    <span className="text-s-accent">Kelly {(p.kellyFraction * 100).toFixed(1)}%</span>
                                  )}
                                </div>
                              </div>
                              {loadingHistory === p.tokenId ? (
                                <div className="text-[10px] text-s-muted animate-pulse">Loading chart...</div>
                              ) : priceHistories[p.tokenId] ? (
                                <Sparkline points={priceHistories[p.tokenId]} width={300} height={48} />
                              ) : (
                                <button onClick={() => loadPriceHistory(p.tokenId)} className="text-[10px] text-s-accent underline">Load chart</button>
                              )}
                            </div>
                          )}
                          <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Thesis</strong><p className="text-s-muted mt-0.5">{p.thesis}</p></div>
                          <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Rationale</strong><p className="text-s-muted mt-0.5">{p.rationale}</p></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Invalidation</strong><p className="text-s-muted mt-0.5">{p.invalidation}</p></div>
                            <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Risk</strong><p className="text-s-muted mt-0.5">{p.riskNote}</p></div>
                          </div>
                          {p.model && <div className="text-[10px] text-s-muted">Model: {p.model} | Token: <span className="font-mono">{p.tokenId?.slice(0, 16)}...</span></div>}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-s-border text-xs bg-s-surface/50">
                      {!ended ? (
                        <span className="text-s-muted">Resolves in {tl(p.endsAt)}</span>
                      ) : (
                        <span className="text-s-warn font-semibold">Market ended</span>
                      )}
                      <span className="text-s-muted ml-auto">{ago(p.createdAt)}</span>

                      {ended && p.status !== 'resolved' && (
                        <span className="text-[10px] px-2 py-1 rounded bg-s-elevated text-s-muted">Syncing protocol outcome...</span>
                      )}
                      {p.wasCorrect !== null && (
                        <span className={`font-bold ${p.wasCorrect ? 'text-s-green' : 'text-s-danger'}`}>
                          {p.wasCorrect ? '✓ AI was right' : '✗ AI was wrong'}
                          {p.resolvedOutcome ? ` • ${p.resolvedOutcome} won` : ''}
                        </span>
                      )}
                    </div>
                    {p.status === 'resolved' && p.reflection && (
                      <div className="px-4 pb-3">
                        <div className="p-2 rounded-lg bg-s-elevated/50 border border-s-border/50">
                          <div className="text-[10px] uppercase tracking-wide text-s-muted mb-1">Auto Reflection</div>
                          <div className="text-[11px] text-s-muted leading-relaxed">{p.reflection}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  )
                }),
                  ]
                )}
                {dedupedPreds.length === 0 && <p className="text-s-muted text-xs text-center py-8">No predictions yet. Ask Opseeq or search above.</p>}
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {tab === 'approvals' && (
            <div className="space-y-4">
              {/* Explainer banner */}
              <div className="bg-s-surface border border-s-accent/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🔐</span>
                  <div>
                    <h3 className="text-xs font-bold text-s-text mb-1">How Approvals Work</h3>
                    <div className="text-[10px] text-s-muted space-y-1">
                      <p><strong className="text-s-text">Predictions</strong> = AI-generated trade ideas. Free to create, no money moves.</p>
                      <p><strong className="text-s-text">Approvals</strong> = When you click "Commit" in <strong className="text-s-warn">LIVE mode</strong>, the order queues here for your final confirmation before real money executes.</p>
                      <p><strong className="text-s-text">Positions</strong> = Orders that have been filled. Visible on the Dashboard under "My Positions".</p>
                      <p className="text-s-accent">In <strong>Practice mode</strong>, orders execute instantly (no approval needed).</p>
                    </div>
                  </div>
                </div>
              </div>

              <div data-synth-id="approvals-list" className={`relative bg-s-surface border border-s-border rounded-lg p-4 ${hl('approvals-list')}`}>
                {hlTooltip('approvals-list')}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider">Pending Approvals</h2>
                  <span className="text-[10px] text-s-muted">{pending.length} pending</span>
                  <button onClick={() => setTab('dashboard')} className="text-[10px] text-s-accent hover:underline font-semibold">
                    ← View My Positions
                  </button>
                  <div className="flex gap-1 bg-s-elevated rounded-lg p-0.5 ml-auto">
                    {(['all','live','sim'] as const).map(ff => (
                      <button key={ff} onClick={() => { setApprovalFilter(ff); api.getApprovals(ff === 'all' ? undefined : ff).then(setPending).catch(() => {}) }}
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${approvalFilter === ff ? 'bg-s-accent text-black' : 'text-s-muted hover:text-s-text'}`}>
                        {ff.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => api.getApprovals(approvalFilter === 'all' ? undefined : approvalFilter).then(setPending).catch(() => {})}
                    className="text-[10px] text-s-muted hover:text-s-accent">↻ Refresh</button>
                </div>

                {pending.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-s-muted text-xs">No pending orders.</p>
                    <p className="text-[10px] text-s-muted mt-2">
                      {wMode === 'sim'
                        ? 'In Practice mode, orders execute instantly — no approval needed. Switch to LIVE mode to test the approval flow.'
                        : 'When you click "Commit" on a prediction, the order will appear here for your final approval.'}
                    </p>
                  </div>
                ) : pending.map(a => {
                  const p = a.params as { tokenId?: string; side?: string; amount?: string; orderType?: string; predictionId?: string }
                  const isLive = a.mode === 'real'
                  const linkedPred = preds.find(pr => pr.id === p.predictionId)
                  return (
                    <div key={a.id} className={`border rounded-lg p-4 mb-2 ${isLive ? 'border-s-warn/40 bg-s-warn/5' : 'border-s-border'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isLive ? 'bg-s-warn/20 text-s-warn' : 'bg-s-elevated text-s-muted'}`}>{isLive ? '🔴 LIVE ORDER' : 'SIM'}</span>
                        <span className="text-sm font-bold">{p.side} ${p.amount} USDC</span>
                        <span className="text-[10px] text-s-muted ml-auto">{ago(a.createdAt)}</span>
                      </div>
                      {linkedPred && (
                        <div className="mb-2 p-2 bg-s-panel rounded text-xs">
                          <span className="text-s-muted">Market:</span> <span className="font-semibold">{linkedPred.marketName}</span>
                          <span className="ml-3 text-s-muted">Lean:</span> <span className={`font-bold ${linkedPred.lean === 'YES' ? 'text-s-green' : 'text-s-danger'}`}>{linkedPred.lean}</span>
                          <span className="ml-3 text-s-muted">Conf:</span> <span className="font-bold">{Math.round(linkedPred.confidence * 100)}%</span>
                        </div>
                      )}
                      <div className="flex gap-2 text-[10px] text-s-muted mb-3">
                        <span>Type: {p.orderType || 'MARKET'}</span>
                        <span className="font-mono">Token: {p.tokenId?.slice(0, 16)}...</span>
                      </div>
                      <div className="flex gap-2">
                        <button data-synth-id={`approval-execute-${a.id}`} onClick={() => {
                          api.approve(a.id).then(r => {
                            if ('orderResult' in (r as object)) {
                              triggerCelebration('fireworks')
                              const rr = (r as { orderResult?: { balanceAfter?: { total?: string } } }).orderResult
                              const balMsg = rr?.balanceAfter?.total ? ` Balance: $${f(rr.balanceAfter.total)}.` : ''
                              flash(`🎆 Order executed! Check your positions on the Dashboard.${balMsg}`)
                              setTab('dashboard')
                            } else { flash('Approved') }
                            refresh()
                          }).catch(e => flash(`Error: ${e instanceof Error ? e.message : ''}`))
                        }} className={`relative px-4 py-2 bg-s-green text-black font-bold rounded text-xs hover:brightness-110 ${hl(`approval-execute-${a.id}`)}`}>
                          {hlTooltip(`approval-execute-${a.id}`)}
                          {isLive ? '✓ Execute Real Order' : '✓ Approve'}
                        </button>
                        <button data-synth-id={`approval-reject-${a.id}`} onClick={() => { api.reject(a.id).then(refresh).catch(() => {}); flash('Rejected') }}
                          className={`relative px-4 py-2 bg-s-danger/20 text-s-danger border border-s-danger/30 rounded text-xs font-semibold ${hl(`approval-reject-${a.id}`)}`}>
                          {hlTooltip(`approval-reject-${a.id}`)}
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── AUDIT ── */}
          {tab === 'audit' && (
            <div className="bg-s-surface border border-s-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider">Audit Log</h2>
                <button className="px-2 py-1 text-xs bg-s-elevated text-s-muted rounded hover:text-s-text" onClick={() => api.getAudit().then(setAudit).catch(() => {})}>Refresh</button>
              </div>
              <table className="w-full text-xs"><thead><tr className="text-[10px] uppercase text-s-muted tracking-wide border-b border-s-border">
                <th className="py-1.5 px-2 text-left">Time</th><th className="py-1.5 px-2 text-left">Category</th><th className="py-1.5 px-2 text-left">Action</th>
                <th className="py-1.5 px-2 text-left">Mode</th><th className="py-1.5 px-2 text-center">OK</th>
              </tr></thead><tbody>{audit.map((e, i) => (
                <tr key={i} className="border-b border-s-border/50"><td className="py-1.5 px-2">{ago(e.timestamp)}</td>
                  <td className="py-1.5 px-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{e.category}</span></td>
                  <td className="py-1.5 px-2">{e.action}</td><td className="py-1.5 px-2">{e.mode}</td>
                  <td className="py-1.5 px-2 text-center">{e.success ? '✓' : '✗'}</td></tr>
              ))}</tbody></table>
              {audit.length === 0 && <p className="text-s-muted text-xs text-center py-4">No audit entries</p>}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === 'settings' && (
            <div className="space-y-4">
              {/* Settings sub-tabs */}
              <div className="flex gap-1 bg-s-surface border border-s-border rounded-lg p-1">
                {(['wallet', 'deposit', 'withdraw', 'config'] as const).map(st => (
                  <button key={st} onClick={() => setSettingsTab(st)}
                    className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-all ${settingsTab === st ? 'bg-s-accent text-black' : 'text-s-muted hover:text-s-text hover:bg-s-panel'}`}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              {/* Network Mismatch Warning */}
              {networkMismatch && (
                <div className="flex items-center gap-2 bg-s-warn/10 border border-s-warn/30 rounded-lg px-4 py-3 text-xs text-s-warn">
                  <span className="text-sm">⚠</span>
                  <span>{networkMismatch}</span>
                </div>
              )}

              {/* Wallet */}
              {settingsTab === 'wallet' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="bg-s-surface border border-s-border rounded-lg p-4">
                    <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Synthesis Wallets</h2>
                    {wallets.length > 0 ? wallets.map(w => (
                      <div key={w.wallet_id} onClick={() => setWid(w.wallet_id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer mb-2 transition-all ${w.wallet_id === wid ? 'border-s-accent bg-s-accent/5' : 'border-s-border hover:border-s-muted'}`}>
                        <div className="flex-1">
                          <div className="text-xs font-semibold">{w.name || 'Unnamed Wallet'}</div>
                          <div className="text-[10px] text-s-muted font-mono mt-0.5">{truncAddr(w.wallet_id, 10)}</div>
                        </div>
                        {w.wallet_id === wid && <span className="text-[10px] text-s-accent font-bold">ACTIVE</span>}
                      </div>
                    )) : <p className="text-s-muted text-xs">No wallets found</p>}

                    {bal?.chains && bal.chains.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-s-border">
                        <h3 className="text-[10px] text-s-muted uppercase tracking-wider mb-2">Chain Balances</h3>
                        {bal.chains.map((c, i) => (
                          <div key={i} className="flex justify-between text-xs py-1.5 border-b border-s-border/50">
                            <span className="text-s-muted">{c.chainId} — {truncAddr(c.address)}</span>
                            <span className="font-semibold">{Object.entries(c.balances).map(([k, v]) => `${v} ${k}`).join(', ') || 'empty'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-s-surface border border-s-border rounded-lg p-4">
                    <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">External Wallet</h2>
                    <p className="text-[10px] text-s-muted mb-3">For deposits and withdrawals only. Your Synthesis wallet handles trading.</p>
                    {metaMask.connected ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-s-green" />
                          <span className="text-xs font-semibold">Connected</span>
                        </div>
                        <div className="space-y-1.5">
                          {[
                            ['Address', truncAddr(metaMask.address || '', 10)],
                            ['Network', metaMask.chainName || `Chain ${metaMask.chainId}`],
                            ['ETH', `${metaMask.balance}`],
                            ...(metaMask.supportedTokens || []).map(t => [t.symbol, `${t.balance}`] as [string, string]),
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between py-1 border-b border-s-border/50 text-xs">
                              <span className="text-s-muted">{k}</span>
                              <span className="font-mono font-semibold">{v}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={handleConnectWallet} className="w-full px-3 py-2 bg-s-elevated text-s-muted rounded text-xs hover:text-s-text">
                          Refresh
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-s-muted text-xs mb-3">Connect MetaMask or Phantom for deposits and withdrawals</p>
                        <button onClick={handleConnectWallet}
                          className="px-5 py-2.5 bg-s-accent text-black font-bold rounded text-xs hover:brightness-110">
                          Connect Wallet
                        </button>
                      </div>
                    )}

                    {/* Mode control */}
                    <div className="mt-4 pt-3 border-t border-s-border">
                      <h3 className="text-[10px] text-s-muted uppercase tracking-wider mb-2">Trading Mode</h3>
                      <div className="flex gap-2">
                        <button onClick={() => setWMode('real')}
                          className={`flex-1 px-3 py-2.5 rounded text-xs font-bold transition-all ${wMode === 'real' ? 'bg-s-accent text-black' : 'bg-s-elevated text-s-muted'}`}>
                          Live Trading
                        </button>
                        <button onClick={() => setWMode('sim')}
                          className={`flex-1 px-3 py-2.5 rounded text-xs font-bold transition-all ${wMode === 'sim' ? 'bg-s-accent text-black' : 'bg-s-elevated text-s-muted'}`}>
                          Practice Mode
                        </button>
                      </div>
                      <p className="text-[10px] text-s-muted mt-2">
                        {wMode === 'sim' ? 'Practice mode — trades are simulated. No real money at risk.' : 'Live mode — real money is used. All risk controls are active.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Deposit */}
              {settingsTab === 'deposit' && (
                <div className="bg-s-surface border border-s-border rounded-lg p-5 max-w-lg mx-auto">
                  <h2 className="text-sm font-semibold mb-4">Deposit</h2>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[10px] text-s-muted uppercase tracking-wider block mb-1.5">Token</label>
                      <div className="relative">
                        <select value={depositToken} onChange={e => setDepositToken(e.target.value as SupportedToken)}
                          className="w-full bg-s-bg border border-s-border rounded px-3 py-2 text-xs appearance-none cursor-pointer focus:border-s-accent outline-none text-s-text">
                          {SUPPORTED_TOKENS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-s-muted text-[10px]">▾</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-s-muted uppercase tracking-wider block mb-1.5">Network</label>
                      <div className="relative">
                        <select value={depositChain} onChange={e => setDepositChain(e.target.value)}
                          className="w-full bg-s-bg border border-s-border rounded px-3 py-2 text-xs appearance-none cursor-pointer focus:border-s-accent outline-none text-s-text">
                          {SUPPORTED_CHAINS.map(c => (
                            <option key={c.id} value={c.id}>{c.name} — {c.minDeposit} min</option>
                          ))}
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-s-muted text-[10px]">▾</span>
                      </div>
                    </div>
                  </div>

                  {/* MetaMask shortcut */}
                  {metaMask.connected && metaMask.chainName?.toLowerCase() === depositChain && (
                    <div className="bg-s-accent/10 border border-s-accent/30 rounded-lg p-3 mb-4 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-s-accent" />
                        <span className="font-semibold text-s-accent">MetaMask ready for direct deposit</span>
                      </div>
                      <p className="text-s-muted text-[10px]">
                        Send {depositToken} from MetaMask ({truncAddr(metaMask.address || '')}) to the address below.
                      </p>
                    </div>
                  )}

                  {metaMask.connected && metaMask.chainName?.toLowerCase() !== depositChain && depositChain !== 'solana' && (
                    <div className="bg-s-warn/10 border border-s-warn/30 rounded-lg p-3 mb-4 text-xs">
                      <p className="text-s-warn">
                        MetaMask is on <strong>{metaMask.chainName}</strong>. Switch to <strong>{depositChain}</strong> in MetaMask to deposit directly, or use the address below from any wallet.
                      </p>
                    </div>
                  )}

                  {/* Deposit address */}
                  {depositLoading ? (
                    <div className="text-center py-8 text-s-muted text-xs">Loading deposit address...</div>
                  ) : currentDepositAddr ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-s-muted uppercase tracking-wider block mb-1.5">Your deposit address</label>
                        <div className="flex items-center gap-2 bg-s-bg border border-s-border rounded px-3 py-2.5">
                          <span className="text-xs font-mono flex-1 truncate text-s-text">{currentDepositAddr.address}</span>
                          <button onClick={() => { navigator.clipboard.writeText(currentDepositAddr.address); flash('Address copied') }}
                            className="text-s-muted hover:text-s-text text-[10px] px-1.5 py-0.5 rounded bg-s-elevated" title="Copy">
                            Copy
                          </button>
                          <button onClick={() => setShowQR(!showQR)}
                            className="text-s-muted hover:text-s-text text-[10px] px-1.5 py-0.5 rounded bg-s-elevated" title="QR Code">
                            QR
                          </button>
                        </div>
                      </div>

                      {showQR && (
                        <div className="flex justify-center py-4 bg-white rounded-lg">
                          <QRCodeSVG value={currentDepositAddr.address} size={160} level="M" />
                        </div>
                      )}

                      {currentDepositAddr.tokens.length > 0 && (
                        <div className="text-[10px] text-s-muted">
                          <span>Min: {currentDepositAddr.tokens[0].min} {depositToken}</span>
                          <span className="mx-2">·</span>
                          <span>Est. fees: 0.01%</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-s-muted text-xs">
                      <p>Unable to load deposit address.</p>
                      <button onClick={fetchDepositAddress} className="mt-2 text-s-accent underline">Retry</button>
                    </div>
                  )}
                </div>
              )}

              {/* Withdraw */}
              {settingsTab === 'withdraw' && (
                <div className="bg-s-surface border border-s-border rounded-lg p-5 max-w-lg mx-auto">
                  <h2 className="text-sm font-semibold mb-4">Withdraw</h2>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[10px] text-s-muted uppercase tracking-wider block mb-1.5">Token</label>
                      <div className="relative">
                        <select value={withdrawToken} onChange={e => setWithdrawToken(e.target.value as SupportedToken)}
                          className="w-full bg-s-bg border border-s-border rounded px-3 py-2 text-xs appearance-none cursor-pointer focus:border-s-accent outline-none text-s-text">
                          {SUPPORTED_TOKENS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-s-muted text-[10px]">▾</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-s-muted uppercase tracking-wider block mb-1.5">Network</label>
                      <div className="relative">
                        <select value={withdrawChain} onChange={e => setWithdrawChain(e.target.value)}
                          className="w-full bg-s-bg border border-s-border rounded px-3 py-2 text-xs appearance-none cursor-pointer focus:border-s-accent outline-none text-s-text">
                          {SUPPORTED_CHAINS.map(c => (
                            <option key={c.id} value={c.id}>{c.name} — {c.minWithdraw} min</option>
                          ))}
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-s-muted text-[10px]">▾</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-[10px] text-s-muted uppercase tracking-wider block mb-1.5">Amount</label>
                    <div className="flex items-center gap-2 bg-s-bg border border-s-border rounded px-3 py-2">
                      <span className="text-s-muted text-xs">$</span>
                      <input type="number" step="0.01" min="0" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-s-text outline-none" placeholder="0.00" />
                      <button onClick={() => setWithdrawAmount(String(avail))}
                        className="text-[10px] text-s-accent font-bold hover:underline">MAX</button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] text-s-muted uppercase tracking-wider">Withdrawal address</label>
                      {metaMask.connected && (
                        <button onClick={() => setWithdrawUseMetaMask(!withdrawUseMetaMask)}
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${withdrawUseMetaMask ? 'bg-s-accent text-black' : 'bg-s-elevated text-s-muted'}`}>
                          {withdrawUseMetaMask ? 'Using MetaMask' : 'Custom address'}
                        </button>
                      )}
                    </div>
                    {withdrawUseMetaMask && metaMask.connected ? (
                      <div className="bg-s-bg border border-s-border rounded px-3 py-2.5 text-xs font-mono text-s-text">
                        {metaMask.address}
                      </div>
                    ) : (
                      <input value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)}
                        className="w-full bg-s-bg border border-s-border rounded px-3 py-2.5 text-xs font-mono text-s-text outline-none focus:border-s-accent"
                        placeholder={withdrawChain === 'solana' ? 'Solana address...' : '0x...'} />
                    )}
                  </div>

                  {/* Address validation warnings */}
                  {!withdrawUseMetaMask && withdrawAddress && (
                    <>
                      {withdrawChain !== 'solana' && !isValidEvmAddress(withdrawAddress) && (
                        <div className="bg-s-danger/10 border border-s-danger/30 rounded-lg px-3 py-2 mb-4 text-[10px] text-s-danger">
                          Invalid EVM address format. Must be 0x followed by 40 hex characters.
                        </div>
                      )}
                      {withdrawChain === 'solana' && !isValidSolAddress(withdrawAddress) && (
                        <div className="bg-s-danger/10 border border-s-danger/30 rounded-lg px-3 py-2 mb-4 text-[10px] text-s-danger">
                          Invalid Solana address format.
                        </div>
                      )}
                    </>
                  )}

                  <button onClick={handleWithdraw} disabled={withdrawLoading || !withdrawAmount}
                    className="w-full px-4 py-3 bg-s-accent text-black font-bold rounded text-xs hover:brightness-110 disabled:opacity-50 transition-all">
                    {withdrawLoading ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
              )}

              {/* Config */}
              {settingsTab === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="bg-s-surface border border-s-border rounded-lg p-4">
                    <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Desk Configuration</h2>
                    {config && <div className="space-y-0.5">
                      {/* Time horizon selector */}
                      <div className="flex justify-between items-center py-2 border-b border-s-border/50">
                        <div>
                          <span className="text-[11px] text-s-muted">Market Horizon</span>
                          <p className="text-[10px] text-s-muted/60">Only show markets ending within this window</p>
                        </div>
                        <div className="flex gap-1">
                          {[7, 14, 30, 60, 90].map(d => (
                            <button key={d} onClick={() => changeHorizon(d)}
                              className={`text-[10px] px-2 py-1 rounded font-semibold transition-all ${config?.horizonDays === d ? 'bg-s-accent text-black' : 'bg-s-elevated text-s-muted hover:text-s-text'}`}>
                              {d}d
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Model selector */}
                      <div className="flex justify-between items-center py-2 border-b border-s-border/50">
                        <span className="text-[11px] text-s-muted">AI Model</span>
                        <div className="relative">
                          <select value={config.model} onChange={e => changeModel(e.target.value)}
                            className="bg-s-bg border border-s-border rounded px-2 py-1 text-xs text-s-text appearance-none cursor-pointer focus:border-s-accent outline-none pr-6">
                            {(config.availableModels || ['gpt-4o']).map((m: string) => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-s-muted text-[10px]">▾</span>
                        </div>
                      </div>
                      {[
                        ['Mode', wMode === 'sim' ? 'Practice' : 'Live'],
                        ['Confidence Threshold', String(config.confidenceThreshold)],
                        ['Require Approval', config.requireApproval ? 'Yes' : 'No'],
                        ['Max Position', `$${config.risk.maxPositionUsdc}`],
                        ['Max Order', `$${config.risk.maxSingleOrderUsdc}`],
                        ['Max Daily Loss', `$${config.risk.maxDailyLossUsdc}`],
                        ['Max Positions', String(config.risk.maxOpenPositions)],
                        ['Per-Prediction Cap', '10%'],
                        ['Total Utilization Cap', '50%'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between py-1.5 border-b border-s-border/50">
                          <span className="text-[11px] text-s-muted">{k}</span><span className="text-xs font-medium">{v}</span>
                        </div>
                      ))}
                    </div>}
                  </div>
                  {/* Sim wallet mint — only in practice mode */}
                  {wMode === 'sim' && (
                    <div className="bg-s-surface border border-s-border rounded-lg p-4 lg:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider">Practice Wallet — Add Funds</h2>
                        {mintStatus && (
                          <span className="text-[10px] text-s-muted">
                            Minted today: <span className="font-mono font-semibold">${mintStatus.mintedToday.toFixed(2)}</span>
                            {' '}/ $1,000 limit
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 items-end mb-3">
                        <div className="flex-1">
                          <label className="text-[10px] text-s-muted uppercase tracking-wider block mb-1.5">Amount (max $1,000/day)</label>
                          <div className="flex items-center gap-2 bg-s-bg border border-s-border rounded px-3 py-2">
                            <span className="text-s-muted text-xs">$</span>
                            <input type="number" min="1" max="1000" step="1" value={mintAmount}
                              onChange={e => setMintAmount(e.target.value)}
                              className="flex-1 bg-transparent text-xs text-s-text outline-none" placeholder="100" />
                            {[100, 250, 500, 1000].map(v => (
                              <button key={v} onClick={() => setMintAmount(String(v))}
                                className="text-[10px] text-s-muted hover:text-s-accent font-semibold">${v}</button>
                            ))}
                          </div>
                        </div>
                        <button onClick={handleMint} disabled={mintLoading || !mintStatus?.canMint}
                          title={mintStatus?.canMint ? 'Add practice funds' : `Daily limit reached. Resets ${mintStatus ? new Date(mintStatus.resetAt).toLocaleTimeString() : ''}`}
                          className="px-4 py-2.5 bg-s-green text-black font-bold rounded text-xs hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          style={{ animation: mintStatus?.canMint ? 'mintPop 0.4s ease-out' : undefined }}>
                          {mintLoading ? 'Minting...' : mintStatus?.canMint ? `💵 Mint $${mintAmount}` : 'Limit Reached'}
                        </button>
                      </div>
                      {mintStatus && !mintStatus.canMint && (
                        <p className="text-[10px] text-s-warn">
                          Daily limit reached. Resets at {new Date(mintStatus.resetAt).toLocaleString()}.
                        </p>
                      )}
                      {mintStatus?.canMint && (
                        <p className="text-[10px] text-s-muted">
                          Remaining today: <span className="font-mono font-semibold text-s-green">${mintStatus.remaining.toFixed(2)}</span>
                          {' '}— Max 1 mint per day, max $1,000 per day.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="bg-s-surface border border-s-border rounded-lg p-4">
                    <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Risk Allocation</h2>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-s-muted">Wallet Utilization</span>
                          <span className={`font-semibold ${util > 50 ? 'text-s-danger' : util > 30 ? 'text-s-warn' : 'text-s-green'}`}>{f(util, 1)}%</span>
                        </div>
                        <div className="h-2 bg-s-elevated rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${util > 50 ? 'bg-s-danger' : util > 30 ? 'bg-s-warn' : 'bg-s-green'}`}
                            style={{ width: `${Math.min(util, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-s-muted mt-1">
                          <span>Available: ${f(avail)}</span>
                          <span>Committed: ${f(committed)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-s-border text-xs">
                        <span className="text-s-muted">Total Balance</span>
                        <span className="font-semibold">${f(total)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-s-border/50 text-xs">
                        <span className="text-s-muted">Total P&L</span>
                        <span className={`font-semibold ${totalPnl >= 0 ? 'text-s-green' : 'text-s-danger'}`}>{totalPnl >= 0 ? '+' : ''}${f(totalPnl)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Opseeq Console Panel */}
        {opseeqPanel && (
          <div className="fixed top-12 bottom-0 w-[560px] bg-s-surface border-l border-s-border z-30 flex flex-col" style={{ right: chatOpen ? '360px' : '0px' }}>
            <div className="flex items-center justify-between px-3 h-10 border-b border-s-border">
              <span className="text-xs font-bold text-s-blue tracking-wider">OPSEEQ GATEWAY</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] ${opseeqAvailable ? 'text-s-green' : 'text-s-warn'}`}>{opseeqAvailable ? 'ONLINE' : 'OFFLINE'}</span>
                <button onClick={() => setOpseeqPanel(false)} className="text-s-muted hover:text-s-text text-xs">✕</button>
              </div>
            </div>
            <div className="flex-1 bg-black/20">
              <iframe title="Opseeq Console" src={opseeqUrl} className="w-full h-full border-0" />
            </div>
          </div>
        )}
        {chatOpen && (
          <div data-synth-id="chat-panel" className={`fixed right-0 top-12 bottom-0 w-[360px] bg-s-surface border-l border-s-border flex flex-col z-40 ${hl('chat-panel')}`}>
            {hlTooltip('chat-panel')}
            <div className="flex items-center justify-between px-3 h-10 border-b border-s-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-s-accent tracking-wider">OPSEEQ</span>
                <span className={`w-1.5 h-1.5 rounded-full ${opseeqAvailable ? 'bg-s-green' : 'bg-s-danger'}`} />
                {lastInference && (
                  <span className="text-[9px] text-s-muted font-mono truncate max-w-[120px]" title={`${lastInference.model} via ${lastInference.route}`}>
                    {lastInference.model.split('/').pop()} ({lastInference.route})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAutoMode(!autoMode)}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-all ${autoMode ? 'bg-s-accent text-black animate-pulse' : 'bg-s-elevated text-s-muted hover:text-s-text'}`}>
                  {autoMode ? 'AUTO ON' : 'AUTO OFF'}
                </button>
                <button onClick={() => setChatOpen(false)} className="text-s-muted hover:text-s-text text-xs">✕</button>
              </div>
            </div>
            {/* Thinking stages display */}
            {thinkLog.length > 0 && (
              <div className="border-b border-s-border/50 bg-s-elevated/30">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <div className="text-[9px] text-s-muted uppercase tracking-wider">Reasoning</div>
                  <div className="flex flex-wrap gap-1">
                    {thinkLog.map((t, i) => (
                      <div key={i} title={t.thought}
                        className={`text-[9px] px-1 py-0.5 rounded border flex items-center gap-0.5 cursor-help ${STAGE_COLORS[t.stage] || 'text-s-muted'} border-current/30 bg-current/5`}>
                        <span>{STAGE_ICONS[t.stage] || '◦'}</span>
                        <span>{t.stage}</span>
                      </div>
                    ))}
                  </div>
                  {chatLoading && <span className="text-[9px] text-s-accent animate-pulse ml-auto">working...</span>}
                </div>
                <div className="max-h-[140px] overflow-y-auto px-3 pb-2 space-y-1">
                  {thinkLog.map((t, i) => (
                    <div key={`trace-${i}`} className="rounded border border-s-border/40 bg-s-panel/40 px-2 py-1">
                      <div className="flex items-center justify-between gap-2 text-[8px] uppercase tracking-wider">
                        <span className={`${STAGE_COLORS[t.stage] || 'text-s-muted'} font-bold`}>{t.stage}</span>
                        <span className="text-s-muted font-mono">{ts(t.enteredAt)}</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-s-muted leading-snug">{t.thought}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMsgs.length === 0 && (
                <div className="py-4">
                  <div className="text-xs text-s-muted border-l-2 border-s-accent pl-3 mb-4">
                    <p className="text-s-text font-semibold mb-1">Welcome to Opseeq</p>
                    <p>I find the best near-term prediction markets, analyze them with AI, and walk you through placing a prediction.</p>
                    <p className="mt-1">Balance: <span className="font-mono text-s-accent">${f(bal?.total || '0')}</span> | Markets tracked: <span className="font-mono text-s-accent">{mkts.length}</span></p>
                  </div>
                  <p className="text-[10px] text-s-muted mb-2 px-1">Quick actions:</p>
                  <div className="space-y-1.5">
                    {[
                      ['Find me the best crypto bet right now', 'BTC, ETH, SOL 15-min markets + commit'],
                      ['Find me the best bet and commit $5', 'Full OODA loop → auto-commit $5'],
                      ['YES - execute the queued order', 'Approves the currently queued live order'],
                      ['NO - cancel the queued order', 'Rejects the currently queued live order'],
                      ['What can I afford with $' + f(bal?.total || '0') + '?', 'Shows affordable options based on balance'],
                      ['Clean up my stale predictions', 'Remove ended + distant uncommitted predictions'],
                      ['Show my positions and P&L', 'Lists all committed bets and performance'],
                    ].map(([label, hint]) => (
                      <button key={label} onClick={() => sendChat(label)}
                        title={hint}
                        className="block w-full text-left text-xs bg-s-panel border border-s-border rounded px-3 py-2.5 text-s-muted hover:text-s-text hover:border-s-accent transition-colors">
                        <span>{label}</span>
                        <span className="block text-[10px] text-s-muted/60 mt-0.5">{hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMsgs.map((m, i) => (
                <div key={i} className={`text-xs leading-relaxed ${m.role === 'user' ? 'text-s-text bg-s-panel rounded-lg p-2.5' : 'text-s-muted border-l-2 border-s-accent pl-3 py-1'}`}>
                  {m.role === 'assistant' ? <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-s-text">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-s-elevated px-1 rounded text-s-accent">$1</code>') }} /> : m.content}
                </div>
              ))}
              {chatLoading && (
                <div className="text-xs border-l-2 border-yellow-400 pl-3 py-2 space-y-1">
                  <div className="text-s-accent animate-pulse">Opseeq is working...</div>
                  {thinkLog.length > 0 && (
                    <div className="text-[10px] text-s-muted">
                      Stage: <span className="text-s-text font-semibold">{thinkLog[thinkLog.length - 1].stage}</span>
                      {' '}&mdash; {thinkLog.length} step{thinkLog.length !== 1 ? 's' : ''} so far
                    </div>
                  )}
                  {opseeqAvailable && <div className="text-[9px] text-s-muted">via Opseeq gateway</div>}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div data-synth-id="chat-input-wrap" className={`relative p-3 border-t border-s-border ${hl('chat-input-wrap')}`}>
              {hlTooltip('chat-input-wrap')}
              <div className="flex gap-2">
                <input data-synth-id="chat-input" className={`flex-1 bg-s-bg border border-s-border rounded px-2.5 py-2 text-xs text-s-text outline-none focus:border-s-accent ${hl('chat-input')}`}
                  placeholder="Ask Opseeq..." value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(chatInput) } }}
                  disabled={chatLoading} />
                <button data-synth-id="chat-send" onClick={() => sendChat(chatInput)} disabled={chatLoading || !chatInput.trim()}
                  className={`relative px-3 py-2 bg-s-accent text-black font-bold rounded text-xs disabled:opacity-50 ${hl('chat-send')}`}>
                  {hlTooltip('chat-send')}
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
