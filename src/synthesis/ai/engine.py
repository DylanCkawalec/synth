"""Synth AI Engine — GPT-4o powered prediction and analysis layer."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from synthesis.ai.models import (
    AuditEntry, ConfidenceLevel, MarketAnalysis, Prediction,
    TradeAction, TradeProposal,
)
from synthesis.ai.prompts import (
    MARKET_ANALYSIS_PROMPT, PORTFOLIO_REVIEW_PROMPT,
    SINGLE_MARKET_PROMPT, SYSTEM_PROMPT,
)
from synthesis.core.models import RiskConfig
from synthesis.sizing.kelly import KellyCalculator

logger = logging.getLogger("synth.ai")


def _confidence_level(c: float) -> ConfidenceLevel:
    if c >= 0.8:
        return ConfidenceLevel.VERY_HIGH
    if c >= 0.6:
        return ConfidenceLevel.HIGH
    if c >= 0.4:
        return ConfidenceLevel.MEDIUM
    return ConfidenceLevel.LOW


class SynthAIEngine:
    """GPT-4o powered trading analysis engine."""

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o",
        risk_config: RiskConfig | None = None,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._risk_config = risk_config or RiskConfig()
        self._audit_log: list[AuditEntry] = []
        self._kelly_calc = KellyCalculator(max_fraction=0.25, fractional_multiplier=0.5)
        self._client = httpx.AsyncClient(
            base_url="https://api.openai.com/v1",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            timeout=60.0,
        )

    async def _chat(self, user_prompt: str, temperature: float = 0.3) -> str:
        """Send a chat completion request to GPT-4o."""
        resp = await self._client.post(
            "/chat/completions",
            json={
                "model": self._model,
                "temperature": temperature,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "response_format": {"type": "json_object"},
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

    def _parse_json(self, raw: str) -> dict:
        """Parse JSON from GPT response, handling markdown fences."""
        text = raw.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            lines = lines[1:]  # skip ```json
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines)
        return json.loads(text)

    async def analyze_markets(
        self,
        markets: list[dict],
        portfolio_context: str = "No portfolio data available",
    ) -> MarketAnalysis:
        """Analyze a set of markets and produce predictions."""
        market_data = json.dumps(markets[:20], indent=2, default=str)
        risk_limits = json.dumps(self._risk_config.model_dump(), indent=2)

        prompt = MARKET_ANALYSIS_PROMPT.format(
            market_data=market_data,
            portfolio_context=portfolio_context,
            risk_limits=risk_limits,
        )

        raw = await self._chat(prompt)
        result = self._parse_json(raw)

        predictions = []
        proposals = []
        for p in result.get("predictions", []):
            confidence = float(p.get("confidence", 0.5))
            current_price = float(p.get("current_price", 0.5))
            predicted_prob = float(p.get("predicted_probability", 0.5))
            edge = predicted_prob - current_price

            pred = Prediction(
                market_id=p.get("market_id", ""),
                market_name=p.get("market_name", ""),
                venue=p.get("venue", "unknown"),
                thesis=p.get("thesis", ""),
                confidence=confidence,
                confidence_level=_confidence_level(confidence),
                predicted_outcome=p.get("predicted_outcome", ""),
                predicted_probability=predicted_prob,
                current_price=current_price,
                edge=edge,
                supporting_signals=p.get("supporting_signals", []),
                invalidation_conditions=p.get("invalidation_conditions", []),
                risk_notes=p.get("risk_notes", []),
                time_horizon=p.get("time_horizon", ""),
            )
            predictions.append(pred)

            action_str = p.get("action", "hold")
            try:
                action = TradeAction(action_str)
            except ValueError:
                action = TradeAction.HOLD

            if action not in (TradeAction.HOLD, TradeAction.AVOID):
                side = "BUY" if action in (TradeAction.BUY_YES, TradeAction.BUY_NO) else "SELL"
                amount = min(
                    float(p.get("suggested_amount_usdc", 10)),
                    self._risk_config.max_single_order_usdc,
                )
                kelly = self._kelly(predicted_prob, current_price)

                proposal = TradeProposal(
                    prediction=pred,
                    action=action,
                    suggested_side=side,
                    suggested_amount_usdc=amount,
                    token_id=p.get("market_id", ""),
                    rationale=p.get("rationale", pred.thesis),
                    why_now=p.get("why_now", ""),
                    why_not=p.get("why_not", ""),
                    kelly_fraction=kelly,
                    risk_reward_ratio=abs(edge / (1 - predicted_prob)) if predicted_prob < 1 else 0,
                    max_loss_usdc=amount,
                    requires_approval=True,
                )
                proposals.append(proposal)

        analysis = MarketAnalysis(
            query="market_scan",
            markets_analyzed=len(markets),
            predictions=predictions,
            proposals=proposals,
            summary=result.get("summary", ""),
            risk_assessment=result.get("risk_assessment", ""),
            portfolio_context=portfolio_context,
        )

        self._audit_log.append(AuditEntry(
            action="analyze_markets",
            details={"markets_count": len(markets), "predictions_count": len(predictions)},
        ))

        return analysis

    async def analyze_single_market(
        self,
        market: dict,
        orderbook: dict | None = None,
        trades: list[dict] | None = None,
        price_history: list[dict] | None = None,
        portfolio_context: str = "No portfolio data",
    ) -> Prediction:
        """Deep analysis of a single market."""
        prompt = SINGLE_MARKET_PROMPT.format(
            market_name=market.get("market_name", market.get("event_title", "")),
            venue=market.get("venue", "unknown"),
            yes_price=market.get("yes_price", market.get("left_price", "0.5")),
            no_price=market.get("no_price", market.get("right_price", "0.5")),
            volume=market.get("volume", "0"),
            volume_24h=market.get("volume_24h", market.get("volume24hr", "0")),
            liquidity=market.get("liquidity", "0"),
            ends_at=market.get("ends_at", "unknown"),
            orderbook=json.dumps(orderbook or {}, indent=2, default=str)[:2000],
            recent_trades=json.dumps((trades or [])[:20], indent=2, default=str),
            price_history=json.dumps((price_history or [])[:30], indent=2, default=str),
            portfolio_context=portfolio_context,
        )

        raw = await self._chat(prompt)
        p = self._parse_json(raw)

        confidence = float(p.get("confidence", 0.5))
        current_price = float(p.get("current_price", 0.5))
        predicted_prob = float(p.get("predicted_probability", 0.5))

        return Prediction(
            market_id=p.get("market_id", market.get("token_id", "")),
            market_name=p.get("market_name", market.get("market_name", "")),
            venue=p.get("venue", market.get("venue", "unknown")),
            thesis=p.get("thesis", ""),
            confidence=confidence,
            confidence_level=_confidence_level(confidence),
            predicted_outcome=p.get("predicted_outcome", ""),
            predicted_probability=predicted_prob,
            current_price=current_price,
            edge=predicted_prob - current_price,
            supporting_signals=p.get("supporting_signals", []),
            invalidation_conditions=p.get("invalidation_conditions", []),
            risk_notes=p.get("risk_notes", []),
            time_horizon=p.get("time_horizon", ""),
        )

    async def review_portfolio(
        self,
        positions: list[dict],
        balance: dict,
        pnl: dict,
        exposure: dict,
        market_conditions: list[dict] | None = None,
    ) -> dict:
        """AI-powered portfolio review and optimization suggestions."""
        risk_limits = json.dumps(self._risk_config.model_dump(), indent=2)
        prompt = PORTFOLIO_REVIEW_PROMPT.format(
            positions=json.dumps(positions[:30], indent=2, default=str),
            balance=json.dumps(balance, indent=2, default=str),
            pnl=json.dumps(pnl, indent=2, default=str),
            exposure=json.dumps(exposure, indent=2, default=str),
            risk_limits=risk_limits,
            market_conditions=json.dumps((market_conditions or [])[:10], indent=2, default=str),
        )

        raw = await self._chat(prompt)
        result = self._parse_json(raw)

        self._audit_log.append(AuditEntry(
            action="review_portfolio",
            details={"positions_count": len(positions)},
        ))

        return result

    def _kelly(self, win_prob: float, price: float) -> float:
        """Kelly criterion for binary markets using unified KellyCalculator."""
        result = self._kelly_calc.binary_market(win_prob, price)
        return result.fractional_kelly

    def get_audit_log(self) -> list[dict]:
        return [e.model_dump() for e in self._audit_log]

    async def close(self) -> None:
        await self._client.aclose()
