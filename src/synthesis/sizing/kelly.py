"""Unified Kelly Criterion module for position sizing across the Synth stack.

Provides three calculation modes:
  1. Binary market: f* from win_prob and market price
  2. Classical: f* from win_prob and payout odds (b*p - q) / b
  3. Fractional: Apply a fractional multiplier (half-Kelly, quarter-Kelly)

Also includes drawdown-adjusted Kelly that reduces sizing based on
current drawdown relative to max allowed loss.

This module is the single source of truth — RiskIsland, SynthAIEngine,
PredictionEngine, and the Node server should all reference this logic.
"""

from __future__ import annotations

import math
from dataclasses import dataclass


MAX_KELLY_FRACTION = 0.25
DEFAULT_FRACTIONAL_MULTIPLIER = 0.5  # half-Kelly by default for safety


@dataclass
class KellyResult:
    """Full Kelly analysis output."""
    full_kelly: float
    fractional_kelly: float
    suggested_pct: float
    edge: float
    expected_value: float
    bankroll_fraction_usdc: float
    method: str
    warnings: list[str]


class KellyCalculator:
    """Deterministic Kelly Criterion calculator with multiple modes."""

    def __init__(
        self,
        max_fraction: float = MAX_KELLY_FRACTION,
        fractional_multiplier: float = DEFAULT_FRACTIONAL_MULTIPLIER,
    ) -> None:
        self.max_fraction = max_fraction
        self.fractional_multiplier = fractional_multiplier

    def binary_market(
        self,
        win_prob: float,
        market_price: float,
        bankroll_usdc: float = 0.0,
    ) -> KellyResult:
        """Kelly for binary prediction markets where price = implied probability.

        f* = (p - price) / (1 - price)
        where p = estimated true probability, price = current market price.
        """
        warnings: list[str] = []
        if not (0.0 < win_prob < 1.0) or not (0.0 < market_price < 1.0):
            return KellyResult(
                full_kelly=0.0, fractional_kelly=0.0, suggested_pct=0.0,
                edge=0.0, expected_value=0.0, bankroll_fraction_usdc=0.0,
                method="binary_market", warnings=["Invalid probability or price bounds"],
            )

        edge = win_prob - market_price
        if edge <= 0:
            warnings.append(f"Negative edge ({edge:.4f}): no bet recommended")
            return KellyResult(
                full_kelly=0.0, fractional_kelly=0.0, suggested_pct=0.0,
                edge=edge, expected_value=edge, bankroll_fraction_usdc=0.0,
                method="binary_market", warnings=warnings,
            )

        odds = (1.0 - market_price) / market_price
        q = 1.0 - win_prob
        full_kelly = (odds * win_prob - q) / odds
        full_kelly = max(0.0, min(full_kelly, self.max_fraction))

        fractional = full_kelly * self.fractional_multiplier
        ev = win_prob * (1.0 / market_price - 1.0) - (1.0 - win_prob)

        if full_kelly > 0.15:
            warnings.append("Large Kelly fraction — consider fractional sizing")

        return KellyResult(
            full_kelly=round(full_kelly, 6),
            fractional_kelly=round(fractional, 6),
            suggested_pct=round(fractional * 100, 2),
            edge=round(edge, 6),
            expected_value=round(ev, 6),
            bankroll_fraction_usdc=round(bankroll_usdc * fractional, 2) if bankroll_usdc else 0.0,
            method="binary_market",
            warnings=warnings,
        )

    def classical(
        self,
        win_prob: float,
        odds: float,
        bankroll_usdc: float = 0.0,
    ) -> KellyResult:
        """Classical Kelly: f* = (bp - q) / b where b = net odds to 1."""
        warnings: list[str] = []
        if win_prob <= 0 or win_prob >= 1 or odds <= 0:
            return KellyResult(
                full_kelly=0.0, fractional_kelly=0.0, suggested_pct=0.0,
                edge=0.0, expected_value=0.0, bankroll_fraction_usdc=0.0,
                method="classical", warnings=["Invalid inputs"],
            )

        q = 1.0 - win_prob
        full_kelly = (odds * win_prob - q) / odds
        full_kelly = max(0.0, min(full_kelly, self.max_fraction))

        if full_kelly <= 0:
            warnings.append("No positive edge at these odds")

        fractional = full_kelly * self.fractional_multiplier
        ev = win_prob * odds - q

        return KellyResult(
            full_kelly=round(full_kelly, 6),
            fractional_kelly=round(fractional, 6),
            suggested_pct=round(fractional * 100, 2),
            edge=round(win_prob * odds - q, 6),
            expected_value=round(ev, 6),
            bankroll_fraction_usdc=round(bankroll_usdc * fractional, 2) if bankroll_usdc else 0.0,
            method="classical",
            warnings=warnings,
        )

    def drawdown_adjusted(
        self,
        win_prob: float,
        market_price: float,
        current_drawdown_pct: float,
        max_drawdown_pct: float = 20.0,
        bankroll_usdc: float = 0.0,
    ) -> KellyResult:
        """Kelly with drawdown reduction: scale down as losses approach limit.

        Multiplier = (1 - current_drawdown / max_drawdown) so sizing shrinks
        as the daily loss limit approaches.
        """
        base = self.binary_market(win_prob, market_price, bankroll_usdc)

        if max_drawdown_pct <= 0 or current_drawdown_pct < 0:
            return base

        drawdown_ratio = min(current_drawdown_pct / max_drawdown_pct, 1.0)
        reduction = 1.0 - drawdown_ratio

        if reduction <= 0.05:
            base.warnings.append("Near max drawdown — sizing effectively zero")
            base.fractional_kelly = 0.0
            base.suggested_pct = 0.0
            base.bankroll_fraction_usdc = 0.0
            return base

        base.fractional_kelly = round(base.fractional_kelly * reduction, 6)
        base.suggested_pct = round(base.fractional_kelly * 100, 2)
        base.bankroll_fraction_usdc = round(bankroll_usdc * base.fractional_kelly, 2) if bankroll_usdc else 0.0
        base.method = "drawdown_adjusted"
        if drawdown_ratio > 0.5:
            base.warnings.append(f"Drawdown at {current_drawdown_pct:.1f}% of {max_drawdown_pct:.1f}% limit — sizing reduced {reduction:.0%}")
        return base
