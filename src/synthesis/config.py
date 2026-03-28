from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class SynthesisSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # API credentials
    public_key: str = Field(alias="PUBLIC_KEY_SYNTH")
    secret_key: str = Field(alias="SECRET_KEY_SYNTH")
    project_api_key: str | None = Field(default=None, alias="PROJECT_API_KEY")

    # Endpoints
    base_url: str = "https://synthesis.trade/api/v1"
    ws_url: str = "wss://synthesis.trade/api/v1"

    # Local server
    server_host: str = "127.0.0.1"
    server_port: int = 8420

    # Safety
    simulation_mode: bool = True
    max_position_usdc: float = 1000.0
    max_single_order_usdc: float = 100.0
    max_daily_loss_usdc: float = 200.0
    max_open_positions: int = 20
    allowed_venues: list[str] = ["polymarket", "kalshi"]
