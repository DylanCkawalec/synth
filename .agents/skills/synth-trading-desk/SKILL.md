---
name: synth-trading-desk
description: Core skill for the Synth AI prediction market desk. Use when interacting with market predictions, portfolio management, order execution, risk analysis, or the approval gate.
---

# Synth Trading Desk

Synth is an AI-assisted prediction market trading desk that generates, evaluates, and executes market predictions using ensemble AI models.

## API Surface (http://localhost:8420)

### Read endpoints (no approval needed)
- `GET /api/health` — desk health, simulation mode, AI availability
- `GET /api/predictions/history?limit=N` — recent predictions
- `GET /api/portfolio/summary?wallet_id=ID` — portfolio overview
- `GET /api/markets/search/:query` — search prediction markets

### Write endpoints (approval gate applies)
- `POST /api/predictions/generate` — generate a new prediction `{ query, wallet_id? }`
- `POST /api/orders/place` — place a trade (requires approval if gate is ON)
- `POST /api/orders/cancel` — cancel a pending order

### Admin endpoints
- `GET /api/audit/log` — audit trail of all actions
- `POST /api/risk/config` — update risk limits
- `POST /api/approval/approve/:id` — approve a pending trade

## Opseeq Integration

Synth routes all inference through Opseeq at `OPENAI_BASE_URL=http://localhost:9090/v1`. The Opseeq MCP server exposes `synth_status`, `synth_predict`, `synth_predictions`, `synth_markets`, `synth_portfolio` tools for programmatic access.

## Key Configuration (.env)
- `SIMULATION_MODE=true` — paper trading (safe for development)
- `REQUIRE_APPROVAL=true` — human-in-the-loop gate for trades
- `OPSEEQ_URL=http://localhost:9090` — gateway connection
- `OPENAI_BASE_URL=http://localhost:9090/v1` — inference routing
