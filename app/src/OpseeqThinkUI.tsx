import { useEffect, useState, useRef, useMemo } from 'react'
import type { ThinkCommand } from './types.ts'

const STAGE_META: Record<string, { emoji: string; flashes: string[] }> = {
  observe: { emoji: '👁', flashes: ['Scanning venues…', 'Pulling order books…', 'Spotting liquidity…'] },
  orient: { emoji: '🧭', flashes: ['Ranking markets…', 'Checking time to close…', 'Sizing edge…'] },
  research: { emoji: '🔍', flashes: ['News + context…', 'Cross-checking facts…'] },
  analyze: { emoji: '📊', flashes: ['Price path…', 'Vol vs fair…'] },
  decide: { emoji: '⚡', flashes: ['Locking lean…', 'Sizing stake…'] },
  act: { emoji: '🎯', flashes: ['Preparing order…', 'Routing execution…'] },
  think: { emoji: '💭', flashes: ['Reasoning…'] },
}

const STAGE_COLORS: Record<string, string> = {
  observe: 'text-s-blue',
  orient: 'text-s-accent',
  research: 'text-purple-400',
  analyze: 'text-yellow-400',
  decide: 'text-s-warn',
  act: 'text-s-green',
}

/** Fast type → hold → delete → next phrase (loop). */
function useFlashTypewriter(phrases: string[], active: boolean) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (!active || phrases.length === 0) {
      setText('')
      return
    }

    let cancelled = false
    const typeMs = 16
    const holdMs = 260
    const deleteMs = 10

    const runPhrase = (pi: number) => {
      if (cancelled) return
      const phrase = phrases[pi % phrases.length]
      let i = 0
      const typeTick = () => {
        if (cancelled) return
        if (i <= phrase.length) {
          setText(phrase.slice(0, i))
          i++
          timersRef.current.push(setTimeout(typeTick, typeMs) as unknown as number)
        } else {
          timersRef.current.push(
            setTimeout(() => {
              if (cancelled) return
              let j = phrase.length
              const delTick = () => {
                if (cancelled) return
                if (j >= 0) {
                  setText(phrase.slice(0, j))
                  j--
                  timersRef.current.push(setTimeout(delTick, deleteMs) as unknown as number)
                } else {
                  timersRef.current.push(
                    setTimeout(() => {
                      setPhraseIndex((x) => x + 1)
                    }, 120) as unknown as number,
                  )
                }
              }
              delTick()
            }, holdMs) as unknown as number,
          )
        }
      }
      typeTick()
    }

    runPhrase(phraseIndex)
    return () => {
      cancelled = true
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [active, phrases, phraseIndex])

  return text
}

/** Pipeline shimmer while waiting for first tool / think event. */
export function OpseeqLoadingPulse({ active }: { active: boolean }) {
  const phrases = useMemo(
    () => [...STAGE_META.observe.flashes, ...STAGE_META.orient.flashes, ...STAGE_META.research.flashes, ...STAGE_META.analyze.flashes, ...STAGE_META.decide.flashes],
    [],
  )
  const line = useFlashTypewriter(phrases, active)
  if (!active) return null
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-s-border/60 bg-s-elevated/40">
      <span className="text-lg animate-pulse" aria-hidden>
        ✨
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-bold uppercase tracking-widest text-s-accent">Opseeq pipeline</div>
        <div className="text-[11px] text-s-muted font-mono truncate">
          <span className="text-s-text">{line}</span>
          <span className="inline-block w-1.5 h-3 ml-0.5 bg-s-accent/90 animate-pulse align-middle rounded-sm" />
        </div>
      </div>
    </div>
  )
}

function StageChip({ cmd, isLatest }: { cmd: ThinkCommand; isLatest: boolean }) {
  const meta = STAGE_META[cmd.stage] || STAGE_META.think
  return (
    <div
      title={cmd.thought}
      className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-0.5 cursor-help ${STAGE_COLORS[cmd.stage] || 'text-s-muted'} border-current/30 bg-current/5 ${isLatest ? 'ring-1 ring-s-accent/40' : ''}`}
    >
      <span>{meta.emoji}</span>
      <span>{cmd.stage}</span>
    </div>
  )
}

const STAGE_ICONS: Record<string, string> = { observe: '👁', orient: '🧭', research: '🔍', analyze: '📊', decide: '⚡', act: '🎯' }

/** Reasoning strip + traces (no raw think() syntax — server strips; here we humanize). */
export function OpseeqThinkStages({ stages }: { stages: ThinkCommand[] }) {
  if (stages.length === 0) return null
  return (
    <div className="border-b border-s-border/50 bg-s-elevated/30">
      <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap">
        <div className="text-[9px] text-s-muted uppercase tracking-wider">Reasoning</div>
        <div className="flex flex-wrap gap-1">
          {stages.map((t, i) => (
            <StageChip key={`${t.stage}-${i}-${t.enteredAt || i}`} cmd={t} isLatest={i === stages.length - 1} />
          ))}
        </div>
      </div>
      <div className="max-h-[140px] overflow-y-auto px-3 pb-2 space-y-1">
        {stages.map((t, i) => (
          <div key={`trace-${i}`} className="rounded border border-s-border/40 bg-s-panel/40 px-2 py-1">
            <div className="flex items-center justify-between gap-2 text-[8px] uppercase tracking-wider">
              <span className={`${STAGE_COLORS[t.stage] || 'text-s-muted'} font-bold flex items-center gap-1`}>
                <span>{STAGE_ICONS[t.stage] || '◦'}</span>
                {t.stage}
              </span>
              <span className="text-s-muted font-mono">
                {t.enteredAt ? new Date(t.enteredAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }) : ''}
              </span>
            </div>
            <div className="mt-0.5 text-[10px] text-s-muted leading-snug">{t.thought}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
