#!/usr/bin/env bash
# Install Synth as a macOS LaunchAgent (starts on login).
# Usage: ./scripts/install-launcher.sh [--uninstall]

set -euo pipefail

SYNTH_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLIST_NAME="com.synth.desk"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$PLIST_DIR/$PLIST_NAME.plist"

if [[ "${1:-}" == "--uninstall" ]]; then
  launchctl unload "$PLIST_PATH" 2>/dev/null || true
  rm -f "$PLIST_PATH"
  echo "Synth LaunchAgent removed."
  exit 0
fi

mkdir -p "$PLIST_DIR"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${PLIST_NAME}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${SYNTH_ROOT}/scripts/boot.sh</string>
    <string>--no-open</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
  <key>StandardOutPath</key>
  <string>${SYNTH_ROOT}/data/synth-boot.log</string>
  <key>StandardErrorPath</key>
  <string>${SYNTH_ROOT}/data/synth-boot.log</string>
  <key>WorkingDirectory</key>
  <string>${SYNTH_ROOT}</string>
</dict>
</plist>
EOF

launchctl load "$PLIST_PATH"
echo "Synth LaunchAgent installed. Will start on login."
echo "  Plist: $PLIST_PATH"
echo "  Log:   $SYNTH_ROOT/data/synth-boot.log"
echo ""
echo "  To uninstall: ./scripts/install-launcher.sh --uninstall"
