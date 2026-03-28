"""Synth AI trading desk routes — prediction, analysis, and guarded execution."""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from synthesis.ai.engine import SynthAIEngine
from synthesis.ai.models import MarketAnalysis, Prediction, TradeProposal

router = APIRouter()


def _get_ai(request: Request) -> SynthAIEngine:
    ai = getattr(request.app.state, "ai_engine", None)
    if ai is None:
        raise HTTPException(503, "AI engine not configured — set OPENAI_API_KEY in .env")
    return ai


# --- Request models ---

class ScanRequest(BaseModel):
    query: str = ""
    venue: str = ""
    limit: int = 10
    wallet_id: str = ""


class AnalyzeMarketRequest(BaseModel):
    token_id: str
    condition_id: str = ""
    market_id: str = ""
    wallet_id: str = ""


class ApproveProposalRequest(BaseModel):
    proposal_index: int
    wallet_id: str


class PortfolioReviewRequest(BaseModel):
    wallet_id: str


# --- Scan & predict ---

@router.post("/scan", response_model=MarketAnalysis)
async def scan_markets(req: ScanRequest, request: Request):
    """Scan markets with AI analysis — returns predictions and trade proposals."""
    ai = _get_ai(request)
    islands = request.app.state.islands

    events = await islands.market_discovery.search_markets(
        query=req.query or None, venue=req.venue or None, limit=req.limit,
    )

    markets = []
    for ev in events:
        for mkt in ev.markets:
            markets.append({
                "event_title": ev.event.title,
                "market_name": mkt.name,
                "venue": ev.venue or mkt.venue,
                "yes_price": str(mkt.left_price),
                "no_price": str(mkt.right_price),
                "volume": str(mkt.volume),
                "volume_24h": str(mkt.volume24hr),
                "liquidity": str(mkt.liquidity),
                "token_id": mkt.primary_token_id,
                "condition_id": mkt.condition_id,
                "market_id": mkt.market_id,
                "active": mkt.active,
                "ends_at": mkt.ends_at,
            })

    portfolio_ctx = "No portfolio data"
    if req.wallet_id:
        try:
            balance = await islands.portfolio.get_balance(req.wallet_id)
            positions = await islands.portfolio.get_positions(req.wallet_id)
            portfolio_ctx = (
                f"Balance: ${balance.available} available. "
                f"{len(positions)} open positions."
            )
        except Exception:
            pass

    analysis = await ai.analyze_markets(markets, portfolio_context=portfolio_ctx)

    # Stash latest analysis for approval flow
    request.app.state.latest_analysis = analysis
    return analysis


@router.post("/analyze", response_model=Prediction)
async def analyze_market(req: AnalyzeMarketRequest, request: Request):
    """Deep AI analysis of a single market."""
    ai = _get_ai(request)
    islands = request.app.state.islands

    # Fetch market data
    events = await islands.market_discovery.search_markets(limit=50)
    market_data = None
    for ev in events:
        for mkt in ev.markets:
            if mkt.primary_token_id == req.token_id or mkt.condition_id == req.condition_id:
                market_data = {
                    "event_title": ev.event.title,
                    "market_name": mkt.name,
                    "venue": ev.venue or mkt.venue,
                    "yes_price": str(mkt.left_price),
                    "no_price": str(mkt.right_price),
                    "volume": str(mkt.volume),
                    "volume_24h": str(mkt.volume24hr),
                    "liquidity": str(mkt.liquidity),
                    "token_id": mkt.primary_token_id,
                    "ends_at": mkt.ends_at,
                }
                break
        if market_data:
            break

    if not market_data:
        raise HTTPException(404, f"Market {req.token_id} not found")

    # Fetch enrichment data
    orderbook = trades = price_history = None
    try:
        book = await islands.market_discovery.get_orderbook(req.token_id)
        orderbook = book.model_dump()
    except Exception:
        pass
    if req.condition_id:
        try:
            t = await islands.market_discovery.get_trades(req.condition_id, limit=20)
            trades = [x.model_dump() for x in t]
        except Exception:
            pass
    try:
        ph = await islands.market_discovery.get_price_history(req.token_id, points=30)
        price_history = [x.model_dump() for x in ph]
    except Exception:
        pass

    portfolio_ctx = "No portfolio data"
    if req.wallet_id:
        try:
            balance = await islands.portfolio.get_balance(req.wallet_id)
            portfolio_ctx = f"Balance: ${balance.available} available"
        except Exception:
            pass

    prediction = await ai.analyze_single_market(
        market_data, orderbook=orderbook, trades=trades,
        price_history=price_history, portfolio_context=portfolio_ctx,
    )
    return prediction


