---
name: plugin-sync
description: >
  This skill should be used when the user asks to "install a plugin from GitHub",
  "sync a remote plugin", "add superpowers", "clone a plugin repo",
  "package a plugin for Cowork", or needs to convert a Claude Code plugin
  into a Cowork-installable .plugin file.
version: 0.1.0
---

# Plugin Sync

Convert any Git-hosted Claude Code plugin into an installable Cowork `.plugin` file.

## When to Use

- User wants a Claude Code plugin available in Cowork
- User references a GitHub repo containing skills/commands
- User asks to sync or update a remote plugin

## Workflow

1. Clone the remote repo (shallow)
2. Validate plugin structure (`.claude-plugin/plugin.json`)
3. Package as `.plugin` ZIP (exclude `.git/`, `tests/`, dev files)
4. Present to user as installable artifact

## Known Plugin Sources

| Plugin | Repo | Description |
|--------|------|-------------|
| superpowers | `obra/superpowers` | TDD, debugging, collaboration, planning skills |

## Notes

- Cowork plugins and Claude Code plugins use the same format
- The `.plugin` file renders as an installable card in Cowork chat
- Skills appear in Cowork's skill list after installation
- Commands become available as `/command-name` slash commands
