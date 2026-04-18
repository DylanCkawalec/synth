import { useMemo, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { prepare, layout } from '@chenglou/pretext'

/** Match body / UI: Inter, avoid system-ui for Pretext accuracy (library caveat). */
export const PRETEXT_FONT_BODY = '500 13px Inter'
export const PRETEXT_FONT_SMALL = '400 12px Inter'
export const PRETEXT_FONT_TINY = '400 11px Inter'
export const PRETEXT_FONT_MICRO = '400 10px Inter'

const LH = { body: 18, small: 16, tiny: 15, micro: 14 } as const

type PretextBlockProps = {
  /** String used for prepare/layout — must match visible text for stable sizing. */
  text: string
  /** Canvas font shorthand; sync with CSS font-weight/size/family on children. */
  font?: string
  lineHeight?: number
  className?: string
  /** Optional: pre-wrap (textarea-like). */
  whiteSpace?: 'normal' | 'pre-wrap'
  children: ReactNode
}

/**
 * Reserves vertical space from Pretext measurement so multiline blocks avoid layout shift
 * when content streams in or reflows (width from ResizeObserver; height from pure layout()).
 */
export function PretextBlock({
  text,
  font = PRETEXT_FONT_BODY,
  lineHeight = LH.body,
  className = '',
  whiteSpace = 'normal',
  children,
}: PretextBlockProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const prepared = useMemo(() => {
    const t = text && text.length > 0 ? text : ' '
    return prepare(t, font, whiteSpace === 'pre-wrap' ? { whiteSpace: 'pre-wrap' } : undefined)
  }, [text, font, whiteSpace])

  const [minH, setMinH] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const run = () => {
      const w = el.getBoundingClientRect().width
      if (w <= 4) return
      const { height } = layout(prepared, w, lineHeight)
      setMinH(Math.max(0, Math.ceil(height)))
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(el)
    return () => ro.disconnect()
  }, [prepared, lineHeight])

  return (
    <div ref={wrapRef} className={className} style={minH != null ? { minHeight: minH } : undefined}>
      {children}
    </div>
  )
}

/** Strip markdown-ish markers for measurement parity with rendered assistant text. */
export function plainFromAssistantMarkdown(s: string): string {
  return s.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1')
}
