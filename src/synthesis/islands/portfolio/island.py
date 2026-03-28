from __future__ import annotations

from typing import Any

from synthesis.core.http import SynthesisHTTPClient
from synthesis.core.models import (
    Wallet, Balance, Position, PNL, Transfer, Order,
    CopyTrade, CopyTradeConfig,
)


class PortfolioIsland:
    """Wallet management, positions, PNL, and copytrade operations."""

    def __init__(self, http: SynthesisHTTPClient) -> None:
        self._http = http

    # --- Wallets ---

    async def get_polygon_wallets(self) -> list[Wallet]:
        data = await self._http.get("/wallet/pol", auth="trading")
        items = data if isinstance(data, list) else data.get("data", data.get("wallets", []))
        return [Wallet(**item) for item in items]

    async def get_solana_wallets(self) -> list[Wallet]:
        data = await self._http.get("/wallet/sol", auth="trading")
        items = data if isinstance(data, list) else data.get("data", data.get("wallets", []))
        return [Wallet(**item) for item in items]

    async def get_all_wallets(self) -> list[Wallet]:
        pol = await self.get_polygon_wallets()
        sol = await self.get_solana_wallets()
        return pol + sol

    async def update_wallet(self, wallet_id: str, name: str) -> Wallet:
        data = await self._http.put(f"/wallet/{wallet_id}", json={"name": name})
        return Wallet(**data) if isinstance(data, dict) else Wallet(wallet_id=wallet_id, name=name)

    async def delete_wallet(self, wallet_id: str) -> bool:
        await self._http.delete(f"/wallet/{wallet_id}")
        return True

    # --- Balance ---

    async def get_balance(self, wallet_id: str) -> Balance:
        data = await self._http.get(f"/wallet/{wallet_id}/balance", auth="trading")
        if isinstance(data, dict):
            return Balance(wallet_id=wallet_id, **data)
        return Balance(wallet_id=wallet_id)

    async def get_polygon_balance(self, wallet_id: str) -> Balance:
        data = await self._http.get(f"/wallet/pol/{wallet_id}/balance", auth="trading")
        if isinstance(data, dict):
            return Balance(wallet_id=wallet_id, **data)
        return Balance(wallet_id=wallet_id)

    async def get_solana_balance(self, wallet_id: str) -> Balance:
        data = await self._http.get(f"/wallet/sol/{wallet_id}/balance", auth="trading")
        if isinstance(data, dict):
            return Balance(wallet_id=wallet_id, **data)
        return Balance(wallet_id=wallet_id)

    # --- Positions ---

    async def get_positions(self, wallet_id: str) -> list[Position]:
        data = await self._http.get(f"/wallet/{wallet_id}/positions", auth="trading")
        items = data if isinstance(data, list) else data.get("data", data.get("positions", []))
        return [Position(wallet_id=wallet_id, **item) for item in items]

    # --- PNL ---

    async def get_pnl(self, wallet_id: str, interval: str | None = None) -> PNL:
        params: dict[str, Any] = {}
        if interval:
            params["interval"] = interval
        data = await self._http.get(f"/wallet/{wallet_id}/pnl", auth="trading", params=params or None)
        if isinstance(data, dict):
            return PNL(wallet_id=wallet_id, **data)
        return PNL(wallet_id=wallet_id)

    # --- Orders ---

    async def get_orders(self, wallet_id: str, limit: int = 50, offset: int = 0) -> list[Order]:
        data = await self._http.get(
            f"/wallet/{wallet_id}/orders", auth="trading",
            params={"limit": limit, "offset": offset},
        )
        items = data if isinstance(data, list) else data.get("data", data.get("orders", []))
        return [Order(wallet_id=wallet_id, **item) for item in items]

    async def get_polygon_active_orders(self, wallet_id: str) -> list[Order]:
        data = await self._http.get(f"/wallet/pol/{wallet_id}/orders/active", auth="trading")
        items = data if isinstance(data, list) else data.get("data", data.get("orders", []))
        return [Order(wallet_id=wallet_id, **item) for item in items]

    # --- Transfers ---

    async def get_transfers(self, wallet_id: str, limit: int = 50, offset: int = 0) -> list[Transfer]:
        data = await self._http.get(
            f"/wallet/{wallet_id}/transfers", auth="trading",
            params={"limit": limit, "offset": offset},
        )
        items = data if isinstance(data, list) else data.get("data", data.get("transfers", []))
        return [Transfer(wallet_id=wallet_id, **item) for item in items]

    # --- Trades ---

    async def get_trades(self, wallet_id: str) -> list[dict]:
        data = await self._http.get(f"/wallet/pol/{wallet_id}/trades", auth="trading")
        return data if isinstance(data, list) else data.get("data", data.get("trades", []))

    # --- Deposit ---

    async def get_deposit_address(self, chain_id: str, wallet_id: str, chain: str) -> dict:
        return await self._http.get(f"/wallet/{chain_id}/{wallet_id}/deposit/{chain}", auth="trading")

    # --- Copytrade ---

    async def get_copytrades(self, wallet_id: str) -> list[CopyTrade]:
        data = await self._http.get(f"/wallet/pol/{wallet_id}/copytrade", auth="trading")
        items = data if isinstance(data, list) else data.get("data", data.get("copytrades", []))
        return [CopyTrade(wallet_id=wallet_id, **item) for item in items]

    async def create_copytrade(self, wallet_id: str, config: CopyTradeConfig) -> CopyTrade:
        data = await self._http.post(f"/wallet/pol/{wallet_id}/copytrade", json=config.model_dump())
        return CopyTrade(wallet_id=wallet_id, **data) if isinstance(data, dict) else CopyTrade(wallet_id=wallet_id)

    async def update_copytrade(self, wallet_id: str, copytrade_id: str, config: CopyTradeConfig) -> CopyTrade:
        data = await self._http.put(f"/wallet/pol/{wallet_id}/copytrade/{copytrade_id}", json=config.model_dump())
        return CopyTrade(wallet_id=wallet_id, **data) if isinstance(data, dict) else CopyTrade(wallet_id=wallet_id)

    async def delete_copytrade(self, wallet_id: str, copytrade_id: str) -> bool:
        await self._http.delete(f"/wallet/pol/{wallet_id}/copytrade/{copytrade_id}")
        return True

    async def pause_copytrade(self, wallet_id: str, copytrade_id: str) -> bool:
        await self._http.post(f"/wallet/pol/{wallet_id}/copytrade/{copytrade_id}/pause")
        return True

    async def unpause_copytrade(self, wallet_id: str, copytrade_id: str) -> bool:
        await self._http.post(f"/wallet/pol/{wallet_id}/copytrade/{copytrade_id}/unpause")
        return True
