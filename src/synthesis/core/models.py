from __future__ import annotations

from decimal import Decimal
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# --- Enums ---

class Venue(str, Enum):
    POLYMARKET = "polymarket"
    KALSHI = "kalshi"

class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOPLOSS = "STOPLOSS"

class OrderUnits(str, Enum):
    USDC = "USDC"
    SHARES = "SHARES"

class SortOrder(str, Enum):
    ASC = "ASC"
    DESC = "DESC"


# --- Market Data Models ---

class LiveStatus(BaseModel):
    live: bool = False
    ended: bool = False
    score: str | None = None
    period: str | None = None
    elapsed: str | None = None
    game_id: str | None = None
    game_status: str | None = None

class Rewards(BaseModel):
    rate: float = 0.0
    size: float = 0.0
    spread: float = 0.0
    holding: bool = False
    rewards: bool = False

class Event(BaseModel):
    event_id: int | str
    title: str
    slug: str
    description: str = ""
    image: str | None = None
    tags: list[str] = []
    labels: list[str] = []
    active: bool = True
    volume: str | float | int = "0"
    volume24hr: str | float | int = "0"
    volume1wk: str | float | int = "0"
    volume1mo: str | float | int = "0"
    volume1yr: str | float | int = "0"
    liquidity: str | float | int = "0"
    live: LiveStatus | dict = {}
    neg_risk: bool = False
    created_at: str = ""
    ends_at: str | None = None
    series_id: str | None = None
    category: str | None = None

    class Config:
        extra = "allow"

class Market(BaseModel):
    event_id: int | str
    question: str | None = None  # Polymarket
    title: str | None = None  # Kalshi
    outcome: str = ""
    slug: str | None = None
    description: str = ""
    image: str | None = None
    left_outcome: str = "Yes"
    right_outcome: str = "No"
    left_price: str | float | int = "0"
    right_price: str | float | int = "0"
    left_token_id: str = ""
    right_token_id: str = ""
    winner_token_id: str = ""
    active: bool = True
    resolved: bool = False
    liquidity: str | float | int = "0"
    volume: str | float | int = "0"
    volume24hr: str | float | int = "0"
    # Polymarket-specific
    condition_id: str | None = None
    question_id: str | None = None
    fees: bool = False
    decimals: int = 3
    rewards: Rewards | None = None
    # Kalshi-specific
    series_id: str | None = None
    market_id: str | None = None
    kalshi_id: str | None = None
    open_interest: str | float | int | None = None
    claimable: bool = False
    dflow: dict | None = None
    # Common
    created_at: str = ""
    updated_at: str | None = None
    ends_at: str | None = None

    @property
    def name(self) -> str:
        return self.question or self.title or self.outcome

    @property
    def yes_price(self) -> Decimal:
        return Decimal(str(self.left_price))

    @property
    def no_price(self) -> Decimal:
        return Decimal(str(self.right_price))

    @property
    def venue(self) -> str:
        if self.condition_id:
            return "polymarket"
        if self.kalshi_id or self.series_id:
            return "kalshi"
        return "unknown"

    @property
    def primary_token_id(self) -> str:
        return self.left_token_id

    class Config:
        extra = "allow"

class EventWithMarkets(BaseModel):
    venue: str | None = None
    event: Event
    markets: list[Market] = []

    class Config:
        extra = "allow"


# --- Orderbook ---

class OrderBookLevel(BaseModel):
    price: str
    size: str

class OrderBook(BaseModel):
    token_id: str = ""
    bids: dict[str, str] | list[OrderBookLevel] = {}
    asks: dict[str, str] | list[OrderBookLevel] = {}
    best_bid: str = "0"
    best_ask: str = "0"
    spread: str = "0"
    hash: str = ""
    created_at: str = ""

    class Config:
        extra = "allow"


# --- Trades ---

class Trade(BaseModel):
    trade_id: str | None = None
    market_id: str | None = None
    condition_id: str | None = None
    token_id: str | None = None
    side: str = ""
    price: str = "0"
    size: str = "0"
    timestamp: str = ""

    class Config:
        extra = "allow"


# --- Orders ---

class PolygonOrderRequest(BaseModel):
    token_id: str
    side: OrderSide
    type: OrderType
    amount: str
    price: str | None = None
    units: OrderUnits = OrderUnits.USDC

