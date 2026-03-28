from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from synthesis.config import SynthesisSettings
from synthesis.exceptions import SynthesisAPIError, RiskViolationError, SimulationModeError
from synthesis.server.deps import build_islands, IslandRegistry
from synthesis.server.routes import (
    markets, orders, portfolio, risk, strategy,
    arbitrage, predictions, approvals, audit_routes, synth,
)

UI_DIR = Path(__file__).resolve().parent.parent / "ui"
DIST_DIR = UI_DIR / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    registry: IslandRegistry = app.state.islands
    await registry.market_discovery._http.close()
    if registry.ai_engine and hasattr(registry.ai_engine, "close"):
        await registry.ai_engine.close()


def create_app(settings: SynthesisSettings | None = None) -> FastAPI:
    settings = settings or SynthesisSettings()

    app = FastAPI(
        title="Synth — AI Trading Desk",
        description="Local-first AI trading desk for prediction markets (Polymarket + Kalshi)",
        version="0.3.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8420"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    registry = build_islands(settings)
    app.state.settings = settings
    app.state.islands = registry
    if registry.ai_engine:
        app.state.ai_engine = registry.ai_engine

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
            "ai_engine_available": reg.ai_engine is not None,
            "version": "0.3.0",
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
            "confidence_threshold": settings.confidence_threshold,
            "max_open_positions": settings.max_open_positions,
        }

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
    app.include_router(synth.router, prefix="/synth", tags=["Synth AI"])

    # --- Static frontend ---
    if DIST_DIR.exists():
        app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="static-assets")

        @app.get("/")
        async def serve_app():
            index = DIST_DIR / "index.html"
            return FileResponse(index, media_type="text/html")
    else:
        @app.get("/")
        async def serve_ui():
            index = UI_DIR / "index.html"
            if index.exists():
                return FileResponse(index, media_type="text/html")
            return JSONResponse({"message": "Synth API running. Build frontend: cd app && npm run build"})

    return app
