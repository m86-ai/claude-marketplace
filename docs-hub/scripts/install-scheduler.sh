#!/usr/bin/env bash
# Install the launchd scheduler for docs-hub-sync
set -euo pipefail

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
SYNC_SCRIPT="$HOME/Ops/docs-hub-sync.sh"
SYNC_LOG="$HOME/Ops/docs-hub-sync.log"
PLIST_NAME="com.m86.docs-hub-sync"
LAUNCH_AGENTS="$HOME/Library/LaunchAgents"
PLIST_TARGET="$LAUNCH_AGENTS/$PLIST_NAME.plist"

# Symlink the sync script to ~/Ops so launchd has a stable path
ln -sf "$PLUGIN_ROOT/scripts/docs-hub-sync.sh" "$SYNC_SCRIPT"
echo "Sync script linked: $SYNC_SCRIPT → $PLUGIN_ROOT/scripts/docs-hub-sync.sh"

# Unload if already running
if launchctl list | grep -q "$PLIST_NAME" 2>/dev/null; then
  echo "Unloading existing scheduler..."
  launchctl unload "$PLIST_TARGET" 2>/dev/null || true
fi

# Generate plist dynamically with correct paths
mkdir -p "$LAUNCH_AGENTS"
cat > "$PLIST_TARGET" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$PLIST_NAME</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$SYNC_SCRIPT</string>
    </array>
    <key>StartInterval</key>
    <integer>3600</integer>
    <key>StandardOutPath</key>
    <string>$SYNC_LOG</string>
    <key>StandardErrorPath</key>
    <string>$SYNC_LOG</string>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF

# Load
launchctl load "$PLIST_TARGET"

echo "docs-hub scheduler installed:"
echo "  plist: $PLIST_TARGET"
echo "  frequency: every hour + on login"
echo "  log: $SYNC_LOG"

# Verify
if launchctl list | grep -q "$PLIST_NAME"; then
  echo "  status: running"
else
  echo "  status: FAILED — check plist"
  exit 1
fi
