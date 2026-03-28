import type { ScoredMarket } from './types.ts'

type RawMarket = Record<string, unknown>

function minutesUntil(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = new Date(String(iso)).getTime() - Date.now()
  return isNaN(ms) ? null : ms / 60_000
}

function urgency(m: number | null): ScoredMarket['urgency'] {
  if (m === null) return 'distant'
  if (m < 0) return 'ended'
  if (m <= 15) return 'critical'
  if (m <= 60) return 'soon'
  if (m <= 1440) return 'normal'
  return 'distant'
}

export function scoreMarkets(events: RawMarket[]): ScoredMarket[] {
  const flat: ScoredMarket[] = []
  for (const ev of events) {
    const markets = (ev.markets || [ev]) as RawMarket[]
    const eventTitle = String((ev.event as RawMarket)?.title || ev.event_title || ev.title || '')
    const eventSlug = String((ev.event as RawMarket)?.slug || ev.slug || eventTitle)

    for (const m of markets) {
      const ends = String(m.ends_at || (ev.event as RawMarket)?.ends_at || '')
      const mins = minutesUntil(ends || null)
      const yes = parseFloat(String(m.left_price || m.yes_price || 0))
      const liq = parseFloat(String(m.liquidity || 0))
      const vol = parseFloat(String(m.volume24hr || m.volume_24h || 0))

      if (mins !== null && mins < -5) continue

      const uScore = mins === null ? 0.1 : mins <= 0 ? 0.05 : mins <= 5 ? 1 : mins <= 15 ? 0.95 : mins <= 60 ? 0.8 : mins <= 360 ? 0.6 : mins <= 1440 ? 0.4 : 0.15
      const lScore = liq > 0 ? Math.min(1, Math.log10(liq + 1) / 5) : 0
      const vScore = vol > 0 ? Math.min(1, Math.log10(vol + 1) / 4.7) : 0
      const dScore = yes > 0 && yes < 1 ? Math.min(1, Math.abs(yes - 0.5) * 3) : 0

      flat.push({
        event_title: eventTitle,
        event_slug: eventSlug,
        market_name: String(m.name || m.question || m.title || eventTitle),
        venue: String(m.venue || ev.venue || 'unknown'),
        yes_price: String(m.left_price || m.yes_price || 0),
        no_price: String(m.right_price || m.no_price || 0),
        volume_24h: String(m.volume24hr || m.volume_24h || 0),
        liquidity: String(m.liquidity || 0),
        token_id: String(m.primary_token_id || m.left_token_id || m.token_id || ''),
        condition_id: m.condition_id ? String(m.condition_id) : null,
        ends_at: ends || null,
        active: m.active !== false,
        score: Math.round((0.4 * uScore + 0.2 * lScore + 0.2 * vScore + 0.2 * dScore) * 1000) / 1000,
        minutesLeft: mins !== null ? Math.round(mins) : null,
        urgency: urgency(mins),
        subMarketCount: markets.length,
      })
    }
  }

  // Event-level deduplication: keep only the best sub-market per event
  const byEvent = new Map<string, ScoredMarket>()
  for (const m of flat) {
    if (!m.active || m.urgency === 'ended') continue
    const key = m.event_slug || m.event_title
    const existing = byEvent.get(key)
    if (!existing || m.score > existing.score) {
      byEvent.set(key, m)
    }
  }

  return [...byEvent.values()].sort((a, b) => b.score - a.score)
}
