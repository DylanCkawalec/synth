from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from synthesis.config import SynthesisSettings
from synthesis.core.auth import AuthManager
from synthesis.core.http import SynthesisHTTPClient
from synthesis.core.models import RiskConfig
from synthesis.islands.market_discovery.island import MarketDiscoveryIsland
from synthesis.islands.order_execution.island import OrderExecutionIsland
from synthesis.islands.portfolio.island import PortfolioIsland
from synthesis.islands.risk.island import RiskIsland
from synthesis.islands.strategy.island import StrategyIsland
from synthesis.islands.arbitrage.island import ArbitrageIsland

# --- Bootstrap ---
_settings = SynthesisSettings()
_auth = AuthManager(_settings)
_http = SynthesisHTTPClient(_settings, _auth)

_market_discovery = MarketDiscoveryIsland(_http)
_order_execution = OrderExecutionIsland(_http, simulation=_settings.simulation_mode)
_portfolio = PortfolioIsland(_http)
_risk = RiskIsland(RiskConfig(
    max_position_usdc=_settings.max_position_usdc,
    max_single_order_usdc=_settings.max_single_order_usdc,
    max_daily_loss_usdc=_settings.max_daily_loss_usdc,
    max_open_positions=_settings.max_open_positions,
    allowed_venues=_settings.allowed_venues,
))
_strategy = StrategyIsland(_market_discovery)
_arbitrage = ArbitrageIsland(_market_discovery)

# --- MCP Server ---
mcp = FastMCP(
    name="synthesis-trading-desk",
)


# ==================== MARKET TOOLS ====================

@mcp.tool()
async def search_markets(
    query: str = "",
    venue: str = "",
    limit: int = 10,
    sort: str = "volume",
) -> list[dict]:
    """Search prediction markets across Polymarket and Kalshi.
    Use this to find markets by topic (e.g., 'election', 'bitcoin', 'fed rate').
    venue: 'polymarket', 'kalshi', or empty for both.
    sort: 'volume', 'volume24hr', 'liquidity', 'created_at', 'ends_at'."""
    events = await _market_discovery.search_markets(
        query=query or None, venue=venue or None, limit=limit, sort=sort,
    )
    results = []
    for ev in events:
        for mkt in ev.markets:
            results.append({
                "event_title": ev.event.title,
                "market_name": mkt.name,
                "venue": ev.venue or mkt.venue,
                "yes_price": mkt.left_price,
                "no_price": mkt.right_price,
                "volume": mkt.volume,
                "volume_24h": mkt.volume24hr,
                "liquidity": mkt.liquidity,
                "token_id": mkt.primary_token_id,
                "condition_id": mkt.condition_id,
                "market_id": mkt.market_id,
                "active": mkt.active,
                "ends_at": mkt.ends_at,
            })
    return results[:limit]


@mcp.tool()
async def get_orderbook(token_id: str) -> dict:
    """Get the current orderbook (bids and asks) for a market token.
    Use the token_id from search_markets results."""
    book = await _market_discovery.get_orderbook(token_id)
    return book.model_dump()


@mcp.tool()
async def get_market_trades(condition_id: str, limit: int = 20) -> list[dict]:
    """Get recent trades for a Polymarket market by condition_id."""
    trades = await _market_discovery.get_trades(condition_id, limit=limit)
    return [t.model_dump() for t in trades]


@mcp.tool()
async def get_price_history(
    token_id: str, points: int = 50,
) -> list[dict]:
    """Get price history for a market token. Returns time series of price points."""
    history = await _market_discovery.get_price_history(token_id, points=points)
    return [p.model_dump() for p in history]


@mcp.tool()
async def get_market_statistics(venue: str = "") -> dict:
    """Get aggregate market statistics (total volume, active markets, etc.)."""
    return await _market_discovery.get_statistics(venue or None)


@mcp.tool()
async def find_similar_market_pairs() -> list[dict]:
    """Find matching markets across Polymarket and Kalshi (useful for arbitrage analysis)."""
    return await _market_discovery.get_similar_pairs()


# ==================== TRADING TOOLS ====================

