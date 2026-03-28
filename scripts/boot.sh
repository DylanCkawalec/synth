#!/usr/bin/env bash
# Synth — Desktop boot script
# Starts the TypeScript server and opens the dashboard.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/app"
PORT="${SERVER_PORT:-8420}"
NO_OPEN=false
[[ "${1:-}" == "--no-open" ]] && NO_OPEN=true

log() { echo -e "\033[0;36m[synth]\033[0m $*"; }
ok()  { echo -e "\033[0;32m[synth]\033[0m $*"; }

cd "$ROOT"

# Check .env
[ -f .env ] || { [ -f .env.example ] && cp .env.example .env && log "Created .env from example"; } || { echo "Missing .env"; exit 1; }

# Ensure data dir
mkdir -p data

# Install deps if needed
[ -d "$APP/node_modules" ] || { log "Installing dependencies..."; (cd "$APP" && npm install --silent); }

# Build frontend if needed
[ -d "$APP/dist" ] || { log "Building frontend..."; (cd "$APP" && npm run build); }

# Kill existing
lsof -ti:"$PORT" 2>/dev/null | xargs kill 2>/dev/null || true
sleep 0.5

# Start server
log "Starting Synth on http://127.0.0.1:$PORT ..."
(cd "$APP" && npx tsx server/index.ts) &
PID=$!

# Wait for healthy
for i in $(seq 1 15); do
  curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1 && break
  [ "$i" -eq 15 ] && { echo "Server failed to start"; kill $PID 2>/dev/null; exit 1; }
  sleep 1
done
ok "Server healthy (PID $PID)"

# Open browser
if ! $NO_OPEN; then
  command -v open >/dev/null && open "http://127.0.0.1:$PORT"
  ok "Dashboard opened"
fi

ok "Synth running at http://127.0.0.1:$PORT"
echo "  Press Ctrl+C to stop."
wait $PID