class SolanaOrderRequest(BaseModel):
    token_id: str
    side: OrderSide
    amount: str
    slippage: int | None = None
    prediction_slippage: int | None = None

class Order(BaseModel):
    order_id: str = ""
    wallet_id: str = ""
    token_id: str = ""
    side: str = ""
    type: str = ""
    amount: str = "0"
    price: str = "0"
    units: str = ""
    status: str = ""
    filled: str = "0"
    created_at: str = ""
    updated_at: str | None = None

    class Config:
        extra = "allow"

class OrderResult(BaseModel):
    success: bool = True
    order: Order | dict | None = None
    message: str = ""
    simulated: bool = False

    class Config:
        extra = "allow"

class SimulationResult(BaseModel):
    estimated_fill_price: str = "0"
    estimated_slippage: str = "0"
    estimated_cost_usdc: str = "0"
    estimated_shares: str = "0"
    orderbook_depth_available: bool = True
    warnings: list[str] = []


# --- Portfolio ---

class Wallet(BaseModel):
    wallet_id: str = ""
    name: str = ""
    chain: str = ""
    address: str = ""
    created_at: str = ""

    class Config:
        extra = "allow"

class Balance(BaseModel):
    wallet_id: str = ""
    total: str = "0"
    available: str = "0"
    in_orders: str = "0"
    currency: str = "USDC"

    class Config:
        extra = "allow"

class Position(BaseModel):
    wallet_id: str = ""
    market_id: str | None = None
    condition_id: str | None = None
    token_id: str = ""
    title: str = ""
    outcome: str = ""
    side: str = ""
    size: str = "0"
    avg_price: str = "0"
    current_price: str = "0"
    pnl: str = "0"
    pnl_percent: str = "0"
    realized: bool = False

    class Config:
        extra = "allow"

class PNL(BaseModel):
    wallet_id: str = ""
    total_pnl: str = "0"
    realized_pnl: str = "0"
    unrealized_pnl: str = "0"
    interval: str = ""

    class Config:
        extra = "allow"

class Transfer(BaseModel):
    transfer_id: str = ""
    wallet_id: str = ""
    type: str = ""
    amount: str = "0"
    token: str = ""
    status: str = ""
    created_at: str = ""

    class Config:
        extra = "allow"


# --- Copytrade ---

class CopyTradeSettings(BaseModel):
    amount: str = "0"
    max_amount: str | None = None

    class Config:
        extra = "allow"

class CopyTradeConfig(BaseModel):
    target: str
    mode: str
    settings: CopyTradeSettings

class CopyTrade(BaseModel):
    copytrade_id: str = ""
    wallet_id: str = ""
    target: str = ""
    mode: str = ""
    settings: CopyTradeSettings = CopyTradeSettings()
    status: str = ""
    created_at: str = ""

    class Config:
        extra = "allow"


# --- Price History ---

class PricePoint(BaseModel):
    timestamp: str
    price: str
    volume: str | None = None

class Candlestick(BaseModel):
    timestamp: str
    open: str
    high: str
    low: str
    close: str
    volume: str = "0"


# --- Risk ---

class RiskConfig(BaseModel):
    max_position_usdc: float = 1000.0
    max_single_order_usdc: float = 100.0
    max_daily_loss_usdc: float = 200.0
    max_open_positions: int = 20
    allowed_venues: list[str] = ["polymarket", "kalshi"]
    blocked_markets: list[str] = []
    require_confirmation_above: float = 50.0

class RiskCheckResult(BaseModel):
    approved: bool
    warnings: list[str] = []
    blocking_reasons: list[str] = []
    estimated_exposure: float = 0.0

class Exposure(BaseModel):
    total_value_usdc: float = 0.0
    position_count: int = 0
    largest_position_usdc: float = 0.0
    largest_position_pct: float = 0.0
    venue_breakdown: dict[str, float] = {}


# --- Strategy ---

class Signal(BaseModel):
    market_id: str
    venue: str
    market_name: str = ""
    direction: str  # BUY or SELL
    confidence: float  # 0.0-1.0
    reasoning: str = ""
    suggested_amount_usdc: float = 0.0
    current_price: str = "0"

class ArbOpportunity(BaseModel):
    polymarket_market: Market | dict
    kalshi_market: Market | dict
    spread: float
    direction: str
    estimated_profit_usdc: float
    confidence: float
    poly_price: str = "0"
    kalshi_price: str = "0"
