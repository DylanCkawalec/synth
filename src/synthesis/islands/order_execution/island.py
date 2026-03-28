from __future__ import annotations

from decimal import Decimal

from synthesis.core.http import SynthesisHTTPClient
from synthesis.core.models import (
    PolygonOrderRequest, SolanaOrderRequest, Order, OrderResult, SimulationResult,
)
from synthesis.exceptions import SimulationModeError


class OrderExecutionIsland:
    """Place, cancel, and simulate orders on Polymarket (Polygon) and Kalshi (Solana)."""

    def __init__(self, http: SynthesisHTTPClient, simulation: bool = True) -> None:
        self._http = http
        self.simulation = simulation

    async def place_polygon_order(self, wallet_id: str, order: PolygonOrderRequest) -> OrderResult:
        if self.simulation:
            sim = await self.simulate_polygon_order(wallet_id, order)
            return OrderResult(
                success=True, simulated=True,
                message=f"SIMULATED: est. fill {sim.estimated_fill_price} USDC, slippage {sim.estimated_slippage}",
                order={"token_id": order.token_id, "side": order.side, "amount": order.amount, "simulation": sim.model_dump()},
            )

        data = await self._http.post(
            f"/wallet/pol/{wallet_id}/order",
            json=order.model_dump(exclude_none=True),
        )
        return OrderResult(success=True, order=Order(**data) if isinstance(data, dict) else data)

    async def place_solana_order(self, wallet_id: str, order: SolanaOrderRequest) -> OrderResult:
        if self.simulation:
            return OrderResult(
                success=True, simulated=True,
                message=f"SIMULATED: {order.side} {order.amount} on {order.token_id}",
                order={"token_id": order.token_id, "side": order.side, "amount": order.amount},
            )

        data = await self._http.post(
            f"/wallet/sol/{wallet_id}/order",
            json=order.model_dump(exclude_none=True),
        )
        return OrderResult(success=True, order=Order(**data) if isinstance(data, dict) else data)

    async def get_order_quote(self, wallet_id: str, order: PolygonOrderRequest) -> dict:
        """Get a quote for an order without executing it."""
        return await self._http.post(
            f"/wallet/pol/{wallet_id}/order/quote",
            json=order.model_dump(exclude_none=True),
        )

    async def get_solana_order_quote(self, wallet_id: str, order: SolanaOrderRequest) -> dict:
        return await self._http.post(
            f"/wallet/sol/{wallet_id}/order/quote",
            json=order.model_dump(exclude_none=True),
        )

    async def cancel_order(self, wallet_id: str, order_id: str) -> bool:
        await self._http.delete(f"/wallet/pol/{wallet_id}/order/{order_id}")
        return True

    async def cancel_all_orders(self, wallet_id: str) -> bool:
        await self._http.delete(f"/wallet/pol/{wallet_id}/orders")
        return True

    async def update_order(self, wallet_id: str, order_id: str, updates: dict) -> Order:
        data = await self._http.put(f"/wallet/pol/{wallet_id}/order/{order_id}", json=updates)
        return Order(**data) if isinstance(data, dict) else Order(order_id=order_id)

    async def get_order(self, wallet_id: str, order_id: str) -> Order:
        data = await self._http.get(f"/wallet/pol/{wallet_id}/order/{order_id}", auth="trading")
        return Order(**data) if isinstance(data, dict) else Order(order_id=order_id)

    async def get_orders(self, wallet_id: str, limit: int = 50, offset: int = 0) -> list[Order]:
        data = await self._http.get(
            f"/wallet/pol/{wallet_id}/orders", auth="trading",
            params={"limit": limit, "offset": offset},
        )
        items = data if isinstance(data, list) else data.get("data", data.get("orders", []))
        return [Order(**item) for item in items]

    async def get_active_orders(self, wallet_id: str) -> list[Order]:
        data = await self._http.get(f"/wallet/pol/{wallet_id}/orders/active", auth="trading")
        items = data if isinstance(data, list) else data.get("data", data.get("orders", []))
        return [Order(**item) for item in items]

    async def redeem_position(self, wallet_id: str, condition_id: str) -> dict:
        return await self._http.post(f"/wallet/pol/{wallet_id}/redeem/{condition_id}")

    async def redeem_solana_position(self, wallet_id: str, token_id: str) -> dict:
        return await self._http.post(f"/wallet/sol/{wallet_id}/redeem/{token_id}")

    async def swap(self, wallet_id: str, from_token: str, to_token: str, amount: str) -> dict:
        return await self._http.post(
            f"/wallet/pol/{wallet_id}/swap",
            json={"from": from_token, "to": to_token, "amount": amount},
        )

    async def withdraw(self, wallet_id: str, token: str, amount: str, address: str) -> dict:
        return await self._http.post(
            f"/wallet/pol/{wallet_id}/withdraw",
            json={"token": token, "amount": amount, "address": address},
        )

    async def mint_shares(self, wallet_id: str, condition_id: str, amount: str) -> dict:
        return await self._http.post(
            f"/wallet/pol/{wallet_id}/mint",
            json={"condition_id": condition_id, "amount": amount},
        )

    async def merge_shares(self, wallet_id: str, condition_id: str, amount: str) -> dict:
        return await self._http.post(
            f"/wallet/pol/{wallet_id}/merge",
            json={"condition_id": condition_id, "amount": amount},
        )

    async def simulate_polygon_order(self, wallet_id: str, order: PolygonOrderRequest) -> SimulationResult:
        """Simulate an order using the quote endpoint."""
        try:
            quote = await self.get_order_quote(wallet_id, order)
            return SimulationResult(
                estimated_fill_price=str(quote.get("price", quote.get("avg_price", "0"))),
                estimated_slippage=str(quote.get("slippage", "0")),
                estimated_cost_usdc=str(quote.get("cost", quote.get("total", order.amount))),
                estimated_shares=str(quote.get("shares", quote.get("quantity", "0"))),
            )
        except Exception:
            amount = Decimal(order.amount)
            price = Decimal(order.price) if order.price else Decimal("0.5")
            return SimulationResult(
                estimated_fill_price=str(price),
                estimated_slippage="0.01",
                estimated_cost_usdc=str(amount),
                estimated_shares=str(amount / price if price > 0 else 0),
                orderbook_depth_available=False,
                warnings=["Quote unavailable — using estimate based on order params"],
            )
