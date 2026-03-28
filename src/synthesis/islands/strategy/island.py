from __future__ import annotations

from decimal import Decimal

from synthesis.islands.market_discovery.island import MarketDiscoveryIsland
from synthesis.core.models import Signal, EventWithMarkets, Market


class StrategyIsland:
    """Market scanning strategies: momentum, value, volume spikes."""

    def __init__(self, market_discovery: MarketDiscoveryIsland) -> None:
        self._markets = market_discovery

    async def scan_momentum(
        self, venue: str | None = None, limit: int = 10,
    ) -> list[Signal]:
        """Find markets with strong recent volume — proxy for momentum."""
        events = await self._markets.search_markets(venue=venue, limit=limit, sort="volume24hr", order="DESC")
        signals: list[Signal] = []
        for ev in events:
            for mkt in ev.markets:
                price = Decimal(mkt.left_price) if mkt.left_price else Decimal("0.5")
                vol24 = Decimal(mkt.volume24hr) if mkt.volume24hr else Decimal("0")
                if vol24 < 1000:
                    continue
                # Strong momentum if price is trending toward extremes with volume
                if price < Decimal("0.3") or price > Decimal("0.7"):
                    direction = "BUY" if price > Decimal("0.7") else "SELL"
                    confidence = min(float(vol24) / 100000, 0.9)
                    signals.append(Signal(
                        market_id=mkt.primary_token_id,
                        venue=mkt.venue,
                        market_name=mkt.name,
                        direction=direction,
                        confidence=confidence,
                        reasoning=f"Price {price} with 24h volume ${vol24} suggests strong directional momentum",
                        suggested_amount_usdc=min(float(vol24) * 0.001, 50),
                        current_price=str(price),
                    ))
        return sorted(signals, key=lambda s: s.confidence, reverse=True)[:limit]

    async def scan_value(
        self, max_price: float = 0.15, venue: str | None = None, limit: int = 10,
    ) -> list[Signal]:
        """Find undervalued markets: low price, decent volume."""
        events = await self._markets.search_markets(
            venue=venue, limit=50, sort="volume", order="DESC", max_price=max_price,
        )
        signals: list[Signal] = []
        for ev in events:
            for mkt in ev.markets:
                price = Decimal(mkt.left_price) if mkt.left_price else Decimal("0.5")
                vol = Decimal(mkt.volume) if mkt.volume else Decimal("0")
                liq = Decimal(mkt.liquidity) if mkt.liquidity else Decimal("0")
                if price <= 0 or price > Decimal(str(max_price)):
                    continue
                if vol < 5000:
                    continue
                # Value = low price + liquidity means market makers are active
                confidence = min(float(liq) / 50000, 0.8)
                signals.append(Signal(
                    market_id=mkt.primary_token_id,
                    venue=mkt.venue,
                    market_name=mkt.name,
                    direction="BUY",
                    confidence=confidence,
                    reasoning=f"Price {price} with ${vol} volume and ${liq} liquidity — potential value play",
                    suggested_amount_usdc=min(float(price) * 100, 25),
                    current_price=str(price),
                ))
        return sorted(signals, key=lambda s: s.confidence, reverse=True)[:limit]

    async def scan_volume_spike(
        self, threshold: float = 3.0, venue: str | None = None, limit: int = 10,
    ) -> list[Signal]:
        """Find markets where 24h volume is unusually high relative to total volume."""
        events = await self._markets.search_markets(venue=venue, limit=50, sort="volume24hr", order="DESC")
        signals: list[Signal] = []
        for ev in events:
            for mkt in ev.markets:
                vol = Decimal(mkt.volume) if mkt.volume else Decimal("1")
                vol24 = Decimal(mkt.volume24hr) if mkt.volume24hr else Decimal("0")
                if vol <= 0:
                    continue
                ratio = float(vol24 / vol) if vol > 0 else 0
                # If 24h volume is >threshold% of all-time volume, that's a spike
                if ratio > (threshold / 100):
                    price = Decimal(mkt.left_price) if mkt.left_price else Decimal("0.5")
                    signals.append(Signal(
                        market_id=mkt.primary_token_id,
                        venue=mkt.venue,
                        market_name=mkt.name,
                        direction="BUY" if price < Decimal("0.5") else "SELL",
                        confidence=min(ratio * 10, 0.85),
                        reasoning=f"Volume spike: 24h vol ${vol24} is {ratio*100:.1f}% of total ${vol}",
                        suggested_amount_usdc=min(float(vol24) * 0.001, 30),
                        current_price=str(price),
                    ))
        return sorted(signals, key=lambda s: s.confidence, reverse=True)[:limit]

    async def evaluate_market(self, market: Market) -> Signal:
        """Deep analysis of a single market."""
        price = Decimal(market.left_price) if market.left_price else Decimal("0.5")
        vol = Decimal(market.volume) if market.volume else Decimal("0")
        liq = Decimal(market.liquidity) if market.liquidity else Decimal("0")

        reasons: list[str] = []
        score = 0.5

        # Volume analysis
        if vol > 100000:
            reasons.append(f"High total volume (${vol})")
            score += 0.1
        # Liquidity analysis
        if liq > 50000:
            reasons.append(f"Deep liquidity (${liq})")
            score += 0.1
        # Price edge analysis
        if price < Decimal("0.1") or price > Decimal("0.9"):
            reasons.append(f"Extreme price ({price}) — high conviction from market")
            score += 0.05
        elif Decimal("0.4") < price < Decimal("0.6"):
            reasons.append(f"Uncertain pricing ({price}) — potential for big move")
            score += 0.05

        direction = "BUY" if price < Decimal("0.5") else "SELL"
        return Signal(
            market_id=market.primary_token_id,
            venue=market.venue,
            market_name=market.name,
            direction=direction,
            confidence=min(score, 0.95),
            reasoning="; ".join(reasons) if reasons else "Insufficient data for strong signal",
            suggested_amount_usdc=min(float(liq) * 0.001, 50) if liq > 0 else 10,
            current_price=str(price),
        )
