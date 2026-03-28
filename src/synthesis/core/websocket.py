from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Awaitable, Callable
from uuid import uuid4

try:
    import websockets
    from websockets.asyncio.client import connect as ws_connect
except ImportError:
    websockets = None  # type: ignore[assignment]

from synthesis.config import SynthesisSettings
from synthesis.core.auth import AuthManager

logger = logging.getLogger(__name__)

Callback = Callable[[dict[str, Any]], Awaitable[None]]


class SynthesisWSClient:
    """WebSocket client for real-time Synthesis streams with auto-reconnect."""

    CHANNELS = ("orderbook", "trades", "balance", "data", "uma")

    def __init__(self, settings: SynthesisSettings, auth: AuthManager) -> None:
        if websockets is None:
            raise ImportError("websockets package required: pip install synthesis-trade[ws]")
        self._settings = settings
        self._auth = auth
        self._connections: dict[str, Any] = {}
        self._subscriptions: dict[str, tuple[str, Callback]] = {}
        self._tasks: dict[str, asyncio.Task] = {}
        self._running = False

    def _ws_url(self, channel: str) -> str:
        return f"{self._settings.ws_url}/{channel}/ws"

    async def connect(self, channel: str) -> None:
        """Connect to a WebSocket channel."""
        if channel not in self.CHANNELS:
            raise ValueError(f"Unknown channel: {channel}. Must be one of {self.CHANNELS}")
        if channel in self._connections:
            return

        url = self._ws_url(channel)
        headers = self._auth.trading_headers() if channel == "balance" else {}
        ws = await ws_connect(url, additional_headers=headers)
        self._connections[channel] = ws
        self._running = True
        self._tasks[channel] = asyncio.create_task(self._listen(channel))

    async def _listen(self, channel: str) -> None:
        """Listen for messages on a channel and dispatch to callbacks."""
        while self._running:
            ws = self._connections.get(channel)
            if not ws:
                break
            try:
                msg = await ws.recv()
                data = json.loads(msg) if isinstance(msg, str) else msg
                for sub_id, (ch, callback) in list(self._subscriptions.items()):
                    if ch == channel:
                        try:
                            await callback(data)
                        except Exception:
                            logger.exception(f"Error in callback for subscription {sub_id}")
            except Exception:
                logger.warning(f"WebSocket {channel} disconnected, reconnecting...")
                await asyncio.sleep(2)
                try:
                    url = self._ws_url(channel)
                    headers = self._auth.trading_headers() if channel == "balance" else {}
                    ws = await ws_connect(url, additional_headers=headers)
                    self._connections[channel] = ws
                except Exception:
                    logger.exception(f"Reconnect failed for {channel}")
                    await asyncio.sleep(5)

    async def subscribe(
        self,
        channel: str,
        callback: Callback,
        params: dict[str, Any] | None = None,
    ) -> str:
        """Subscribe to a channel with an optional subscription message. Returns subscription ID."""
        if channel not in self._connections:
            await self.connect(channel)

        sub_id = str(uuid4())
        self._subscriptions[sub_id] = (channel, callback)

        # Send subscription message if params provided
        if params:
            ws = self._connections[channel]
            await ws.send(json.dumps(params))

        return sub_id

    async def unsubscribe(self, sub_id: str) -> None:
        self._subscriptions.pop(sub_id, None)

    async def send(self, channel: str, message: dict[str, Any]) -> None:
        """Send a message on an open channel."""
        ws = self._connections.get(channel)
        if not ws:
            raise ConnectionError(f"Not connected to {channel}")
        await ws.send(json.dumps(message))

    async def close(self) -> None:
        """Close all connections."""
        self._running = False
        for task in self._tasks.values():
            task.cancel()
        for ws in self._connections.values():
            try:
                await ws.close()
            except Exception:
                pass
        self._connections.clear()
        self._subscriptions.clear()
        self._tasks.clear()
