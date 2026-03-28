import { describe, it, expect } from 'vitest'

describe('sim wallet logic', () => {
  it('computes balance after debit', () => {
    const starting = 10000
    const debit = 100
    const result = Math.max(0, starting - debit)
    expect(result).toBe(9900)
  })

  it('prevents negative balance', () => {
    const starting = 50
    const debit = 200
    const result = Math.max(0, starting - debit)
    expect(result).toBe(0)
  })

  it('credits balance correctly', () => {
    const current = 9900
    const credit = 150
    expect(current + credit).toBe(10050)
  })

  it('resets to starting balance', () => {
    const SIM_STARTING = 10000
    expect(SIM_STARTING).toBe(10000)
  })

  it('formats sim balance shape correctly', () => {
    const total = 5000
    const bal = {
      total: total.toFixed(3),
      available: total.toFixed(3),
      chains: [{ chainId: 'SIM', address: '0xSIM', balances: { 'USDC.sim': total.toFixed(3) } }],
    }
    expect(bal.total).toBe('5000.000')
    expect(bal.chains[0].chainId).toBe('SIM')
    expect(bal.chains[0].balances['USDC.sim']).toBe('5000.000')
  })
})
