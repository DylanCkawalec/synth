from __future__ import annotations

from fastapi import APIRouter, Request
from pydantic import BaseModel

from synthesis.core.models import PolygonOrderRequest, SolanaOrderRequest, OrderSide, OrderType, OrderUnits

router = APIRouter()


def _islands(request: Request):
    return request.app.state.islands


class PlacePolygonOrderBody(BaseModel):
    token_id: str
    side: str  # BUY or SELL
    type: str = "MARKET"  # MARKET, LIMIT, STOPLOSS
    amount: str
    price: str | None = None
    units: str = "USDC"


class PlaceSolanaOrderBody(BaseModel):
    token_id: str
    side: str
    amount: str
    slippage: int | None = None


@router.post("/polygon/{wallet_id}")
async def place_polygon_order(request: Request, wallet_id: str, body: PlacePolygonOrderBody):
    islands = _islands(request)

    order_req = PolygonOrderRequest(
        token_id=body.token_id,
        side=OrderSide(body.side),
        type=OrderType(body.type),
        amount=body.amount,
        price=body.price,
        units=OrderUnits(body.units),
    )

    # Risk check first
    positions = await islands.portfolio.get_positions(wallet_id)
    balance = await islands.portfolio.get_balance(wallet_id)
    risk_result = islands.risk.check_order(order_req, positions, balance)

    if not risk_result.approved:
        return {
            "success": False,
            "error": "Risk check failed",
            "reasons": risk_result.blocking_reasons,
            "warnings": risk_result.warnings,
        }

    result = await islands.order_execution.place_polygon_order(wallet_id, order_req)
    return {
        "success": True,
        "data": result.model_dump(),
        "risk_warnings": risk_result.warnings,
        "simulation": result.simulated,
    }


@router.post("/solana/{wallet_id}")
async def place_solana_order(request: Request, wallet_id: str, body: PlaceSolanaOrderBody):
    islands = _islands(request)

    order_req = SolanaOrderRequest(
        token_id=body.token_id,
        side=OrderSide(body.side),
        amount=body.amount,
        slippage=body.slippage,
    )

    result = await islands.order_execution.place_solana_order(wallet_id, order_req)
    return {"success": True, "data": result.model_dump(), "simulation": result.simulated}


@router.post("/simulate/polygon/{wallet_id}")
async def simulate_polygon_order(request: Request, wallet_id: str, body: PlacePolygonOrderBody):
    islands = _islands(request)
    order_req = PolygonOrderRequest(
        token_id=body.token_id,
        side=OrderSide(body.side),
        type=OrderType(body.type),
        amount=body.amount,
        price=body.price,
        units=OrderUnits(body.units),
    )
    sim = await islands.order_execution.simulate_polygon_order(wallet_id, order_req)
    return {"success": True, "data": sim.model_dump()}


@router.delete("/{wallet_id}/{order_id}")
async def cancel_order(request: Request, wallet_id: str, order_id: str):
    await _islands(request).order_execution.cancel_order(wallet_id, order_id)
    return {"success": True, "message": f"Order {order_id} cancelled"}


@router.delete("/{wallet_id}")
async def cancel_all_orders(request: Request, wallet_id: str):
    await _islands(request).order_execution.cancel_all_orders(wallet_id)
    return {"success": True, "message": "All orders cancelled"}


@router.get("/{wallet_id}")
async def get_orders(request: Request, wallet_id: str, limit: int = 50, offset: int = 0):
    orders = await _islands(request).order_execution.get_orders(wallet_id, limit=limit, offset=offset)
    return {"success": True, "data": [o.model_dump() for o in orders]}


@router.get("/{wallet_id}/active")
async def get_active_orders(request: Request, wallet_id: str):
    orders = await _islands(request).order_execution.get_active_orders(wallet_id)
    return {"success": True, "data": [o.model_dump() for o in orders]}
