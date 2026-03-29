import type { Prediction, DualPrediction, Note, Wallet, Balance, Position, PNL, HealthStatus, DeskConfig, PendingAction, AuditEntry, AgentCommand, WalletMode, DepositAddress, OrderRequest, OrderQuote, OrderResult, MintStatus, MintResult, PricePoint, MarketStats } from './types.ts'

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`)
  return res.json()
}

export const verifyAuth     = ()              => api<{ authenticated: boolean; walletId: string; walletName: string; simulation: boolean }>('/auth/verify')
export const getHealth      = ()              => api<HealthStatus>('/health')
export const getConfig      = ()              => api<DeskConfig>('/config')
export const getWallets     = ()              => api<{ wallets: Wallet[]; defaultWalletId: string }>('/wallets')
export const getBalance     = (id: string, mode?: WalletMode) => api<Balance>(`/wallet/${id}/balance${mode ? `?mode=${mode}` : ''}`)
export const getPositions   = (id: string)    => api<Position[]>(`/wallet/${id}/positions`)
export const getPnl         = (id: string)    => api<PNL>(`/wallet/${id}/pnl`)
export const getMarkets     = (q = '', v = '', n = 40, days?: number) => api<unknown[]>(`/markets?query=${encodeURIComponent(q)}&venue=${v}&limit=${n}${days ? `&days=${days}` : ''}`)
export const getPredictions = (n = 50, mode = 'both') => api<Prediction[]>(`/predictions?limit=${n}&mode=${mode}`)
export const predict        = (query: string, walletId?: string, mode = 'both') =>
  api<DualPrediction>('/predict', { method: 'POST', body: JSON.stringify({ query, walletId, mode }) })
export const generatePrediction = (query: string, walletId?: string, mode?: string) =>
  api<Prediction>('/predictions/generate', { method: 'POST', body: JSON.stringify({ query, walletId, mode }) })
export const resolvePrediction = (id: string, wasCorrect: boolean, pnl?: number) =>
  api<Prediction>(`/predictions/${id}/resolve`, { method: 'POST', body: JSON.stringify({ wasCorrect, pnl }) })
export const deletePrediction = (id: string) =>
  api<{ deleted: boolean }>(`/predictions/${id}`, { method: 'DELETE' })
export const cleanStalePredictions = (maxDays = 30) =>
  api<{ cleaned: number; removed: string[] }>('/predictions/clean', { method: 'POST', body: JSON.stringify({ maxDays }) })
export const syncPredictionResolutions = () =>
  api<{ ok: boolean; checked: number; resolved: number }>('/predictions/sync', { method: 'POST' })
export const getNotes       = (tag?: string, period?: string, n = 50) => {
  const p = new URLSearchParams({ limit: String(n) })
  if (tag) p.set('tag', tag)
  if (period) p.set('period', period)
  return api<Note[]>(`/notes?${p}`)
}
export const getApprovals   = (mode?: string, all = false) => api<PendingAction[]>(`/approvals${mode || all ? `?${mode ? `mode=${mode}&` : ''}${all ? 'all=true' : ''}` : ''}`)
export const getPriceHistory = (tokenId: string, fidelity = 60) => api<{ history: PricePoint[] }>(`/market/${tokenId}/history?fidelity=${fidelity}`)
export const getMarketStats  = (tokenId: string) => api<MarketStats>(`/market/${tokenId}/stats`)
export const setHorizon     = (days: number) => api<{ horizonDays: number }>('/config/horizon', { method: 'POST', body: JSON.stringify({ days }) })
export const approve        = (id: string)    => api(`/approvals/${id}/approve`, { method: 'POST' })
export const reject         = (id: string, reason = '') => api(`/approvals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
export const getAudit       = (n = 100)       => api<AuditEntry[]>(`/audit?limit=${n}`)

export const getDepositAddress = (walletId: string, chainId: string, chain: string) =>
  api<DepositAddress[]>(`/wallet/${walletId}/deposit/${chainId}/${chain}`)

export const requestWithdrawal = (walletId: string, params: { chain: string; token: string; amount: string; address: string }) =>
  api<{ success: boolean; txHash?: string }>(`/wallet/${walletId}/withdraw`, { method: 'POST', body: JSON.stringify(params) })

export const quoteOrder = (walletId: string, params: Omit<OrderRequest, 'predictionId'>) =>
  api<OrderQuote>(`/wallet/${walletId}/order/quote`, { method: 'POST', body: JSON.stringify(params) })

export const placeOrder = (walletId: string, params: OrderRequest) =>
  api<OrderResult>(`/wallet/${walletId}/order`, { method: 'POST', body: JSON.stringify(params) })

export const setModel = (model: string) =>
  api<{ model: string }>('/config/model', { method: 'POST', body: JSON.stringify({ model }) })

export const getMintStatus = (walletId: string) =>
  api<MintStatus>(`/wallet/${walletId}/sim/mint/status`)

export const mintSimFunds = (walletId: string, amount: number) =>
  api<MintResult>(`/wallet/${walletId}/sim/mint`, { method: 'POST', body: JSON.stringify({ amount }) })

export async function chat(messages: Array<{ role: string; content: string }>): Promise<{ reply: string; commands: AgentCommand[] }> {
  return api('/chat', { method: 'POST', body: JSON.stringify({ messages }) })
}
