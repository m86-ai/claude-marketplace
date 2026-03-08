# docs-hub

Centralized Obsidian vault that symlinks `docs/` directories from all projects for cross-project search and browsing.

## Prerequisites

- Obsidian Desktop v1.12+ with CLI enabled
- An Obsidian vault at `~/Ops/docs-hub`

## Setup

```
/docs-hub-setup
```

This creates the vault symlinks, generates the index, and installs the hourly launchd scheduler.

## Components

| Component | What |
|-----------|------|
| **SessionStart hook** | Runs sync on every Claude Code session with execution timing |
| **`/docs-hub-setup`** | Initial setup: vault, sync, scheduler |
| **`/docs-hub-sync`** | Manual sync refresh |
| **launchd scheduler** | Hourly background sync (`com.m86.docs-hub-sync`) |
| **Skill** | Guides Claude on how to search/read docs via Obsidian CLI |

## Scan Roots

| Root | Description |
|------|-------------|
| `~/One` | Core platform |
| `~/Workbench` | Active projects |
| `~/Lab` | Experiments & tools |

`~/Ops` is excluded — it hosts the vault directly.

## How It Works

The sync script finds `docs/` directories under each scan root, creates symlinks in the Obsidian vault, prunes stale links, and regenerates `_index.md` with wikilinks to every doc.

Edits in Obsidian write directly to the source files in each project repo.