@mcp.tool()
async def place_order(
    wallet_id: str,
    token_id: str,
    side: str,
    amount: str,
    order_type: str = "MARKET",
    price: str = "",
    units: str = "USDC",
) -> dict:
    """Place a trade on Polymarket (Polygon wallet).
    IMPORTANT: In simulation mode (default), this does NOT execute real trades.
    side: 'BUY' or 'SELL'.
    order_type: 'MARKET', 'LIMIT', or 'STOPLOSS'.
    amount: dollar amount as string (e.g., '10').
    price: required for LIMIT/STOPLOSS (e.g., '0.45').
    units: 'USDC' or 'SHARES'."""
    from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits

    # Risk check first
    positions = await _portfolio.get_positions(wallet_id)
    balance = await _portfolio.get_balance(wallet_id)
    order_req = PolygonOrderRequest(
        token_id=token_id, side=OrderSide(side), type=OrderType(order_type),
        amount=amount, price=price or None, units=OrderUnits(units),
    )
    risk_result = _risk.check_order(order_req, positions, balance)
    if not risk_result.approved:
        return {"success": False, "error": "Risk check failed", "reasons": risk_result.blocking_reasons}

    result = await _order_execution.place_polygon_order(wallet_id, order_req)
    return {
        "success": True,
        "simulated": result.simulated,
        "message": result.message,
        "order": result.order if isinstance(result.order, dict) else (result.order.model_dump() if result.order else None),
        "risk_warnings": risk_result.warnings,
    }


@mcp.tool()
async def place_solana_order(
    wallet_id: str, token_id: str, side: str, amount: str,
) -> dict:
    """Place a trade on Kalshi (Solana wallet).
    side: 'BUY' or 'SELL'. amount: dollar amount as string."""
    from synthesis.core.models import SolanaOrderRequest, OrderSide
    order_req = SolanaOrderRequest(token_id=token_id, side=OrderSide(side), amount=amount)
    result = await _order_execution.place_solana_order(wallet_id, order_req)
    return {"success": True, "simulated": result.simulated, "message": result.message}


@mcp.tool()
async def simulate_order(
    wallet_id: str, token_id: str, side: str, amount: str,
    order_type: str = "MARKET", price: str = "",
) -> dict:
    """Simulate a trade to see estimated fill price, slippage, and cost without executing.
    Always safe to call — never touches real money."""
    from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits
    order_req = PolygonOrderRequest(
        token_id=token_id, side=OrderSide(side), type=OrderType(order_type),
        amount=amount, price=price or None, units=OrderUnits.USDC,
    )
    sim = await _order_execution.simulate_polygon_order(wallet_id, order_req)
    return sim.model_dump()


@mcp.tool()
async def cancel_order(wallet_id: str, order_id: str) -> dict:
    """Cancel an open order on Polymarket."""
    await _order_execution.cancel_order(wallet_id, order_id)
    return {"success": True, "cancelled": order_id}


@mcp.tool()
async def get_open_orders(wallet_id: str) -> list[dict]:
    """Get all open/active orders for a Polygon wallet."""
    orders = await _order_execution.get_active_orders(wallet_id)
    return [o.model_dump() for o in orders]


# ==================== PORTFOLIO TOOLS ====================

@mcp.tool()
async def get_wallets() -> list[dict]:
    """List all wallets (Polygon + Solana) associated with this account."""
    wallets = await _portfolio.get_all_wallets()
    return [w.model_dump() for w in wallets]


@mcp.tool()
async def get_balance(wallet_id: str) -> dict:
    """Get the USDC balance for a wallet."""
    balance = await _portfolio.get_balance(wallet_id)
    return balance.model_dump()


@mcp.tool()
async def get_positions(wallet_id: str) -> list[dict]:
    """Get all open positions for a wallet with current P&L."""
    positions = await _portfolio.get_positions(wallet_id)
    return [p.model_dump() for p in positions]


@mcp.tool()
async def get_pnl(wallet_id: str, interval: str = "") -> dict:
    """Get profit and loss summary for a wallet. interval: '1d', '1w', '1m', or empty for all-time."""
    pnl = await _portfolio.get_pnl(wallet_id, interval=interval or None)
    return pnl.model_dump()


@mcp.tool()
async def get_portfolio_summary(wallet_id: str) -> dict:
    """Get a full portfolio summary: balance, positions, P&L, and exposure analysis."""
    balance = await _portfolio.get_balance(wallet_id)
    positions = await _portfolio.get_positions(wallet_id)
    pnl = await _portfolio.get_pnl(wallet_id)
    exposure = _risk.get_exposure(positions)

    return {
        "wallet_id": wallet_id,
        "balance": balance.model_dump(),
        "position_count": len(positions),
        "positions": [p.model_dump() for p in positions],
        "pnl": pnl.model_dump(),
        "exposure": exposure.model_dump(),
    }


