from __future__ import annotations

from typing import Any

from synthesis.core.http import SynthesisHTTPClient
from synthesis.core.models import EventWithMarkets, Market, OrderBook, Trade, PricePoint, Candlestick


class MarketDiscoveryIsland:
    """Search, filter, and analyze prediction markets across Polymarket and Kalshi."""

    def __init__(self, http: SynthesisHTTPClient) -> None:
        self._http = http

    async def search_markets(
        self,
        query: str | None = None,
        venue: str | None = None,
        active: bool = True,
        limit: int = 20,
        offset: int = 0,
        tags: list[str] | None = None,
        labels: list[str] | None = None,
        sort: str = "volume",
        order: str = "DESC",
        min_price: float | None = None,
        max_price: float | None = None,
    ) -> list[EventWithMarkets]:
        """Search unified markets across venues with filtering."""
        if query:
            data = await self._http.get(f"/markets/search/{query}")
            return [EventWithMarkets(**item) for item in (data if isinstance(data, list) else [data])]

        params: dict[str, Any] = {"limit": limit, "offset": offset, "sort": sort, "order": order}
        if venue:
            params["venue"] = venue
        if tags:
            params["tags"] = ",".join(tags)
        if labels:
            params["labels"] = ",".join(labels)
        if min_price is not None:
            params["min_price"] = str(min_price)
        if max_price is not None:
            params["max_price"] = str(max_price)

        data = await self._http.get("/markets", params=params)
        items = data if isinstance(data, list) else data.get("data", data.get("events", [data]))
        return [EventWithMarkets(**item) if isinstance(item, dict) else item for item in items]

    async def get_polymarket_markets(
        self, limit: int = 20, offset: int = 0, sort: str = "volume", order: str = "DESC", **filters: Any,
    ) -> list[EventWithMarkets]:
        params: dict[str, Any] = {"limit": limit, "offset": offset, "sort": sort, "order": order, **filters}
        data = await self._http.get("/polymarket/markets", params=params)
        items = data if isinstance(data, list) else data.get("data", data.get("events", []))
        return [EventWithMarkets(**item) for item in items]

    async def get_kalshi_markets(
        self, limit: int = 20, offset: int = 0, sort: str = "volume", order: str = "DESC", **filters: Any,
    ) -> list[EventWithMarkets]:
        params: dict[str, Any] = {"limit": limit, "offset": offset, "sort": sort, "order": order, **filters}
        data = await self._http.get("/kalshi/markets", params=params)
        items = data if isinstance(data, list) else data.get("data", data.get("events", []))
        return [EventWithMarkets(**item) for item in items]

    async def get_polymarket_event(self, event_id: str) -> EventWithMarkets:
        data = await self._http.get(f"/polymarket/market/event/{event_id}")
        return EventWithMarkets(**data)

    async def get_polymarket_by_slug(self, slug: str) -> EventWithMarkets:
        data = await self._http.get(f"/polymarket/market/slug/{slug}")
        return EventWithMarkets(**data)

    async def get_polymarket_by_condition(self, condition_id: str) -> Market:
        data = await self._http.get(f"/polymarket/market/{condition_id}")
        return Market(**data)

    async def get_kalshi_event(self, event_id: str) -> EventWithMarkets:
        data = await self._http.get(f"/kalshi/market/event/{event_id}")
        return EventWithMarkets(**data)

    async def get_kalshi_by_slug(self, slug: str) -> EventWithMarkets:
        data = await self._http.get(f"/kalshi/market/slug/{slug}")
        return EventWithMarkets(**data)

    async def get_orderbook(self, token_id: str) -> OrderBook:
        data = await self._http.post("/markets/orderbooks", json={"markets": [token_id]})
        if isinstance(data, list) and data:
            return OrderBook(**data[0])
        if isinstance(data, dict):
            books = data.get("data", data.get("orderbooks", [data]))
            if books:
                return OrderBook(**(books[0] if isinstance(books, list) else books))
        return OrderBook(token_id=token_id)

    async def get_orderbooks(self, token_ids: list[str]) -> list[OrderBook]:
        data = await self._http.post("/markets/orderbooks", json={"markets": token_ids})
        items = data if isinstance(data, list) else data.get("data", data.get("orderbooks", []))
        return [OrderBook(**item) for item in items]

    async def get_prices(self, market_ids: list[str]) -> dict[str, str]:
        data = await self._http.post("/markets/prices", json={"markets": market_ids})
        if isinstance(data, dict):
            return data
        return {}

    async def get_trades(self, condition_id: str, limit: int = 50) -> list[Trade]:
        data = await self._http.get(f"/polymarket/market/{condition_id}/trades", params={"limit": limit})
        items = data if isinstance(data, list) else data.get("data", data.get("trades", []))
        return [Trade(**item) for item in items]

    async def get_kalshi_trades(self, market_id: str, limit: int = 50) -> list[Trade]:
        data = await self._http.get(f"/kalshi/market/{market_id}/trades", params={"limit": limit})
        items = data if isinstance(data, list) else data.get("data", data.get("trades", []))
        return [Trade(**item) for item in items]

    async def get_price_history(self, token_id: str, start: str | None = None, end: str | None = None, points: int = 100) -> list[PricePoint]:
        params: dict[str, Any] = {"points": points}
        if start:
            params["start"] = start
        if end:
            params["end"] = end
        data = await self._http.get(f"/polymarket/market/{token_id}/price-history", params=params)
        items = data if isinstance(data, list) else data.get("data", data.get("history", []))
        return [PricePoint(**item) for item in items]

    async def get_sparklines(self, market_ids: list[str]) -> dict[str, list[PricePoint]]:
        data = await self._http.post("/markets/sparklines", json={"markets": market_ids})
        if isinstance(data, dict):
            return {k: [PricePoint(**p) for p in v] if isinstance(v, list) else [] for k, v in data.items()}
        return {}

    async def get_statistics(self, venue: str | None = None) -> dict:
        params = {"venue": venue} if venue else {}
        return await self._http.get("/markets/statistics", params=params)

    async def get_related(self, slug: str) -> list[EventWithMarkets]:
        data = await self._http.get(f"/markets/related/{slug}")
        items = data if isinstance(data, list) else data.get("data", [])
        return [EventWithMarkets(**item) for item in items]

    async def get_similar_pairs(self) -> list[dict]:
        data = await self._http.get("/markets/similar-pairs")
        return data if isinstance(data, list) else data.get("data", [])
