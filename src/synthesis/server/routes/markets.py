from __future__ import annotations

from fastapi import APIRouter, Request, Query

router = APIRouter()


def _islands(request: Request):
    return request.app.state.islands


@router.get("")
async def search_markets(
    request: Request,
    query: str | None = None,
    venue: str | None = None,
    active: bool = True,
    limit: int = Query(default=20, le=100),
    offset: int = 0,
    tags: str | None = None,
    sort: str = "volume",
    order: str = "DESC",
    min_price: float | None = None,
    max_price: float | None = None,
):
    islands = _islands(request)
    tag_list = tags.split(",") if tags else None
    events = await islands.market_discovery.search_markets(
        query=query, venue=venue, active=active, limit=limit, offset=offset,
        tags=tag_list, sort=sort, order=order, min_price=min_price, max_price=max_price,
    )
    return {"success": True, "data": [e.model_dump() for e in events]}


@router.get("/polymarket")
async def polymarket_markets(
    request: Request, limit: int = 20, offset: int = 0, sort: str = "volume", order: str = "DESC",
):
    events = await _islands(request).market_discovery.get_polymarket_markets(limit=limit, offset=offset, sort=sort, order=order)
    return {"success": True, "data": [e.model_dump() for e in events]}


@router.get("/kalshi")
async def kalshi_markets(
    request: Request, limit: int = 20, offset: int = 0, sort: str = "volume", order: str = "DESC",
):
    events = await _islands(request).market_discovery.get_kalshi_markets(limit=limit, offset=offset, sort=sort, order=order)
    return {"success": True, "data": [e.model_dump() for e in events]}


@router.get("/polymarket/event/{event_id}")
async def polymarket_event(request: Request, event_id: str):
    event = await _islands(request).market_discovery.get_polymarket_event(event_id)
    return {"success": True, "data": event.model_dump()}


@router.get("/polymarket/slug/{slug}")
async def polymarket_by_slug(request: Request, slug: str):
    event = await _islands(request).market_discovery.get_polymarket_by_slug(slug)
    return {"success": True, "data": event.model_dump()}


@router.get("/kalshi/event/{event_id}")
async def kalshi_event(request: Request, event_id: str):
    event = await _islands(request).market_discovery.get_kalshi_event(event_id)
    return {"success": True, "data": event.model_dump()}


@router.get("/orderbook/{token_id}")
async def get_orderbook(request: Request, token_id: str):
    book = await _islands(request).market_discovery.get_orderbook(token_id)
    return {"success": True, "data": book.model_dump()}


@router.post("/prices")
async def get_prices(request: Request):
    body = await request.json()
    market_ids = body.get("markets", [])
    prices = await _islands(request).market_discovery.get_prices(market_ids)
    return {"success": True, "data": prices}


@router.get("/statistics")
async def get_statistics(request: Request, venue: str | None = None):
    stats = await _islands(request).market_discovery.get_statistics(venue)
    return {"success": True, "data": stats}


@router.get("/similar-pairs")
async def get_similar_pairs(request: Request):
    pairs = await _islands(request).market_discovery.get_similar_pairs()
    return {"success": True, "data": pairs}


@router.get("/search/{query}")
async def search(request: Request, query: str):
    events = await _islands(request).market_discovery.search_markets(query=query)
    return {"success": True, "data": [e.model_dump() for e in events]}