# ==================== RISK TOOLS ====================

@mcp.tool()
async def check_risk(
    wallet_id: str, token_id: str, side: str, amount: str,
) -> dict:
    """Pre-flight risk check for a potential trade. Returns whether the trade would be approved
    and any warnings or blocking reasons."""
    from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits
    order = PolygonOrderRequest(
        token_id=token_id, side=OrderSide(side), type=OrderType.MARKET,
        amount=amount, units=OrderUnits.USDC,
    )
    positions = await _portfolio.get_positions(wallet_id)
    balance = await _portfolio.get_balance(wallet_id)
    result = _risk.check_order(order, positions, balance)
    return result.model_dump()


@mcp.tool()
async def get_exposure(wallet_id: str) -> dict:
    """Get current portfolio risk exposure: total value, concentration, venue breakdown."""
    positions = await _portfolio.get_positions(wallet_id)
    exposure = _risk.get_exposure(positions)
    return exposure.model_dump()


@mcp.tool()
async def update_risk_limits(
    max_position_usdc: float = 0,
    max_single_order_usdc: float = 0,
    max_daily_loss_usdc: float = 0,
) -> dict:
    """Update risk management parameters. Pass 0 to keep current value."""
    updates = {}
    if max_position_usdc > 0:
        updates["max_position_usdc"] = max_position_usdc
    if max_single_order_usdc > 0:
        updates["max_single_order_usdc"] = max_single_order_usdc
    if max_daily_loss_usdc > 0:
        updates["max_daily_loss_usdc"] = max_daily_loss_usdc
    if updates:
        _risk.update_config(**updates)
    return _risk.config.model_dump()


@mcp.tool()
def kelly_sizing(win_probability: float, odds: float) -> dict:
    """Calculate optimal position size using Kelly Criterion.
    win_probability: estimated probability of winning (0-1).
    odds: payout ratio (e.g., 2.0 means you get 2x your bet on a win)."""
    fraction = _risk.kelly_criterion(win_probability, odds)
    return {
        "kelly_fraction": fraction,
        "suggested_percent": f"{fraction * 100:.1f}%",
        "win_probability": win_probability,
        "odds": odds,
    }


# ==================== STRATEGY TOOLS ====================

@mcp.tool()
async def find_momentum_markets(venue: str = "", limit: int = 5) -> list[dict]:
    """Find markets with strong price momentum (high 24h volume, trending prices)."""
    signals = await _strategy.scan_momentum(venue=venue or None, limit=limit)
    return [s.model_dump() for s in signals]


@mcp.tool()
async def find_value_markets(max_price: float = 0.15, venue: str = "", limit: int = 5) -> list[dict]:
    """Find potentially undervalued markets: low price + decent volume/liquidity."""
    signals = await _strategy.scan_value(max_price=max_price, venue=venue or None, limit=limit)
    return [s.model_dump() for s in signals]


@mcp.tool()
async def find_volume_spikes(threshold: float = 3.0, venue: str = "", limit: int = 5) -> list[dict]:
    """Find markets with unusual volume activity (possible catalyst or breaking news)."""
    signals = await _strategy.scan_volume_spike(threshold=threshold, venue=venue or None, limit=limit)
    return [s.model_dump() for s in signals]


# ==================== ARBITRAGE TOOLS ====================

@mcp.tool()
async def find_arbitrage_opportunities(min_spread: float = 0.03) -> list[dict]:
    """Find price discrepancies between Polymarket and Kalshi for the same events.
    min_spread: minimum price difference to report (default 0.03 = 3 cents)."""
    opps = await _arbitrage.find_cross_venue_arbs(min_spread=min_spread)
    return [o.model_dump() for o in opps]


@mcp.tool()
async def analyze_event_pricing(event_id: str, venue: str = "polymarket") -> dict:
    """Analyze pricing consistency within a multi-outcome event.
    Checks if probabilities sum to ~100% (efficient market) or if there's overround/underround."""
    return await _arbitrage.analyze_event_pricing(event_id, venue=venue)


# ==================== CONFIG TOOLS ====================

@mcp.tool()
def get_desk_config() -> dict:
    """Get current trading desk configuration: simulation mode, risk limits, venues."""
    return {
        "simulation_mode": _settings.simulation_mode,
        "base_url": _settings.base_url,
        "risk_config": _risk.config.model_dump(),
        "allowed_venues": _settings.allowed_venues,
    }
