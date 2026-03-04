# M86 Claude Marketplace

Curated plugins for Claude Code and Cowork, maintained by [M86.ai](https://m86.ai).

## Installation

### Claude Code
```bash
claude plugin marketplace add m86-ai/claude-marketplace
claude plugin install superpowers@m86-ai-claude-marketplace
```

### Cowork
Add as a marketplace source in plugin settings, or via `known_marketplaces.json`:
```json
{
  "m86-claude-marketplace": {
    "source": {
      "source": "github",
      "repo": "m86-ai/claude-marketplace"
    }
  }
}
```

## Plugins

| Plugin | Source | Description |
|--------|--------|-------------|
| superpowers | [obra/superpowers](https://github.com/obra/superpowers) | TDD, debugging, collaboration patterns, proven agentic techniques |
| tasks-board | included | Visual task board backed by markdown files — epics, tasks, subtask checkboxes, zero deps |
