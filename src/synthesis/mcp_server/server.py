"""Nemoclaw MCP Bridge — structured read tools, guarded execution tools, GPT-4o predictions.

Tool categories:
  READ     — market data, portfolio, strategy, risk analysis. No approval needed.
  PREDICT  — GPT-4o prediction generation. No approval needed.
  EXECUTE  — order placement, cancellation. Requires approval gate.
  ADMIN    — audit log, risk config, approval management.
"""

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
from synthesis.audit.logger import AuditLogger
from synthesis.guard.gate import ApprovalGate
from synthesis.predictions.engine import PredictionEngine

# ── Bootstrap ──────────────────────────────────────────────────────────────────
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
_audit = AuditLogger(log_dir=_settings.audit_log_dir)
_gate = ApprovalGate(
    require_approval=_settings.require_approval,
    ttl_seconds=_settings.approval_ttl_seconds,
)
_predictions: PredictionEngine | None = None
if _settings.openai_api_key:
    try:
        _predictions = PredictionEngine(
            openai_api_key=_settings.openai_api_key,
            model=_settings.openai_model,
        )
    except ImportError:
        pass

_mode = "sim" if _settings.simulation_mode else "live"

# ── MCP Server ─────────────────────────────────────────────────────────────────
mcp = FastMCP(name="nemoclaw")


# ══════════════════════════════════════════════════════════════════════════════
# READ TOOLS — safe, no approval needed
# ══════════════════════════════════════════════════════════════════════════════

