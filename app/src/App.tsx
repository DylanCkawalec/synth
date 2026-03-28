import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Tab, Prediction, ScoredMarket, Balance, Position, PNL, HealthStatus, DeskConfig, PendingAction, AuditEntry, ChatMessage, HighlightCommand, WalletMode, MetaMaskState, DepositAddress, Wallet, SupportedToken } from './types.ts'
import { SUPPORTED_CHAINS, CHAIN_IDS, SUPPORTED_TOKENS } from './types.ts'
import * as api from './api.ts'
import { scoreMarkets } from './scoring.ts'

// ── Formatters ────────────────────────────────────────────────────
const f = (n: string | number, d = 2) => { const v = typeof n === 'string' ? parseFloat(n) : n; return isNaN(v) ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) }
const ago = (iso: string) => { const d = Date.now() - new Date(iso).getTime(); return d < 6e4 ? 'now' : d < 36e5 ? `${Math.floor(d / 6e4)}m` : d < 864e5 ? `${Math.floor(d / 36e5)}h` : `${Math.floor(d / 864e5)}d` }
const tl = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso).getTime() - Date.now(); return d <= 0 ? 'ended' : d < 6e4 ? '<1m' : d < 36e5 ? `${Math.floor(d / 6e4)}m` : d < 864e5 ? `${Math.floor(d / 36e5)}h` : `${Math.floor(d / 864e5)}d` }
const cc = (c: number) => c >= .75 ? 'bg-s-green' : c >= .5 ? 'bg-s-accent' : c >= .3 ? 'bg-s-warn' : 'bg-s-danger'
const uIcons: Record<string, string> = { critical: '🔴', soon: '🟡', normal: '🟢', distant: '⚪', ended: '⚫' }

function truncAddr(addr: string, n = 6) { return addr ? `${addr.slice(0, n)}...${addr.slice(-4)}` : '' }
function isValidEvmAddress(addr: string) { return /^0x[a-fA-F0-9]{40}$/.test(addr) }
function isValidSolAddress(addr: string) { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr) }

