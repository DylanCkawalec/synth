from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ConfidenceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class TradeAction(str, Enum):
    BUY_YES = "buy_yes"
    BUY_NO = "buy_no"
    SELL_YES = "sell_yes"
    SELL_NO = "sell_no"
    HOLD = "hold"
    AVOID = "avoid"


class Prediction(BaseModel):
    market_id: str
    market_name: str
    venue: str
    thesis: str
    confidence: float = Field(ge=0.0, le=1.0)
    confidence_level: ConfidenceLevel
    predicted_outcome: str
    predicted_probability: float = Field(ge=0.0, le=1.0)
    current_price: float
    edge: float  # predicted_probability - current_price
    supporting_signals: list[str] = []
    invalidation_conditions: list[str] = []
    risk_notes: list[str] = []
    time_horizon: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TradeProposal(BaseModel):
    prediction: Prediction
    action: TradeAction
    suggested_side: str  # BUY or SELL
    suggested_amount_usdc: float
    suggested_price: float | None = None
    order_type: str = "MARKET"
    token_id: str
    wallet_id: str = ""
    rationale: str
    why_now: str
    why_not: str
    kelly_fraction: float = 0.0
    risk_reward_ratio: float = 0.0
    max_loss_usdc: float = 0.0
    requires_approval: bool = True
    approved: bool = False
    executed: bool = False
    execution_result: dict | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class MarketAnalysis(BaseModel):
    query: str
    markets_analyzed: int = 0
    predictions: list[Prediction] = []
    proposals: list[TradeProposal] = []
    summary: str = ""
    risk_assessment: str = ""
    portfolio_context: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AuditEntry(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    action: str
    details: dict[str, Any] = {}
    mode: str = "simulation"  # simulation | paper | live
    user_approved: bool = False
