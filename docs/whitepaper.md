# Synth Protocol: AI-Assisted Prediction Market Decision Engine

## Abstract

Synth is a local-first protocol for simplifying prediction market participation through AI-guided decision flows. It connects users and AI agents to unified prediction market data (Polymarket, Kalshi) via the Synthesis.trade API, scores opportunities by near-term resolution urgency, generates structured AI predictions with explicit thesis/rationale/risk, and enforces capital preservation through built-in risk controls. The result is a system where making the next best prediction is as simple as clicking a button.

## 1. Problem

Prediction markets offer superior price discovery for real-world events, but participation is unnecessarily difficult:

- **Information overload**: thousands of markets across venues with no unified ranking
- **Analysis paralysis**: evaluating probability, liquidity, timing, and risk simultaneously is cognitively expensive
- **Fragmented tooling**: separate interfaces for Polymarket, Kalshi, and analytics
- **No guidance**: users must form their own thesis with no structured support
- **Capital risk**: no built-in guardrails against over-concentration or drawdown

The median user abandons prediction markets not because the markets are wrong, but because the workflow is overwhelming.

## 2. Solution

Synth reduces the prediction workflow to a guided sequence:

```
Discover → Analyze → Decide → Track
```

Each step is AI-assisted and human-approved:

1. **Discover**: Markets are scored and ranked by a composite signal (urgency × liquidity × volume × dislocation). Near-term markets surface first.
2. **Analyze**: GPT-4o generates a structured prediction: thesis, confidence (0–1), rationale, invalidation conditions, risk notes, and a suggested execution with Kelly-optimal sizing.
3. **Decide**: The user reviews the prediction card, inspects wallet state and risk budget, then approves or skips.
4. **Track**: Every prediction is persisted with full provenance. Resolution tracking determines whether the AI was correct.

## 3. Architecture

### 3.1 Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React + TypeScript + Tailwind | Dashboard, predictions, wallet visibility |
| Server | Express (TypeScript) | API proxy, OpenAI integration, persistence |
| Data Source | synthesis.trade API | Unified market data, wallet, orders |
| AI | OpenAI GPT-4o | Prediction generation |
| Scoring | MiroFish-inspired engine | Market ranking by composite signal |
| Agent | Nemoclaw MCP | Structured tool use for AI agents |

### 3.2 Data Flow

```
synthesis.trade API
       │
       ▼
  Express Server (auth proxy, prediction engine, JSONL store)
       │
       ▼
  React Dashboard (scoring, display, guided actions)
       │
       ▼
  User / AI Agent (approve, reject, track)
```

### 3.3 Source of Truth

- **Market data**: synthesis.trade API (remote, real-time)
- **Wallet state**: synthesis.trade API (authenticated)
- **Predictions**: local JSONL (`data/predictions.jsonl`)
- **Audit log**: local JSONL (`data/audit.jsonl`)
- **Configuration**: `.env` file

## 4. Scoring Model

Markets are ranked by a weighted composite score inspired by MiroFish feed-weight architecture:

| Signal | Weight | Measurement |
|--------|--------|-------------|
| **Urgency** | 40% | Time to market resolution (log-scaled, near-term preferred) |
| **Liquidity** | 20% | Orderbook depth (log-scaled) |
| **Volume Momentum** | 20% | 24-hour trading volume (log-scaled) |
| **Price Dislocation** | 20% | Distance from 50/50 pricing (linear) |

The urgency-heavy weighting reflects the protocol's core thesis: **fast-resolution markets provide the tightest feedback loops and lowest uncertainty risk.**

Urgency thresholds:
- **Critical** (≤15 min): score 0.95–1.0
- **Soon** (≤60 min): score 0.8
- **Normal** (≤24 hours): score 0.4–0.6
- **Distant** (>24 hours): score 0.15

## 5. Prediction Schema

Every prediction is a structured record:

```typescript
{
  id: string              // Unique identifier
  thesis: string          // Core prediction statement
  confidence: number      // 0.0 – 1.0
  rationale: string       // Evidence and reasoning
  invalidation: string    // What would disprove the thesis
  riskNote: string        // Liquidity, expiry, correlation risks
  action: string          // BUY | SELL | HOLD | SKIP
  side: string            // BUY | SELL
  amountUsdc: number      // Suggested position size
  kellyFraction: number   // Kelly-optimal fraction
  marketName: string      // Human-readable market name
  venue: string           // polymarket | kalshi
  tokenId: string         // Venue-specific token ID
  endsAt: string          // Market resolution time
  yesPrice: number        // Current yes price
  noPrice: number         // Current no price
  createdAt: string       // Prediction timestamp
  status: string          // generated | resolved
  wasCorrect: boolean     // Post-resolution accuracy
  pnl: number             // Realized P&L
}
```

