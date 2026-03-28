# Synth

Local-first AI trading desk for prediction markets. Built on [synthesis.trade](https://synthesis.trade) — unified order routing across **Polymarket** and **Kalshi** with GPT-4o–powered predictions, an MCP bridge (Nemoclaw), and an operator dashboard.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Operator UI (:8420)             │
│   Dashboard · Markets · Predictions · Approvals  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              FastAPI Server                       │
│  /markets  /order  /portfolio  /risk  /strategy  │
│  /predictions  /approvals  /audit  /arbitrage    │
├──────────────────────────────────────────────────┤
│  Prediction Engine │ Audit Log │ Approval Gate   │
│       (GPT-4o)     │  (JSONL)  │  (in-memory)   │
├──────────────────────────────────────────────────┤
│              Island Layer                         │
│  MarketDiscovery · OrderExecution · Portfolio     │
│  Risk · Strategy · Arbitrage                     │
├──────────────────────────────────────────────────┤
│         synthesis.trade API (source of truth)     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│          Nemoclaw MCP Server (stdio)              │
│  READ tools    — markets, portfolio, risk, arb   │
│  PREDICT tools — GPT-4o generation               │
│  EXECUTE tools — approval-gated order placement  │
│  ADMIN tools   — audit log, config, approvals    │
└──────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Clone
git clone https://github.com/DylanCkawalec/synth.git && cd synth

# Setup
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[all]"

# Configure
cp .env.example .env
# Edit .env with your keys from https://synthesis.trade/dashboard

# Run
./run.sh
# → http://127.0.0.1:8420
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_KEY_SYNTH` | Yes | Synthesis public key |
| `SECRET_KEY_SYNTH` | Yes | Synthesis secret key |
| `OPENAI_API_KEY` | For predictions | OpenAI API key (GPT-4o) |
| `NVIDIA_KEY` | For container | NVIDIA API key |
| `SIMULATION_MODE` | — | `true` (default) or `false` |
| `REQUIRE_APPROVAL` | — | `true` (default) — gate execution tools |
| `MAX_POSITION_USDC` | — | Max position size (default 1000) |
| `MAX_SINGLE_ORDER_USDC` | — | Max single order (default 100) |
| `MAX_DAILY_LOSS_USDC` | — | Daily loss limit (default 200) |

## Run Modes

```bash
./run.sh              # HTTP server + operator UI
./run.sh mcp          # Nemoclaw MCP server (stdio)
./run.sh docker       # Build and run in container
./run.sh test         # Preflight validation
```

## Docker

Uses `ghcr.io/nvidia/openshell/cluster:0.0.15` as the base image.

```bash
# Build and run
docker compose up --build -d

# Logs
docker compose logs -f synth

# Stop
docker compose down
```

## Operator UI

Open `http://127.0.0.1:8420` after starting the server.

- **Dashboard** — balance, positions, P&L, recent predictions, pending approvals
- **Markets** — search Polymarket + Kalshi, one-click prediction generation
- **Predictions** — GPT-4o structured outputs with thesis, confidence, rationale, invalidation, risk note, suggested execution
- **Approvals** — review and approve/reject pending execution actions
- **Audit Log** — filterable history of every read, prediction, and execution
- **Settings** — wallet ID, risk config, mode display

## Nemoclaw MCP Server

The MCP bridge exposes the full trading system to AI agents via stdio.

### Tool Categories

**READ** (no approval) — `search_markets`, `get_orderbook`, `get_positions`, `get_balance`, `get_portfolio_summary`, `check_risk`, `kelly_sizing`, `find_momentum_markets`, `find_value_markets`, `find_volume_spikes`, `find_arbitrage_opportunities`, `simulate_order`, `get_open_orders`

**PREDICT** (no approval) — `generate_prediction`, `get_predictions`

**EXECUTE** (approval-gated) — `place_order`, `cancel_order`

**ADMIN** — `approve_action`, `reject_action`, `get_pending_actions`, `get_audit_log`, `get_desk_config`, `update_risk_limits`

### Prediction Output Schema

Every prediction includes:
- **thesis** — the core prediction
- **confidence** — 0.0–1.0
- **rationale** — evidence and reasoning
- **invalidation** — what would disprove the thesis
- **risk_note** — liquidity, expiry, correlation risks
- **suggested_execution** — action, token, side, amount, order type, Kelly fraction

### MCP Configuration

Add to your MCP client config:

```json
{
  "mcpServers": {
    "nemoclaw": {
      "command": "synthesis-mcp",
      "args": [],
      "env": {
        "PUBLIC_KEY_SYNTH": "...",
        "SECRET_KEY_SYNTH": "...",
        "OPENAI_API_KEY": "..."
      }
    }
  }
}
```

## Safety

- **Simulation mode** (default ON) — orders are simulated, not executed
- **Approval gate** (default ON) — execution tools require explicit operator approval via UI or MCP `approve_action`
- **Risk engine** — pre-flight checks on every order: position limits, order size, daily loss, venue restrictions
- **Audit log** — every action (reads, predictions, executions) logged to `data/audit.jsonl`
- Secrets loaded from `.env` only, never hardcoded

## Testing

```bash
# Validate config and API keys
./run.sh test

# Verify imports
python -c "from synthesis.server.app import create_app; print('ok')"

# Start server and hit health
./run.sh &
curl http://127.0.0.1:8420/health

# Generate a prediction via API
curl -X POST http://127.0.0.1:8420/predictions/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "Will Bitcoin hit $100k?"}'
```

## Project Structure

```
src/synthesis/
├── config.py              Settings from .env
├── exceptions.py          Error types
├── core/
│   ├── auth.py            API authentication
│   ├── http.py            Async HTTP client
│   ├── models.py          Pydantic models
│   └── websocket.py       WebSocket client
├── predictions/
│   ├── engine.py          GPT-4o prediction engine
│   └── models.py          Prediction schema
├── audit/
│   └── logger.py          JSONL audit logger
├── guard/
│   └── gate.py            Approval gate
├── islands/               Trading logic
│   ├── market_discovery/
│   ├── order_execution/
│   ├── portfolio/
│   ├── risk/
│   ├── strategy/
│   └── arbitrage/
├── server/                FastAPI app
│   └── routes/            API endpoints
├── mcp_server/            Nemoclaw MCP bridge
│   └── server.py
└── ui/
    └── index.html         Operator dashboard
```

## License

MIT