@router.post("/portfolio-review")
async def portfolio_review(req: PortfolioReviewRequest, request: Request):
    """AI-powered portfolio review with optimization suggestions."""
    ai = _get_ai(request)
    islands = request.app.state.islands

    balance = await islands.portfolio.get_balance(req.wallet_id)
    positions = await islands.portfolio.get_positions(req.wallet_id)
    pnl = await islands.portfolio.get_pnl(req.wallet_id)
    exposure = islands.risk.get_exposure(positions)

    # Get some market context
    market_conditions = []
    try:
        momentum = await islands.strategy.scan_momentum(limit=5)
        market_conditions = [s.model_dump() for s in momentum]
    except Exception:
        pass

    result = await ai.review_portfolio(
        positions=[p.model_dump() for p in positions],
        balance=balance.model_dump(),
        pnl=pnl.model_dump(),
        exposure=exposure.model_dump(),
        market_conditions=market_conditions,
    )
    return result


# --- Approval & execution ---

@router.post("/approve")
async def approve_proposal(req: ApproveProposalRequest, request: Request):
    """Approve a trade proposal from the latest analysis for execution."""
    islands = request.app.state.islands
    settings = request.app.state.settings
    latest: MarketAnalysis | None = getattr(request.app.state, "latest_analysis", None)

    if not latest or req.proposal_index >= len(latest.proposals):
        raise HTTPException(404, "No proposal at that index — run /synth/scan first")

    proposal = latest.proposals[req.proposal_index]

    # Confidence gate
    if proposal.prediction.confidence < settings.confidence_threshold:
        raise HTTPException(
            400,
            f"Confidence {proposal.prediction.confidence:.2f} below threshold "
            f"{settings.confidence_threshold:.2f}",
        )

    # Risk check
    from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits
    order_req = PolygonOrderRequest(
        token_id=proposal.token_id,
        side=OrderSide(proposal.suggested_side),
        type=OrderType(proposal.order_type),
        amount=str(proposal.suggested_amount_usdc),
        units=OrderUnits.USDC,
    )
    positions = await islands.portfolio.get_positions(req.wallet_id)
    balance = await islands.portfolio.get_balance(req.wallet_id)
    risk_result = islands.risk.check_order(order_req, positions, balance)

    if not risk_result.approved:
        raise HTTPException(403, {"error": "Risk check failed", "reasons": risk_result.blocking_reasons})

    # Execute (simulation or live based on settings)
    result = await islands.order_execution.place_polygon_order(req.wallet_id, order_req)

    proposal.approved = True
    proposal.executed = True
    proposal.execution_result = {
        "success": result.success,
        "simulated": result.simulated,
        "message": result.message,
    }

    return {
        "approved": True,
        "executed": True,
        "simulated": result.simulated,
        "message": result.message,
        "proposal": proposal.model_dump(),
        "risk_warnings": risk_result.warnings,
    }


# --- Audit ---

@router.get("/audit")
async def get_audit_log(request: Request):
    """Get the AI engine's audit log."""
    ai = _get_ai(request)
    return {"entries": ai.get_audit_log()}


@router.get("/status")
async def get_status(request: Request):
    """Get current Synth desk status."""
    settings = request.app.state.settings
    latest: MarketAnalysis | None = getattr(request.app.state, "latest_analysis", None)
    return {
        "ai_enabled": bool(settings.openai_api_key),
        "model": settings.openai_model,
        "simulation_mode": settings.simulation_mode,
        "confidence_threshold": settings.confidence_threshold,
        "risk_limits": {
            "max_position_usdc": settings.max_position_usdc,
            "max_single_order_usdc": settings.max_single_order_usdc,
            "max_daily_loss_usdc": settings.max_daily_loss_usdc,
        },
        "latest_analysis": {
            "predictions": len(latest.predictions) if latest else 0,
            "proposals": len(latest.proposals) if latest else 0,
            "created_at": latest.created_at if latest else None,
        },
    }
