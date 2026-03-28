export interface Prediction {
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

export interface ScoredMarket {
  event_title: string; event_slug: string; market_name: string; venue: string
  yes_price: string; no_price: string; volume_24h: string
  liquidity: string; token_id: string; condition_id: string | null
  ends_at: string | null; active: boolean
  score: number; minutesLeft: number | null
  urgency: 'critical' | 'soon' | 'normal' | 'distant' | 'ended'
  subMarketCount: number
}

export interface Wallet { wallet_id: string; name: string; chains: Record<string, { address: string }> }
export interface Balance { total: string; available: string; chains: Array<ChainBalance> }
export interface ChainBalance { chainId: string; address: string; balances: Record<string, string> }
export interface Position { title: string; token_id: string; side: string; size: string; pnl: string; current_price: string }
export interface PNL { total_pnl: string; realized_pnl: string; unrealized_pnl: string }
export interface HealthStatus { status: string; version: string; simulation: boolean; aiAvailable: boolean; predictions: number; defaultWallet: string }
export interface DeskConfig { simulation: boolean; confidenceThreshold: number; requireApproval: boolean; model: string; risk: Record<string, number> }
export interface PendingAction { id: string; type: string; params: Record<string, unknown>; createdAt: string; status: string }
export interface AuditEntry { timestamp: string; action: string; category: string; mode: string; success: boolean }

export interface DualPrediction {
  real: Prediction; sim: Prediction
  diff: { balanceDelta: number; confidenceSame: boolean; actionSame: boolean; amountDelta: number }
  noteId: string
}

export interface Note { id: string; tag: string; content: string; period: string; created_at: string }

export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface AgentCommand { type: 'switch_tab' | 'highlight' | 'tool'; payload: unknown }
export interface HighlightCommand { element: string; message: string }

export type WalletMode = 'real' | 'sim'
export type Tab = 'dashboard' | 'markets' | 'predictions' | 'approvals' | 'audit' | 'settings'

// Deposit / Withdraw types
export interface DepositAddress {
  chain: string
  address: string
  tokens: Array<{ token: string; contract: string; min: string; max: string }>
}

export interface SupportedChain {
  id: string
  name: string
  icon: string
  minDeposit: string
  minWithdraw: string
}

export interface MetaMaskState {
  connected: boolean
  address: string | null
  chainId: number | null
  chainName: string | null
  balance: string | null
  supportedTokens: MetaMaskToken[]
}

export interface MetaMaskToken {
  symbol: string
  balance: string
  contract: string
  canDeposit: boolean
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  { id: 'polygon', name: 'Polygon', icon: 'polygon', minDeposit: '$0', minWithdraw: '$0.1' },
  { id: 'ethereum', name: 'Ethereum', icon: 'ethereum', minDeposit: '$5', minWithdraw: '$5' },
  { id: 'solana', name: 'Solana', icon: 'solana', minDeposit: '$0.5', minWithdraw: '$1' },
  { id: 'base', name: 'Base', icon: 'base', minDeposit: '$0.5', minWithdraw: '$1' },
  { id: 'binance', name: 'Binance', icon: 'binance', minDeposit: '$0.5', minWithdraw: '$1' },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'arbitrum', minDeposit: '$0.5', minWithdraw: '$1' },
  { id: 'optimism', name: 'Optimism', icon: 'optimism', minDeposit: '$0.5', minWithdraw: '$1' },
]

export const CHAIN_IDS: Record<number, string> = {
  1: 'ethereum',
  137: 'polygon',
  56: 'binance',
  42161: 'arbitrum',
  10: 'optimism',
  8453: 'base',
}

export const SUPPORTED_TOKENS = ['USDC', 'USDC.e', 'USDT'] as const
export type SupportedToken = typeof SUPPORTED_TOKENS[number]
