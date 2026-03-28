#!/usr/bin/env bash
# ── Synth — start the trading desk ──────────────────────────────────────────
# Modes:
#   ./run.sh           Start the HTTP server + Operator UI (port 8420)
#   ./run.sh mcp       Start the Nemoclaw MCP server (stdio)
#   ./run.sh docker    Build and run via Docker
#   ./run.sh test      Preflight + health check
#
# Environment:
#   SYNTH_SKIP_VERIFY=1  Skip remote API check (offline / CI)
#   SYNTH_ROOT           Repo root (set automatically)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SYNTH_ROOT="$ROOT"
cd "$ROOT"

DASHBOARD_URL="${SYNTH_DASHBOARD_URL:-https://synthesis.trade/dashboard}"
CMD="${1:-server}"

open_dashboard() {
  if command -v open >/dev/null 2>&1; then
    open "$DASHBOARD_URL" || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$DASHBOARD_URL" || true
  fi
}

activate_venv() {
  if [[ -f "$ROOT/.venv/bin/activate" ]]; then
    # shellcheck source=/dev/null
    source "$ROOT/.venv/bin/activate"
  elif [[ -f "$ROOT/venv/bin/activate" ]]; then
    # shellcheck source=/dev/null
    source "$ROOT/venv/bin/activate"
  fi
}

ensure_installed() {
  activate_venv
  if ! python3 -c "import synthesis" 2>/dev/null; then
    echo "synth: installing package (editable, all extras)…"
    pip install -q -e ".[all]"
  fi
}

preflight() {
  if [[ ! -f "$ROOT/.env" ]]; then
    echo "synth: no .env — copying .env.example"
    cp "$ROOT/.env.example" "$ROOT/.env"
    echo "synth: edit .env with your API keys, then run again."
    open_dashboard
    exit 1
  fi

  PREFLIGHT=(python3 "$ROOT/scripts/preflight.py")
  if "${PREFLIGHT[@]}"; then
    :
  else
    code=$?
    if [[ "$code" -eq 2 ]]; then
      echo "synth: configure .env with real API keys from the dashboard."
      open_dashboard
    elif [[ "$code" -eq 3 ]]; then
      echo "synth: pip install -e '.[all]' failed or package missing."
    fi
    exit "$code"
  fi
}

case "$CMD" in
  server)
    ensure_installed
    preflight
    mkdir -p "$ROOT/data"
    echo "synth: starting server on http://127.0.0.1:${SERVER_PORT:-8420}"
    echo "synth: operator UI → http://127.0.0.1:${SERVER_PORT:-8420}/"
    exec synthesis-server
    ;;
  mcp)
    ensure_installed
    preflight
    mkdir -p "$ROOT/data"
    echo "synth: starting Nemoclaw MCP server (stdio)…"
    exec synthesis-mcp
    ;;
  docker)
    echo "synth: building and running via Docker…"
    docker compose up --build -d
    echo "synth: container started → http://localhost:8420/"
    ;;
  test)
    ensure_installed
    preflight
    echo "synth: preflight passed. checking server health…"
    python3 -c "
from synthesis.server.app import create_app
from synthesis.config import SynthesisSettings
s = SynthesisSettings()
app = create_app(s)
print('  app created:', app.title)
print('  mode:', 'SIMULATION' if s.simulation_mode else 'LIVE')
print('  approval gate:', 'ON' if s.require_approval else 'OFF')
print('  predictions:', 'available' if s.openai_api_key else 'unavailable (no OPENAI_API_KEY)')
print('  routes:', len(app.routes))
print('synth: all checks passed.')
"
    ;;
  *)
    echo "Usage: ./run.sh [server|mcp|docker|test]"
    exit 1
    ;;
esac
