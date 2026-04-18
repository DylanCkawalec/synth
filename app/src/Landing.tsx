import { useState, useEffect, useCallback } from 'react'
import { getHealth, getOpseeqStatus } from './api.ts'

const STORAGE_KEY = 'synth-desk-entered'

function readEntered(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Full-screen boot landing (Opseeq / Mermate-style): shared logo asset, health strip, then main app.
 */
export function LandingGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'landing' | 'fade' | 'done'>(() => (readEntered() ? 'done' : 'landing'))
  const [deskLine, setDeskLine] = useState('Checking desk…')
  const [gatewayLine, setGatewayLine] = useState('Checking Opseeq…')
  const [deskOk, setDeskOk] = useState<boolean | null>(null)
  const [gwOk, setGwOk] = useState<boolean | null>(null)

  const poll = useCallback(async () => {
    if (phase === 'done') return
    try {
      const h = await getHealth()
      setDeskOk(true)
      setDeskLine(
        `Desk v${h.version} · ${h.simulation ? 'Simulation' : 'LIVE'} · ${h.predictions} predictions · AI ${h.aiAvailable ? 'ready' : 'offline'}`
      )
    } catch {
      setDeskOk(false)
      setDeskLine('Desk unreachable — ensure API is running (port 8420)')
    }
    try {
      const o = await getOpseeqStatus()
      const ok = !!o.available
      setGwOk(ok)
      setGatewayLine(
        ok
          ? `Opseeq gateway ${o.url || ''}`.trim()
          : 'Opseeq offline — inference may use direct providers'
      )
    } catch {
      setGwOk(false)
      setGatewayLine('Opseeq status unknown')
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'done') return
    poll()
    const id = setInterval(poll, 10_000)
    return () => clearInterval(id)
  }, [phase, poll])

  const onStart = () => {
    setPhase('fade')
    window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
      setPhase('done')
    }, 420)
  }

  if (phase === 'done') return <>{children}</>

  return (
    <>
      <div
        data-synth-id="landing-synth"
        className={`sfx-mesh fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black px-6 transition-[opacity,visibility] duration-500 ease-out ${
          phase === 'fade' ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        aria-hidden={phase === 'fade'}
      >
        <img
          src="/opseeq-logo.svg"
          alt="Opseeq"
          className="mb-8 w-[min(280px,85vw)] select-none"
          width={280}
          height={48}
        />
        <p className="mb-2 text-center font-semibold tracking-[0.2em] text-[#FF9500]">SYNTH</p>
        <h1 className="mb-3 max-w-lg text-center text-2xl font-bold text-[#e0e0e0] sm:text-3xl">
          Your AI prediction desk.
        </h1>
        <p className="mb-10 max-w-md text-center text-base text-[#888]">
          Human-in-the-loop markets with the same gateway stack as Opseeq — start when you are ready.
        </p>

        <div className="mb-6 flex w-full max-w-md flex-col gap-3 text-sm text-[#888]">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
                deskOk === null ? 'bg-[#555]' : deskOk ? 'bg-[#00CC88] shadow-[0_0_8px_rgba(0,204,136,0.45)]' : 'bg-[#FF4444]'
              }`}
              aria-hidden
            />
            <span id="landing-desk-status">{deskLine}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
                gwOk === null ? 'bg-[#555]' : gwOk ? 'bg-[#00CC88] shadow-[0_0_8px_rgba(0,204,136,0.45)]' : 'bg-[#FF4444]'
              }`}
              aria-hidden
            />
            <span id="landing-opseeq-status">{gatewayLine}</span>
          </div>
        </div>

        <button
          type="button"
          data-synth-id="landing-start-prediction"
          onClick={onStart}
          className="rounded-full bg-[#00CC88] px-10 py-3.5 text-[15px] font-semibold text-black shadow-[0_4px_24px_rgba(0,204,136,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(0,204,136,0.35)] active:translate-y-0"
        >
          Start prediction
        </button>
      </div>
    </>
  )
}
