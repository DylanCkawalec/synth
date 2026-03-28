"""Confidence calibration for LLM-generated prediction probabilities.

Uses isotonic regression and Platt scaling to map raw model confidences
to historically calibrated probabilities. Tracks Brier score and ECE
(Expected Calibration Error) for ongoing quality measurement.
"""

from __future__ import annotations

import json
import logging
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger("synth.calibration")

N_BINS = 10
MIN_SAMPLES_FOR_FIT = 20


@dataclass
class CalibrationMetrics:
    brier_score: float = 1.0
    ece: float = 1.0
    sample_count: int = 0
    bin_accuracies: list[float] = field(default_factory=list)
    bin_confidences: list[float] = field(default_factory=list)
    bin_counts: list[int] = field(default_factory=list)


@dataclass
class _Record:
    raw_confidence: float
    outcome: int  # 1 = correct, 0 = incorrect
    market_name: str = ""
    prediction_id: str = ""


class ConfidenceCalibrator:
    """Calibrates LLM confidence outputs using historical prediction outcomes.

    Supports two modes:
      - isotonic: non-parametric monotonic regression (sklearn.isotonic)
      - platt: logistic regression / Platt scaling (sklearn.linear_model)

    Falls back to a simple binned lookup when sklearn is unavailable.
    """

    def __init__(
        self,
        method: str = "isotonic",
        persist_path: str | Path | None = None,
    ) -> None:
        self._method = method
        self._persist_path = Path(persist_path) if persist_path else None
        self._records: list[_Record] = []
        self._fitted = False
        self._model: Any = None
        self._bin_map: dict[int, float] = {}
        self._sklearn_available = False

        try:
            import sklearn  # noqa: F401
            self._sklearn_available = True
        except ImportError:
            logger.info("scikit-learn not installed — using binned calibration fallback")

        if self._persist_path and self._persist_path.exists():
            self._load()

    def record_outcome(
        self,
        raw_confidence: float,
        was_correct: bool,
        market_name: str = "",
        prediction_id: str = "",
    ) -> None:
        self._records.append(_Record(
            raw_confidence=max(0.0, min(1.0, raw_confidence)),
            outcome=1 if was_correct else 0,
            market_name=market_name,
            prediction_id=prediction_id,
        ))
        if len(self._records) >= MIN_SAMPLES_FOR_FIT and len(self._records) % 5 == 0:
            self.fit()
        self._save()

    def fit(self) -> CalibrationMetrics:
        if len(self._records) < MIN_SAMPLES_FOR_FIT:
            logger.info("Need %d+ samples to fit, have %d", MIN_SAMPLES_FOR_FIT, len(self._records))
            return self.metrics()

        confs = [r.raw_confidence for r in self._records]
        outcomes = [r.outcome for r in self._records]

        if self._sklearn_available:
            self._fit_sklearn(confs, outcomes)
        else:
            self._fit_binned(confs, outcomes)

        self._fitted = True
        self._save()
        m = self.metrics()
        logger.info("Calibrator fitted: brier=%.4f ece=%.4f n=%d", m.brier_score, m.ece, m.sample_count)
        return m

    def calibrate(self, raw_confidence: float) -> float:
        c = max(0.0, min(1.0, raw_confidence))
        if not self._fitted:
            return c

        if self._sklearn_available and self._model is not None:
            try:
                import numpy as np
                result = self._model.predict(np.array([[c]]))[0]
                return float(max(0.0, min(1.0, result)))
            except Exception:
                pass

        b = min(int(c * N_BINS), N_BINS - 1)
        return self._bin_map.get(b, c)

    def metrics(self) -> CalibrationMetrics:
        if not self._records:
            return CalibrationMetrics()

        confs = [r.raw_confidence for r in self._records]
        outcomes = [r.outcome for r in self._records]
        n = len(confs)

        brier = sum((c - o) ** 2 for c, o in zip(confs, outcomes)) / n

        bin_accs: list[float] = []
        bin_confs: list[float] = []
        bin_counts: list[int] = []
        ece = 0.0

        for b in range(N_BINS):
            lo = b / N_BINS
            hi = (b + 1) / N_BINS
            idxs = [i for i, c in enumerate(confs) if lo <= c < hi]
            if not idxs:
                bin_accs.append(0.0)
                bin_confs.append((lo + hi) / 2)
                bin_counts.append(0)
                continue
            acc = sum(outcomes[i] for i in idxs) / len(idxs)
            conf = sum(confs[i] for i in idxs) / len(idxs)
            bin_accs.append(acc)
            bin_confs.append(conf)
            bin_counts.append(len(idxs))
            ece += abs(acc - conf) * len(idxs) / n

        return CalibrationMetrics(
            brier_score=brier,
            ece=ece,
            sample_count=n,
            bin_accuracies=bin_accs,
            bin_confidences=bin_confs,
            bin_counts=bin_counts,
        )

    @property
    def is_fitted(self) -> bool:
        return self._fitted

    @property
    def sample_count(self) -> int:
        return len(self._records)

    def _fit_sklearn(self, confs: list[float], outcomes: list[int]) -> None:
        import numpy as np

        X = np.array(confs).reshape(-1, 1)
        y = np.array(outcomes)

        if self._method == "isotonic":
            from sklearn.isotonic import IsotonicRegression
            self._model = IsotonicRegression(y_min=0.0, y_max=1.0, out_of_bounds="clip")
            self._model.fit(X.ravel(), y)
        else:
            from sklearn.linear_model import LogisticRegression
            self._model = LogisticRegression(C=1.0, max_iter=1000)
            self._model.fit(X, y)

        self._fit_binned(confs, outcomes)

    def _fit_binned(self, confs: list[float], outcomes: list[int]) -> None:
        self._bin_map = {}
        for b in range(N_BINS):
            lo = b / N_BINS
            hi = (b + 1) / N_BINS
            idxs = [i for i, c in enumerate(confs) if lo <= c < hi]
            if idxs:
                self._bin_map[b] = sum(outcomes[i] for i in idxs) / len(idxs)
            else:
                self._bin_map[b] = (lo + hi) / 2

    def _save(self) -> None:
        if not self._persist_path:
            return
        self._persist_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "records": [
                {"c": r.raw_confidence, "o": r.outcome, "m": r.market_name, "p": r.prediction_id}
                for r in self._records
            ],
            "bin_map": {str(k): v for k, v in self._bin_map.items()},
            "fitted": self._fitted,
        }
        self._persist_path.write_text(json.dumps(data))

    def _load(self) -> None:
        if not self._persist_path or not self._persist_path.exists():
            return
        try:
            data = json.loads(self._persist_path.read_text())
            self._records = [
                _Record(raw_confidence=r["c"], outcome=r["o"], market_name=r.get("m", ""), prediction_id=r.get("p", ""))
                for r in data.get("records", [])
            ]
            self._bin_map = {int(k): v for k, v in data.get("bin_map", {}).items()}
            self._fitted = data.get("fitted", False)
            if self._fitted and len(self._records) >= MIN_SAMPLES_FOR_FIT:
                confs = [r.raw_confidence for r in self._records]
                outcomes = [r.outcome for r in self._records]
                if self._sklearn_available:
                    self._fit_sklearn(confs, outcomes)
                else:
                    self._fit_binned(confs, outcomes)
            logger.info("Loaded %d calibration records", len(self._records))
        except Exception as e:
            logger.warning("Failed to load calibration data: %s", e)
