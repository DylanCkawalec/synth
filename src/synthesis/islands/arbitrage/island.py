from __future__ import annotations

from decimal import Decimal

from synthesis.islands.market_discovery.island import MarketDiscoveryIsland
from synthesis.core.models import ArbOpportunity, Market, EventWithMarkets


class ArbitrageIsland:
    """Cross-venue arbitrage detection between Polymarket and Kalshi."""

    def __init__(self, market_discovery: MarketDiscoveryIsland) -> None:
        self._markets = market_discovery

    async def find_cross_venue_arbs(self, min_spread: float = 0.03) -> list[ArbOpportunity]:
        """Find price discrepancies for similar markets across Polymarket and Kalshi."""
        pairs = await self._markets.get_similar_pairs()
        opportunities: list[ArbOpportunity] = []

        for pair in pairs:
            try:
                poly = pair.get("polymarket", pair.get("poly", {}))
                kalshi = pair.get("kalshi", {})
                if not poly or not kalshi:
                    continue

                poly_price = Decimal(str(poly.get("left_price", poly.get("price", "0.5"))))
                kalshi_price = Decimal(str(kalshi.get("left_price", kalshi.get("price", "0.5"))))
                spread = float(abs(poly_price - kalshi_price))

                if spread < min_spread:
                    continue

                if poly_price < kalshi_price:
                    direction = "buy_poly_sell_kalshi"
                else:
                    direction = "buy_kalshi_sell_poly"

                opportunities.append(ArbOpportunity(
                    polymarket_market=poly,
                    kalshi_market=kalshi,
                    spread=spread,
                    direction=direction,
                    estimated_profit_usdc=spread * 100,  # Per $100 notional
                    confidence=min(spread * 10, 0.9),
                    poly_price=str(poly_price),
                    kalshi_price=str(kalshi_price),
                ))
            except (KeyError, ValueError, TypeError):
                continue

        return sorted(opportunities, key=lambda o: o.spread, reverse=True)

    async def analyze_event_pricing(self, event_id: str, venue: str = "polymarket") -> dict:
        """Check if probabilities within a multi-outcome event sum to ~100%."""
        if venue == "polymarket":
            event = await self._markets.get_polymarket_event(event_id)
        else:
            event = await self._markets.get_kalshi_event(event_id)

        markets = event.markets
        total_yes = sum(Decimal(m.left_price) for m in markets if m.left_price)
        total_no = sum(Decimal(m.right_price) for m in markets if m.right_price)

        deviation = abs(float(total_yes) - 1.0)
        overround = float(total_yes) - 1.0

        mispriced: list[dict] = []
        if len(markets) > 1:
            fair_share = Decimal("1") / len(markets)
            for m in markets:
                price = Decimal(m.left_price) if m.left_price else Decimal("0")
                dev = float(abs(price - fair_share))
                if dev > 0.1:
                    mispriced.append({
                        "market": m.name,
                        "token_id": m.primary_token_id,
                        "price": str(price),
                        "fair_share": str(fair_share),
                        "deviation": f"{dev:.3f}",
                    })

        return {
            "event_id": event_id,
            "venue": venue,
            "market_count": len(markets),
            "total_yes_probability": f"{total_yes:.4f}",
            "total_no_probability": f"{total_no:.4f}",
            "overround": f"{overround:.4f}",
            "deviation_from_unity": f"{deviation:.4f}",
            "is_efficient": deviation < 0.02,
            "mispriced_markets": mispriced,
        }
