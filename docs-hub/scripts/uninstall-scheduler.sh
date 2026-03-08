#!/usr/bin/env bash
# Uninstall the launchd scheduler for docs-hub-sync
set -euo pipefail

PLIST_NAME="com.m86.docs-hub-sync"
PLIST_TARGET="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

if launchctl list | grep -q "$PLIST_NAME" 2>/dev/null; then
  launchctl unload "$PLIST_TARGET" 2>/dev/null
  echo "Scheduler unloaded."
else
  echo "Scheduler not running."
fi

if [[ -e "$PLIST_TARGET" ]]; then
  rm "$PLIST_TARGET"
  echo "Plist removed: $PLIST_TARGET"
fi

echo "docs-hub scheduler uninstalled."
