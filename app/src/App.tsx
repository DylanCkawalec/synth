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

function truncAddr(addr: string, n = 6) { return addr ? `${addr.slice(0, n)}...${addr.slice(-4)}` : '' }
function isValidEvmAddress(addr: string) { return /^0x[a-fA-F0-9]{40}$/.test(addr) }
function isValidSolAddress(addr: string) { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr) }

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

// Stage icons for NemoClaw thinking
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

  // Celebrations
  const [celebration, setCelebration] = useState<CelebType | null>(null)
  const triggerCelebration = useCallback((type: CelebType) => {
    setCelebration(type)
  }, [])

  // Think messages from NemoClaw
  const [thinkLog, setThinkLog] = useState<ThinkCommand[]>([])

  // Price history cache per tokenId
  const [priceHistories, setPriceHistories] = useState<Record<string, PricePoint[]>>({})
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null)

  // Approvals filter
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'live' | 'sim'>('all')

  // Sim mint
  const [mintStatus, setMintStatus] = useState<MintStatus | null>(null)
  const [mintAmount, setMintAmount] = useState('100')
  const [mintLoading, setMintLoading] = useState(false)

  // Highlights
  const [highlights, setHighlights] = useState<Map<string, string>>(new Map())

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

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  // Theme: sim = light, real = dark
  const theme = wMode === 'sim' ? 'light' : 'dark'
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  const addHighlight = useCallback((cmd: HighlightCommand) => {
    setHighlights(prev => new Map(prev).set(cmd.element, cmd.message))
    setTimeout(() => setHighlights(prev => { const n = new Map(prev); n.delete(cmd.element); return n }), 3500)
  }, [])

  useEffect(() => {
    api.getWallets().then(({ wallets: w, defaultWalletId }) => {
      setWallets(w)
      if (defaultWalletId) setWid(defaultWalletId)
      else if (w.length > 0) setWid(w[0].wallet_id)
    }).catch(() => {})
  }, [])

  const refresh = useCallback(async () => {
    try { const [h, c] = await Promise.all([api.getHealth(), api.getConfig()]); setHealth(h); setConfig(c) } catch {/**/}
    if (wid) {
      try { setBal(await api.getBalance(wid, wMode)) } catch {/**/}
      try { setPos(await api.getPositions(wid)) } catch {/**/}
      try { setPnl(await api.getPnl(wid)) } catch {/**/}
    }
    try { setPreds(await api.getPredictions(100)) } catch {/**/}
    try { setPending(await api.getApprovals()) } catch {/**/}
    const days = config?.horizonDays || 7
    try { setMkts(scoreMarkets(await api.getMarkets('', '', 40, days) as Record<string, unknown>[])) } catch {/**/}
    setLastRefresh(Date.now())
  }, [wid, wMode, config?.horizonDays])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => { const iv = setInterval(refresh, 12_000); return () => clearInterval(iv) }, [refresh])

  const predict = async (query: string) => {
    setLoading(true)
    try { const p = await api.generatePrediction(query, wid || undefined); setPreds(prev => [p, ...prev]); setTab('predictions'); flash('Prediction generated') }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Unknown'}`) }
    finally { setLoading(false) }
  }

  const resolve = async (id: string, correct: boolean) => {
    try {
      await api.resolvePrediction(id, correct)
      await refresh()
      if (correct) {
        flash('🏆 Prediction correct! Well done.')
        triggerCelebration('confetti')
      } else {
        flash('Marked incorrect — keep learning.')
      }
    }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Failed'}`) }
  }

  const deletePred = async (id: string) => {
    try { await api.deletePrediction(id); setPreds(prev => prev.filter(p => p.id !== id)); flash('Prediction removed') }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Failed'}`) }
  }

  const [orderLoading, setOrderLoading] = useState<string | null>(null)

  const placeOrder = async (p: Prediction, amountOverride?: number) => {
    if (!wid || !p.tokenId) { flash('Missing wallet or token ID'); return }
    setOrderLoading(p.id)
    try {
      const amount = String(amountOverride ?? p.amountUsdc)
      const result = await api.placeOrder(wid, {
        predictionId: p.id,
        tokenId: p.tokenId,
        side: (p.side as 'BUY' | 'SELL') || 'BUY',
        type: (p.orderType as 'MARKET' | 'LIMIT') || 'MARKET',
        amount,
        units: 'USDC',
        venue: (p.venue?.toLowerCase().includes('kalshi') ? 'kalshi' : 'polymarket') as 'polymarket' | 'kalshi',
      })
      if ('queued' in result) {
        flash('Order queued for approval — check Approvals tab')
        setTab('approvals')
      } else {
        flash(`🎆 Position filled: ${result.orderId?.slice(0, 12)}...`)
        triggerCelebration('fireworks')
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

  // NemoClaw chat
  const sendChat = async (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    const newMsgs = [...chatMsgs, userMsg]
    setChatMsgs(newMsgs)
    setChatInput('')
    setChatLoading(true)
    try {
      setThinkLog([])
      const { reply, commands } = await api.chat(newMsgs.map(m => ({ role: m.role, content: m.content })))
      const thinks: ThinkCommand[] = []
      for (const cmd of commands || []) {
        if (cmd.type === 'switch_tab') setTab(cmd.payload as Tab)
        if (cmd.type === 'highlight') addHighlight(cmd.payload as HighlightCommand)
        if (cmd.type === 'think') thinks.push(cmd.payload as ThinkCommand)
      }
      setThinkLog(thinks)
      setChatMsgs(prev => [...prev, { role: 'assistant', content: reply || 'Done.' }])
      await refresh()
    } catch (e) { setChatMsgs(prev => [...prev, { role: 'assistant', content: `Error: ${e instanceof Error ? e.message : 'Failed'}` }]) }
    finally { setChatLoading(false) }
  }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs])

  useEffect(() => {
    if (!autoMode) return
    const run = () => sendChat('Run the OODA loop: observe markets and balance, orient on the best near-term opportunity, decide on a prediction, and act by presenting it.')
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
  const best = mkts[0] || null
  const urgentMkts = mkts.filter(m => m.urgency === 'critical' || m.urgency === 'soon')
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const refreshAge = Math.round((Date.now() - lastRefresh) / 1000)

  // Deduplicate: one card per market name per day, latest wins
  // Then sort: affordable+uncommitted first (actionable now), then committed, then others
  const dedupedPreds = useMemo(() => {
    const seen = new Map<string, Prediction>()
    for (const p of preds) {
      const dayKey = p.createdAt.slice(0, 10)
      const key = `${p.marketName || p.query}::${dayKey}`
      if (!seen.has(key)) seen.set(key, p)
    }
    const all = [...seen.values()]
    return all.sort((a, b) => {
      // Committed (active positions) come first for tracking
      const aCommitted = !!(a.status === 'committed' || a.orderId)
      const bCommitted = !!(b.status === 'committed' || b.orderId)
      if (aCommitted !== bCommitted) return aCommitted ? -1 : 1
      // Then sort by affordability × confidence
      const aAfford = (a.maxAffordableUsdc || 0) >= (a.minEntryUsdc || 0.10) && a.status !== 'resolved'
      const bAfford = (b.maxAffordableUsdc || 0) >= (b.minEntryUsdc || 0.10) && b.status !== 'resolved'
      if (aAfford !== bAfford) return aAfford ? -1 : 1
      return b.confidence - a.confidence
    })
  }, [preds])

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

  const hl = (id: string) => highlights.has(id) ? 'ring-2 ring-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all duration-500' : 'transition-all duration-500'
  const hlTooltip = (id: string) => highlights.has(id)
    ? <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap z-50 animate-pulse">{highlights.get(id)}</div>
    : null

  const toggleMode = () => setWMode(prev => prev === 'real' ? 'sim' : 'real')

  return (
    <div className="min-h-screen flex flex-col font-sans text-[13px]">
      {celebration && <Celebration type={celebration} onDone={() => setCelebration(null)} />}
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
              {t === 'approvals' && (pending.length > 0 || (health as (HealthStatus & { pendingApprovals?: number }))?.pendingApprovals) && (
                <span className="ml-1 bg-s-danger text-white text-[9px] px-1.5 rounded-full font-bold">
                  {(health as (HealthStatus & { pendingApprovals?: number }))?.pendingApprovals || pending.length}
                </span>
              )}
              {t === 'predictions' && preds.length > 0 && <span className="ml-1 bg-s-blue text-white text-[9px] px-1.5 rounded-full font-bold">{preds.length}</span>}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setChatOpen(!chatOpen)} className={`text-[10px] px-2 py-1 rounded font-semibold transition-all ${chatOpen ? 'bg-s-accent text-black' : 'bg-s-elevated text-s-muted hover:text-s-text'}`}>
            NemoClaw
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

        {/* Balance info */}
        {[
          ['Balance', `$${f(bal?.total || '0')}`],
          ['Available', `$${f(bal?.available || '0')}`],
          ['Committed', `$${f(committed)}`],
          ['Utilization', `${f(util, 1)}%`],
          ['P&L', `${totalPnl >= 0 ? '+' : ''}$${f(Math.abs(totalPnl))}`],
          ['Positions', String(pos.length)],
          ['Max Risk', `$${f(config?.risk?.maxPositionUsdc || 0)}`],
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
        <main className={`flex-1 p-4 overflow-y-auto transition-all duration-300 ${chatOpen ? 'mr-[360px]' : ''}`}>
          {toast && <div className="fixed top-14 right-5 bg-s-panel border border-s-accent text-s-text px-4 py-2.5 rounded text-xs z-50 animate-[slideIn_0.2s_ease-out]">{toast}</div>}

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Next Best */}
              <div data-synth-id="next-best" className={`relative lg:col-span-2 bg-s-surface border border-s-border rounded-lg p-4 ${hl('next-best')}`}>
                {hlTooltip('next-best')}
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Next Best Opportunity</h2>
                {best ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <span>{uIcons[best.urgency] || '⚪'}</span>
                      <span className="text-sm font-semibold flex-1">{best.market_name || best.event_title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{best.venue}</span>
                    </div>
                    <div className="flex gap-6">
                      {[['Yes', f(best.yes_price)], ['No', f(best.no_price)], ['Score', String(best.score)], ['Ends', tl(best.ends_at)]].map(([l, v]) => (
                        <div key={l} className="flex flex-col"><span className="text-[10px] text-s-muted uppercase">{l}</span><span className="text-sm font-semibold">{v}</span></div>
                      ))}
                    </div>
                    <button disabled={loading} onClick={() => predict(best.market_name || best.event_title)}
                      title="Ask AI to analyze this market and suggest a trade"
                      className={`self-start px-5 py-2.5 bg-s-accent text-black font-bold rounded text-xs hover:brightness-110 disabled:opacity-50 transition-all ${best.score > 0.7 ? 'animate-[glow_2s_ease-in-out_infinite]' : ''}`}>
                      {loading ? 'Analyzing...' : '→ Generate Prediction'}
                    </button>
                  </div>
                ) : <p className="text-s-muted text-xs">Loading markets...</p>}
              </div>

              {/* Ending Soon */}
              <div data-synth-id="ending-soon" className={`relative bg-s-surface border border-s-border rounded-lg p-4 ${hl('ending-soon')}`}>
                {hlTooltip('ending-soon')}
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Ending Soon</h2>
                <div className="flex flex-col gap-1">
                  {urgentMkts.slice(0, 8).map(m => (
                    <div key={m.token_id} onClick={() => predict(m.market_name || m.event_title)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-s-panel transition-colors">
                      <span className="text-xs">{uIcons[m.urgency]}</span>
                      <span className="flex-1 text-xs truncate">{m.market_name || m.event_title}</span>
                      <span className="text-[11px] text-s-warn font-semibold">{tl(m.ends_at)}</span>
                    </div>
                  ))}
                  {urgentMkts.length === 0 && <p className="text-s-muted text-xs">No urgent markets right now</p>}
                </div>
              </div>

              {/* Recent Predictions */}
              <div data-synth-id="recent-preds" className={`relative bg-s-surface border border-s-border rounded-lg p-4 ${hl('recent-preds')}`}>
                {hlTooltip('recent-preds')}
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Recent Predictions</h2>
                {preds.slice(0, 5).map(p => (
                  <div key={p.id} className="border border-s-border rounded p-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-xs truncate">{p.thesis.slice(0, 80)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-black ${cc(p.confidence)}`}>{Math.round(p.confidence * 100)}%</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px] text-s-muted">
                      <span className="font-semibold">{p.action}</span><span>{p.venue}</span><span>{ago(p.createdAt)}</span>
                      {p.wasCorrect !== null && <span className={p.wasCorrect ? 'text-s-green font-semibold' : 'text-s-danger font-semibold'}>{p.wasCorrect ? '✓ Correct' : '✗ Wrong'}</span>}
                    </div>
                  </div>
                ))}
                {preds.length === 0 && <p className="text-s-muted text-xs">No predictions yet — ask NemoClaw or click Generate</p>}
              </div>

              {/* Calendar Timeline */}
              <div data-synth-id="calendar" className={`relative lg:col-span-2 bg-s-surface border border-s-border rounded-lg p-4 ${hl('calendar')}`}>
                {hlTooltip('calendar')}
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Prediction Calendar — Next 24h</h2>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mkts.filter(m => m.minutesLeft !== null && m.minutesLeft > 0 && m.minutesLeft <= 1440).slice(0, 12).map(m => (
                    <div key={m.token_id} onClick={() => predict(m.market_name || m.event_title)}
                      className={`flex-shrink-0 w-44 p-2.5 rounded-lg border cursor-pointer hover:brightness-110 transition-all ${
                        m.urgency === 'critical' ? 'border-s-danger bg-s-danger/10' : m.urgency === 'soon' ? 'border-s-warn bg-s-warn/10' : 'border-s-border bg-s-panel'}`}>
                      <div className="text-[10px] font-bold text-s-muted uppercase mb-1">{tl(m.ends_at)}</div>
                      <div className="text-xs font-semibold truncate">{m.market_name || m.event_title}</div>
                      <div className="flex gap-2 mt-1 text-[10px] text-s-muted">
                        <span>Yes: {f(m.yes_price)}</span>
                        <span>Score: {m.score}</span>
                      </div>
                    </div>
                  ))}
                  {mkts.filter(m => m.minutesLeft !== null && m.minutesLeft > 0 && m.minutesLeft <= 1440).length === 0 && <p className="text-s-muted text-xs">No markets ending in the next 24h</p>}
                </div>
              </div>

              {/* Positions */}
              <div data-synth-id="positions" className={`relative lg:col-span-2 bg-s-surface border border-s-border rounded-lg p-4 ${hl('positions')}`}>
                {hlTooltip('positions')}
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Open Positions</h2>
                {pos.length > 0 ? (
                  <table className="w-full text-xs"><thead><tr className="text-[10px] uppercase text-s-muted tracking-wide border-b border-s-border">
                    <th className="text-left py-1.5 px-2">Market</th><th className="text-left py-1.5 px-2">Side</th><th className="text-right py-1.5 px-2">Size</th><th className="text-right py-1.5 px-2">P&L</th>
                  </tr></thead><tbody>{pos.map((p, i) => (
                    <tr key={i} className="border-b border-s-border/50 hover:bg-s-panel/50">
                      <td className="py-1.5 px-2 truncate max-w-[200px]">{p.title || p.token_id?.slice(0, 12)}</td>
                      <td className={`py-1.5 px-2 font-semibold ${p.side === 'BUY' ? 'text-s-green' : 'text-s-danger'}`}>{p.side}</td>
                      <td className="py-1.5 px-2 text-right">{p.size}</td>
                      <td className={`py-1.5 px-2 text-right ${parseFloat(p.pnl) >= 0 ? 'text-s-green' : 'text-s-danger'}`}>{p.pnl}</td>
                    </tr>
                  ))}</tbody></table>
                ) : <p className="text-s-muted text-xs">No open positions</p>}
              </div>
            </div>
          )}

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
                <th className="py-1.5 px-2 text-right">Yes</th><th className="py-1.5 px-2 text-right">No</th><th className="py-1.5 px-2 text-right">Ends</th>
                <th className="py-1.5 px-2 text-right">Score</th><th className="py-1.5 px-2 w-16"></th>
              </tr></thead><tbody>{mkts.slice(0, 40).map(m => (
                <tr key={m.token_id} className="border-b border-s-border/50 hover:bg-s-panel/50">
                  <td className="py-1.5 px-2">{uIcons[m.urgency]}</td>
                  <td className="py-1.5 px-2 truncate max-w-[280px]">{m.market_name || m.event_title}</td>
                  <td className="py-1.5 px-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{m.venue}</span>
                    {m.subMarketCount > 1 && <span className="ml-1 text-[9px] text-s-muted">{m.subMarketCount} outcomes</span>}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">{f(m.yes_price)}</td><td className="py-1.5 px-2 text-right font-mono">{f(m.no_price)}</td>
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
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider">My Predictions</h2>
                <div className="flex gap-2">
                  <input className="bg-s-bg border border-s-border rounded px-2.5 py-1.5 text-xs text-s-text outline-none focus:border-s-accent min-w-[250px]"
                    placeholder="Ask about a market..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') predict(q) }} />
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
                  const isCommitted = p.status === 'committed' || p.orderId
                  const leanPrice = p.lean === 'YES' ? p.yesPrice : p.lean === 'NO' ? p.noPrice : p.yesPrice
                  const canAfford = (p.maxAffordableUsdc || 0) >= (p.minEntryUsdc || 0.10)
                  const isOrdering = orderLoading === p.id
                  return (
                  <div key={p.id} className={`bg-s-panel border rounded-lg overflow-hidden ${isCommitted ? 'border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.15)]' : 'border-s-border'}`}>
                    {/* Header */}
                    <div className="flex items-center gap-2 p-4 pb-3">
                      {isCommitted && <span className="text-yellow-400 text-xs" title="You have money on this">💰</span>}
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
                        AI recommends: <span className="text-s-green">{p.action} {p.lean || 'YES'}</span> at <span className="font-mono">${f(leanPrice)}</span>
                        {p.amountUsdc > 0 && <span className="text-s-muted ml-1">— wager <span className="font-mono text-s-text">${f(p.amountUsdc)}</span></span>}
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
                          <span className="font-mono font-semibold">${f(p.minEntryUsdc || 0.10)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-s-muted">You can bet up to:</span>
                          <span className={`font-mono font-semibold ${canAfford ? 'text-s-green' : 'text-s-danger'}`}>${f(p.maxAffordableUsdc || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-s-muted">Yes:</span>
                          <span className="font-mono">${f(p.yesPrice)}</span>
                          <span className="text-s-muted ml-1">No:</span>
                          <span className="font-mono">${f(p.noPrice)}</span>
                        </div>
                      </div>
                    )}

                    {/* Order buttons */}
                    {!ended && p.status !== 'resolved' && !isCommitted && (
                      <div className="flex gap-2 mx-4 mb-3">
                        {wMode === 'sim' ? (
                          <button onClick={() => placeOrder(p)} disabled={isOrdering}
                            title="Place a simulated bet with practice money"
                            className="flex-1 px-3 py-2.5 bg-s-green/20 text-s-green border border-s-green/30 rounded text-xs font-bold hover:bg-s-green/30 transition-all disabled:opacity-50">
                            {isOrdering ? 'Placing...' : `Simulate: ${p.lean || 'YES'} $${f(p.amountUsdc)}`}
                          </button>
                        ) : (
                          <>
                            <button onClick={() => placeOrder(p)} disabled={isOrdering || !canAfford}
                              title={canAfford ? 'Place a real order via synthesis.trade' : 'Insufficient balance'}
                              className="flex-1 px-3 py-2.5 bg-s-accent/20 text-s-accent border border-s-accent/30 rounded text-xs font-bold hover:bg-s-accent/30 transition-all disabled:opacity-50">
                              {isOrdering ? 'Placing...' : `Commit: ${p.lean || 'YES'} $${f(p.amountUsdc)}`}
                            </button>
                            {p.amountUsdc > 1 && (
                              <button onClick={() => placeOrder(p, Math.max(p.minEntryUsdc || 0.10, 1))} disabled={isOrdering}
                                title="Place minimum bet"
                                className="px-3 py-2.5 bg-s-elevated text-s-muted border border-s-border rounded text-xs font-semibold hover:text-s-text transition-all disabled:opacity-50">
                                Min ${ f(Math.max(p.minEntryUsdc || 0.10, 1))}
                              </button>
                            )}
                          </>
                        )}
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
                                  <span>Yes: <strong className="text-s-green">${f(p.yesPrice)}</strong></span>
                                  <span>No: <strong className="text-s-danger">${f(p.noPrice)}</strong></span>
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
                        <div className="flex gap-1.5">
                          <button onClick={() => resolve(p.id, true)} title="Mark correct" className="px-2.5 py-1 bg-s-green/20 text-s-green rounded text-[10px] font-bold hover:bg-s-green/30">✓ Correct</button>
                          <button onClick={() => resolve(p.id, false)} title="Mark incorrect" className="px-2.5 py-1 bg-s-danger/20 text-s-danger rounded text-[10px] font-bold hover:bg-s-danger/30">✗ Wrong</button>
                        </div>
                      )}
                      {p.wasCorrect !== null && <span className={`font-bold ${p.wasCorrect ? 'text-s-green' : 'text-s-danger'}`}>{p.wasCorrect ? '✓ AI was right' : '✗ AI was wrong'}</span>}
                    </div>
                  </div>
                  )
                }),
                  ]
                )}
                {dedupedPreds.length === 0 && <p className="text-s-muted text-xs text-center py-8">No predictions yet. Ask NemoClaw or search above.</p>}
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {tab === 'approvals' && (
            <div className="bg-s-surface border border-s-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider">Approval Queue</h2>
                <div className="flex gap-1 bg-s-elevated rounded-lg p-0.5">
                  {(['all','live','sim'] as const).map(f => (
                    <button key={f} onClick={() => { setApprovalFilter(f); api.getApprovals(f === 'all' ? undefined : f).then(setPending).catch(() => {}) }}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${approvalFilter === f ? 'bg-s-accent text-black' : 'text-s-muted hover:text-s-text'}`}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button onClick={() => api.getApprovals(approvalFilter === 'all' ? undefined : approvalFilter).then(setPending).catch(() => {})}
                  className="ml-auto text-[10px] text-s-muted hover:text-s-accent">↻ Refresh</button>
              </div>

              <div className="mb-2 text-[10px] text-s-muted">
                <strong>Predictions tab</strong> = your AI analyses and generated trade ideas.<br/>
                <strong>Approvals tab</strong> = live orders waiting for your confirmation before real money is spent.
              </div>

              {pending.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-s-muted text-xs">No pending orders.</p>
                  <p className="text-[10px] text-s-muted mt-1">When you click "Commit" in LIVE mode, orders appear here for approval before executing.</p>
                </div>
              ) : pending.map(a => {
                const p = a.params as { tokenId?: string; side?: string; amount?: string; orderType?: string; predictionId?: string }
                const isLive = a.mode === 'real'
                return (
                  <div key={a.id} className={`border rounded-lg p-3 mb-2 ${isLive ? 'border-s-warn/40 bg-s-warn/5' : 'border-s-border'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isLive ? 'bg-s-warn/20 text-s-warn' : 'bg-s-elevated text-s-muted'}`}>{isLive ? 'LIVE ORDER' : 'SIM'}</span>
                      <span className="text-xs font-semibold">{p.side} {p.amount} USDC</span>
                      <span className="text-[10px] text-s-muted font-mono">{p.tokenId?.slice(0, 16)}...</span>
                      <span className="text-[10px] text-s-muted ml-auto">{ago(a.createdAt)}</span>
                    </div>
                    <div className="flex gap-2 text-[10px] text-s-muted mb-2">
                      <span>Type: {p.orderType || 'MARKET'}</span>
                      {p.predictionId && <span>Linked to prediction: {p.predictionId}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        api.approve(a.id).then(r => {
                          if ('orderResult' in (r as object)) { triggerCelebration('fireworks'); flash('🎆 Order executed!') }
                          else flash('Approved')
                          refresh()
                        }).catch(e => flash(`Error: ${e instanceof Error ? e.message : ''}`))
                      }} className="px-3 py-1.5 bg-s-green text-black font-bold rounded text-xs hover:brightness-110">
                        {isLive ? '✓ Execute Order' : '✓ Approve'}
                      </button>
                      <button onClick={() => { api.reject(a.id).then(refresh).catch(() => {}); flash('Rejected') }}
                        className="px-3 py-1.5 bg-s-danger/20 text-s-danger border border-s-danger/30 rounded text-xs font-semibold">
                        ✗ Cancel
                      </button>
                    </div>
                  </div>
                )
              })}
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

        {/* NemoClaw Chat Panel */}
        {chatOpen && (
          <div className="fixed right-0 top-12 bottom-0 w-[360px] bg-s-surface border-l border-s-border flex flex-col z-40">
            <div className="flex items-center justify-between px-3 h-10 border-b border-s-border">
              <span className="text-xs font-bold text-s-accent tracking-wider">NEMOCLAW</span>
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
              <div className="px-3 py-2 border-b border-s-border/50 bg-s-elevated/30">
                <div className="text-[9px] text-s-muted uppercase tracking-wider mb-1.5">Reasoning stages</div>
                <div className="flex flex-wrap gap-1">
                  {thinkLog.map((t, i) => (
                    <div key={i} title={t.thought}
                      className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 cursor-help ${STAGE_COLORS[t.stage] || 'text-s-muted'} border-current/30 bg-current/5`}>
                      <span>{STAGE_ICONS[t.stage] || '◦'}</span>
                      <span>{t.stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMsgs.length === 0 && (
                <div className="py-4">
                  <div className="text-xs text-s-muted border-l-2 border-s-accent pl-3 mb-4">
                    <p className="text-s-text font-semibold mb-1">Welcome to NemoClaw</p>
                    <p>I find the best near-term prediction markets, analyze them with AI, and walk you through placing a prediction.</p>
                    <p className="mt-1">Balance: <span className="font-mono text-s-accent">${f(bal?.total || '0')}</span> | Markets tracked: <span className="font-mono text-s-accent">{mkts.length}</span></p>
                  </div>
                  <p className="text-[10px] text-s-muted mb-2 px-1">Quick actions:</p>
                  <div className="space-y-1.5">
                    {[
                      ['Find me the best bet I can make right now', 'Full multi-stage analysis + place order'],
                      ['What can I afford with $' + f(bal?.total || '0') + '?', 'Shows affordable options based on balance'],
                      ['What markets end in the next 7 days?', 'Time-filtered market discovery'],
                      ['Research the golf market', 'Deep research + price history + stats'],
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
                <div className="text-xs text-s-accent border-l-2 border-yellow-400 pl-3 py-2 animate-pulse">
                  NemoClaw is thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-s-border">
              <div className="flex gap-2">
                <input className="flex-1 bg-s-bg border border-s-border rounded px-2.5 py-2 text-xs text-s-text outline-none focus:border-s-accent"
                  placeholder="Ask NemoClaw..." value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(chatInput) } }}
                  disabled={chatLoading} />
                <button onClick={() => sendChat(chatInput)} disabled={chatLoading || !chatInput.trim()}
                  className="px-3 py-2 bg-s-accent text-black font-bold rounded text-xs disabled:opacity-50">→</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
