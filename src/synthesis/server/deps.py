from __future__ import annotations

from dataclasses import dataclass

from synthesis.config import SynthesisSettings
from synthesis.core.auth import AuthManager
from synthesis.core.http import SynthesisHTTPClient
from synthesis.islands.market_discovery.island import MarketDiscoveryIsland
from synthesis.islands.order_execution.island import OrderExecutionIsland
from synthesis.islands.portfolio.island import PortfolioIsland
from synthesis.islands.risk.island import RiskIsland
from synthesis.islands.strategy.island import StrategyIsland
from synthesis.islands.arbitrage.island import ArbitrageIsland
from synthesis.core.models import RiskConfig


@dataclass
class IslandRegistry:
    market_discovery: MarketDiscoveryIsland
    order_execution: OrderExecutionIsland
    portfolio: PortfolioIsland
    risk: RiskIsland
    strategy: StrategyIsland
    arbitrage: ArbitrageIsland


def build_islands(settings: SynthesisSettings) -> IslandRegistry:
    auth = AuthManager(settings)
    http = SynthesisHTTPClient(settings, auth)

    market_discovery = MarketDiscoveryIsland(http)
    order_execution = OrderExecutionIsland(http, simulation=settings.simulation_mode)
    portfolio = PortfolioIsland(http)
    risk = RiskIsland(RiskConfig(
        max_position_usdc=settings.max_position_usdc,
        max_single_order_usdc=settings.max_single_order_usdc,
        max_daily_loss_usdc=settings.max_daily_loss_usdc,
        max_open_positions=settings.max_open_positions,
        allowed_venues=settings.allowed_venues,
    ))
    strategy = StrategyIsland(market_discovery)
    arbitrage = ArbitrageIsland(market_discovery)

    return IslandRegistry(
        market_discovery=market_discovery,
        order_execution=order_execution,
        portfolio=portfolio,
        risk=risk,
        strategy=strategy,
        arbitrage=arbitrage,
    )
