from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()


def _reg(request: Request):
    return request.app.state.islands


class SubmitActionBody(BaseModel):
    action_type: str
    params: dict = {}
    prediction_id: str | None = None


class RejectBody(BaseModel):
    reason: str = ""


@router.get("/pending")
async def get_pending(request: Request):
    reg = _reg(request)
    pending = reg.gate.get_pending()
    return {"success": True, "data": [a.model_dump() for a in pending]}


@router.post("/submit")
async def submit_action(request: Request, body: SubmitActionBody):
    reg = _reg(request)
    action = reg.gate.submit(
        action_type=body.action_type,
        params=body.params,
        prediction_id=body.prediction_id,
    )
    mode = "sim" if reg.settings.simulation_mode else "live"
    reg.audit.log("submit_action", "execute", params=body.model_dump(), result={"action_id": action.action_id, "status": action.status}, mode=mode)
    return {"success": True, "data": action.model_dump()}


@router.post("/{action_id}/approve")
async def approve_action(request: Request, action_id: str):
    reg = _reg(request)
    action = reg.gate.approve(action_id)
    if not action:
        raise HTTPException(404, f"Pending action {action_id} not found or expired")
    mode = "sim" if reg.settings.simulation_mode else "live"
    reg.audit.log("approve_action", "approve", params={"action_id": action_id}, result=action.model_dump(), mode=mode)
    return {"success": True, "data": action.model_dump()}


@router.post("/{action_id}/reject")
async def reject_action(request: Request, action_id: str, body: RejectBody):
    reg = _reg(request)
    action = reg.gate.reject(action_id, reason=body.reason)
    if not action:
        raise HTTPException(404, f"Pending action {action_id} not found or expired")
    mode = "sim" if reg.settings.simulation_mode else "live"
    reg.audit.log("reject_action", "approve", params={"action_id": action_id, "reason": body.reason}, mode=mode)
    return {"success": True, "data": action.model_dump()}


@router.get("/history")
async def approval_history(request: Request, limit: int = 50):
    reg = _reg(request)
    return {"success": True, "data": [a.model_dump() for a in reg.gate.get_history(limit)]}
