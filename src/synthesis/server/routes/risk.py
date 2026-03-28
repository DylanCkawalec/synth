from __future__ import annotations

from fastapi import APIRouter, Request
from pydantic import BaseModel

from synthesis.core.models import PolygonOrderRequest, OrderSide, OrderType, OrderUnits

router = APIRouter()


def _islands(request: Request):
    return request.app.state.islands


class RiskCheckBody(BaseModel):
    wallet_id: str
    token_id: str
    side: str
    type: str = "MARKET"
    amount: str
    price: str | None = None
    units: str = "USDC"


class UpdateRiskBody(BaseModel):
    max_position_usdc: float | None = None
    max_single_order_usdc: float | None = None
    max_daily_loss_usdc: float | None = None
    max_open_positions: int | None = None
    require_confirmation_above: float | None = None


@router.post("/check")
async def check_risk(request: Request, body: RiskCheckBody):
    islands = _islands(request)
    order = PolygonOrderRequest(
        token_id=body.token_id,
        side=OrderSide(body.side),
        type=OrderType(body.type),
        amount=body.amount,
        price=body.price,
        units=OrderUnits(body.units),
    )
    positions = await islands.portfolio.get_positions(body.wallet_id)
    balance = await islands.portfolio.get_balance(body.wallet_id)
    result = islands.risk.check_order(order, positions, balance)
    return {"success": True, "data": result.model_dump()}


@router.get("/exposure/{wallet_id}")
async def get_exposure(request: Request, wallet_id: str):
    islands = _islands(request)
    positions = await islands.portfolio.get_positions(wallet_id)
    exposure = islands.risk.get_exposure(positions)
    return {"success": True, "data": exposure.model_dump()}


@router.get("/daily-loss/{wallet_id}")
async def check_daily_loss(request: Request, wallet_id: str):
    islands = _islands(request)
    pnl = await islands.portfolio.get_pnl(wallet_id, interval="1d")
    result = islands.risk.check_daily_loss(pnl)
    return {"success": True, "data": result.model_dump()}


@router.get("/config")
async def get_risk_config(request: Request):
    return {"success": True, "data": _islands(request).risk.config.model_dump()}


@router.post("/config")
async def update_risk_config(request: Request, body: UpdateRiskBody):
    updates = body.model_dump(exclude_none=True)
    config = _islands(request).risk.update_config(**updates)
    return {"success": True, "data": config.model_dump()}


@router.get("/kelly")
async def kelly_criterion(request: Request, win_prob: float, odds: float):
    fraction = _islands(request).risk.kelly_criterion(win_prob, odds)
    return {"success": True, "data": {"kelly_fraction": fraction, "win_prob": win_prob, "odds": odds}}
