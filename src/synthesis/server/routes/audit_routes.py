from __future__ import annotations

from fastapi import APIRouter, Request

router = APIRouter()


def _reg(request: Request):
    return request.app.state.islands


@router.get("/tail")
async def audit_tail(request: Request, n: int = 50):
    entries = _reg(request).audit.tail(n)
    return {"success": True, "data": [e.model_dump() for e in entries]}


@router.get("/query")
async def audit_query(request: Request, category: str | None = None, action: str | None = None, limit: int = 100, since: str | None = None):
    entries = _reg(request).audit.query(category=category, action=action, limit=limit, since=since)
    return {"success": True, "data": [e.model_dump() for e in entries]}
