from __future__ import annotations

from synthesis.config import SynthesisSettings


class AuthManager:
    """Manages authentication headers for different Synthesis API contexts."""

    def __init__(self, settings: SynthesisSettings) -> None:
        self._settings = settings

    def trading_headers(self) -> dict[str, str]:
        """X-API-KEY header for wallet/trading operations."""
        return {"X-API-KEY": self._settings.secret_key}

    def project_headers(self) -> dict[str, str]:
        """X-PROJECT-API-KEY header for account management."""
        if not self._settings.project_api_key:
            raise ValueError("project_api_key not configured")
        return {"X-PROJECT-API-KEY": self._settings.project_api_key}

    def public_headers(self) -> dict[str, str]:
        """No auth needed for public market data endpoints."""
        return {}