// ── MetaMask helpers ─────────────────────────────────────────────
async function connectMetaMask(): Promise<MetaMaskState> {
  const eth = (window as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; on: (event: string, cb: (...args: unknown[]) => void) => void } }).ethereum
  if (!eth) throw new Error('MetaMask not detected. Please install MetaMask.')
  const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[]
  const chainHex = await eth.request({ method: 'eth_chainId' }) as string
  const chainId = parseInt(chainHex, 16)
  const address = accounts[0]
  const balHex = await eth.request({ method: 'eth_getBalance', params: [address, 'latest'] }) as string
  const balance = (parseInt(balHex, 16) / 1e18).toFixed(4)
  return { connected: true, address, chainId, chainName: CHAIN_IDS[chainId] || `Chain ${chainId}`, balance, supportedTokens: [] }
}

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
    try { setPreds(await api.getPredictions(50)) } catch {/**/}
    try { setPending(await api.getApprovals()) } catch {/**/}
    try { setMkts(scoreMarkets(await api.getMarkets('', '', 40) as Record<string, unknown>[])) } catch {/**/}
    setLastRefresh(Date.now())
  }, [wid, wMode])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => { const iv = setInterval(refresh, 12_000); return () => clearInterval(iv) }, [refresh])

  const predict = async (query: string) => {
    setLoading(true)
    try { const p = await api.generatePrediction(query, wid || undefined); setPreds(prev => [p, ...prev]); setTab('predictions'); flash('Prediction generated') }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Unknown'}`) }
    finally { setLoading(false) }
  }

  const resolve = async (id: string, correct: boolean) => {
    try { await api.resolvePrediction(id, correct); await refresh(); flash(correct ? 'Marked correct' : 'Marked incorrect') }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Failed'}`) }
  }

  const deletePred = async (id: string) => {
    try { await api.deletePrediction(id); setPreds(prev => prev.filter(p => p.id !== id)); flash('Prediction removed') }
    catch (e) { flash(`Error: ${e instanceof Error ? e.message : 'Failed'}`) }
  }

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
      const { reply, commands } = await api.chat(newMsgs.map(m => ({ role: m.role, content: m.content })))
      setChatMsgs(prev => [...prev, { role: 'assistant', content: reply || 'Done.' }])
      for (const cmd of commands || []) {
        if (cmd.type === 'switch_tab') setTab(cmd.payload as Tab)
        if (cmd.type === 'highlight') addHighlight(cmd.payload as HighlightCommand)
      }
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

  // MetaMask connection
  const handleConnectMetaMask = async () => {
    try {
      const state = await connectMetaMask()
      setMetaMask(state)
      if (state.address) setWithdrawAddress(state.address)
      flash('MetaMask connected')
    } catch (e) { flash(e instanceof Error ? e.message : 'MetaMask connection failed') }
  }

  // Listen for MetaMask chain/account changes
  useEffect(() => {
    const eth = (window as { ethereum?: { on: (event: string, cb: (...args: unknown[]) => void) => void; removeListener: (event: string, cb: (...args: unknown[]) => void) => void } }).ethereum
    if (!eth) return
    const handleChainChange = () => { if (metaMask.connected) handleConnectMetaMask() }
    const handleAccountChange = () => { if (metaMask.connected) handleConnectMetaMask() }
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

  // Deduplicate: one card per market name, latest wins
  const dedupedPreds = useMemo(() => {
    const seen = new Map<string, Prediction>()
    for (const p of preds) {
      const key = p.marketName || p.query
      if (!seen.has(key)) seen.set(key, p)
    }
    return [...seen.values()]
  }, [preds])

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
              {t === 'approvals' && pending.length > 0 && <span className="ml-1 bg-s-danger text-white text-[9px] px-1.5 rounded-full font-bold">{pending.length}</span>}
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
                {dedupedPreds.map(p => {
                  const cl = confLabel(p.confidence)
                  const ended = marketEnded(p.endsAt)
                  const isBuyOrSell = p.action === 'BUY' || p.action === 'SELL'
                  const isExpanded = expanded.has(p.id)
                  const effectiveAction = (p.action === 'HOLD' || p.action === 'SKIP') ? p.action : `${p.action} ${p.side || 'YES'}`
                  return (
                  <div key={p.id} className="bg-s-panel border border-s-border rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 p-4 pb-3">
                      <span className="text-sm font-semibold flex-1">{p.marketName || p.query}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{p.venue || '—'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${cl.cls}`}>{cl.text}</span>
                      <button onClick={() => deletePred(p.id)} title="Remove this prediction" className="text-s-muted hover:text-s-danger text-xs px-1">✕</button>
                    </div>

                    {/* AI Recommendation */}
                    <div className={`mx-4 mb-3 p-3 rounded-lg border ${isBuyOrSell ? 'border-s-accent/30 bg-s-accent/5' : 'border-s-border bg-s-elevated/50'}`}>
                      <div className="text-xs font-semibold mb-1">
                        {isBuyOrSell ? (
                          <span>AI recommends: <span className={p.action === 'BUY' ? 'text-s-green' : 'text-s-danger'}>{effectiveAction}</span> at <span className="font-mono">${f(p.yesPrice)}</span></span>
                        ) : (
                          <span className="text-s-muted">AI recommends: <span className="text-s-warn">{p.action}</span> — confidence too low or insufficient data</span>
                        )}
                      </div>
                      {isBuyOrSell && p.amountUsdc > 0 && (
                        <div className="text-[11px] text-s-muted">Suggested wager: <span className="font-mono font-semibold text-s-text">${f(p.amountUsdc)}</span></div>
                      )}
                    </div>

                    {/* Bet buttons */}
                    {isBuyOrSell && !ended && p.status !== 'resolved' && (
                      <div className="flex gap-2 mx-4 mb-3">
                        <button title="Place a simulated bet with practice money"
                          className="flex-1 px-3 py-2 bg-s-green/20 text-s-green border border-s-green/30 rounded text-xs font-bold hover:bg-s-green/30 transition-all">
                          Simulate Bet ${f(p.amountUsdc)}
                        </button>
                        {wMode === 'real' && (
                          <button title="Place a real bet (requires approval)"
                            className="flex-1 px-3 py-2 bg-transparent text-s-warn border border-s-warn/40 rounded text-xs font-bold hover:bg-s-warn/10 transition-all">
                            Place Real Bet ${f(p.amountUsdc)}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Thesis (collapsible) */}
                    <div className="mx-4 mb-3">
                      <button onClick={() => setExpanded(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n })}
                        className="text-[10px] text-s-muted hover:text-s-text transition-colors">
                        {isExpanded ? '▾ Hide analysis' : '▸ Show analysis'}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 space-y-2 text-xs">
                          <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Thesis</strong><p className="text-s-muted mt-0.5">{p.thesis}</p></div>
                          <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Rationale</strong><p className="text-s-muted mt-0.5">{p.rationale}</p></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Invalidation</strong><p className="text-s-muted mt-0.5">{p.invalidation}</p></div>
                            <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Risk</strong><p className="text-s-muted mt-0.5">{p.riskNote}</p></div>
                          </div>
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

                      {/* Correct/Wrong only after market ends */}
                      {ended && p.status !== 'resolved' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => resolve(p.id, true)} title="Mark this prediction as correct" className="px-2.5 py-1 bg-s-green/20 text-s-green rounded text-[10px] font-bold hover:bg-s-green/30">✓ Correct</button>
                          <button onClick={() => resolve(p.id, false)} title="Mark this prediction as incorrect" className="px-2.5 py-1 bg-s-danger/20 text-s-danger rounded text-[10px] font-bold hover:bg-s-danger/30">✗ Wrong</button>
                        </div>
                      )}
                      {p.wasCorrect !== null && <span className={`font-bold ${p.wasCorrect ? 'text-s-green' : 'text-s-danger'}`}>{p.wasCorrect ? '✓ AI was right' : '✗ AI was wrong'}</span>}
                    </div>
                  </div>
                  )
                })}
                {dedupedPreds.length === 0 && <p className="text-s-muted text-xs text-center py-8">No predictions yet. Ask NemoClaw or search above.</p>}
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {tab === 'approvals' && (
            <div className="bg-s-surface border border-s-border rounded-lg p-4">
              <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Approval Queue</h2>
              {pending.length === 0 ? <p className="text-s-muted text-xs">All clear</p> : pending.map(a => (
                <div key={a.id} className="border border-s-border rounded p-3 mb-2">
                  <div className="flex items-center gap-3 mb-2"><span className="font-semibold text-xs">{a.type}</span><span className="text-[10px] text-s-muted">{a.id.slice(0, 8)}</span><span className="text-[10px] text-s-muted">{ago(a.createdAt)}</span></div>
                  <pre className="text-[10px] text-s-muted bg-s-bg rounded p-2 mb-2 overflow-x-auto max-h-24">{JSON.stringify(a.params, null, 2)}</pre>
                  <div className="flex gap-2">
                    <button onClick={() => { api.approve(a.id).then(refresh).catch(() => {}); flash('Approved') }} className="px-3 py-1 bg-s-green text-black font-semibold rounded text-xs">Approve</button>
                    <button onClick={() => { api.reject(a.id).then(refresh).catch(() => {}); flash('Rejected') }} className="px-3 py-1 bg-s-danger text-white font-semibold rounded text-xs">Reject</button>
                  </div>
                </div>
              ))}
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
                    <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">MetaMask</h2>
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
                            ['Balance', `${metaMask.balance} ETH`],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between py-1 border-b border-s-border/50 text-xs">
                              <span className="text-s-muted">{k}</span>
                              <span className="font-mono font-semibold">{v}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={handleConnectMetaMask} className="w-full px-3 py-2 bg-s-elevated text-s-muted rounded text-xs hover:text-s-text">
                          Refresh Connection
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-s-muted text-xs mb-3">Connect MetaMask for direct deposits and withdrawals</p>
                        <button onClick={handleConnectMetaMask}
                          className="px-5 py-2.5 bg-s-accent text-black font-bold rounded text-xs hover:brightness-110">
                          Connect MetaMask
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
                      {[
                        ['Mode', wMode === 'sim' ? 'Practice' : 'Live'],
                        ['Model', config.model],
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
                      ['Find me the best prediction right now', 'Runs full OODA analysis'],
                      ['What markets are ending soon?', 'Shows urgent opportunities'],
                      ['How is my portfolio doing?', 'Checks balance and positions'],
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
