"""Mirofish swarm bridge — lightweight async wrapper around the vendored
Mirofish Flask API for generating narrative scenario analyses.

Workflow:
  1. Seed Mirofish with market resolution criteria + news context
  2. Build a knowledge graph of actors/entities via Zep
  3. Run a short OASIS multi-agent simulation (configurable rounds)
  4. Extract the ReportAgent's structured scenario summary
  5. Return as a SwarmScenario for injection into prediction context

When Mirofish is unavailable (no Zep key, service down), falls back to
a GPT-powered mini-swarm that generates adversarial perspectives directly.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from typing import Any

import httpx

logger = logging.getLogger("synth.swarm")

DEFAULT_MIROFISH_URL = "http://127.0.0.1:5001"
MAX_SIMULATION_ROUNDS = 5
POLL_INTERVAL_SECONDS = 3
MAX_POLL_ATTEMPTS = 40  # ~2 minutes max wait


@dataclass
class SwarmScenario:
    """Structured output from a Mirofish swarm simulation or GPT mini-swarm."""
    market_name: str = ""
    seed_text: str = ""
    scenario_summary: str = ""
    bull_thesis: str = ""
    bear_thesis: str = ""
    key_actors: list[str] = field(default_factory=list)
    sentiment_distribution: dict[str, float] = field(default_factory=dict)
    narrative_risk: str = ""
    confidence_adjustment: float = 0.0
    source: str = "gpt_fallback"
    generation_time_ms: int = 0


class MirofishBridge:
    """Thin async client for the vendored Mirofish Flask backend."""

    def __init__(
        self,
        mirofish_url: str = DEFAULT_MIROFISH_URL,
        openai_api_key: str = "",
        openai_model: str = "gpt-4o",
        timeout_seconds: float = 120.0,
    ) -> None:
        self._url = mirofish_url.rstrip("/")
        self._openai_key = openai_api_key
        self._openai_model = openai_model
        self._timeout = timeout_seconds
        self._client = httpx.AsyncClient(timeout=timeout_seconds)
        self._available: bool | None = None

    async def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            r = await self._client.get(f"{self._url}/api/graph/list", timeout=5.0)
            self._available = r.status_code == 200
        except Exception:
            self._available = False
        return self._available

    async def generate_scenario(
        self,
        market_name: str,
        resolution_criteria: str,
        news_context: str = "",
        ends_at: str = "",
        max_rounds: int = MAX_SIMULATION_ROUNDS,
    ) -> SwarmScenario:
        """Generate a narrative scenario analysis for a prediction market.

        Tries Mirofish first; falls back to GPT multi-perspective generation.
        """
        start = time.monotonic()

        if await self.is_available():
            try:
                result = await self._run_mirofish_pipeline(
                    market_name, resolution_criteria, news_context, ends_at, max_rounds,
                )
                result.generation_time_ms = int((time.monotonic() - start) * 1000)
                return result
            except Exception as e:
                logger.warning("Mirofish pipeline failed, falling back to GPT: %s", e)

        result = await self._gpt_mini_swarm(
            market_name, resolution_criteria, news_context, ends_at,
        )
        result.generation_time_ms = int((time.monotonic() - start) * 1000)
        return result

    async def _run_mirofish_pipeline(
        self,
        market_name: str,
        resolution_criteria: str,
        news_context: str,
        ends_at: str,
        max_rounds: int,
    ) -> SwarmScenario:
        seed = self._build_seed_text(market_name, resolution_criteria, news_context, ends_at)

        # 1. Upload seed text to build graph
        graph_resp = await self._client.post(
            f"{self._url}/api/graph/upload_text",
            json={"text": seed, "chunk_size": 300, "chunk_overlap": 30},
        )
        graph_resp.raise_for_status()
        graph_data = graph_resp.json()
        graph_id = graph_data.get("data", {}).get("graph_id", "")
        if not graph_id:
            raise RuntimeError("Mirofish did not return a graph_id")

        task_id = graph_data.get("data", {}).get("task_id", "")
        if task_id:
            await self._poll_task(task_id)

        # 2. Prepare simulation
        prep_resp = await self._client.post(
            f"{self._url}/api/simulation/prepare",
            json={"graph_id": graph_id, "max_rounds": max_rounds},
        )
        prep_resp.raise_for_status()
        sim_data = prep_resp.json().get("data", {})
        sim_id = sim_data.get("simulation_id", "")

        if sim_data.get("task_id"):
            await self._poll_task(sim_data["task_id"])

        # 3. Start simulation
        if sim_id:
            start_resp = await self._client.post(
                f"{self._url}/api/simulation/start",
                json={"simulation_id": sim_id},
            )
            start_resp.raise_for_status()
            start_data = start_resp.json().get("data", {})
            if start_data.get("task_id"):
                await self._poll_task(start_data["task_id"])

        # 4. Generate report
        report_resp = await self._client.post(
            f"{self._url}/api/report/generate",
            json={"simulation_id": sim_id},
        )
        report_resp.raise_for_status()
        report_data = report_resp.json().get("data", {})
        report_task = report_data.get("task_id", "")
        if report_task:
            await self._poll_task(report_task)

        # 5. Fetch the report
        report_content = await self._client.get(
            f"{self._url}/api/report/content",
            params={"simulation_id": sim_id},
        )
        report_content.raise_for_status()
        content = report_content.json().get("data", {})

        return SwarmScenario(
            market_name=market_name,
            seed_text=seed[:500],
            scenario_summary=content.get("report_text", content.get("summary", "")),
            bull_thesis=content.get("bull_case", ""),
            bear_thesis=content.get("bear_case", ""),
            key_actors=content.get("key_entities", []),
            sentiment_distribution=content.get("sentiment", {}),
            narrative_risk=content.get("risk_narrative", ""),
            source="mirofish",
        )

    async def _gpt_mini_swarm(
        self,
        market_name: str,
        resolution_criteria: str,
        news_context: str,
        ends_at: str,
    ) -> SwarmScenario:
        """Multi-perspective GPT fallback: 3 analyst personas debate the market."""
        if not self._openai_key:
            return SwarmScenario(
                market_name=market_name,
                scenario_summary="Swarm analysis unavailable — no API key configured.",
                source="unavailable",
            )

        try:
            from openai import AsyncOpenAI
        except ImportError:
            return SwarmScenario(market_name=market_name, source="unavailable")

        client = AsyncOpenAI(api_key=self._openai_key)
        seed = self._build_seed_text(market_name, resolution_criteria, news_context, ends_at)

        personas = [
            ("Macro Analyst", "You are a macro-focused prediction market analyst. You focus on systemic forces, policy, and broad trends. Be data-driven and cite specific evidence."),
            ("Contrarian Skeptic", "You are a contrarian skeptic. You challenge consensus, find flaws in popular reasoning, and identify overlooked risks. Be rigorous and provocative."),
            ("Quantitative Trader", "You are a quantitative trader focused on market microstructure: volume, liquidity, price action, and orderbook dynamics. You reason about edge and expected value."),
        ]

        tasks = [
            client.chat.completions.create(
                model=self._openai_model,
                temperature=0.6 + i * 0.1,
                max_tokens=600,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": persona_prompt + "\n\nReturn JSON: {\"thesis\": \"...\", \"probability\": 0.0-1.0, \"confidence\": 0.0-1.0, \"key_risk\": \"...\", \"key_factor\": \"...\"}"},
                    {"role": "user", "content": f"Analyze this prediction market:\n\n{seed}\n\nWhat is your probability estimate and thesis?"},
                ],
            )
            for i, (_, persona_prompt) in enumerate(personas)
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)
        views: list[dict] = []
        for resp in responses:
            if isinstance(resp, Exception):
                continue
            try:
                views.append(json.loads(resp.choices[0].message.content or "{}"))
            except Exception:
                continue

        if not views:
            return SwarmScenario(market_name=market_name, source="gpt_fallback")

        probs = [v.get("probability", 0.5) for v in views]
        avg_prob = sum(probs) / len(probs)
        spread = max(probs) - min(probs)

        bull = max(views, key=lambda v: v.get("probability", 0.5))
        bear = min(views, key=lambda v: v.get("probability", 0.5))

        summary_parts = []
        for (name, _), view in zip(personas, views):
            summary_parts.append(f"**{name}** (p={view.get('probability', '?'):.0%}): {view.get('thesis', 'N/A')}")

        return SwarmScenario(
            market_name=market_name,
            seed_text=seed[:500],
            scenario_summary="\n\n".join(summary_parts),
            bull_thesis=bull.get("thesis", ""),
            bear_thesis=bear.get("thesis", ""),
            key_actors=[v.get("key_factor", "") for v in views if v.get("key_factor")],
            sentiment_distribution={
                "bull": sum(1 for p in probs if p > 0.55) / len(probs),
                "bear": sum(1 for p in probs if p < 0.45) / len(probs),
                "neutral": sum(1 for p in probs if 0.45 <= p <= 0.55) / len(probs),
            },
            narrative_risk=bear.get("key_risk", ""),
            confidence_adjustment=-0.05 if spread > 0.3 else 0.0,
            source="gpt_fallback",
        )

    async def _poll_task(self, task_id: str) -> None:
        for _ in range(MAX_POLL_ATTEMPTS):
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
            try:
                r = await self._client.get(f"{self._url}/api/graph/task/{task_id}")
                if r.status_code != 200:
                    r = await self._client.get(f"{self._url}/api/simulation/task/{task_id}")
                if r.status_code != 200:
                    r = await self._client.get(f"{self._url}/api/report/generate/status", params={"task_id": task_id})
                data = r.json().get("data", {})
                status = data.get("status", "")
                if status in ("completed", "done", "finished", "ready"):
                    return
                if status in ("failed", "error"):
                    raise RuntimeError(f"Mirofish task {task_id} failed: {data}")
            except httpx.HTTPError:
                continue
        logger.warning("Mirofish task %s timed out after polling", task_id)

    @staticmethod
    def _build_seed_text(
        market_name: str,
        resolution_criteria: str,
        news_context: str,
        ends_at: str,
    ) -> str:
        parts = [
            f"# Prediction Market: {market_name}",
            f"\n## Resolution Criteria\n{resolution_criteria}" if resolution_criteria else "",
            f"\n## Deadline\n{ends_at}" if ends_at else "",
            f"\n## Recent News & Context\n{news_context}" if news_context else "",
        ]
        return "\n".join(p for p in parts if p)

    async def close(self) -> None:
        await self._client.aclose()
