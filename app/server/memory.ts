import { summaryStore, predictionStore, type DbSummary } from './db.ts'
import type OpenAI from 'openai'

export function generateRunNote(
  predictionId: string,
  walletId: string,
  mode: 'real' | 'sim',
  thesis: string,
  confidence: number,
  action: string,
  marketName: string,
  modelVersion: string,
): string {
  const date = new Date().toISOString().slice(0, 10)
  const tag = `${walletId}_${mode}_${date}_${modelVersion}`
  const content = `${action} ${marketName} @ ${Math.round(confidence * 100)}% — ${thesis}`.slice(0, 200)
  const id = crypto.randomUUID().slice(0, 12)
  const note: DbSummary = {
    id, tag, content, period: 'run',
    prediction_ids: JSON.stringify([predictionId]),
    created_at: new Date().toISOString(),
  }
  summaryStore.insert(note)
  return id
}

export async function runAggregation(openai: OpenAI | null, model: string) {
  if (!openai) return

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 86_400_000).toISOString()
  const runs = summaryStore.listRunSummariesSince(oneDayAgo)
  if (runs.length < 2) return

  const grouped = new Map<string, DbSummary[]>()
  for (const r of runs) {
    const prefix = r.tag.split('_').slice(0, 2).join('_')
    const arr = grouped.get(prefix) || []
    arr.push(r)
    grouped.set(prefix, arr)
  }

  for (const [prefix, notes] of grouped) {
    const existing = summaryStore.listByPeriod('daily').find(s => s.tag.startsWith(prefix) && s.created_at > oneDayAgo)
    if (existing) continue

    const combined = notes.map(n => n.content).join('\n')
    try {
      const resp = await openai.chat.completions.create({
        model, temperature: 0.2, max_tokens: 200,
        messages: [
          { role: 'system', content: 'Summarize these prediction notes into a single daily trend summary. Max 200 characters. Include: count, dominant action, avg confidence, notable market.' },
          { role: 'user', content: combined },
        ],
      })
      const content = (resp.choices[0].message.content || '').slice(0, 200)
      const allIds = notes.flatMap(n => JSON.parse(n.prediction_ids || '[]'))
      const date = now.toISOString().slice(0, 10)
      summaryStore.insert({
        id: crypto.randomUUID().slice(0, 12),
        tag: `${prefix}_${date}_daily`,
        content, period: 'daily',
        prediction_ids: JSON.stringify(allIds),
        created_at: now.toISOString(),
      })
    } catch { /* aggregation failure is non-fatal */ }
  }
}

export function startAggregationWorker(openai: OpenAI | null, model: string) {
  const hours = parseInt(process.env.AGGREGATION_INTERVAL_HOURS || '6')
  const ms = hours * 3_600_000
  setInterval(() => runAggregation(openai, model), ms)
  console.log(`  📝 Memory aggregation worker started (every ${hours}h)`)
}

export function runCompaction() {
  const cutoff = new Date(Date.now() - 7 * 86_400_000).toISOString()
  const deleted = predictionStore.deleteOlderThan(cutoff)
  if (deleted.changes > 0) {
    console.log(`  🗜 Compacted ${deleted.changes} old prediction snapshots`)
  }
}

export function startCompactionWorker() {
  const hour = parseInt(process.env.COMPACTION_HOUR || '3')
  const now = new Date()
  const next = new Date(now)
  next.setHours(hour, 0, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  const delay = next.getTime() - now.getTime()
  setTimeout(() => {
    runCompaction()
    setInterval(runCompaction, 86_400_000)
  }, delay)
  console.log(`  🗜 Compaction scheduled at ${hour}:00 (in ${Math.round(delay / 3_600_000)}h)`)
}
