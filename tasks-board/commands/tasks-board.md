---
description: Launch the visual tasks board UI
allowed-tools: Bash(node:*, fuser:*, kill:*, lsof:*), Read
---

Launch the tasks board server and open the UI in the browser.

1. Check if port 3456 is already in use. If so, kill the existing process.
2. Determine the tasks directory. Default: look for a `tasks/` directory in the user's workspace. If the user has specified a custom path, use that.
3. Start the server:
   ```
   TASKS_DIR=<path-to-tasks> node ${CLAUDE_PLUGIN_ROOT}/server/server.js &
   ```
4. Wait 1 second for the server to start.
5. Tell the user the board is running at http://localhost:3456 and they can open it in their browser.

If the server fails to start, check the error output and help the user resolve it (common issues: port in use, tasks directory not found).