This schema enables:
- Full prediction provenance tracking
- AI accuracy measurement over time
- Agent-readable structured output
- Audit compliance

## 6. Risk Controls

### 6.1 Capital Preservation Rules

| Rule | Default | Purpose |
|------|---------|---------|
| Max per prediction | 10% of wallet | Prevent single-bet ruin |
| Max total utilization | 50% of wallet | Preserve dry powder |
| Max single order | $100 USDC | Limit per-trade exposure |
| Max daily loss | $200 USDC | Drawdown circuit breaker |
| Confidence threshold | 0.55 | Block low-conviction trades |

### 6.2 Execution Modes

1. **Read-only**: Market analysis and scoring only
2. **Simulation**: Predictions generated, orders simulated (default)
3. **Suggestion**: Predictions surface execution proposals for human review
4. **Live**: Execution enabled with explicit approval gates

### 6.3 Approval Gate

All execution actions require explicit human approval by default. The approval flow:

```
AI generates prediction → Prediction card displayed → User clicks Approve/Reject → Order submitted (if approved)
```

## 7. Agent Integration (Nemoclaw)

Synth exposes a Model Context Protocol (MCP) server called Nemoclaw with 26 tools:

- **READ** (14 tools): market search, orderbook, positions, balance, risk, strategy signals
- **PREDICT** (2 tools): prediction generation, history retrieval
- **EXECUTE** (2 tools): order placement, cancellation (approval-gated)
- **ADMIN** (8 tools): approvals, audit, configuration

AI agents (Claude, GPT, custom) can autonomously research, score, and propose predictions. Execution remains human-gated by default, supporting a progressive autonomy model.

## 8. MiroFish Integration

[MiroFish](https://github.com/DylanCkawalec/MiroFish) is a multi-agent social simulation framework. Synth integrates its concepts at two levels:

1. **Scoring weights**: MiroFish's feed-weight architecture (recency, popularity, relevance) directly informs the market scoring model.
2. **Oracle mode**: For high-stakes predictions, MiroFish can run social simulations to generate consensus forecasts as a supplementary signal.

## 9. Product Design Principles

1. **One-click workflow**: Every screen should be one click away from the next action
2. **Signal over noise**: Show only what changes the decision
3. **Near-term focus**: Fast-resolution markets first, always
4. **Psychological safety**: Simulation mode by default, approval gates on, risk limits enforced
5. **Agent-native**: Every surface is structured for both human and AI consumption
6. **Local-first**: Runs on your machine, secrets stay local, data persists locally

## 10. Go-to-Market

Synth is positioned as **the simplest way to participate in prediction markets with AI assistance**.

Target users:
- Prediction market participants who want AI-augmented analysis
- Developers building AI agents that interact with prediction markets
- Quantitative traders seeking structured near-term opportunity scanning

Distribution:
- Open source (GitHub)
- Local-first (no cloud dependency)
- Agent-compatible (MCP protocol)

Differentiation:
- Not a research tool — a decision engine
- Not a portfolio tracker — a prediction cockpit
- Not an automation platform — a human-in-the-loop assistant

## 11. Future Work

1. **WebSocket streaming**: Real-time price feeds replacing polling
2. **Brier score tracking**: Quantitative calibration measurement per user and per model
3. **Multi-agent consensus**: Run multiple AI models and aggregate predictions
4. **Cross-venue arbitrage alerts**: Automated spread detection between Polymarket and Kalshi
5. **Resolution automation**: Auto-resolve predictions from on-chain settlement data
6. **Progressive autonomy**: Confidence-gated auto-execution for high-conviction, small-size trades

## 12. Conclusion

Prediction markets are the most efficient mechanism for aggregating beliefs about future events. Synth removes the friction between having a question and acting on the best available answer. By combining unified market data, AI-generated structured predictions, capital preservation controls, and a guided decision flow, Synth makes prediction market participation accessible to anyone — human or agent — who wants to make better decisions about the near future.
