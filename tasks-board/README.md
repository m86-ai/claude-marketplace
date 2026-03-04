# Tasks Board Plugin

Visual task management backed by markdown files. Each epic is a subdirectory under `tasks/`, each task is a `.md` file, subtasks are checkbox items.

## Components

| Type | Name | Purpose |
|------|------|---------|
| Command | `/tasks-board` | Launch the server and open the UI |
| Skill | `tasks-board` | Domain knowledge for task/epic management |
| Hook | SessionStart | Inject tasks board context on session start |
| Server | `server/server.js` | Zero-dep Node.js API + static file server |

## Setup

No dependencies required. The server uses only Node.js built-in modules (`http`, `fs`, `path`).

### Requirements

- Node.js 18+ (Cowork sandbox ships Node v22)

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3456` | Server port |
| `TASKS_DIR` | `../../tasks` (relative to server.js) | Path to the tasks directory |
| `PREFS_FILE` | `./prefs.json` (relative to server.js) | User preferences file |

## Usage

### Via command
```
/tasks-board
```
Launches the server and tells you where to open it.

### Manual
```bash
TASKS_DIR=/path/to/tasks node server/server.js
```

Then open `http://localhost:3456` in your browser.

## Data Model

```
tasks/
├── epic-name/
│   ├── _description.md    # Optional epic metadata
│   └── task-slug.md       # Task with subtasks
└── another-epic/
    └── ...
```

See the `tasks-board` skill references for full file format documentation.
