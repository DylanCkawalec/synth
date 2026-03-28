from __future__ import annotations

import asyncio
from typing import Any

import httpx

from synthesis.config import SynthesisSettings
from synthesis.core.auth import AuthManager
from synthesis.exceptions import SynthesisAPIError


class SynthesisHTTPClient:
    """Async HTTP client for the Synthesis API with envelope unwrap and retry."""

    def __init__(self, settings: SynthesisSettings, auth: AuthManager) -> None:
        self._settings = settings
        self._auth = auth
        self._client = httpx.AsyncClient(
            base_url=settings.base_url,
            timeout=30.0,
            headers={"Content-Type": "application/json"},
        )

    def _headers_for(self, auth: str) -> dict[str, str]:
        if auth == "trading":
            return self._auth.trading_headers()
        if auth == "project":
            return self._auth.project_headers()
        return self._auth.public_headers()

    async def _request(
        self,
        method: str,
        path: str,
        auth: str = "public",
        params: dict | None = None,
        json: dict | None = None,
        max_retries: int = 3,
    ) -> Any:
        headers = self._headers_for(auth)
        last_exc: Exception | None = None

        for attempt in range(max_retries):
            try:
                resp = await self._client.request(
                    method, path, headers=headers, params=params, json=json,
                )
                if resp.status_code == 429 or resp.status_code >= 500:
                    wait = min(2 ** attempt, 8)
                    await asyncio.sleep(wait)
                    continue

                data = resp.json()
                if not data.get("success", False):
                    msg = data.get("response", str(data))
                    raise SynthesisAPIError(str(msg), status_code=resp.status_code)

                return data.get("response")

            except httpx.HTTPError as exc:
                last_exc = exc
                if attempt < max_retries - 1:
                    await asyncio.sleep(min(2 ** attempt, 8))
                    continue
                raise SynthesisAPIError(str(exc)) from exc

        raise SynthesisAPIError(f"Max retries exceeded: {last_exc}")

    async def get(self, path: str, params: dict | None = None, auth: str = "public") -> Any:
        return await self._request("GET", path, auth=auth, params=params)

    async def post(self, path: str, json: dict | None = None, auth: str = "trading") -> Any:
        return await self._request("POST", path, auth=auth, json=json)

    async def put(self, path: str, json: dict | None = None, auth: str = "trading") -> Any:
        return await self._request("PUT", path, auth=auth, json=json)

    async def delete(self, path: str, auth: str = "trading") -> Any:
        return await self._request("DELETE", path, auth=auth)

    async def close(self) -> None:
        await self._client.aclose()
