from __future__ import annotations

from fastapi import APIRouter, Request

router = APIRouter()


def _islands(request: Request):
    return request.app.state.islands


@router.get("/momentum")
async def scan_momentum(request: Request, venue: str | None = None, limit: int = 10):
    signals = await _islands(request).strategy.scan_momentum(venue=venue, limit=limit)
    return {"success": True, "data": [s.model_dump() for s in signals]}


@router.get("/value")
async def scan_value(request: Request, max_price: float = 0.15, venue: str | None = None, limit: int = 10):
    signals = await _islands(request).strategy.scan_value(max_price=max_price, venue=venue, limit=limit)
    return {"success": True, "data": [s.model_dump() for s in signals]}


@router.get("/volume-spike")
async def scan_volume_spike(request: Request, threshold: float = 3.0, venue: str | None = None, limit: int = 10):
    signals = await _islands(request).strategy.scan_volume_spike(threshold=threshold, venue=venue, limit=limit)
    return {"success": True, "data": [s.model_dump() for s in signals]}
