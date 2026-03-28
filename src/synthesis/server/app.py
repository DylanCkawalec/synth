from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse

from synthesis.config import SynthesisSettings
from synthesis.exceptions import SynthesisAPIError, RiskViolationError, SimulationModeError
from synthesis.server.deps import build_islands, IslandRegistry
from synthesis.server.routes import markets, orders, portfolio, risk, strategy, arbitrage
from synthesis.server.routes import predictions, approvals, audit_routes

UI_DIR = Path(__file__).resolve().parent.parent / "ui"


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    registry: IslandRegistry = app.state.islands
    await registry.market_discovery._http.close()


def create_app(settings: SynthesisSettings | None = None) -> FastAPI:
    settings = settings or SynthesisSettings()

    app = FastAPI(
        title="Synth — AI Trading Desk",
        description="Local-first AI trading desk for prediction markets (Polymarket + Kalshi)",
        version="0.2.0",
        lifespan=lifespan,
    )

    app.state.settings = settings
    app.state.islands = build_islands(settings)

    # --- Exception handlers ---
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

    # --- System endpoints ---
    @app.get("/health")
    async def health():
        reg: IslandRegistry = app.state.islands
        return {
            "status": "ok",
            "simulation_mode": settings.simulation_mode,
            "approval_required": settings.require_approval,
            "predictions_available": reg.predictions is not None,
            "version": "0.2.0",
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
            "require_approval": settings.require_approval,
            "approval_ttl_seconds": settings.approval_ttl_seconds,
            "openai_model": settings.openai_model,
        }

    # --- Operator UI ---
    @app.get("/")
    async def serve_ui():
        index = UI_DIR / "index.html"
        if index.exists():
            return FileResponse(index, media_type="text/html")
        return JSONResponse({"message": "Synth API is running. UI not found at /ui/index.html."})

    # --- Route modules ---
    app.include_router(markets.router, prefix="/markets", tags=["Markets"])
    app.include_router(orders.router, prefix="/order", tags=["Orders"])
    app.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
    app.include_router(risk.router, prefix="/risk", tags=["Risk"])
    app.include_router(strategy.router, prefix="/strategy", tags=["Strategy"])
    app.include_router(arbitrage.router, prefix="/arbitrage", tags=["Arbitrage"])
    app.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
    app.include_router(approvals.router, prefix="/approvals", tags=["Approvals"])
    app.include_router(audit_routes.router, prefix="/audit", tags=["Audit"])

    return app
