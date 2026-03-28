import { describe, it, expect } from 'vitest'
import { scoreMarkets } from '../src/scoring'

const now = new Date()
const mins = (m: number) => new Date(now.getTime() + m * 60_000).toISOString()

describe('scoreMarkets', () => {
  it('returns empty array for empty input', () => {
    expect(scoreMarkets([])).toEqual([])
  })

  it('ranks ending-soon markets higher', () => {
    const markets = [
      { event: { title: 'Far Market' }, markets: [{ name: 'Far', left_price: '0.5', right_price: '0.5', liquidity: '10000', volume24hr: '5000', active: true, ends_at: mins(1440), primary_token_id: 'a' }] },
      { event: { title: 'Soon Market' }, markets: [{ name: 'Soon', left_price: '0.5', right_price: '0.5', liquidity: '10000', volume24hr: '5000', active: true, ends_at: mins(10), primary_token_id: 'b' }] },
    ]
    const scored = scoreMarkets(markets as any)
    expect(scored[0].market_name).toBe('Soon')
    expect(scored[0].urgency).toBe('critical')
    expect(scored[0].score).toBeGreaterThan(scored[1].score)
  })

  it('filters inactive markets', () => {
    const markets = [
      { event: { title: 'Inactive' }, markets: [{ name: 'Dead', active: false, primary_token_id: 'x' }] },
      { event: { title: 'Active' }, markets: [{ name: 'Live', active: true, primary_token_id: 'y', left_price: '0.7' }] },
    ]
    const scored = scoreMarkets(markets as any)
    expect(scored.length).toBe(1)
    expect(scored[0].market_name).toBe('Live')
  })

  it('scores price dislocation higher', () => {
    const markets = [
      { event: { title: 'Balanced' }, markets: [{ name: 'Even', left_price: '0.50', right_price: '0.50', liquidity: '10000', volume24hr: '5000', active: true, ends_at: mins(60), primary_token_id: 'a' }] },
      { event: { title: 'Dislocated' }, markets: [{ name: 'Skewed', left_price: '0.85', right_price: '0.15', liquidity: '10000', volume24hr: '5000', active: true, ends_at: mins(60), primary_token_id: 'b' }] },
    ]
    const scored = scoreMarkets(markets as any)
    expect(scored[0].market_name).toBe('Skewed')
  })

  it('assigns correct urgency labels', () => {
    const markets = [
      { event: { title: 'Event A', slug: 'a' }, markets: [{ name: 'A', active: true, ends_at: mins(5), primary_token_id: '1' }] },
      { event: { title: 'Event B', slug: 'b' }, markets: [{ name: 'B', active: true, ends_at: mins(30), primary_token_id: '2' }] },
      { event: { title: 'Event C', slug: 'c' }, markets: [{ name: 'C', active: true, ends_at: mins(300), primary_token_id: '3' }] },
      { event: { title: 'Event D', slug: 'd' }, markets: [{ name: 'D', active: true, ends_at: mins(3000), primary_token_id: '4' }] },
    ]
    const scored = scoreMarkets(markets as any)
    const urgencies = scored.map(s => s.urgency)
    expect(urgencies).toContain('critical')
    expect(urgencies).toContain('soon')
    expect(urgencies).toContain('normal')
    expect(urgencies).toContain('distant')
  })

  it('handles missing data gracefully', () => {
    const markets = [{ event: { title: 'Sparse' }, markets: [{ name: 'Minimal', active: true, primary_token_id: 'z' }] }]
    const scored = scoreMarkets(markets as any)
    expect(scored.length).toBe(1)
    expect(scored[0].score).toBeGreaterThanOrEqual(0)
  })
})
