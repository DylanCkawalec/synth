#!/usr/bin/env bash
# ── Synth — start the trading desk ──────────────────────────────────────────
# Modes:
#   ./run.sh           Start the Node app + Opseeq gateway (recommended)
#   ./run.sh app       Same as above — Node desk + Opseeq
#   ./run.sh server    Start the Python synthesis-server + Opseeq
#   ./run.sh mcp       Start the Opseeq MCP server (stdio)
#   ./run.sh docker    Build and run via Docker
#   ./run.sh test      Preflight + health check
#
# Environment:
#   SYNTH_SKIP_VERIFY=1   Skip remote API check (offline / CI)
#   SYNTH_SKIP_OPSEEQ=1   Skip launching Opseeq agent gateway
#   OPSEEQ_URL            Override Opseeq URL (default http://127.0.0.1:9090)
#   OPSEEQ_REPO           Absolute path to opseeq repo for Docker builds (default: ../opseeq)
#   OPSEEQ_FORCE_REBUILD  Set to 1 to rebuild opseeq:v5 from source and recreate container
#   SYNTH_ROOT            Repo root (set automatically)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SYNTH_ROOT="$ROOT"
SYNTH_PORT="${SERVER_PORT:-8420}"
SYNTH_URL="http://127.0.0.1:${SYNTH_PORT}"
OPSEEQ_URL="${OPSEEQ_URL:-http://127.0.0.1:9090}"
cd "$ROOT"

DASHBOARD_URL="${SYNTH_DASHBOARD_URL:-https://synthesis.trade/dashboard}"
CMD="${1:-app}"

open_dashboard() {
  if command -v open >/dev/null 2>&1; then
    open "$DASHBOARD_URL" || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$DASHBOARD_URL" || true
  fi
}

activate_venv() {
  if [[ -f "$ROOT/.venv/bin/activate" ]]; then
    source "$ROOT/.venv/bin/activate"
  elif [[ -f "$ROOT/venv/bin/activate" ]]; then
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

wait_for_synth() {
  local attempts=0
  echo "synth: waiting for desk at ${SYNTH_URL}…"
  while [ "${attempts}" -lt 30 ]; do
    if curl -fsS "${SYNTH_URL}/api/health" >/dev/null 2>&1; then
      echo "synth: desk is live at ${SYNTH_URL}"
      return 0
    fi
    attempts=$((attempts + 1))
    sleep 1
  done
  echo "synth: desk not yet ready after 30s — Opseeq will retry" >&2
  return 0
}

ensure_opseeq() {
  if [[ "${SYNTH_SKIP_OPSEEQ:-}" == "1" ]]; then
    return 0
  fi

  local opseeq_root="${OPSEEQ_REPO:-$ROOT/../opseeq}"
  if [[ -d "$opseeq_root" ]]; then
    opseeq_root="$(cd "$opseeq_root" && pwd)"
  fi

  if [[ "${OPSEEQ_FORCE_REBUILD:-}" == "1" ]]; then
    :
  elif curl -fsS "${OPSEEQ_URL}/health" >/dev/null 2>&1; then
    echo "synth: Opseeq gateway already running at ${OPSEEQ_URL}"
    return 0
  fi

  if ! command -v docker >/dev/null 2>&1; then
    echo "synth: Opseeq not running and Docker not found. Set SYNTH_SKIP_OPSEEQ=1 to skip."
    return 0
  fi

  if [[ -f "${opseeq_root}/Dockerfile.service" ]]; then
    if [[ "${OPSEEQ_FORCE_REBUILD:-}" == "1" ]]; then
      echo "synth: OPSEEQ_FORCE_REBUILD=1 — rebuilding Opseeq from ${opseeq_root} …"
    else
      echo "synth: building Opseeq from ${opseeq_root} (no healthy gateway on ${OPSEEQ_URL}) …"
    fi
    docker build -f "${opseeq_root}/Dockerfile.service" -t opseeq:v5 "${opseeq_root}"
    docker rm -f opseeq 2>/dev/null || true
    if [[ -f "$ROOT/.env" ]]; then
      docker run -d --name opseeq -p 9090:9090 --env-file "$ROOT/.env" opseeq:v5
    else
      docker run -d --name opseeq -p 9090:9090 opseeq:v5
    fi
    return 0
  fi

  echo "synth: starting Opseeq gateway (no ${opseeq_root}/Dockerfile.service — using existing opseeq:v5 image)…"
  docker start opseeq 2>/dev/null || docker run -d --name opseeq -p 9090:9090 --env-file "$ROOT/.env" opseeq:v5 2>/dev/null || docker run -d --name opseeq -p 9090:9090 opseeq:v5 2>/dev/null || true
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
  app)
    echo "synth: starting Node desk + Opseeq…"
    echo ""

    cd "$ROOT/app"
    if [[ ! -d "node_modules" ]]; then
      echo "synth: installing Node dependencies…"
      npm install
    fi

    npm run server &
    SYNTH_PID=$!

    cd "$ROOT"
    wait_for_synth
    ensure_opseeq

    echo ""
    echo "  ⚡ Synth desk:     ${SYNTH_URL}"
    echo "  🔷 Opseeq:         ${OPSEEQ_URL}"
    echo "  📊 Open in browser: ${SYNTH_URL}"
    echo ""

    wait "$SYNTH_PID"
    ;;
  server)
    ensure_installed
    preflight
    ensure_opseeq
    mkdir -p "$ROOT/data"
    echo "synth: starting server on ${SYNTH_URL}"
    echo "synth: operator UI → ${SYNTH_URL}/"
    exec synthesis-server
    ;;
  mcp)
    ensure_installed
    preflight
    mkdir -p "$ROOT/data"
    echo "synth: starting Opseeq MCP server (stdio)…"
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
    echo "Usage: ./run.sh [app|server|mcp|docker|test]"
    echo ""
    echo "  app     Start Node desk + Opseeq gateway (default)"
    echo "  server  Start Python synthesis-server + Opseeq"
    echo "  mcp     Start MCP server (stdio)"
    echo "  docker  Build and run via Docker"
    echo "  test    Preflight checks"
    exit 1
    ;;
esac
