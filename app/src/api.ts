import type { Prediction, Balance, Position, PNL, HealthStatus, DeskConfig, PendingAction, AuditEntry } from './types.ts'

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`)
  return res.json()
}

export const getHealth    = ()              => api<HealthStatus>('/health')
export const getConfig    = ()              => api<DeskConfig>('/config')
export const getBalance   = (id: string)    => api<Balance>(`/wallet/${id}/balance`)
export const getPositions = (id: string)    => api<Position[]>(`/wallet/${id}/positions`)
export const getPnl       = (id: string)    => api<PNL>(`/wallet/${id}/pnl`)
export const getWallets   = ()              => api<{ polygon: unknown[]; solana: unknown[] }>('/wallets')
export const getMarkets   = (q = '', v = '', n = 30) => api<unknown[]>(`/markets?query=${encodeURIComponent(q)}&venue=${v}&limit=${n}`)
export const getPredictions = (n = 50)      => api<Prediction[]>(`/predictions?limit=${n}`)
export const generatePrediction = (query: string, walletId?: string) =>
  api<Prediction>('/predictions/generate', { method: 'POST', body: JSON.stringify({ query, walletId }) })
export const resolvePrediction = (id: string, wasCorrect: boolean, pnl?: number) =>
  api<Prediction>(`/predictions/${id}/resolve`, { method: 'POST', body: JSON.stringify({ wasCorrect, pnl }) })
export const getApprovals = ()              => api<PendingAction[]>('/approvals')
export const approve      = (id: string)    => api(`/approvals/${id}/approve`, { method: 'POST' })
export const reject       = (id: string, reason = '') => api(`/approvals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
export const getAudit     = (n = 100)       => api<AuditEntry[]>(`/audit?limit=${n}`)
