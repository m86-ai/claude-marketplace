---
name: docs-hub
description: Use when searching for documentation across projects, reading project docs, or working with the docs-hub Obsidian vault. Triggers on "find docs", "search documentation", "project docs", "docs-hub", "obsidian vault".
---

# Docs Hub

Centralized Obsidian vault at `~/Ops/docs-hub` that symlinks `docs/` directories from all projects for cross-project search and browsing.

## Vault Access

```bash
obsidian vault=docs-hub search query="<term>"          # cross-project search
obsidian vault=docs-hub search:context query="<term>"   # search with matching lines
obsidian vault=docs-hub read path="<project>/file.md"   # read a doc
obsidian vault=docs-hub files                           # list all files
obsidian vault=docs-hub files total                     # count files
```

## Structure

Symlinks grouped by root directory:

- `One/` — `~/One/docs`
- `Workbench/<project>/` — `~/Workbench/<project>/docs`
- `Lab/<project>/` — `~/Lab/<project>/docs`

`~/Ops` is not scanned — it hosts the vault directly.

## Commands

- `/docs-hub-setup` — Initial setup (vault creation, sync, scheduler install)
- `/docs-hub-sync` — Manual sync refresh

## Conventions

- `_index.md` is auto-generated — do not edit
- Edits to symlinked files write to the source repo
- Obsidian desktop must be running for CLI access
- Use `search:context` over `search` when you need matching content
- Use `vault=docs-hub` (not positional vault name)
