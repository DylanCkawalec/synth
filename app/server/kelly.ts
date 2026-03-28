/**
 * Unified Kelly Criterion calculator for the Node/Express layer.
 *
 * Mirrors the logic in src/synthesis/sizing/kelly.py so that both
 * Python (MCP / AI engine) and Node (dashboard) use identical math.
 */

export interface KellyResult {
  fullKelly: number
  fractionalKelly: number
  suggestedPct: number
  edge: number
  expectedValue: number
  bankrollFractionUsdc: number
  method: string
  warnings: string[]
}

const MAX_FRACTION = 0.25
const DEFAULT_MULTIPLIER = 0.5

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function kellyBinaryMarket(
  winProb: number,
  marketPrice: number,
  bankrollUsdc: number = 0,
  fractionalMultiplier: number = DEFAULT_MULTIPLIER,
): KellyResult {
  const warnings: string[] = []
  const fail: KellyResult = {
    fullKelly: 0, fractionalKelly: 0, suggestedPct: 0,
    edge: 0, expectedValue: 0, bankrollFractionUsdc: 0,
    method: 'binary_market', warnings,
  }

  if (winProb <= 0 || winProb >= 1 || marketPrice <= 0 || marketPrice >= 1) {
    warnings.push('Invalid probability or price bounds')
    return fail
  }

  const edge = winProb - marketPrice
  if (edge <= 0) {
    warnings.push(`Negative edge (${edge.toFixed(4)}): no bet recommended`)
    return { ...fail, edge, expectedValue: edge }
  }

  const odds = (1 - marketPrice) / marketPrice
  const q = 1 - winProb
  let fullKelly = (odds * winProb - q) / odds
  fullKelly = clamp(fullKelly, 0, MAX_FRACTION)
  const fractionalKelly = fullKelly * fractionalMultiplier
  const ev = winProb * (1 / marketPrice - 1) - (1 - winProb)

  if (fullKelly > 0.15) warnings.push('Large Kelly fraction — consider fractional sizing')

  return {
    fullKelly: +fullKelly.toFixed(6),
    fractionalKelly: +fractionalKelly.toFixed(6),
    suggestedPct: +(fractionalKelly * 100).toFixed(2),
    edge: +edge.toFixed(6),
    expectedValue: +ev.toFixed(6),
    bankrollFractionUsdc: bankrollUsdc ? +(bankrollUsdc * fractionalKelly).toFixed(2) : 0,
    method: 'binary_market',
    warnings,
  }
}

export function kellyClassical(
  winProb: number,
  odds: number,
  bankrollUsdc: number = 0,
  fractionalMultiplier: number = DEFAULT_MULTIPLIER,
): KellyResult {
  const warnings: string[] = []
  if (winProb <= 0 || winProb >= 1 || odds <= 0) {
    return {
      fullKelly: 0, fractionalKelly: 0, suggestedPct: 0,
      edge: 0, expectedValue: 0, bankrollFractionUsdc: 0,
      method: 'classical', warnings: ['Invalid inputs'],
    }
  }

  const q = 1 - winProb
  let fullKelly = (odds * winProb - q) / odds
  fullKelly = clamp(fullKelly, 0, MAX_FRACTION)
  if (fullKelly <= 0) warnings.push('No positive edge at these odds')

  const fractionalKelly = fullKelly * fractionalMultiplier
  const ev = winProb * odds - q

  return {
    fullKelly: +fullKelly.toFixed(6),
    fractionalKelly: +fractionalKelly.toFixed(6),
    suggestedPct: +(fractionalKelly * 100).toFixed(2),
    edge: +(winProb * odds - q).toFixed(6),
    expectedValue: +ev.toFixed(6),
    bankrollFractionUsdc: bankrollUsdc ? +(bankrollUsdc * fractionalKelly).toFixed(2) : 0,
    method: 'classical',
    warnings,
  }
}

export function kellyDrawdownAdjusted(
  winProb: number,
  marketPrice: number,
  currentDrawdownPct: number,
  maxDrawdownPct: number = 20,
  bankrollUsdc: number = 0,
  fractionalMultiplier: number = DEFAULT_MULTIPLIER,
): KellyResult {
  const base = kellyBinaryMarket(winProb, marketPrice, bankrollUsdc, fractionalMultiplier)
  if (maxDrawdownPct <= 0 || currentDrawdownPct < 0) return base

  const ratio = Math.min(currentDrawdownPct / maxDrawdownPct, 1)
  const reduction = 1 - ratio

  if (reduction <= 0.05) {
    base.warnings.push('Near max drawdown — sizing effectively zero')
    base.fractionalKelly = 0
    base.suggestedPct = 0
    base.bankrollFractionUsdc = 0
    return base
  }

  base.fractionalKelly = +(base.fractionalKelly * reduction).toFixed(6)
  base.suggestedPct = +(base.fractionalKelly * 100).toFixed(2)
  base.bankrollFractionUsdc = bankrollUsdc ? +(bankrollUsdc * base.fractionalKelly).toFixed(2) : 0
  base.method = 'drawdown_adjusted'
  if (ratio > 0.5) base.warnings.push(`Drawdown at ${currentDrawdownPct.toFixed(1)}% — sizing reduced`)
  return base
}
