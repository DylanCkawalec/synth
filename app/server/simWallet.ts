import { walletStore, type DbWallet } from './db.ts'

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
