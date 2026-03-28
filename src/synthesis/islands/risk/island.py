from __future__ import annotations

from decimal import Decimal

from synthesis.core.models import (
    RiskConfig, RiskCheckResult, Exposure,
    PolygonOrderRequest, Position, Balance, PNL,
)


class RiskIsland:
    """Pre-flight risk checks, exposure analysis, and position limits. Pure computation — no API calls."""

    def __init__(self, config: RiskConfig | None = None) -> None:
        self.config = config or RiskConfig()

    def check_order(
        self,
        order: PolygonOrderRequest,
        positions: list[Position],
        balance: Balance,
    ) -> RiskCheckResult:
        warnings: list[str] = []
        blocking: list[str] = []

        order_amount = Decimal(order.amount)
        available = Decimal(balance.available) if balance.available else Decimal("0")

        # Check order size limit
        if float(order_amount) > self.config.max_single_order_usdc:
            blocking.append(
                f"Order ${order_amount} exceeds max single order ${self.config.max_single_order_usdc}"
            )

        # Check balance
        if order.side == "BUY" and order_amount > available:
            blocking.append(f"Insufficient balance: need ${order_amount}, have ${available}")

        # Check position count
        if len(positions) >= self.config.max_open_positions and order.side == "BUY":
            blocking.append(f"Max open positions ({self.config.max_open_positions}) reached")

        # Check total exposure
        exposure = self.get_exposure(positions)
        projected = exposure.total_value_usdc + float(order_amount)
        if projected > self.config.max_position_usdc:
            blocking.append(
                f"Projected exposure ${projected:.2f} exceeds max ${self.config.max_position_usdc}"
            )

        # Check blocked markets
        token_id = order.token_id
        if token_id in self.config.blocked_markets:
            blocking.append(f"Market {token_id} is blocked")

        # Warning for large orders
        if float(order_amount) > self.config.require_confirmation_above:
            warnings.append(f"Order ${order_amount} exceeds confirmation threshold ${self.config.require_confirmation_above}")

        # Concentration warning
        if exposure.position_count > 0 and float(order_amount) / max(exposure.total_value_usdc, 1) > 0.5:
            warnings.append("This order would represent >50% concentration in one position")

        return RiskCheckResult(
            approved=len(blocking) == 0,
            warnings=warnings,
            blocking_reasons=blocking,
            estimated_exposure=projected,
        )

    def get_exposure(self, positions: list[Position]) -> Exposure:
        if not positions:
            return Exposure()

        total = 0.0
        largest = 0.0
        venue_totals: dict[str, float] = {}

        for pos in positions:
            size = float(Decimal(pos.size)) if pos.size else 0
            price = float(Decimal(pos.current_price)) if pos.current_price else 0
            value = size * price

            total += value
            largest = max(largest, value)

            venue = "polymarket" if pos.condition_id else "kalshi"
            venue_totals[venue] = venue_totals.get(venue, 0) + value

        return Exposure(
            total_value_usdc=total,
            position_count=len(positions),
            largest_position_usdc=largest,
            largest_position_pct=(largest / total * 100) if total > 0 else 0,
            venue_breakdown=venue_totals,
        )

    def check_daily_loss(self, pnl: PNL) -> RiskCheckResult:
        total_loss = float(Decimal(pnl.total_pnl)) if pnl.total_pnl else 0
        if total_loss < -self.config.max_daily_loss_usdc:
            return RiskCheckResult(
                approved=False,
                blocking_reasons=[f"Daily loss ${abs(total_loss):.2f} exceeds limit ${self.config.max_daily_loss_usdc}"],
                estimated_exposure=abs(total_loss),
            )
        warnings = []
        if total_loss < -self.config.max_daily_loss_usdc * 0.8:
            warnings.append(f"Approaching daily loss limit: ${abs(total_loss):.2f} / ${self.config.max_daily_loss_usdc}")
        return RiskCheckResult(approved=True, warnings=warnings, estimated_exposure=abs(total_loss))

    def kelly_criterion(self, win_prob: float, odds: float) -> float:
        """Calculate Kelly fraction: f* = (bp - q) / b where b=odds, p=win_prob, q=1-p."""
        if odds <= 0 or win_prob <= 0 or win_prob >= 1:
            return 0.0
        q = 1 - win_prob
        f = (odds * win_prob - q) / odds
        return max(0.0, min(f, 0.25))  # Cap at 25% of bankroll

    def update_config(self, **kwargs: float | int | list) -> RiskConfig:
        data = self.config.model_dump()
        data.update(kwargs)
        self.config = RiskConfig(**data)
        return self.config
