export interface Prediction {
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

export interface ScoredMarket {
  event_title: string; market_name: string; venue: string
  yes_price: string; no_price: string; volume_24h: string
  liquidity: string; token_id: string; condition_id: string | null
  ends_at: string | null; active: boolean
  score: number; minutesLeft: number | null
  urgency: 'critical' | 'soon' | 'normal' | 'distant'
}

export interface Balance { total: string; available: string; in_orders: string }
export interface Position { title: string; token_id: string; side: string; size: string; pnl: string; current_price: string }
export interface PNL { total_pnl: string; realized_pnl: string; unrealized_pnl: string }
export interface HealthStatus { status: string; version: string; simulation: boolean; aiAvailable: boolean; predictions: number }
export interface DeskConfig { simulation: boolean; confidenceThreshold: number; requireApproval: boolean; model: string; risk: Record<string, number> }
export interface PendingAction { id: string; type: string; params: Record<string, unknown>; createdAt: string; status: string }
export interface AuditEntry { timestamp: string; action: string; category: string; mode: string; success: boolean }
export type Tab = 'dashboard' | 'markets' | 'predictions' | 'approvals' | 'audit' | 'settings'
