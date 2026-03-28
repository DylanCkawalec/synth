from __future__ import annotations

from fastapi import APIRouter, Request

router = APIRouter()


def _islands(request: Request):
    return request.app.state.islands


@router.get("/wallets")
async def get_wallets(request: Request):
    wallets = await _islands(request).portfolio.get_all_wallets()
    return {"success": True, "data": [w.model_dump() for w in wallets]}


@router.get("/wallets/polygon")
async def get_polygon_wallets(request: Request):
    wallets = await _islands(request).portfolio.get_polygon_wallets()
    return {"success": True, "data": [w.model_dump() for w in wallets]}


@router.get("/wallets/solana")
async def get_solana_wallets(request: Request):
    wallets = await _islands(request).portfolio.get_solana_wallets()
    return {"success": True, "data": [w.model_dump() for w in wallets]}


@router.get("/wallet/{wallet_id}/balance")
async def get_balance(request: Request, wallet_id: str):
    balance = await _islands(request).portfolio.get_balance(wallet_id)
    return {"success": True, "data": balance.model_dump()}


@router.get("/wallet/{wallet_id}/positions")
async def get_positions(request: Request, wallet_id: str):
    positions = await _islands(request).portfolio.get_positions(wallet_id)
    return {"success": True, "data": [p.model_dump() for p in positions]}


@router.get("/wallet/{wallet_id}/pnl")
async def get_pnl(request: Request, wallet_id: str, interval: str | None = None):
    pnl = await _islands(request).portfolio.get_pnl(wallet_id, interval=interval)
    return {"success": True, "data": pnl.model_dump()}


@router.get("/wallet/{wallet_id}/orders")
async def get_orders(request: Request, wallet_id: str, limit: int = 50, offset: int = 0):
    orders = await _islands(request).portfolio.get_orders(wallet_id, limit=limit, offset=offset)
    return {"success": True, "data": [o.model_dump() for o in orders]}


@router.get("/wallet/{wallet_id}/transfers")
async def get_transfers(request: Request, wallet_id: str, limit: int = 50, offset: int = 0):
    transfers = await _islands(request).portfolio.get_transfers(wallet_id, limit=limit, offset=offset)
    return {"success": True, "data": [t.model_dump() for t in transfers]}


@router.get("/wallet/{wallet_id}/trades")
async def get_trades(request: Request, wallet_id: str):
    trades = await _islands(request).portfolio.get_trades(wallet_id)
    return {"success": True, "data": trades}
