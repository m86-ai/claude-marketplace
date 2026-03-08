---
description: Manually run the docs-hub sync to refresh symlinks and index
allowed-tools:
  - Bash(bash, chmod)
---

# Docs Hub Sync

Run the sync script manually to pick up new projects or prune stale links.

```bash
chmod +x $CLAUDE_PLUGIN_ROOT/scripts/docs-hub-sync.sh
bash -c 'start=$(date +%s%3N); $CLAUDE_PLUGIN_ROOT/scripts/docs-hub-sync.sh 2>&1; end=$(date +%s%3N); ms=$((end - start)); echo "docs-hub-sync: completed in ${ms}ms"'
```

Report the output to the user.
