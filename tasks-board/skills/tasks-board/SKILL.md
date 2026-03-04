---
name: tasks-board
description: >
  This skill should be used when the user asks about "tasks board", "task management",
  "epic management", "subtask tracking", "kanban board", or wants to create, update,
  organize, or view tasks stored as markdown files in epic directories. Also trigger
  when the user says "show my tasks", "open the board", or "manage tasks".
version: 0.1.0
---

# Tasks Board

Visual task management backed by a directory of markdown files. Each epic is a subdirectory, each task is a `.md` file, and subtasks are checkbox items within the file.

## Data Model

```
tasks/
├── epic-name/
│   ├── _description.md    # Epic metadata (optional)
│   ├── task-slug.md        # Individual task
│   └── another-task.md
└── another-epic/
    └── ...
```

### Task File Format

```markdown
# Task Title

Optional description text here.

**Priority:** high | medium | low
**Status:** todo | in-progress | done | blocked
**Created:** 2026-01-15
**Owner:** name

- [x] Completed subtask
- [ ] Pending subtask
```

### Epic Description File (_description.md)

```markdown
# Epic Display Name

Optional description of the epic's scope.
```

## Architecture

Zero-dependency Node.js server using only built-in modules (`http`, `fs`, `path`). Vanilla HTML/CSS/JS client — no React, no build step.

### Server Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/epics | List all epic directories |
| GET | /api/tasks | List all tasks (sorted by prefs) |
| GET | /api/tasks/:epic/:slug | Get single task |
| PUT | /api/tasks/:epic/:slug | Update task (merge with existing) |
| POST | /api/tasks | Create new task |
| DELETE | /api/tasks/:epic/:slug | Delete task file |
| GET | /api/prefs | Get user preferences |
| PATCH | /api/prefs | Update preferences |

### Environment Variables

| Var | Default | Purpose |
|-----|---------|---------|
| PORT | 3456 | Server port |
| TASKS_DIR | `../../tasks` relative to server.js | Path to tasks directory |
| PREFS_FILE | `./prefs.json` relative to server.js | User preferences file |

## UI Features

- Dark/light theme toggle (persisted to prefs.json)
- Sidebar with epic list and task counts
- Filter toolbar: All, Todo, In-Progress, Done
- Card grid with priority dots, status badges, subtask progress bars
- Slide-out detail panel with editable description, priority/status dropdowns, subtask checkboxes
- All mutations write back to the `.md` files immediately

## Common Operations

### Creating a task via CLI (without UI)

Create a new `.md` file in the appropriate epic directory following the task file format above. The server picks it up on next API call.

### Creating an epic

Create a new subdirectory under the tasks directory. Optionally add `_description.md` with a `# Name` heading.

### Bulk operations

For bulk status changes, use the API directly:
```bash
curl -X PUT http://localhost:3456/api/tasks/epic-id/task-slug \
  -H 'Content-Type: application/json' \
  -d '{"status": "done"}'
```

## Reference Files

- **`references/api-contract.md`** — Full API request/response examples
- **`references/file-format.md`** — Detailed markdown parsing rules
