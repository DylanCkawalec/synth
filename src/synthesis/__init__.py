"""Synthesis Trading Desk — unified prediction market trading across Polymarket and Kalshi."""

from synthesis.config import SynthesisSettings
from synthesis.core.auth import AuthManager
from synthesis.core.http import SynthesisHTTPClient
from synthesis.exceptions import SynthesisError, SynthesisAPIError

__all__ = [
    "SynthesisSettings",
    "AuthManager",
    "SynthesisHTTPClient",
    "SynthesisError",
    "SynthesisAPIError",
]
