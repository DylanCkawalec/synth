import { walletStore, mintStore, type DbWallet } from './db.ts'

const SIM_STARTING_BALANCE = parseFloat(process.env.SIM_STARTING_BALANCE || '10000')

export interface SimBalance {
  total: string
  available: string
  chains: Array<{ chainId: string; address: string; balances: Record<string, string> }>
}

function simId(walletId: string) { return `sim_${walletId}` }

function toSimBalance(total: number): SimBalance {
  return {
    total: total.toFixed(3),
    available: total.toFixed(3),
    chains: [{ chainId: 'SIM', address: '0xSIM_WALLET', balances: { 'USDC.sim': total.toFixed(3) } }],
  }
}

export const simWallet = {
  ensureExists(realWalletId: string, name?: string) {
    const id = simId(realWalletId)
    const existing = walletStore.get(id)
    if (existing) return existing
    const now = new Date().toISOString()
    const w: DbWallet = {
      id, wallet_id: realWalletId, mode: 'sim', name: name || 'Sim Wallet',
      balance_json: JSON.stringify(toSimBalance(SIM_STARTING_BALANCE)),
      created_at: now, updated_at: now,
    }
    walletStore.upsert(w)
    return w
  },

  get(realWalletId: string): SimBalance {
    const row = walletStore.get(simId(realWalletId))
    if (!row) return toSimBalance(SIM_STARTING_BALANCE)
    return JSON.parse(row.balance_json)
  },

  getTotal(realWalletId: string): number {
    const bal = this.get(realWalletId)
    return parseFloat(bal.total) || 0
  },

  debit(realWalletId: string, amount: number): SimBalance {
    const current = this.getTotal(realWalletId)
    const next = Math.max(0, current - amount)
    return this._set(realWalletId, next)
  },

  credit(realWalletId: string, amount: number): SimBalance {
    const current = this.getTotal(realWalletId)
    return this._set(realWalletId, current + amount)
  },

  reset(realWalletId: string): SimBalance {
    return this._set(realWalletId, SIM_STARTING_BALANCE)
  },

  // Returns today's date as YYYY-MM-DD in local time
  _today(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  mintStatus(realWalletId: string): { canMint: boolean; mintedToday: number; remaining: number; resetAt: string } {
    const today = this._today()
    const minted = mintStore.todayTotal(realWalletId, today)
    const MAX_DAILY = 1000
    const remaining = Math.max(0, MAX_DAILY - minted)
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0)
    return { canMint: remaining > 0, mintedToday: minted, remaining, resetAt: tomorrow.toISOString() }
  },

  mint(realWalletId: string, amount: number): { balance: SimBalance; minted: number; error?: string } {
    const MAX_PER_MINT = 1000
    const today = this._today()
    const status = this.mintStatus(realWalletId)

    if (amount <= 0) return { balance: this.get(realWalletId), minted: 0, error: 'Amount must be positive' }
    if (amount > MAX_PER_MINT) return { balance: this.get(realWalletId), minted: 0, error: `Max $${MAX_PER_MINT} per mint` }
    if (status.remaining <= 0) return { balance: this.get(realWalletId), minted: 0, error: `Daily limit reached. Resets at ${new Date(status.resetAt).toLocaleTimeString()}` }

    const actualAmount = Math.min(amount, status.remaining)
    const mintId = `mint_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    mintStore.record(mintId, realWalletId, actualAmount, today)
    const balance = this.credit(realWalletId, actualAmount)
    return { balance, minted: actualAmount }
  },

  _set(realWalletId: string, total: number): SimBalance {
    const id = simId(realWalletId)
    const bal = toSimBalance(total)
    const now = new Date().toISOString()
    const existing = walletStore.get(id)
    walletStore.upsert({
      id, wallet_id: realWalletId, mode: 'sim', name: existing?.name || 'Sim Wallet',
      balance_json: JSON.stringify(bal), created_at: existing?.created_at || now, updated_at: now,
    })
    return bal
  },
}
