# Synth Protocol: Calibrated Swarm Ensemble Architecture

## Product Requirements Document

### Problem

Single-shot GPT-4o predictions yield uncalibrated confidences, heuristic sizing, and no
diversity of reasoning. Users cannot trust confidence scores because they do not correspond
to historical accuracy. Kelly fractions are inconsistent across the Python and Node stacks.
The Mirofish swarm engine is vendored but unused. There is no feedback loop from resolved
predictions to future prediction quality.

### Solution

Transform Synth from a single-model prediction system into a **Calibrated Swarm Ensemble Agent**
that produces professor-grade, data-science-backed predictions. All improvements are backend-only —
the frontend contract (prediction cards, rationale, actions) is unchanged.

### Design Principles

1. **Backend-only enhancement** — no new UI elements, no interface junk
2. **Radical quality improvement** — measurable via Brier score and ECE
3. **User psychology** — frame predictions for clear commitment decisions
4. **Full automation** — the user's thinking is done for them
5. **Local-first** — everything runs on the user's machine

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Dashboard (unchanged)                   │
│         Prediction Cards · Markets · Wallet · Approvals          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP
┌──────────────────────────────▼──────────────────────────────────┐
│                     Express Server (Node.js)                     │
│              Unified Kelly (kelly.ts) · API Proxy                │
│              /api/kelly endpoint · /api/chat (NemoClaw)          │
├──────────────────────────────────────────────────────────────────┤
│                    Nemoclaw MCP Server (Python)                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              EnsemblePredictionEngine                     │    │
│  │                                                           │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐ │    │
│  │  │ Base       │ │Contrarian │ │Quantitative│ │ Urgency │ │    │
│  │  │ Analyst    │ │ Skeptic   │ │ Trader     │ │Specialist│ │    │
│  │  │ (GPT 0.3) │ │ (GPT 0.5) │ │ (GPT 0.2) │ │(GPT 0.4)│ │    │
│  │  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └────┬────┘ │    │
│  │        └──────────────┼─────────────┼────────────┘       │    │
│  │                       ▼                                   │    │
│  │           Confidence-Weighted Aggregation                 │    │
│  │                       │                                   │    │
│  │              ┌────────▼────────┐                          │    │
│  │              │  Calibration    │ ← Historical outcomes    │    │
│  │              │  (Isotonic/Platt)│                          │    │
│  │              └────────┬────────┘                          │    │
│  │                       │                                   │    │
│  │              ┌────────▼────────┐                          │    │
│  │              │  Kelly Sizing   │ ← Unified calculator     │    │
│  │              │  (Binary/DD-adj)│                          │    │
│  │              └────────┬────────┘                          │    │
│  │                       │                                   │    │
│  │              ┌────────▼────────┐                          │    │
│  │              │  Commitment     │ ← Behavioral framing     │    │
│  │              │  Rationale      │                          │    │
│  │              └─────────────────┘                          │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐    │
│  │  Mirofish Swarm     │  │  Fine-Tune Pipeline             │    │
│  │  Bridge             │  │  (Resolved → JSONL → LoRA)      │    │
│  │  (Flask / GPT       │  │                                  │    │
│  │   fallback)         │  │  Exports: OpenAI JSONL,          │    │
│  └─────────┬───────────┘  │  Alpaca JSON, CSV                │    │
│            │               └─────────────────────────────────┘    │
│            ▼                                                      │
│  Narrative scenario context injected into ensemble                │
├──────────────────────────────────────────────────────────────────┤
│                    synthesis.trade API                            │
│              Markets · Wallets · Orders · News                   │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow: OODA Protocol (Enhanced)

```
OBSERVE
  ├── synthesis.trade API → markets, balance, positions, news
  ├── Mirofish swarm → narrative scenario (bull/bear/actors)
  └── Price history → statistical baseline

ORIENT
  ├── EnsemblePredictionEngine dispatches 3-4 parallel GPT calls
  │   with distinct analyst personas and temperatures
  ├── Each returns: thesis, probability, confidence, key_factor
  └── Statistical baseline provides non-LLM anchor

DECIDE
  ├── Confidence-weighted aggregation of all perspectives
  ├── Disagreement penalty reduces confidence when analysts diverge
  ├── ConfidenceCalibrator maps raw → calibrated probability
  │   (trained on historical resolved predictions via isotonic regression)
  ├── KellyCalculator computes optimal sizing
  │   (binary market mode, drawdown-adjusted, half-Kelly default)
  └── Commitment rationale assembled with behavioral framing

ACT
  ├── Enriched prediction returned via MCP (ensemble_predict tool)
  ├── Approval gate with calibrated confidence threshold
  ├── Outcome recorded back to calibrator (record_prediction_outcome)
  └── Training examples generated for fine-tune pipeline
```

---

## New Modules

### `src/synthesis/ensemble/engine.py` — EnsemblePredictionEngine

The core orchestrator. Replaces single-shot GPT with:

- **Parallel GPT calls**: 3-4 analyst personas (Base, Contrarian, Quantitative, Urgency)
  with varied temperatures (0.2–0.5) to maximize reasoning diversity
- **Statistical baseline**: Mean-reversion projection from price history as a non-LLM anchor
- **Swarm injection**: Mirofish scenario summary appended as context for high-impact markets
- **Aggregation**: Confidence-weighted average with disagreement penalty
- **Output**: `EnsembleResult` with full audit trail of individual views

### `src/synthesis/calibration/calibrator.py` — ConfidenceCalibrator

Maps raw LLM confidences to historically accurate probabilities:

