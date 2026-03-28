"""GPT-4o–powered prediction engine for prediction market analysis."""

from __future__ import annotations

import json
import logging
from typing import Any

from synthesis.predictions.models import MarketContext, Prediction, SuggestedExecution

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are Synth, an expert prediction-market analyst. You receive market data and a user query, \
then produce a structured trading prediction.

Rules:
- Be specific. Ground your thesis in the data provided.
- Confidence is 0.0–1.0. Above 0.7 = strong conviction. Below 0.3 = low conviction.
- Always state what would invalidate the thesis.
- Risk notes must call out liquidity, expiry, or correlation risks.
- Suggested execution must be actionable: BUY/SELL with specific amounts, or HOLD/SKIP with reasoning.
- Use Kelly fraction when you have enough data (win_prob, payout odds).
- If data is insufficient, say so and recommend SKIP.

Return ONLY valid JSON matching this schema (no markdown fences):
{
  "thesis": "<string>",
  "confidence": <float 0-1>,
  "rationale": "<string>",
  "invalidation": "<string>",
  "risk_note": "<string>",
  "suggested_execution": {
    "action": "BUY|SELL|HOLD|SKIP",
    "token_id": "<string or empty>",
    "venue": "<string or empty>",
    "side": "BUY|SELL|<empty>",
    "amount_usdc": <float>,
    "order_type": "MARKET|LIMIT",
    "price": <float or null>,
    "kelly_fraction": <float or null>
  }
}"""


class PredictionEngine:
    def __init__(
        self,
        openai_api_key: str,
        model: str = "gpt-4o",
    ) -> None:
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise ImportError("openai package required: pip install openai")

        self._client = AsyncOpenAI(api_key=openai_api_key)
        self._model = model
        self._history: list[Prediction] = []

    async def generate(
        self,
        query: str,
        markets: list[dict[str, Any]] | None = None,
        portfolio: dict[str, Any] | None = None,
        wallet_id: str | None = None,
    ) -> Prediction:
        context_parts: list[str] = []

        market_ctx = MarketContext()
        if markets:
            context_parts.append("## Market Data")
            for m in markets[:8]:
                context_parts.append(json.dumps(m, default=str))
            top = markets[0]
            market_ctx = MarketContext(
                market_name=top.get("market_name", top.get("event_title", "")),
                venue=top.get("venue", ""),
                yes_price=float(top.get("yes_price", top.get("left_price", 0))),
                no_price=float(top.get("no_price", top.get("right_price", 0))),
                volume_24h=float(top.get("volume_24h", top.get("volume24hr", 0))),
                liquidity=float(top.get("liquidity", 0)),
                token_id=str(top.get("token_id", top.get("primary_token_id", ""))),
                condition_id=str(top.get("condition_id", "")),
                ends_at=top.get("ends_at"),
            )

        if portfolio:
            context_parts.append("## Portfolio")
            context_parts.append(json.dumps(portfolio, default=str))

        user_msg = f"Query: {query}\n\n" + "\n".join(context_parts)

        resp = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.4,
            max_tokens=1200,
            response_format={"type": "json_object"},
        )

        raw = resp.choices[0].message.content or "{}"

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            logger.error("GPT-4o returned invalid JSON: %s", raw[:500])
            data = {
                "thesis": "Failed to parse prediction",
                "confidence": 0.0,
                "rationale": raw[:500],
                "invalidation": "N/A",
                "risk_note": "Prediction engine returned malformed output",
                "suggested_execution": {"action": "SKIP"},
            }

        exec_data = data.get("suggested_execution", {})
        prediction = Prediction(
            thesis=data.get("thesis", ""),
            confidence=max(0.0, min(1.0, float(data.get("confidence", 0)))),
            rationale=data.get("rationale", ""),
            invalidation=data.get("invalidation", ""),
            risk_note=data.get("risk_note", ""),
            suggested_execution=SuggestedExecution(
                action=exec_data.get("action", "SKIP"),
                token_id=exec_data.get("token_id", market_ctx.token_id),
                venue=exec_data.get("venue", market_ctx.venue),
                side=exec_data.get("side", ""),
                amount_usdc=float(exec_data.get("amount_usdc", 0)),
                order_type=exec_data.get("order_type", "MARKET"),
                price=exec_data.get("price"),
                kelly_fraction=exec_data.get("kelly_fraction"),
            ),
            market_context=market_ctx,
            query=query,
            model=self._model,
            wallet_id=wallet_id,
        )

        self._history.append(prediction)
        return prediction

    def get_history(self, limit: int = 50) -> list[Prediction]:
        return list(reversed(self._history[-limit:]))

    def get_prediction(self, prediction_id: str) -> Prediction | None:
        for p in self._history:
            if p.prediction_id == prediction_id:
                return p
        return None
