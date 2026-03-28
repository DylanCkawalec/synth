"""Fine-tuning data pipeline for Synth prediction models.

Generates training examples from:
  1. Resolved predictions with known outcomes (primary source)
  2. Mirofish swarm simulation outputs (synthetic augmentation)
  3. Ensemble disagreement cases (hard examples for calibration)

Output formats:
  - OpenAI JSONL (for GPT fine-tuning via API)
  - Alpaca-style JSON (for local LoRA with Axolotl/unsloth)
  - Raw CSV for sklearn/statistical model training

This pipeline does NOT perform the actual fine-tuning — it produces
the dataset. Fine-tuning is done via OpenAI API or local tools.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger("synth.finetune")


@dataclass
class TrainingExample:
    """A single training example for fine-tuning."""
    system: str
    user_input: str
    assistant_output: str
    market_name: str = ""
    outcome: str = ""  # "correct" | "incorrect" | "unknown"
    confidence: float = 0.0
    actual_probability: float | None = None
    source: str = "resolved_prediction"
    tags: list[str] = field(default_factory=list)


FINETUNE_SYSTEM = """\
You are Synth, an expert prediction-market analyst. Given market data and a query, \
produce a calibrated prediction with thesis, probability estimate, rationale, \
invalidation criteria, and Kelly-optimal sizing. Your probabilities should match \
long-run resolution rates. Be specific. Be honest about uncertainty."""


class FineTunePipeline:
    """Generate fine-tuning datasets from prediction history and Mirofish sims."""

    def __init__(self, output_dir: str | Path = "data/finetune") -> None:
        self._output_dir = Path(output_dir)
        self._output_dir.mkdir(parents=True, exist_ok=True)
        self._examples: list[TrainingExample] = []

    def add_resolved_prediction(
        self,
        query: str,
        markets: list[dict],
        prediction: dict,
        was_correct: bool,
        actual_resolution: str = "",
    ) -> None:
        """Create a training example from a resolved prediction.

        For correct predictions: reinforce the output.
        For incorrect: create a corrected version with hindsight annotation.
        """
        market_context = self._format_markets(markets)

        if was_correct:
            output = self._format_prediction_output(prediction)
            tags = ["correct", "reinforcement"]
        else:
            output = self._format_corrected_output(prediction, actual_resolution)
            tags = ["incorrect", "correction"]

        self._examples.append(TrainingExample(
            system=FINETUNE_SYSTEM,
            user_input=f"Query: {query}\n\n{market_context}",
            assistant_output=output,
            market_name=prediction.get("marketName", prediction.get("market_name", "")),
            outcome="correct" if was_correct else "incorrect",
            confidence=float(prediction.get("confidence", 0)),
            source="resolved_prediction",
            tags=tags,
        ))

    def add_ensemble_disagreement(
        self,
        query: str,
        markets: list[dict],
        ensemble_result: dict,
    ) -> None:
        """Create training examples from cases where ensemble analysts disagreed.

        The blended output (with calibration) is treated as the target,
        teaching the model to produce more calibrated responses directly.
        """
        views = ensemble_result.get("ensemble", {}).get("individual_views", [])
        if not views:
            return

        market_context = self._format_markets(markets)
        calibrated_prob = ensemble_result.get("ensemble", {}).get("calibrated_probability", 0.5)

        output = json.dumps({
            "thesis": ensemble_result.get("thesis", ""),
            "confidence": ensemble_result.get("confidence", 0.5),
            "predicted_probability": calibrated_prob,
            "rationale": ensemble_result.get("rationale", ""),
            "invalidation": ensemble_result.get("invalidation", ""),
            "risk_note": ensemble_result.get("riskNote", ""),
            "analyst_perspectives": [
                {"persona": v.get("persona", ""), "probability": v.get("probability", 0.5)}
                for v in views
            ],
            "suggested_execution": {
                "action": ensemble_result.get("action", "SKIP"),
                "side": ensemble_result.get("side", ""),
                "amount_usdc": ensemble_result.get("amountUsdc", 0),
                "kelly_fraction": ensemble_result.get("kellyFraction", 0),
            },
        }, indent=2)

        self._examples.append(TrainingExample(
            system=FINETUNE_SYSTEM,
            user_input=f"Query: {query}\n\n{market_context}",
            assistant_output=output,
            market_name=ensemble_result.get("marketName", ""),
            confidence=float(ensemble_result.get("confidence", 0.5)),
            source="ensemble_disagreement",
            tags=["ensemble", "calibration"],
        ))

    def add_swarm_scenario(
        self,
        market_name: str,
        scenario: dict,
        markets: list[dict] | None = None,
    ) -> None:
        """Create training examples from Mirofish swarm outputs.

        The swarm's multi-perspective analysis is formatted as a training
        target to teach the model to reason from multiple angles.
        """
        market_context = self._format_markets(markets or [])
        output = json.dumps({
            "thesis": f"Swarm analysis of {market_name}",
            "scenario_summary": scenario.get("scenario_summary", ""),
            "bull_thesis": scenario.get("bull_thesis", ""),
            "bear_thesis": scenario.get("bear_thesis", ""),
            "key_actors": scenario.get("key_actors", []),
            "sentiment_distribution": scenario.get("sentiment_distribution", {}),
            "narrative_risk": scenario.get("narrative_risk", ""),
        }, indent=2)

        self._examples.append(TrainingExample(
            system=FINETUNE_SYSTEM + "\n\nInclude multi-perspective scenario analysis with bull/bear cases.",
            user_input=f"Swarm analysis request: {market_name}\n\n{market_context}",
            assistant_output=output,
            market_name=market_name,
            source="swarm_scenario",
            tags=["swarm", "synthetic"],
        ))

    def export_openai_jsonl(self, filename: str = "train.jsonl") -> Path:
        """Export in OpenAI fine-tuning format."""
        path = self._output_dir / filename
        with path.open("w") as f:
            for ex in self._examples:
                entry = {
                    "messages": [
                        {"role": "system", "content": ex.system},
                        {"role": "user", "content": ex.user_input},
                        {"role": "assistant", "content": ex.assistant_output},
                    ]
                }
                f.write(json.dumps(entry) + "\n")
        logger.info("Exported %d examples to %s (OpenAI JSONL)", len(self._examples), path)
        return path

    def export_alpaca_json(self, filename: str = "train_alpaca.json") -> Path:
        """Export in Alpaca format for local LoRA fine-tuning (Axolotl/unsloth)."""
        path = self._output_dir / filename
        entries = [
            {
                "instruction": ex.system,
                "input": ex.user_input,
                "output": ex.assistant_output,
                "metadata": {
                    "market": ex.market_name,
                    "outcome": ex.outcome,
                    "source": ex.source,
                    "tags": ex.tags,
                },
            }
            for ex in self._examples
        ]
        path.write_text(json.dumps(entries, indent=2))
        logger.info("Exported %d examples to %s (Alpaca JSON)", len(self._examples), path)
        return path

    def export_csv(self, filename: str = "train.csv") -> Path:
        """Export numerical features for sklearn/statistical model training."""
        path = self._output_dir / filename
        lines = ["market_name,confidence,actual_probability,outcome,source"]
        for ex in self._examples:
            actual = ex.actual_probability if ex.actual_probability is not None else ""
            outcome_val = "1" if ex.outcome == "correct" else "0" if ex.outcome == "incorrect" else ""
            lines.append(f"{ex.market_name},{ex.confidence},{actual},{outcome_val},{ex.source}")
        path.write_text("\n".join(lines))
        logger.info("Exported %d examples to %s (CSV)", len(self._examples), path)
        return path

    @property
    def count(self) -> int:
        return len(self._examples)

    def clear(self) -> None:
        self._examples.clear()

    @staticmethod
    def _format_markets(markets: list[dict]) -> str:
        if not markets:
            return "No market data available."
        parts = ["## Market Data"]
        for m in markets[:8]:
            parts.append(json.dumps(m, default=str))
        return "\n".join(parts)

    @staticmethod
    def _format_prediction_output(prediction: dict) -> str:
        return json.dumps({
            "thesis": prediction.get("thesis", ""),
            "confidence": prediction.get("confidence", 0.5),
            "predicted_probability": prediction.get("confidence", 0.5),
            "rationale": prediction.get("rationale", ""),
            "invalidation": prediction.get("invalidation", ""),
            "risk_note": prediction.get("riskNote", prediction.get("risk_note", "")),
            "suggested_execution": {
                "action": prediction.get("action", "SKIP"),
                "side": prediction.get("side", ""),
                "amount_usdc": prediction.get("amountUsdc", prediction.get("amount_usdc", 0)),
                "kelly_fraction": prediction.get("kellyFraction", prediction.get("kelly_fraction", 0)),
            },
        }, indent=2)

    @staticmethod
    def _format_corrected_output(prediction: dict, actual_resolution: str) -> str:
        original_conf = float(prediction.get("confidence", 0.5))
        corrected_conf = 1.0 - original_conf  # flip for incorrect prediction

        return json.dumps({
            "thesis": prediction.get("thesis", "") + f" [CORRECTION: This prediction was incorrect. Actual outcome: {actual_resolution}]",
            "confidence": round(corrected_conf, 4),
            "predicted_probability": round(corrected_conf, 4),
            "rationale": f"Original rationale was flawed. {prediction.get('invalidation', 'The invalidation condition was triggered.')}",
            "invalidation": "N/A — this is a hindsight correction.",
            "risk_note": prediction.get("riskNote", prediction.get("risk_note", "")),
            "suggested_execution": {"action": "SKIP", "side": "", "amount_usdc": 0, "kelly_fraction": 0},
        }, indent=2)
