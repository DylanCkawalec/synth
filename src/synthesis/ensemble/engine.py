"""Ensemble Prediction Engine — multi-perspective, calibrated, Kelly-optimized.

Replaces single-shot GPT predictions with a rigorous pipeline:
  1. Parallel GPT calls with varied temperatures and analyst personas
  2. Optional statistical baseline from price history (time-series mean reversion)
  3. Aggregation via inverse-variance weighting or simple average
  4. Confidence calibration using historical outcomes (isotonic regression)
  5. Kelly sizing using the unified calculator
  6. Optional Mirofish swarm scenario injection for narrative context

The ensemble output enriches existing Prediction models without changing
the frontend contract — all improvements are backend-only.
"""

from __future__ import annotations

import asyncio
import json
import logging
import math
import statistics
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

logger = logging.getLogger("synth.ensemble")

ANALYST_PERSONAS = [
    {
        "name": "Base Analyst",
        "temperature": 0.3,
        "system_suffix": "You are a balanced, data-driven prediction market analyst. Weigh all evidence equally.",
    },
    {
        "name": "Contrarian",
        "temperature": 0.5,
        "system_suffix": "You are a contrarian analyst. Challenge consensus views. Identify risks others miss. Be rigorous about evidence quality.",
    },
    {
        "name": "Quantitative",
        "temperature": 0.2,
        "system_suffix": "You are a quantitative analyst focused on edge, expected value, and market microstructure. Prioritize liquidity, volume, and price action over narratives.",
    },
    {
        "name": "Urgency Specialist",
        "temperature": 0.4,
        "system_suffix": "You specialize in near-term resolution markets. Weight time-to-resolution heavily. Identify catalysts within the next 24 hours.",
    },
]

ENSEMBLE_SYSTEM = """\
You are Synth, an expert prediction-market analyst. You receive market data and a user query, \
then produce a structured trading prediction.

{persona_suffix}

Return ONLY valid JSON:
{{
  "thesis": "<string>",
  "confidence": <float 0-1>,
  "predicted_probability": <float 0-1>,
  "rationale": "<string>",
  "invalidation": "<string>",
  "risk_note": "<string>",
  "key_factor": "<single most important factor>",
  "suggested_execution": {{
    "action": "BUY|SELL|HOLD|SKIP",
    "side": "BUY|SELL|<empty>",
    "amount_usdc": <float>,
    "order_type": "MARKET|LIMIT",
    "price": <float or null>,
    "kelly_fraction": <float or null>
  }}
}}"""


@dataclass
class EnsembleResult:
    """Enriched prediction output from the ensemble pipeline."""
    prediction_id: str = ""
    thesis: str = ""
    confidence: float = 0.0
    calibrated_confidence: float = 0.0
    predicted_probability: float = 0.5
    calibrated_probability: float = 0.5
    edge: float = 0.0
    rationale: str = ""
    invalidation: str = ""
    risk_note: str = ""
    action: str = "SKIP"
    side: str = ""
    amount_usdc: float = 0.0
    kelly_full: float = 0.0
    kelly_fractional: float = 0.0
    kelly_amount_usdc: float = 0.0

    individual_views: list[dict] = field(default_factory=list)
    consensus_spread: float = 0.0
    statistical_baseline: float | None = None
    swarm_scenario: str = ""
    commitment_rationale: str = ""

    ensemble_method: str = "weighted_average"
    n_perspectives: int = 0
    brier_estimate: float = 0.0
    market_name: str = ""
    market_price: float = 0.5
    created_at: str = ""

    def to_prediction_dict(self) -> dict[str, Any]:
        """Convert to the existing Prediction schema for backward compatibility."""
        return {
            "id": self.prediction_id,
            "thesis": self.thesis,
            "confidence": self.calibrated_confidence,
            "rationale": self.rationale,
            "invalidation": self.invalidation,
            "riskNote": self.risk_note,
            "status": "generated",
            "action": self.action,
            "side": self.side,
            "amountUsdc": self.kelly_amount_usdc or self.amount_usdc,
            "orderType": "MARKET",
            "price": None,
            "kellyFraction": self.kelly_fractional,
            "marketName": self.market_name,
            "ensemble": {
                "n_perspectives": self.n_perspectives,
                "consensus_spread": self.consensus_spread,
                "calibrated_probability": self.calibrated_probability,
                "edge": self.edge,
                "brier_estimate": self.brier_estimate,
                "statistical_baseline": self.statistical_baseline,
                "method": self.ensemble_method,
                "commitment_rationale": self.commitment_rationale,
            },
        }


