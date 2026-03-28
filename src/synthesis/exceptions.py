from __future__ import annotations


class SynthesisError(Exception):
    """Base exception for all Synthesis errors."""


class SynthesisAPIError(SynthesisError):
    """Error returned by the Synthesis API."""

    def __init__(self, message: str, status_code: int | None = None):
        self.status_code = status_code
        super().__init__(message)


class RiskViolationError(SynthesisError):
    """Order rejected by the risk engine."""

    def __init__(self, reasons: list[str]):
        self.reasons = reasons
        super().__init__(f"Risk check failed: {'; '.join(reasons)}")


class SimulationModeError(SynthesisError):
    """Attempted live trade while in simulation mode."""

    def __init__(self):
        super().__init__("Cannot execute live trades while simulation_mode=True. Set simulation_mode=False in config.")
