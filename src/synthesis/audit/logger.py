"""Append-only JSONL audit log for every action through Synth."""

from __future__ import annotations

import json
import logging
import os
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class AuditEntry(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    action: str
    category: str  # read, execute, predict, approve, admin
    params: dict[str, Any] = {}
    result: dict[str, Any] | None = None
    user: str = "operator"
    success: bool = True
    error: str | None = None
    prediction_id: str | None = None
    action_id: str | None = None
    mode: str = "sim"  # sim or live


class AuditLogger:
    def __init__(self, log_dir: str = "data", max_memory: int = 2000) -> None:
        self._dir = Path(log_dir)
        self._dir.mkdir(parents=True, exist_ok=True)
        self._path = self._dir / "audit.jsonl"
        self._buffer: deque[AuditEntry] = deque(maxlen=max_memory)
        self._lock = Lock()

        if self._path.exists():
            try:
                for line in self._path.read_text().strip().split("\n")[-max_memory:]:
                    if line.strip():
                        self._buffer.append(AuditEntry(**json.loads(line)))
            except Exception:
                pass

    def log(
        self,
        action: str,
        category: str,
        params: dict[str, Any] | None = None,
        result: dict[str, Any] | None = None,
        success: bool = True,
        error: str | None = None,
        prediction_id: str | None = None,
        action_id: str | None = None,
        mode: str = "sim",
    ) -> AuditEntry:
        entry = AuditEntry(
            action=action,
            category=category,
            params=params or {},
            result=result,
            success=success,
            error=error,
            prediction_id=prediction_id,
            action_id=action_id,
            mode=mode,
        )
        with self._lock:
            self._buffer.append(entry)
            try:
                with open(self._path, "a") as f:
                    f.write(entry.model_dump_json() + "\n")
            except OSError as exc:
                logger.warning("audit write failed: %s", exc)
        return entry

    def query(
        self,
        category: str | None = None,
        action: str | None = None,
        limit: int = 100,
        since: str | None = None,
    ) -> list[AuditEntry]:
        entries = list(self._buffer)
        if category:
            entries = [e for e in entries if e.category == category]
        if action:
            entries = [e for e in entries if e.action == action]
        if since:
            entries = [e for e in entries if e.timestamp >= since]
        return list(reversed(entries[-limit:]))

    def tail(self, n: int = 50) -> list[AuditEntry]:
        return list(reversed(list(self._buffer)[-n:]))
