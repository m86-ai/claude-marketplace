# M86 Claude Marketplace

## What This Is
Private plugin marketplace for Claude Code and Cowork, maintained by M86.ai (Rodrigo Garcia).
GitHub repo: `m86-ai/claude-marketplace`

## Architecture

```
.claude-plugin/marketplace.json   # Marketplace catalog — lists all plugins
plugins live as top-level dirs:
  tasks-board/                    # Visual kanban backed by markdown
  plugin-sync/                    # Bridges Claude Code marketplace to Cowork
```

Each plugin has its own `.claude-plugin/plugin.json` manifest.

### marketplace.json Source Format
- **Local plugins**: plain string with `./` prefix (e.g. `"source": "./tasks-board"`)
- **Remote plugins**: object with `source` type (e.g. `{"source": "url", "url": "https://github.com/org/repo.git"}`)
- Schema ref: `https://anthropic.com/claude-code/marketplace.schema.json`
- Required top-level fields: `$schema`, `name`, `description`, `owner` (with `name` + `email`), `plugins`
- Plugin `version` is optional in marketplace.json (official marketplace omits it for most plugins); when set, it must be valid semver

## Current Plugins

| Plugin | Version | Source | Description |
|--------|---------|--------|-------------|
| superpowers | 4.3.1 | remote (obra/superpowers.git) | TDD, debugging, collaboration patterns |
| tasks-board | 0.1.0 | local | Visual task board — epics, tasks, subtask checkboxes |
| plugin-sync | 0.1.0 | local | Clone remote plugins, package as .plugin for Cowork |

## Plugin Versioning

### How It Works
- The `version` field in marketplace.json (or plugin.json) determines cache paths and update detection
- Cache path: `~/.claude/plugins/cache/{marketplace-name}/{plugin-name}/{version}/`
- When you bump version, Claude fetches fresh and caches under the new version
- **For relative-path plugins: set version in marketplace.json** (not plugin.json)
- For remote plugins: set version in plugin.json (plugin.json always wins silently — avoid setting in both places)
- If two refs/commits have the same version, Claude skips the update
- No version subdirectories in source — versioning is handled by the version field, not directory structure

### Cross-Platform Compatibility
- **Claude Code and Cowork use the same plugin format** (same `.claude-plugin/plugin.json`)
- Delivery differs: Claude Code resolves from marketplace.json cache; Cowork installs from `.plugin` ZIP files
- One `version` field serves both platforms — Cowork reads `plugin.json` inside the `.plugin` ZIP
- plugin-sync packages the plugin as-is, so whatever version is in plugin.json propagates to Cowork

### Semantic Versioning (semver)

All plugins follow `MAJOR.MINOR.PATCH`:

| Bump | When | Example |
|------|------|---------|
| **PATCH** (0.1.0 → 0.1.1) | Bug fixes, typo corrections, minor wording changes in skills/commands | Fixed regex in sync-plugin |
| **MINOR** (0.1.0 → 0.2.0) | New features, new commands/skills/agents added, non-breaking enhancements | Added `/board-export` command to tasks-board |
| **MAJOR** (0.2.0 → 1.0.0) | Breaking changes — renamed commands, changed skill behavior, removed features, restructured plugin | Renamed `/sync-plugin` to `/package-plugin` |

**Pre-1.0 convention**: While plugins are in 0.x.y, minor bumps can include breaking changes. Once a plugin reaches 1.0.0, semver is strictly enforced.

### Publishing Workflow

1. Make changes to the plugin source in this repo
2. Test locally with Claude (install, invoke commands/skills, verify behavior)
3. Bump `version` in `marketplace.json` for the changed plugin(s) following semver
4. Commit with message referencing the version: e.g. `tasks-board v0.2.0 — add board export`
5. Push to repo — **mandatory after local testing, non-negotiable**
6. Claude Code users pick up changes on next `/plugin marketplace update` or session restart
7. For Cowork: re-run `/sync-plugin` to generate a fresh `.plugin` ZIP with the new version

### Known Gap
- plugin-sync doesn't tag the `.plugin` output filename with version (e.g. `superpowers-4.3.1.plugin`)
- It shallow-clones HEAD without version awareness — future improvement opportunity

## Workflow Rules

1. **Push after local testing**: After finishing a feature and fully testing locally with Claude, always push to the repo to keep it synced
2. **Version bumps gate updates**: Bump the `version` field in marketplace.json when shipping changes to local plugins. Without a version bump, Claude won't detect updates
3. **Git flow**: Single `master` branch, push directly after local validation

## How Claude Resolves This Marketplace

- **Registered as local marketplace** in `~/.claude/plugins/known_marketplaces.json`
- Points directly to this directory: `/Users/rodrigo/Ops/m86-claude-marketplace`
- Claude caches plugin dirs to `~/.claude/plugins/cache/m86-claude-marketplace/{plugin}/{version}/`
- Install plugins with: `/plugin install {plugin-name}@m86-claude-marketplace`
- Changes are picked up when version is bumped and Claude refreshes

## Also Installed: Official Marketplace

`claude-plugins-official` from `anthropics/claude-plugins-official` is also registered.
Superpowers is listed in both — our marketplace entry points to the same remote repo.
