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
from synthesis.audit.logger import AuditLogger
from synthesis.guard.gate import ApprovalGate
from synthesis.predictions.engine import PredictionEngine


@dataclass
class IslandRegistry:
    market_discovery: MarketDiscoveryIsland
    order_execution: OrderExecutionIsland
    portfolio: PortfolioIsland
    risk: RiskIsland
    strategy: StrategyIsland
    arbitrage: ArbitrageIsland
    audit: AuditLogger
    gate: ApprovalGate
    predictions: PredictionEngine | None
    settings: SynthesisSettings


def build_islands(settings: SynthesisSettings) -> IslandRegistry:
    auth = AuthManager(settings)
    http = SynthesisHTTPClient(settings, auth)

    risk_config = RiskConfig(
        max_position_usdc=settings.max_position_usdc,
        max_single_order_usdc=settings.max_single_order_usdc,
        max_daily_loss_usdc=settings.max_daily_loss_usdc,
        max_open_positions=settings.max_open_positions,
        allowed_venues=settings.allowed_venues,
    )
    market_discovery = MarketDiscoveryIsland(http)

    predictions: PredictionEngine | None = None
    if settings.openai_api_key:
        try:
            predictions = PredictionEngine(
                openai_api_key=settings.openai_api_key,
                model=settings.openai_model,
            )
        except ImportError:
            pass

    return IslandRegistry(
        market_discovery=market_discovery,
        order_execution=OrderExecutionIsland(http, simulation=settings.simulation_mode),
        portfolio=PortfolioIsland(http),
        risk=RiskIsland(risk_config),
        strategy=StrategyIsland(market_discovery),
        arbitrage=ArbitrageIsland(market_discovery),
        audit=AuditLogger(log_dir=settings.audit_log_dir),
        gate=ApprovalGate(
            require_approval=settings.require_approval,
            ttl_seconds=settings.approval_ttl_seconds,
        ),
        predictions=predictions,
        settings=settings,
    )
