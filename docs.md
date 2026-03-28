# Synthesis Trading Desk

AI-powered prediction market trading desk for [Synthesis.trade](https://synthesis.trade) — unified trading across **Polymarket** (Polygon) and **Kalshi** (Solana) through a single SDK, local API server, and Claude MCP integration.

## Quickstart

```bash
git clone <your-repo-url>
cd synthesis-trade
python -m venv venv && source venv/bin/activate
pip install -e ".[all]"
cp .env.example .env   # Edit with your Synthesis API keys
```

Get your API keys from [synthesis.trade/dashboard](https://synthesis.trade/dashboard).

## Architecture

**Island-based modular design** — each island is a self-contained module with its own API, models, and logic. No global state. Clean interfaces.

```
src/synthesis/
  core/           # HTTP client, auth, WebSocket, Pydantic models
  islands/
    market_discovery/   # Search, filter, orderbooks, price history
    order_execution/    # Place/cancel orders, simulation mode
    portfolio/          # Wallets, balances, positions, PNL, copytrade
    risk/               # Pre-flight checks, Kelly criterion, exposure
    strategy/           # Momentum, value, volume spike scanners
    arbitrage/          # Cross-venue arb detection
  server/         # FastAPI local proxy (47 endpoints)
  mcp_server/     # Claude MCP server (26 tools)
```

## Usage

### Python SDK

```python
import asyncio
from synthesis import SynthesisSettings, AuthManager, SynthesisHTTPClient
from synthesis.islands import MarketDiscoveryIsland, OrderExecutionIsland, RiskIsland

async def main():
    settings = SynthesisSettings()  # Loads from .env
    auth = AuthManager(settings)
    http = SynthesisHTTPClient(settings, auth)

    # Search markets
    markets = MarketDiscoveryIsland(http)
    events = await markets.search_markets(query="bitcoin", limit=5)
    for ev in events:
        print(f"{ev.event.title}")
        for mkt in ev.markets:
            print(f"  YES: {mkt.left_price} | NO: {mkt.right_price}")

    # Place a simulated order (simulation_mode=True by default)
    orders = OrderExecutionIsland(http, simulation=True)
    from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits
    result = await orders.place_polygon_order("your_wallet_id", PolygonOrderRequest(
        token_id="some_token_id", side=OrderSide.BUY,
        type=OrderType.MARKET, amount="10", units=OrderUnits.USDC,
    ))
    print(f"Simulated: {result.message}")

    await http.close()

asyncio.run(main())
```

### Local API Server

```bash
# Start the server (port 8420)
synthesis-server
# Or:
uvicorn synthesis.server.app:create_app --factory --host 127.0.0.1 --port 8420
```

Then browse to `http://localhost:8420/docs` for the full OpenAPI documentation.

Key endpoints:
- `GET /markets` — Search markets across venues
- `POST /order/polygon/{wallet_id}` — Place order (risk-checked, simulation-aware)
- `GET /portfolio/wallet/{wallet_id}/positions` — View positions
- `GET /risk/exposure/{wallet_id}` — Portfolio risk exposure
- `GET /strategy/momentum` — Find momentum markets
- `GET /arbitrage/cross-venue` — Find cross-venue arbitrage

### MCP Server for Claude

```bash
# Start MCP server (stdio transport for Claude Desktop)
synthesis-mcp
```

Add to Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "synthesis-trading-desk": {
      "command": "/path/to/synthesis-trade/venv/bin/python",
      "args": ["-m", "synthesis.mcp_server"],
      "cwd": "/path/to/synthesis-trade"
    }
  }
}
```

Then ask Claude:
- "Search for bitcoin prediction markets"
- "Show me my portfolio and positions"
- "Find arbitrage opportunities between Polymarket and Kalshi"
- "What's the Kelly optimal sizing for a 65% win probability at 2:1 odds?"
- "Place a simulated $10 buy on this market"

**26 MCP tools available:** search_markets, place_order, get_balance, get_positions, check_risk, find_momentum_markets, find_arbitrage_opportunities, analyze_event_pricing, kelly_sizing, and more.

## Safety

- **Simulation mode is ON by default.** No real trades execute until you explicitly set `SIMULATION_MODE=false` in `.env`.
- Every order goes through the **Risk Engine** (position limits, daily loss limits, concentration checks).
- API keys are loaded from `.env` and never committed (`.gitignore` enforced).

## Configuration

Edit `.env`:
```env
PUBLIC_KEY_SYNTH=pk_...
SECRET_KEY_SYNTH=sk_...
SIMULATION_MODE=true
MAX_POSITION_USDC=1000.0
MAX_SINGLE_ORDER_USDC=100.0
MAX_DAILY_LOSS_USDC=200.0
```

## API Coverage

Full coverage of the [Synthesis.trade API](https://api.synthesis.trade/docs):
- Unified market search + Polymarket/Kalshi-specific endpoints
- Order execution (MARKET, LIMIT, STOPLOSS) on both venues
- Wallet management, balances, positions, PNL
- Copytrade creation and management
- Real-time WebSocket streams (orderbook, trades, balance)
- Share minting/merging, swaps, withdrawals
- UMA oracle request tracking

## License

MIT
