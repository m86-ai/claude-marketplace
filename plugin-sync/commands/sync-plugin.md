---
description: Clone a remote plugin repo and package it as an installable .plugin file
allowed-tools: Bash, Read, Write
argument-hint: <github-url-or-org/repo>
---

Clone a plugin from a remote Git repository and package it as a `.plugin` file that can be installed in Cowork.

## Process

1. Parse the argument to get the Git URL. Accept these formats:
   - `https://github.com/org/repo.git`
   - `https://github.com/org/repo`
   - `org/repo` (assume GitHub)
   - A full URL to any git remote

2. Clone the repo (shallow, depth 1) to `/tmp/plugin-sync-stage/`:
   ```bash
   rm -rf /tmp/plugin-sync-stage && git clone --depth 1 <url> /tmp/plugin-sync-stage
   ```

3. Verify the repo has a valid plugin structure:
   - Must have `.claude-plugin/plugin.json`
   - Read `plugin.json` to get the plugin `name`

4. If no `.claude-plugin/plugin.json` exists, check if it has a `skills/` or `commands/` directory. If so, create a minimal `plugin.json` using the repo name.

5. Package as ZIP, excluding development files:
   ```bash
   cd /tmp/plugin-sync-stage && zip -r /tmp/<name>.plugin . \
     -x "*.DS_Store" -x ".git/*" -x "tests/*" -x ".github/*" \
     -x ".gitignore" -x ".gitattributes" -x "node_modules/*" \
     -x "*.test.*" -x "__pycache__/*"
   ```

6. Copy the `.plugin` file to the workspace output folder so the user can install it:
   ```bash
   cp /tmp/<name>.plugin /sessions/lucid-eager-euler/mnt/Ops/<name>.plugin
   ```

7. Present the file to the user using the `present_files` MCP tool so it renders as an installable card.

8. Tell the user they can click to install the plugin. Mention the plugin name, version, and how many skills/commands it contains.

## Error Handling

- If git clone fails: report the error, suggest checking the URL or repo visibility.
- If no plugin structure found: offer to create a wrapper plugin from any `*.md` files found in the repo.
- If packaging fails: report the specific error.
