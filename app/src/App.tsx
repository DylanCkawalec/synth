import { useState, useEffect, useCallback } from 'react'
import type { Tab, Prediction, ScoredMarket, Balance, Position, PNL, HealthStatus, DeskConfig, PendingAction, AuditEntry } from './types.ts'
import * as api from './api.ts'
import { scoreMarkets } from './scoring.ts'

const W = 'synth_wallet'
const f = (n: string | number, d = 2) => { const v = typeof n === 'string' ? parseFloat(n) : n; return isNaN(v) ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) }
const ago = (iso: string) => { const d = Date.now() - new Date(iso).getTime(); return d < 6e4 ? 'now' : d < 36e5 ? `${Math.floor(d / 6e4)}m` : d < 864e5 ? `${Math.floor(d / 36e5)}h` : `${Math.floor(d / 864e5)}d` }
const left = (iso: string | null) => { if (!iso) return '—'; const d = new Date(iso).getTime() - Date.now(); return d <= 0 ? 'ended' : d < 6e4 ? '<1m' : d < 36e5 ? `${Math.floor(d / 6e4)}m` : d < 864e5 ? `${Math.floor(d / 36e5)}h` : `${Math.floor(d / 864e5)}d` }
const cc = (c: number) => c >= .75 ? 'bg-s-green' : c >= .5 ? 'bg-s-accent' : c >= .3 ? 'bg-s-warn' : 'bg-s-danger'
const urgencyIcons: Record<ScoredMarket['urgency'], string> = { critical: '🔴', soon: '🟡', normal: '🟢', distant: '⚪' }
const ub = (u: ScoredMarket['urgency']) => urgencyIcons[u]

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [wid, setWid] = useState(() => localStorage.getItem(W) || '')
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

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }
  const saveW = (v: string) => { setWid(v); localStorage.setItem(W, v) }

  const refresh = useCallback(async () => {
    try { const [h, c] = await Promise.all([api.getHealth(), api.getConfig()]); setHealth(h); setConfig(c) } catch {/* offline */}
    if (wid) {
      try { setBal(await api.getBalance(wid)) } catch {/**/}
      try { setPos(await api.getPositions(wid)) } catch {/**/}
      try { setPnl(await api.getPnl(wid)) } catch {/**/}
    }
    try { setPreds(await api.getPredictions(50)) } catch {/**/}
    try { setPending(await api.getApprovals()) } catch {/**/}
    try { setMkts(scoreMarkets(await api.getMarkets('', '', 40) as Record<string, unknown>[])) } catch {/**/}
  }, [wid])

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

  const totalPnl = parseFloat(pnl?.total_pnl || '0')
  const avail = parseFloat(bal?.available || '0')
  const total = parseFloat(bal?.total || '0')
  const committed = total - avail
  const util = total > 0 ? (committed / total) * 100 : 0
  const best = mkts[0] || null

  return (
    <div className="min-h-screen flex flex-col font-mono text-[13px]">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 h-12 bg-s-surface border-b border-s-border sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-[3px] text-s-accent">SYNTH</h1>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${health?.simulation ? 'bg-s-warn text-black' : 'bg-s-danger text-white'}`}>
            {health?.simulation ? 'SIM' : 'LIVE'}
          </span>
        </div>
        <nav className="flex gap-0.5">
          {(['dashboard','markets','predictions','approvals','audit','settings'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'audit') api.getAudit().then(setAudit).catch(() => {}) }}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${tab === t ? 'text-s-accent bg-s-panel' : 'text-s-muted hover:text-s-text hover:bg-s-panel/50'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'approvals' && pending.length > 0 && <span className="ml-1 bg-s-danger text-white text-[9px] px-1.5 rounded-full font-bold">{pending.length}</span>}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-s-green shadow-[0_0_6px] shadow-s-green' : 'bg-s-danger'}`} />
          <span className="text-[11px] text-s-muted">{health?.status === 'ok' ? 'Connected' : 'Offline'}</span>
        </div>
      </header>

      {/* ── Wallet Strip ── */}
      <div className="flex items-center px-5 h-9 bg-s-surface border-b border-s-border overflow-x-auto gap-0 text-xs">
        {[
          ['Balance', `$${f(bal?.total || '0')}`],
          ['Available', `$${f(bal?.available || '0')}`],
          ['Committed', `$${f(committed)}`],
          ['Utilization', `${f(util, 1)}%`],
          ['P&L', `${totalPnl >= 0 ? '+' : ''}${f(totalPnl)}`],
          ['Positions', String(pos.length)],
          ['Max Risk', `$${f(config?.risk?.maxPositionUsdc || 0)}`],
        ].map(([label, value], i) => (
          <div key={i} className="flex items-center gap-1.5 px-4 border-r border-s-border last:border-r-0 whitespace-nowrap">
            <span className="text-[10px] text-s-muted uppercase tracking-wide">{label}</span>
            <span className={`font-semibold ${label === 'P&L' ? (totalPnl >= 0 ? 'text-s-green' : 'text-s-danger') : 'text-s-text'}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Main ── */}
      <main className="flex-1 p-4 max-w-[1440px] mx-auto w-full">
        {toast && <div className="fixed top-14 right-5 bg-s-panel border border-s-accent text-s-text px-4 py-2.5 rounded text-xs z-50 animate-[slideIn_0.2s_ease-out]">{toast}</div>}

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Next Best */}
            <div className="lg:col-span-2 bg-s-surface border border-s-border rounded-lg p-4">
              <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Next Best Opportunity</h2>
              {best ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <span>{ub(best.urgency)}</span>
                    <span className="text-sm font-semibold flex-1">{best.market_name || best.event_title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{best.venue}</span>
                  </div>
                  <div className="flex gap-6">
                    {[['Yes', f(best.yes_price)], ['No', f(best.no_price)], ['Score', String(best.score)], ['Ends', left(best.ends_at)]].map(([l, v]) => (
                      <div key={l} className="flex flex-col"><span className="text-[10px] text-s-muted uppercase">{l}</span><span className="text-sm font-semibold">{v}</span></div>
                    ))}
                  </div>
                  <button disabled={loading} onClick={() => predict(best.market_name || best.event_title)}
                    className="self-start px-4 py-2 bg-s-accent text-black font-semibold rounded text-xs hover:brightness-110 disabled:opacity-50">
                    {loading ? 'Analyzing...' : 'Generate Prediction'}
                  </button>
                </div>
              ) : <p className="text-s-muted text-xs">Loading markets...</p>}
            </div>

            {/* Ending Soon */}
            <div className="bg-s-surface border border-s-border rounded-lg p-4">
              <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Ending Soon</h2>
              <div className="flex flex-col gap-1">
                {mkts.filter(m => m.urgency === 'critical' || m.urgency === 'soon').slice(0, 8).map(m => (
                  <div key={m.token_id} onClick={() => predict(m.market_name || m.event_title)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-s-panel transition-colors">
                    <span className="text-xs">{ub(m.urgency)}</span>
                    <span className="flex-1 text-xs truncate">{m.market_name || m.event_title}</span>
                    <span className="text-[11px] text-s-warn font-semibold">{left(m.ends_at)}</span>
                  </div>
                ))}
                {mkts.filter(m => m.urgency === 'critical' || m.urgency === 'soon').length === 0 && <p className="text-s-muted text-xs">No urgent markets</p>}
              </div>
            </div>

            {/* Recent Predictions */}
            <div className="bg-s-surface border border-s-border rounded-lg p-4">
              <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Recent Predictions</h2>
              {preds.slice(0, 5).map(p => (
                <div key={p.id} className="border border-s-border rounded p-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-xs truncate">{p.thesis.slice(0, 80)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-black ${cc(p.confidence)}`}>{Math.round(p.confidence * 100)}%</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px] text-s-muted">
                    <span>{p.action}</span><span>{p.venue}</span><span>{ago(p.createdAt)}</span>
                    {p.wasCorrect !== null && <span className={p.wasCorrect ? 'text-s-green' : 'text-s-danger'}>{p.wasCorrect ? '✓ Correct' : '✗ Wrong'}</span>}
                  </div>
                </div>
              ))}
              {preds.length === 0 && <p className="text-s-muted text-xs">No predictions yet</p>}
            </div>

            {/* Positions */}
            <div className="lg:col-span-2 bg-s-surface border border-s-border rounded-lg p-4">
              <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Open Positions</h2>
              {pos.length > 0 ? (
                <table className="w-full text-xs"><thead><tr className="text-[10px] uppercase text-s-muted tracking-wide border-b border-s-border">
                  <th className="text-left py-1.5 px-2">Market</th><th className="text-left py-1.5 px-2">Side</th><th className="text-right py-1.5 px-2">Size</th><th className="text-right py-1.5 px-2">P&L</th>
                </tr></thead><tbody>{pos.map((p, i) => (
                  <tr key={i} className="border-b border-s-border/50 hover:bg-s-panel/50"><td className="py-1.5 px-2 truncate max-w-[200px]">{p.title || p.token_id.slice(0, 12)}</td>
                    <td className={`py-1.5 px-2 font-semibold ${p.side === 'BUY' ? 'text-s-green' : 'text-s-danger'}`}>{p.side}</td>
                    <td className="py-1.5 px-2 text-right">{p.size}</td>
                    <td className={`py-1.5 px-2 text-right ${parseFloat(p.pnl) >= 0 ? 'text-s-green' : 'text-s-danger'}`}>{p.pnl}</td></tr>
                ))}</tbody></table>
              ) : <p className="text-s-muted text-xs">No open positions</p>}
            </div>
          </div>
        )}

        {/* MARKETS */}
        {tab === 'markets' && (
          <div className="bg-s-surface border border-s-border rounded-lg p-4">
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
                <td className="py-1.5 px-2">{ub(m.urgency)}</td>
                <td className="py-1.5 px-2 truncate max-w-[280px]">{m.market_name || m.event_title}</td>
                <td className="py-1.5 px-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{m.venue}</span></td>
                <td className="py-1.5 px-2 text-right">{f(m.yes_price)}</td><td className="py-1.5 px-2 text-right">{f(m.no_price)}</td>
                <td className="py-1.5 px-2 text-right">{left(m.ends_at)}</td><td className="py-1.5 px-2 text-right font-semibold">{m.score}</td>
                <td className="py-1.5 px-2"><button disabled={loading} onClick={() => predict(m.market_name || m.event_title)}
                  className="px-2 py-1 bg-s-accent text-black font-semibold rounded text-[10px] hover:brightness-110 disabled:opacity-50">Predict</button></td>
              </tr>
            ))}</tbody></table>
          </div>
        )}

        {/* MY PREDICTIONS */}
        {tab === 'predictions' && (
          <div className="bg-s-surface border border-s-border rounded-lg p-4">
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
              {preds.map(p => (
                <div key={p.id} className="bg-s-panel border border-s-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold flex-1">{p.marketName || p.query}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-s-elevated text-s-muted uppercase">{p.venue || '—'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${p.status === 'generated' ? 'bg-s-blue text-white' : p.status === 'resolved' ? (p.wasCorrect ? 'bg-s-green text-black' : 'bg-s-danger text-white') : 'bg-s-elevated text-s-muted'}`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1 bg-s-elevated rounded overflow-hidden"><div className={`h-full rounded ${cc(p.confidence)}`} style={{ width: `${p.confidence * 100}%` }} /></div>
                    <span className="text-xs font-semibold">{Math.round(p.confidence * 100)}%</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Thesis</strong><p className="text-s-muted mt-0.5">{p.thesis}</p></div>
                    <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Rationale</strong><p className="text-s-muted mt-0.5">{p.rationale}</p></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Invalidation</strong><p className="text-s-muted mt-0.5">{p.invalidation}</p></div>
                      <div><strong className="text-[10px] uppercase tracking-wide text-s-text">Risk</strong><p className="text-s-muted mt-0.5">{p.riskNote}</p></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-3 mt-3 border-t border-s-border text-xs flex-wrap">
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase ${p.action === 'BUY' ? 'bg-s-green text-black' : p.action === 'SELL' ? 'bg-s-danger text-white' : 'bg-s-elevated text-s-muted'}`}>{p.action}</span>
                    {p.side && <span className="text-s-muted">{p.side}</span>}
                    {p.amountUsdc > 0 && <span>${f(p.amountUsdc)}</span>}
                    {p.kellyFraction != null && <span className="text-s-muted">Kelly: {f(p.kellyFraction, 3)}</span>}
                    <span className="text-s-muted">Ends: {left(p.endsAt)}</span>
                    <span className="text-s-muted ml-auto">{ago(p.createdAt)}</span>
                    {p.status !== 'resolved' && (
                      <div className="flex gap-1.5 ml-2">
                        <button onClick={() => resolve(p.id, true)} className="px-2 py-0.5 bg-s-green/20 text-s-green rounded text-[10px] font-semibold hover:bg-s-green/30">✓ Correct</button>
                        <button onClick={() => resolve(p.id, false)} className="px-2 py-0.5 bg-s-danger/20 text-s-danger rounded text-[10px] font-semibold hover:bg-s-danger/30">✗ Wrong</button>
                      </div>
                    )}
                    {p.wasCorrect !== null && <span className={`font-bold ${p.wasCorrect ? 'text-s-green' : 'text-s-danger'}`}>{p.wasCorrect ? '✓ AI was right' : '✗ AI was wrong'}</span>}
                  </div>
                </div>
              ))}
              {preds.length === 0 && <p className="text-s-muted text-xs text-center py-8">No predictions yet. Search for a market above.</p>}
            </div>
          </div>
        )}

        {/* APPROVALS */}
        {tab === 'approvals' && (
          <div className="bg-s-surface border border-s-border rounded-lg p-4">
            <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Approval Queue</h2>
            {pending.length === 0 ? <p className="text-s-muted text-xs">All clear — no pending actions</p> : pending.map(a => (
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

        {/* AUDIT */}
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

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-s-surface border border-s-border rounded-lg p-4">
              <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Wallet</h2>
              <input className="w-full bg-s-bg border border-s-border rounded px-2.5 py-1.5 text-xs text-s-text outline-none focus:border-s-accent"
                placeholder="Wallet ID" value={wid} onChange={e => saveW(e.target.value)} />
              <p className="text-[10px] text-s-muted mt-2">Polygon or Solana wallet ID from synthesis.trade</p>
            </div>
            <div className="bg-s-surface border border-s-border rounded-lg p-4">
              <h2 className="text-xs font-semibold text-s-muted uppercase tracking-wider mb-3">Desk Configuration</h2>
              {config && <div className="space-y-0.5">
                {[
                  ['Mode', config.simulation ? 'Simulation' : 'Live'],
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
                  <div key={k} className="flex justify-between py-1 border-b border-s-border/50">
                    <span className="text-[11px] text-s-muted">{k}</span><span className="text-xs font-medium">{v}</span>
                  </div>
                ))}
              </div>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
