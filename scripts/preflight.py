"""Validate .env and optionally verify Synthesis API keys (GET /account/session)."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def _repo_root() -> Path:
    if env := os.environ.get("SYNTH_ROOT"):
        return Path(env).resolve()
    return Path(__file__).resolve().parents[1]


def _placeholder(secret: str, public: str) -> bool:
    s, p = secret.lower(), public.lower()
    if not secret.strip() or not public.strip():
        return True
    needles = (
        "your_public_key",
        "your_secret_key",
        "pk_your_",
        "sk_your_",
        "placeholder",
        "changeme",
        "example",
    )
    return any(n in s or n in p for n in needles)


def main() -> int:
    os.chdir(_repo_root())

    try:
        from synthesis.config import SynthesisSettings
    except ImportError:
        print("preflight: synthesis package not installed (pip install -e '.[all]')", file=sys.stderr)
        return 3

    try:
        settings = SynthesisSettings()
    except Exception as exc:
        print(f"preflight: invalid or missing .env — {exc}", file=sys.stderr)
        return 2

    if _placeholder(settings.secret_key, settings.public_key):
        print(
            "preflight: PUBLIC_KEY_SYNTH / SECRET_KEY_SYNTH look like placeholders; "
            "replace with keys from https://synthesis.trade/dashboard",
            file=sys.stderr,
        )
        return 2

    if os.environ.get("SYNTH_SKIP_VERIFY", "").lower() in ("1", "true", "yes"):
        print("preflight: SYNTH_SKIP_VERIFY set — skipping remote /account/session check")
        return 0

    base = settings.base_url.rstrip("/")
    url = f"{base}/account/session"
    req = Request(url, headers={"X-API-KEY": settings.secret_key})

    try:
        with urlopen(req, timeout=30) as resp:
            raw = resp.read().decode()
    except HTTPError as e:
        err_body = ""
        try:
            err_body = e.read().decode(errors="replace")[:500]
        except Exception:
            pass
        print(
            f"preflight: Synthesis API rejected keys (HTTP {e.code}){f' — {err_body}' if err_body else ''}",
            file=sys.stderr,
        )
        return 1
    except URLError as e:
        print(f"preflight: could not reach Synthesis API — {e.reason}", file=sys.stderr)
        return 1

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        print("preflight: invalid JSON from /account/session", file=sys.stderr)
        return 1

    if not data.get("success"):
        print(f"preflight: API error — {data!r}", file=sys.stderr)
        return 1

    print("preflight: Synthesis API credentials OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
