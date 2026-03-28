from __future__ import annotations

from fastapi import APIRouter, Request

router = APIRouter()


def _islands(request: Request):
    return request.app.state.islands


@router.get("/cross-venue")
async def find_cross_venue_arbs(request: Request, min_spread: float = 0.03):
    opps = await _islands(request).arbitrage.find_cross_venue_arbs(min_spread=min_spread)
    return {"success": True, "data": [o.model_dump() for o in opps]}


@router.get("/event-pricing/{event_id}")
async def analyze_event_pricing(request: Request, event_id: str, venue: str = "polymarket"):
    analysis = await _islands(request).arbitrage.analyze_event_pricing(event_id, venue=venue)
    return {"success": True, "data": analysis}