@mcp.tool()
async def search_markets(query: str = "", venue: str = "", limit: int = 10, sort: str = "volume") -> list[dict]:
    """[READ] Search prediction markets across Polymarket and Kalshi.
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
    _audit.log("search_markets", "read", params={"query": query, "venue": venue, "limit": limit}, mode=_mode)
    return results[:limit]


@mcp.tool()
async def get_orderbook(token_id: str) -> dict:
    """[READ] Get the current orderbook (bids and asks) for a market token."""
    book = await _market_discovery.get_orderbook(token_id)
    _audit.log("get_orderbook", "read", params={"token_id": token_id}, mode=_mode)
    return book.model_dump()


@mcp.tool()
async def get_market_trades(condition_id: str, limit: int = 20) -> list[dict]:
    """[READ] Get recent trades for a Polymarket market by condition_id."""
    trades = await _market_discovery.get_trades(condition_id, limit=limit)
    _audit.log("get_market_trades", "read", params={"condition_id": condition_id}, mode=_mode)
    return [t.model_dump() for t in trades]


@mcp.tool()
async def get_price_history(token_id: str, points: int = 50) -> list[dict]:
    """[READ] Get price history for a market token."""
    history = await _market_discovery.get_price_history(token_id, points=points)
    _audit.log("get_price_history", "read", params={"token_id": token_id}, mode=_mode)
    return [p.model_dump() for p in history]


@mcp.tool()
async def get_market_statistics(venue: str = "") -> dict:
    """[READ] Get aggregate market statistics."""
    _audit.log("get_market_statistics", "read", params={"venue": venue}, mode=_mode)
    return await _market_discovery.get_statistics(venue or None)


@mcp.tool()
async def find_similar_market_pairs() -> list[dict]:
    """[READ] Find matching markets across Polymarket and Kalshi (arbitrage discovery)."""
    _audit.log("find_similar_market_pairs", "read", mode=_mode)
    return await _market_discovery.get_similar_pairs()


@mcp.tool()
async def get_wallets() -> list[dict]:
    """[READ] List all wallets associated with this account."""
    wallets = await _portfolio.get_all_wallets()
    _audit.log("get_wallets", "read", mode=_mode)
    return [w.model_dump() for w in wallets]


@mcp.tool()
async def get_balance(wallet_id: str) -> dict:
    """[READ] Get USDC balance for a wallet."""
    balance = await _portfolio.get_balance(wallet_id)
    _audit.log("get_balance", "read", params={"wallet_id": wallet_id}, mode=_mode)
    return balance.model_dump()


@mcp.tool()
async def get_positions(wallet_id: str) -> list[dict]:
    """[READ] Get all open positions for a wallet."""
    positions = await _portfolio.get_positions(wallet_id)
    _audit.log("get_positions", "read", params={"wallet_id": wallet_id}, mode=_mode)
    return [p.model_dump() for p in positions]


@mcp.tool()
async def get_pnl(wallet_id: str, interval: str = "") -> dict:
    """[READ] Get P&L summary. interval: '1d', '1w', '1m', or empty for all-time."""
    pnl = await _portfolio.get_pnl(wallet_id, interval=interval or None)
    _audit.log("get_pnl", "read", params={"wallet_id": wallet_id, "interval": interval}, mode=_mode)
    return pnl.model_dump()


@mcp.tool()
async def get_portfolio_summary(wallet_id: str) -> dict:
    """[READ] Full portfolio: balance, positions, P&L, exposure."""
    balance = await _portfolio.get_balance(wallet_id)
    positions = await _portfolio.get_positions(wallet_id)
    pnl = await _portfolio.get_pnl(wallet_id)
    exposure = _risk.get_exposure(positions)
    _audit.log("get_portfolio_summary", "read", params={"wallet_id": wallet_id}, mode=_mode)
    return {
        "wallet_id": wallet_id,
        "balance": balance.model_dump(),
        "position_count": len(positions),
        "positions": [p.model_dump() for p in positions],
        "pnl": pnl.model_dump(),
        "exposure": exposure.model_dump(),
    }


@mcp.tool()
async def check_risk(wallet_id: str, token_id: str, side: str, amount: str) -> dict:
    """[READ] Pre-flight risk check for a potential trade."""
    from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits
    order = PolygonOrderRequest(
        token_id=token_id, side=OrderSide(side), type=OrderType.MARKET,
        amount=amount, units=OrderUnits.USDC,
    )
    positions = await _portfolio.get_positions(wallet_id)
    balance = await _portfolio.get_balance(wallet_id)
    result = _risk.check_order(order, positions, balance)
    _audit.log("check_risk", "read", params={"wallet_id": wallet_id, "token_id": token_id, "side": side, "amount": amount}, mode=_mode)
    return result.model_dump()


@mcp.tool()
async def get_exposure(wallet_id: str) -> dict:
    """[READ] Get current portfolio risk exposure."""
    positions = await _portfolio.get_positions(wallet_id)
    exposure = _risk.get_exposure(positions)
    _audit.log("get_exposure", "read", params={"wallet_id": wallet_id}, mode=_mode)
    return exposure.model_dump()


@mcp.tool()
def kelly_sizing(win_probability: float, odds: float) -> dict:
    """[READ] Calculate optimal position size using Kelly Criterion."""
    fraction = _risk.kelly_criterion(win_probability, odds)
    _audit.log("kelly_sizing", "read", params={"win_probability": win_probability, "odds": odds}, mode=_mode)
    return {"kelly_fraction": fraction, "suggested_percent": f"{fraction * 100:.1f}%", "win_probability": win_probability, "odds": odds}


@mcp.tool()
async def find_momentum_markets(venue: str = "", limit: int = 5) -> list[dict]:
    """[READ] Markets with strong price momentum."""
    signals = await _strategy.scan_momentum(venue=venue or None, limit=limit)
    _audit.log("find_momentum_markets", "read", params={"venue": venue, "limit": limit}, mode=_mode)
    return [s.model_dump() for s in signals]


@mcp.tool()
async def find_value_markets(max_price: float = 0.15, venue: str = "", limit: int = 5) -> list[dict]:
    """[READ] Potentially undervalued markets."""
    signals = await _strategy.scan_value(max_price=max_price, venue=venue or None, limit=limit)
    _audit.log("find_value_markets", "read", params={"max_price": max_price}, mode=_mode)
    return [s.model_dump() for s in signals]


@mcp.tool()
async def find_volume_spikes(threshold: float = 3.0, venue: str = "", limit: int = 5) -> list[dict]:
    """[READ] Markets with unusual volume activity."""
    signals = await _strategy.scan_volume_spike(threshold=threshold, venue=venue or None, limit=limit)
    _audit.log("find_volume_spikes", "read", params={"threshold": threshold}, mode=_mode)
    return [s.model_dump() for s in signals]


@mcp.tool()
async def find_arbitrage_opportunities(min_spread: float = 0.03) -> list[dict]:
    """[READ] Price discrepancies between Polymarket and Kalshi."""
    opps = await _arbitrage.find_cross_venue_arbs(min_spread=min_spread)
    _audit.log("find_arbitrage_opportunities", "read", params={"min_spread": min_spread}, mode=_mode)
    return [o.model_dump() for o in opps]


@mcp.tool()
async def analyze_event_pricing(event_id: str, venue: str = "polymarket") -> dict:
    """[READ] Analyze pricing consistency within a multi-outcome event."""
    _audit.log("analyze_event_pricing", "read", params={"event_id": event_id, "venue": venue}, mode=_mode)
    return await _arbitrage.analyze_event_pricing(event_id, venue=venue)


# ══════════════════════════════════════════════════════════════════════════════
# PREDICT TOOLS — GPT-4o powered, audit-logged, no approval needed
# ══════════════════════════════════════════════════════════════════════════════

@mcp.tool()
async def generate_prediction(query: str, wallet_id: str = "") -> dict:
    """[PREDICT] Generate a GPT-4o prediction with thesis, confidence, rationale,
    invalidation, risk note, and suggested execution.
    Searches markets for context automatically."""
    if not _predictions:
        return {"error": "Prediction engine unavailable — set OPENAI_API_KEY in .env"}

    markets: list[dict] = []
    try:
        events = await _market_discovery.search_markets(query=query, limit=5)
        for ev in events:
            for mkt in ev.markets:
                markets.append({
                    "event_title": ev.event.title, "market_name": mkt.name,
                    "venue": ev.venue or mkt.venue,
                    "yes_price": str(mkt.left_price), "no_price": str(mkt.right_price),
                    "volume_24h": str(mkt.volume24hr), "liquidity": str(mkt.liquidity),
                    "token_id": mkt.primary_token_id, "condition_id": mkt.condition_id,
                    "ends_at": mkt.ends_at,
                })
    except Exception:
        pass

    portfolio = None
    if wallet_id:
        try:
            bal = await _portfolio.get_balance(wallet_id)
            pos = await _portfolio.get_positions(wallet_id)
            portfolio = {"balance": bal.model_dump(), "positions": [p.model_dump() for p in pos[:10]]}
        except Exception:
            pass

    prediction = await _predictions.generate(
        query=query, markets=markets, portfolio=portfolio, wallet_id=wallet_id or None,
    )
    _audit.log("generate_prediction", "predict", params={"query": query}, result={"prediction_id": prediction.prediction_id}, mode=_mode)
    return prediction.model_dump()


@mcp.tool()
async def get_predictions(limit: int = 20) -> list[dict]:
    """[PREDICT] Get recent predictions history."""
    if not _predictions:
        return []
    _audit.log("get_predictions", "predict", params={"limit": limit}, mode=_mode)
    return [p.model_dump() for p in _predictions.get_history(limit)]


# ══════════════════════════════════════════════════════════════════════════════
# EXECUTE TOOLS — approval-gated, audit-logged
# ══════════════════════════════════════════════════════════════════════════════

@mcp.tool()
async def place_order(
    wallet_id: str, token_id: str, side: str, amount: str,
    order_type: str = "MARKET", price: str = "", units: str = "USDC",
    prediction_id: str = "",
) -> dict:
    """[EXECUTE] Place a trade on Polymarket. REQUIRES APPROVAL if gate is enabled.
    Returns action_id when pending; call approve_action to execute.
    In simulation mode, no real trades are placed."""
    from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits

    order_req = PolygonOrderRequest(
        token_id=token_id, side=OrderSide(side), type=OrderType(order_type),
        amount=amount, price=price or None, units=OrderUnits(units),
    )

    positions = await _portfolio.get_positions(wallet_id)
    balance = await _portfolio.get_balance(wallet_id)
    risk_result = _risk.check_order(order_req, positions, balance)

    if not risk_result.approved:
        _audit.log("place_order", "execute", params={"token_id": token_id, "side": side, "amount": amount},
                    success=False, error="Risk check failed", mode=_mode)
        return {"success": False, "error": "Risk check failed", "reasons": risk_result.blocking_reasons}

    params = {"wallet_id": wallet_id, "token_id": token_id, "side": side, "amount": amount,
              "order_type": order_type, "price": price, "units": units}

    action = _gate.submit(
        action_type="place_order", params=params,
        prediction_id=prediction_id or None,
        risk_summary=risk_result.model_dump(),
    )
    _audit.log("place_order_submitted", "execute", params=params,
               result={"action_id": action.action_id, "status": action.status}, mode=_mode)

    if action.status == "approved":
        result = await _order_execution.place_polygon_order(wallet_id, order_req)
        _gate.mark_executed(action.action_id)
        _audit.log("place_order_executed", "execute", params=params,
                    result={"simulated": result.simulated, "message": result.message}, mode=_mode)
        return {
            "success": True, "simulated": result.simulated, "message": result.message,
            "order": result.order if isinstance(result.order, dict) else (result.order.model_dump() if result.order else None),
            "risk_warnings": risk_result.warnings,
        }

    return {
        "success": True, "status": "pending_approval",
        "action_id": action.action_id,
        "message": f"Action {action.action_id} submitted for approval. Call approve_action('{action.action_id}') to execute.",
        "risk_warnings": risk_result.warnings,
    }


@mcp.tool()
async def cancel_order(wallet_id: str, order_id: str) -> dict:
    """[EXECUTE] Cancel an open order. Requires approval if gate is enabled."""
    params = {"wallet_id": wallet_id, "order_id": order_id}
    action = _gate.submit(action_type="cancel_order", params=params)
    _audit.log("cancel_order_submitted", "execute", params=params,
               result={"action_id": action.action_id, "status": action.status}, mode=_mode)

    if action.status == "approved":
        await _order_execution.cancel_order(wallet_id, order_id)
        _gate.mark_executed(action.action_id)
        _audit.log("cancel_order_executed", "execute", params=params, mode=_mode)
        return {"success": True, "cancelled": order_id}

    return {"success": True, "status": "pending_approval", "action_id": action.action_id,
            "message": f"Call approve_action('{action.action_id}') to execute."}


@mcp.tool()
async def simulate_order(
    wallet_id: str, token_id: str, side: str, amount: str,
    order_type: str = "MARKET", price: str = "",
) -> dict:
    """[READ] Simulate a trade — estimated fill, slippage, cost. Always safe."""
    from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits
    order_req = PolygonOrderRequest(
        token_id=token_id, side=OrderSide(side), type=OrderType(order_type),
        amount=amount, price=price or None, units=OrderUnits.USDC,
    )
    sim = await _order_execution.simulate_polygon_order(wallet_id, order_req)
    _audit.log("simulate_order", "read", params={"token_id": token_id, "side": side, "amount": amount}, mode=_mode)
    return sim.model_dump()


@mcp.tool()
async def get_open_orders(wallet_id: str) -> list[dict]:
    """[READ] Get all open/active orders for a wallet."""
    orders = await _order_execution.get_active_orders(wallet_id)
    _audit.log("get_open_orders", "read", params={"wallet_id": wallet_id}, mode=_mode)
    return [o.model_dump() for o in orders]


# ══════════════════════════════════════════════════════════════════════════════
# ADMIN TOOLS — approval management, audit, config
# ══════════════════════════════════════════════════════════════════════════════

@mcp.tool()
async def approve_action(action_id: str) -> dict:
    """[ADMIN] Approve a pending execution action, then execute it."""
    action = _gate.approve(action_id)
    if not action:
        return {"success": False, "error": f"Action {action_id} not found or expired"}

    _audit.log("approve_action", "approve", params={"action_id": action_id}, mode=_mode)

    if action.action_type == "place_order":
        from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits
        p = action.params
        order_req = PolygonOrderRequest(
            token_id=p["token_id"], side=OrderSide(p["side"]),
            type=OrderType(p.get("order_type", "MARKET")),
            amount=p["amount"], price=p.get("price") or None,
            units=OrderUnits(p.get("units", "USDC")),
        )
        result = await _order_execution.place_polygon_order(p["wallet_id"], order_req)
        _gate.mark_executed(action_id)
        _audit.log("place_order_executed", "execute", params=p,
                    result={"simulated": result.simulated}, action_id=action_id, mode=_mode)
        return {"success": True, "executed": True, "simulated": result.simulated, "message": result.message}

    if action.action_type == "cancel_order":
        p = action.params
        await _order_execution.cancel_order(p["wallet_id"], p["order_id"])
        _gate.mark_executed(action_id)
        _audit.log("cancel_order_executed", "execute", params=p, action_id=action_id, mode=_mode)
        return {"success": True, "executed": True, "cancelled": p["order_id"]}

    return {"success": True, "approved": True, "action": action.model_dump()}


@mcp.tool()
async def reject_action(action_id: str, reason: str = "") -> dict:
    """[ADMIN] Reject a pending execution action."""
    action = _gate.reject(action_id, reason=reason)
    if not action:
        return {"success": False, "error": f"Action {action_id} not found or expired"}
    _audit.log("reject_action", "approve", params={"action_id": action_id, "reason": reason}, mode=_mode)
    return {"success": True, "rejected": True, "action": action.model_dump()}


@mcp.tool()
async def get_pending_actions() -> list[dict]:
    """[ADMIN] Get all pending actions waiting for approval."""
    return [a.model_dump() for a in _gate.get_pending()]


@mcp.tool()
async def get_audit_log(category: str = "", limit: int = 50) -> list[dict]:
    """[ADMIN] Query the audit log. category: 'read', 'execute', 'predict', 'approve', 'admin'."""
    entries = _audit.query(category=category or None, limit=limit)
    return [e.model_dump() for e in entries]


@mcp.tool()
def get_desk_config() -> dict:
    """[ADMIN] Get current trading desk configuration."""
    return {
        "simulation_mode": _settings.simulation_mode,
        "require_approval": _settings.require_approval,
        "base_url": _settings.base_url,
        "risk_config": _risk.config.model_dump(),
        "allowed_venues": _settings.allowed_venues,
        "openai_model": _settings.openai_model,
        "predictions_available": _predictions is not None,
    }


@mcp.tool()
async def update_risk_limits(
    max_position_usdc: float = 0, max_single_order_usdc: float = 0, max_daily_loss_usdc: float = 0,
) -> dict:
    """[ADMIN] Update risk management parameters. Pass 0 to keep current value."""
    updates: dict = {}
    if max_position_usdc > 0:
        updates["max_position_usdc"] = max_position_usdc
    if max_single_order_usdc > 0:
        updates["max_single_order_usdc"] = max_single_order_usdc
    if max_daily_loss_usdc > 0:
        updates["max_daily_loss_usdc"] = max_daily_loss_usdc
    if updates:
        _risk.update_config(**updates)
    _audit.log("update_risk_limits", "admin", params=updates, mode=_mode)
    return _risk.config.model_dump()
