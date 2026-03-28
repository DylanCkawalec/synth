from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()


def _reg(request: Request):
    return request.app.state.islands


class PredictionRequest(BaseModel):
    query: str
    wallet_id: str | None = None


@router.post("/generate")
async def generate_prediction(request: Request, body: PredictionRequest):
    reg = _reg(request)
    if not reg.predictions:
        raise HTTPException(status_code=503, detail="Prediction engine unavailable (set OPENAI_API_KEY)")

    markets = []
    try:
        events = await reg.market_discovery.search_markets(query=body.query, limit=5)
        for ev in events:
            for mkt in ev.markets:
                markets.append({
                    "event_title": ev.event.title,
                    "market_name": mkt.name,
                    "venue": ev.venue or mkt.venue,
                    "yes_price": str(mkt.left_price),
                    "no_price": str(mkt.right_price),
                    "volume_24h": str(mkt.volume24hr),
                    "liquidity": str(mkt.liquidity),
                    "token_id": mkt.primary_token_id,
                    "condition_id": mkt.condition_id,
                    "ends_at": mkt.ends_at,
                })
    except Exception:
        pass

    portfolio = None
    if body.wallet_id:
        try:
            balance = await reg.portfolio.get_balance(body.wallet_id)
            positions = await reg.portfolio.get_positions(body.wallet_id)
            portfolio = {
                "balance": balance.model_dump(),
                "positions": [p.model_dump() for p in positions[:10]],
            }
        except Exception:
            pass

    prediction = await reg.predictions.generate(
        query=body.query,
        markets=markets,
        portfolio=portfolio,
        wallet_id=body.wallet_id,
    )

    mode = "sim" if reg.settings.simulation_mode else "live"
    reg.audit.log("generate_prediction", "predict", params={"query": body.query}, result={"prediction_id": prediction.prediction_id}, mode=mode)

    return {"success": True, "data": prediction.model_dump()}


@router.get("/history")
async def prediction_history(request: Request, limit: int = 20):
    reg = _reg(request)
    if not reg.predictions:
        return {"success": True, "data": []}
    return {"success": True, "data": [p.model_dump() for p in reg.predictions.get_history(limit)]}


@router.get("/{prediction_id}")
async def get_prediction(request: Request, prediction_id: str):
    reg = _reg(request)
    if not reg.predictions:
        raise HTTPException(404, "Prediction engine unavailable")
    p = reg.predictions.get_prediction(prediction_id)
    if not p:
        raise HTTPException(404, f"Prediction {prediction_id} not found")
    return {"success": True, "data": p.model_dump()}
