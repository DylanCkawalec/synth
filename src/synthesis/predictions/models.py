from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, Field


class MarketContext(BaseModel):
    """Snapshot of market data fed to the prediction engine."""
    market_name: str = ""
    venue: str = ""
    yes_price: float = 0.0
    no_price: float = 0.0
    volume_24h: float = 0.0
    liquidity: float = 0.0
    token_id: str = ""
    condition_id: str = ""
    ends_at: str | None = None
    orderbook_spread: float | None = None
    recent_trades_count: int = 0


class SuggestedExecution(BaseModel):
    """What the prediction engine recommends doing."""
    action: str = "HOLD"  # BUY, SELL, HOLD, SKIP
    token_id: str = ""
    venue: str = ""
    side: str = ""
    amount_usdc: float = 0.0
    order_type: str = "MARKET"
    price: float | None = None
    kelly_fraction: float | None = None


class Prediction(BaseModel):
    prediction_id: str = Field(default_factory=lambda: uuid4().hex[:12])
    thesis: str
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str
    invalidation: str
    risk_note: str
    suggested_execution: SuggestedExecution
    market_context: MarketContext = MarketContext()
    query: str = ""
    model: str = "gpt-4o"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    wallet_id: str | None = None
    status: str = "generated"  # generated, approved, executed, rejected, expired
