from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from synthesis.config import SynthesisSettings
from synthesis.exceptions import SynthesisAPIError, RiskViolationError, SimulationModeError
from synthesis.server.deps import build_islands, IslandRegistry
from synthesis.server.routes import markets, orders, portfolio, risk, strategy, arbitrage


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Cleanup HTTP client on shutdown
    registry: IslandRegistry = app.state.islands
    await registry.market_discovery._http.close()


def create_app(settings: SynthesisSettings | None = None) -> FastAPI:
    settings = settings or SynthesisSettings()

    app = FastAPI(
        title="Synthesis Trading Desk",
        description="Local AI trading desk for prediction markets (Polymarket + Kalshi)",
        version="0.1.0",
        lifespan=lifespan,
    )

    # Build and store island registry
    app.state.settings = settings
    app.state.islands = build_islands(settings)

    # Exception handlers
    @app.exception_handler(SynthesisAPIError)
    async def api_error_handler(request: Request, exc: SynthesisAPIError):
        return JSONResponse(
            status_code=exc.status_code or 502,
            content={"success": False, "error": str(exc)},
        )

    @app.exception_handler(RiskViolationError)
    async def risk_error_handler(request: Request, exc: RiskViolationError):
        return JSONResponse(
            status_code=403,
            content={"success": False, "error": str(exc), "reasons": exc.reasons},
        )

    @app.exception_handler(SimulationModeError)
    async def sim_error_handler(request: Request, exc: SimulationModeError):
        return JSONResponse(
            status_code=403,
            content={"success": False, "error": str(exc)},
        )

    # Health check
    @app.get("/health")
    async def health():
        return {
            "status": "ok",
            "simulation_mode": settings.simulation_mode,
            "version": "0.1.0",
        }

    @app.get("/config")
    async def get_config():
        return {
            "simulation_mode": settings.simulation_mode,
            "base_url": settings.base_url,
            "max_position_usdc": settings.max_position_usdc,
            "max_single_order_usdc": settings.max_single_order_usdc,
            "max_daily_loss_usdc": settings.max_daily_loss_usdc,
            "allowed_venues": settings.allowed_venues,
        }

    # Register route modules
    app.include_router(markets.router, prefix="/markets", tags=["Markets"])
    app.include_router(orders.router, prefix="/order", tags=["Orders"])
    app.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
    app.include_router(risk.router, prefix="/risk", tags=["Risk"])
    app.include_router(strategy.router, prefix="/strategy", tags=["Strategy"])
    app.include_router(arbitrage.router, prefix="/arbitrage", tags=["Arbitrage"])

    return app
