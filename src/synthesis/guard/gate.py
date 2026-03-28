"""Approval gate — execution tools require explicit operator approval."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class PendingAction(BaseModel):
    action_id: str = Field(default_factory=lambda: uuid4().hex[:12])
    action_type: str  # place_order, cancel_order, cancel_all, update_risk, etc.
    params: dict[str, Any] = {}
    prediction_id: str | None = None
    risk_summary: dict[str, Any] = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "pending"  # pending, approved, rejected, expired, executed
    resolved_at: str | None = None
    ttl_seconds: int = 300


class ApprovalGate:
    def __init__(self, require_approval: bool = True, ttl_seconds: int = 300) -> None:
        self.require_approval = require_approval
        self.ttl_seconds = ttl_seconds
        self._pending: dict[str, PendingAction] = {}
        self._resolved: list[PendingAction] = []

    def submit(
        self,
        action_type: str,
        params: dict[str, Any],
        prediction_id: str | None = None,
        risk_summary: dict[str, Any] | None = None,
    ) -> PendingAction:
        """Submit an action for approval. Returns PendingAction with action_id."""
        action = PendingAction(
            action_type=action_type,
            params=params,
            prediction_id=prediction_id,
            risk_summary=risk_summary or {},
            ttl_seconds=self.ttl_seconds,
        )
        if not self.require_approval:
            action.status = "approved"
            action.resolved_at = datetime.now(timezone.utc).isoformat()
            self._resolved.append(action)
            return action
        self._pending[action.action_id] = action
        return action

    def approve(self, action_id: str) -> PendingAction | None:
        action = self._pending.pop(action_id, None)
        if not action:
            return None
        action.status = "approved"
        action.resolved_at = datetime.now(timezone.utc).isoformat()
        self._resolved.append(action)
        return action

    def reject(self, action_id: str, reason: str = "") -> PendingAction | None:
        action = self._pending.pop(action_id, None)
        if not action:
            return None
        action.status = "rejected"
        action.resolved_at = datetime.now(timezone.utc).isoformat()
        if reason:
            action.risk_summary["rejection_reason"] = reason
        self._resolved.append(action)
        return action

    def mark_executed(self, action_id: str) -> None:
        for a in self._resolved:
            if a.action_id == action_id:
                a.status = "executed"
                return

    def get_pending(self) -> list[PendingAction]:
        self._expire_stale()
        return list(self._pending.values())

    def get_action(self, action_id: str) -> PendingAction | None:
        return self._pending.get(action_id) or next(
            (a for a in self._resolved if a.action_id == action_id), None
        )

    def get_history(self, limit: int = 50) -> list[PendingAction]:
        return list(reversed(self._resolved[-limit:]))

    def _expire_stale(self) -> None:
        now = datetime.now(timezone.utc)
        expired_ids = []
        for aid, action in self._pending.items():
            created = datetime.fromisoformat(action.created_at)
            if (now - created).total_seconds() > action.ttl_seconds:
                expired_ids.append(aid)
        for aid in expired_ids:
            action = self._pending.pop(aid)
            action.status = "expired"
            action.resolved_at = now.isoformat()
            self._resolved.append(action)