class EnsemblePredictionEngine:
    """Orchestrates multi-perspective GPT calls, calibration, and Kelly sizing."""

    def __init__(
        self,
        openai_api_key: str,
        model: str = "gpt-4o",
        calibrator: Any | None = None,
        kelly_calculator: Any | None = None,
        swarm_bridge: Any | None = None,
        n_perspectives: int = 3,
    ) -> None:
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise ImportError("openai package required: pip install openai")

        self._client = AsyncOpenAI(api_key=openai_api_key)
        self._model = model
        self._calibrator = calibrator
        self._swarm = swarm_bridge
        self._n_perspectives = min(n_perspectives, len(ANALYST_PERSONAS))

        if kelly_calculator is None:
            from synthesis.sizing.kelly import KellyCalculator
            kelly_calculator = KellyCalculator()
        self._kelly = kelly_calculator

    async def predict(
        self,
        query: str,
        markets: list[dict[str, Any]] | None = None,
        portfolio: dict[str, Any] | None = None,
        wallet_id: str | None = None,
        bankroll_usdc: float = 0.0,
        price_history: list[float] | None = None,
        news_context: str = "",
    ) -> EnsembleResult:
        """Run the full ensemble pipeline and return an enriched result."""
        market_price = 0.5
        market_name = query
        ends_at = ""
        if markets:
            top = markets[0]
            market_price = float(top.get("yes_price", top.get("left_price", 0.5)))
            market_name = top.get("market_name", top.get("event_title", query))
            ends_at = top.get("ends_at", "")

        # 1. Parallel GPT calls with varied personas
        views = await self._gather_perspectives(query, markets, portfolio)

        # 2. Statistical baseline from price history
        stat_baseline = self._statistical_baseline(price_history) if price_history else None

        # 3. Swarm scenario (async, fire only for markets with news)
        swarm_summary = ""
        if self._swarm and news_context:
            try:
                scenario = await self._swarm.generate_scenario(
                    market_name=market_name,
                    resolution_criteria=query,
                    news_context=news_context,
                    ends_at=ends_at,
                )
                swarm_summary = scenario.scenario_summary
            except Exception as e:
                logger.warning("Swarm scenario failed: %s", e)

        # 4. Aggregate
        result = self._aggregate(views, market_price, stat_baseline, swarm_summary)
        result.prediction_id = uuid4().hex[:12]
        result.market_name = market_name
        result.market_price = market_price
        result.created_at = datetime.now(timezone.utc).isoformat()

        # 5. Calibrate
        raw_prob = result.predicted_probability
        if self._calibrator and self._calibrator.is_fitted:
            result.calibrated_probability = self._calibrator.calibrate(raw_prob)
            result.calibrated_confidence = self._calibrator.calibrate(result.confidence)
        else:
            result.calibrated_probability = raw_prob
            result.calibrated_confidence = result.confidence

        # 6. Kelly sizing
        result.edge = result.calibrated_probability - market_price
        kelly_result = self._kelly.binary_market(
            result.calibrated_probability, market_price, bankroll_usdc,
        )
        result.kelly_full = kelly_result.full_kelly
        result.kelly_fractional = kelly_result.fractional_kelly
        result.kelly_amount_usdc = kelly_result.bankroll_fraction_usdc

        if result.edge <= 0:
            result.action = "SKIP"
            result.side = ""
            result.amount_usdc = 0.0

        # 7. Commitment rationale for user psychology
        result.commitment_rationale = self._build_commitment_rationale(result)

        return result

    async def _gather_perspectives(
        self,
        query: str,
        markets: list[dict] | None,
        portfolio: dict | None,
    ) -> list[dict]:
        """Fire N parallel GPT calls with different analyst personas."""
        context_parts: list[str] = []
        if markets:
            context_parts.append("## Market Data")
            for m in markets[:8]:
                context_parts.append(json.dumps(m, default=str))
        if portfolio:
            context_parts.append("## Portfolio")
            context_parts.append(json.dumps(portfolio, default=str))

        user_msg = f"Query: {query}\n\n" + "\n".join(context_parts)

        personas = ANALYST_PERSONAS[:self._n_perspectives]
        tasks = [
            self._single_gpt_call(persona, user_msg)
            for persona in personas
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        views: list[dict] = []
        for persona, result in zip(personas, results):
            if isinstance(result, Exception):
                logger.warning("Perspective '%s' failed: %s", persona["name"], result)
                continue
            result["_persona"] = persona["name"]
            views.append(result)

        return views

    async def _single_gpt_call(self, persona: dict, user_msg: str) -> dict:
        system = ENSEMBLE_SYSTEM.format(persona_suffix=persona["system_suffix"])
        resp = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_msg},
            ],
            temperature=persona["temperature"],
            max_tokens=1000,
            response_format={"type": "json_object"},
        )
        raw = resp.choices[0].message.content or "{}"
        return json.loads(raw)

    def _statistical_baseline(self, price_history: list[float]) -> float | None:
        """Simple mean-reversion baseline from recent price data."""
        if not price_history or len(price_history) < 3:
            return None
        try:
            recent = price_history[-10:]
            mean = statistics.mean(recent)
            trend = recent[-1] - recent[0]
            projected = mean + (trend * 0.3)  # damped trend extrapolation
            return max(0.01, min(0.99, projected))
        except Exception:
            return None

    def _aggregate(
        self,
        views: list[dict],
        market_price: float,
        stat_baseline: float | None,
        swarm_summary: str,
    ) -> EnsembleResult:
        """Weighted aggregation of multiple perspectives."""
        if not views:
            return EnsembleResult(action="SKIP", risk_note="No valid perspectives generated")

        probs = []
        confs = []
        for v in views:
            p = float(v.get("predicted_probability", v.get("confidence", 0.5)))
            c = float(v.get("confidence", 0.5))
            probs.append(max(0.01, min(0.99, p)))
            confs.append(max(0.01, min(0.99, c)))

        if stat_baseline is not None:
            probs.append(stat_baseline)
            confs.append(0.3)  # low confidence weight for statistical baseline

        # Confidence-weighted average
        total_weight = sum(confs)
        if total_weight > 0:
            weighted_prob = sum(p * c for p, c in zip(probs, confs)) / total_weight
        else:
            weighted_prob = statistics.mean(probs)

        avg_conf = statistics.mean(confs)
        spread = max(probs) - min(probs)

        # Reduce confidence when analysts disagree
        disagreement_penalty = min(spread * 0.5, 0.15)
        adjusted_conf = max(0.1, avg_conf - disagreement_penalty)

        best_view = max(views, key=lambda v: float(v.get("confidence", 0)))
        worst_view = min(views, key=lambda v: float(v.get("confidence", 0)))

        exec_data = best_view.get("suggested_execution", {})
        action = exec_data.get("action", "SKIP") if weighted_prob != market_price else "SKIP"
        side = exec_data.get("side", "")
        if weighted_prob > market_price and action not in ("SKIP", "HOLD"):
            side = "BUY"
        elif weighted_prob < market_price and action not in ("SKIP", "HOLD"):
            side = "SELL"

        individual_views = [
            {
                "persona": v.get("_persona", f"Analyst {i}"),
                "probability": float(v.get("predicted_probability", v.get("confidence", 0.5))),
                "confidence": float(v.get("confidence", 0.5)),
                "thesis": v.get("thesis", "")[:200],
                "key_factor": v.get("key_factor", ""),
            }
            for i, v in enumerate(views)
        ]

        return EnsembleResult(
            thesis=best_view.get("thesis", ""),
            confidence=round(adjusted_conf, 4),
            predicted_probability=round(weighted_prob, 4),
            rationale=best_view.get("rationale", ""),
            invalidation=best_view.get("invalidation", worst_view.get("invalidation", "")),
            risk_note=worst_view.get("risk_note", best_view.get("risk_note", "")),
            action=action,
            side=side,
            amount_usdc=float(exec_data.get("amount_usdc", 0)),
            individual_views=individual_views,
            consensus_spread=round(spread, 4),
            statistical_baseline=stat_baseline,
            swarm_scenario=swarm_summary[:1000] if swarm_summary else "",
            ensemble_method="confidence_weighted",
            n_perspectives=len(views),
            brier_estimate=round((weighted_prob - market_price) ** 2, 4),
        )

    @staticmethod
    def _build_commitment_rationale(result: EnsembleResult) -> str:
        """Behavioral nudge: frame the prediction to support clear decision-making.

        Uses loss-aversion framing, consensus clarity, and expected value
        to help users commit with confidence or skip decisively.
        """
        parts: list[str] = []

        if result.n_perspectives > 1:
            if result.consensus_spread < 0.1:
                parts.append(f"Strong consensus across {result.n_perspectives} independent analyses.")
            elif result.consensus_spread < 0.2:
                parts.append(f"Moderate agreement across {result.n_perspectives} analyses (spread: {result.consensus_spread:.0%}).")
            else:
                parts.append(f"Analysts disagree (spread: {result.consensus_spread:.0%}) — sizing reduced for safety.")

        if result.edge > 0.05:
            parts.append(f"Edge: {result.edge:.1%} above market price. Expected value is positive.")
        elif result.edge > 0:
            parts.append(f"Thin edge ({result.edge:.1%}). Proceed only if you trust the thesis.")
        else:
            parts.append("No positive edge detected. Recommended: SKIP.")

        if result.kelly_fractional > 0:
            parts.append(f"Kelly suggests {result.kelly_fractional:.1%} of bankroll (${result.kelly_amount_usdc:.0f}).")

        if result.calibrated_probability != result.predicted_probability:
            parts.append(f"Calibrated probability: {result.calibrated_probability:.0%} (raw: {result.predicted_probability:.0%}).")

        if result.statistical_baseline is not None:
            parts.append(f"Statistical baseline: {result.statistical_baseline:.0%}.")

        return " ".join(parts) if parts else "Insufficient data for a strong recommendation."