- **Isotonic regression** (primary): non-parametric monotonic calibration via scikit-learn
- **Platt scaling** (alternative): logistic regression on confidence→outcome
- **Binned fallback**: works without scikit-learn for zero-dependency mode
- **Online learning**: auto-refits every 5 new observations after 20+ samples
- **Persistence**: JSON serialization to `data/calibration.json`
- **Metrics**: Brier score, Expected Calibration Error (ECE), per-bin accuracy

### `src/synthesis/sizing/kelly.py` — KellyCalculator

Single source of truth for position sizing:

- **Binary market mode**: `f* = (p - price) / (1 - price)` for prediction markets
- **Classical mode**: `f* = (bp - q) / b` for general odds
- **Drawdown-adjusted**: Scales sizing down as daily loss approaches limit
- **Half-Kelly default**: 50% fractional multiplier for safety
- **25% absolute cap**: Never risk more than a quarter of bankroll
- **Mirrored in Node**: `app/server/kelly.ts` uses identical math

### `src/synthesis/swarm/bridge.py` — MirofishBridge

Lightweight async wrapper around Mirofish:

- **Primary path**: Seeds Mirofish with market criteria + news → builds knowledge graph →
  runs short OASIS simulation → extracts ReportAgent summary
- **GPT fallback**: When Mirofish is unavailable, runs 3 GPT personas (Macro Analyst,
  Contrarian Skeptic, Quantitative Trader) in parallel to generate adversarial scenarios
- **Output**: `SwarmScenario` with bull/bear theses, key actors, sentiment distribution,
  narrative risk, and confidence adjustment

### `src/synthesis/finetune/pipeline.py` — FineTunePipeline

Generates training datasets from operational data:

- **Resolved predictions**: Correct → reinforce; incorrect → create corrected version
- **Ensemble disagreements**: Blended calibrated output as training target
- **Swarm scenarios**: Multi-perspective analysis as synthetic training data
- **Export formats**: OpenAI JSONL, Alpaca JSON (for Axolotl/unsloth LoRA), CSV

---

## New MCP Tools (Nemoclaw)

| Tool | Category | Description |
|------|----------|-------------|
| `ensemble_predict` | PREDICT | Multi-perspective ensemble prediction with calibration and Kelly |
| `swarm_scenario` | PREDICT | Mirofish/GPT multi-agent narrative scenario analysis |
| `calibration_metrics` | READ | Brier score, ECE, sample count, calibration curves |
| `record_prediction_outcome` | ADMIN | Feed resolved outcomes back to the calibrator |
| `kelly_sizing_advanced` | READ | Binary market Kelly with drawdown adjustment |

---

## OSS Dependencies

| Package | Purpose | License |
|---------|---------|---------|
| scikit-learn | Isotonic regression for calibration, stacking | BSD-3 |
| numpy | Numerical operations for calibration/ensemble | BSD-3 |
| scipy | Statistical distributions for Bayesian posteriors | BSD-3 |
| statsforecast | Time-series baselines (ARIMA, ETS, Theta) | Apache 2.0 |
| pandas | Data manipulation for fine-tune pipeline | BSD-3 |

All added as optional `[ai-extras]` group in `pyproject.toml`.

---

## Protocol Thinking Model

The system reasons through predictions as a **Calibrated Swarm Ensemble**:

1. **Multi-perspective**: Never trust a single reasoning path. The Contrarian catches
   risks the Base Analyst misses. The Quantitative Trader grounds narratives in
   market microstructure. The Urgency Specialist catches time-sensitive catalysts.

2. **Probabilistic**: Outputs are probabilities, not certainties. Calibration maps
   "model says 70%" to "historically, things the model called 70% happened 70% of the time."
   This is what separates professional forecasting from casual prediction.

3. **Ensemble-first**: Variance reduction via aggregation. When 3 analysts agree,
   confidence rises. When they disagree, sizing shrinks — this is mathematically optimal.

4. **Kelly-optimal**: Given a calibrated probability and market price, the Kelly criterion
   computes the growth-rate-maximizing bet size. Half-Kelly for safety. Drawdown adjustment
   for loss streaks. This removes human bias from sizing decisions.

5. **Behaviorally framed**: The commitment rationale uses loss-aversion framing ("edge above
   market price"), consensus clarity ("3/3 analysts agree"), and expected value to help
   users commit decisively or skip confidently. The psychology of "the thinking is done for
   you" — automate the hard parts, present the simple decision.

6. **Self-improving**: Every resolved prediction feeds back to calibration. Every ensemble
   disagreement generates training data. Over time, the system converges toward perfect
   calibration — the holy grail of forecasting.

---

## Metrics

Track and display:

- **Brier score**: Lower is better. Measures calibration + resolution. Target: < 0.25
- **ECE (Expected Calibration Error)**: Measures reliability curve deviation. Target: < 0.05
- **Ensemble consensus spread**: How much analysts disagree. Low = high confidence.
- **Kelly efficiency**: Actual returns vs Kelly-predicted growth rate
- **Win rate by confidence bucket**: Are 80% predictions correct 80% of the time?

---

## User Experience Impact

Before:
> "AI says 68% confidence." (What does that mean? Can I trust it? How much should I bet?)

After:
> "3 independent analysts agree (spread: 4%). Calibrated probability: 72% (historically
> accurate). Edge: 8% above market. Kelly suggests $42 (6.2% of bankroll). Strong consensus
> with positive expected value."

The user's decision is binary: approve or skip. All the hard thinking is automated.
