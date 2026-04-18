import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { LandingGate } from './Landing.tsx'
import './index.css'
import './synth-mermaid-fx.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingGate>
      <App />
    </LandingGate>
  </StrictMode>,
)
