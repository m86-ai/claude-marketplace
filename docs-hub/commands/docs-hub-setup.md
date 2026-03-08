---
description: Set up the docs-hub Obsidian vault and install the hourly sync scheduler
allowed-tools:
  - Bash(bash, mkdir, ln, chmod, launchctl, obsidian)
  - Read
---

# Docs Hub Setup

Run the initial setup for the docs-hub plugin:

1. Ensure `~/Ops/docs-hub` exists as an Obsidian vault
2. Run the sync script to populate symlinks
3. Install the launchd scheduler for hourly sync

## Steps

1. Check if the vault directory exists:
   ```bash
   ls ~/Ops/docs-hub/.obsidian 2>/dev/null
   ```
   If not, tell the user to create the vault in Obsidian: **Open another vault > Open folder as vault > `~/Ops/docs-hub`**

2. Make scripts executable and run the sync:
   ```bash
   chmod +x $CLAUDE_PLUGIN_ROOT/scripts/*.sh
   bash $CLAUDE_PLUGIN_ROOT/scripts/docs-hub-sync.sh
   ```

3. Install the launchd scheduler:
   ```bash
   bash $CLAUDE_PLUGIN_ROOT/scripts/install-scheduler.sh
   ```

4. Verify the vault is working:
   ```bash
   obsidian vault=docs-hub files total
   ```

5. Report results to the user.
