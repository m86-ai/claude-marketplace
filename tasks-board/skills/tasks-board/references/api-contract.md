# API Contract

Full request/response examples for the Tasks Board server.

## GET /api/epics

Returns all epic directories.

```json
[
  { "id": "platform-infra", "name": "Platform Infra", "description": "Core infrastructure work" },
  { "id": "user-experience", "name": "User Experience", "description": "" }
]
```

## GET /api/tasks

Returns all tasks across all epics, sorted by prefs.sortOrder.

```json
[
  {
    "id": "platform-infra/setup-ci",
    "title": "Setup CI Pipeline",
    "description": "Configure GitHub Actions for automated testing.",
    "epicId": "platform-infra",
    "priority": "high",
    "status": "in-progress",
    "created": "2026-01-15",
    "owner": "rodrigo",
    "subtasks": [
      { "label": "Create workflow file", "done": true },
      { "label": "Add test step", "done": false }
    ],
    "filePath": "platform-infra/setup-ci.md"
  }
]
```

## GET /api/tasks/:epicId/:taskSlug

Returns a single task by epic and slug.

```
GET /api/tasks/platform-infra/setup-ci
```

Response: same shape as individual task above.

## PUT /api/tasks/:epicId/:taskSlug

Merge-update a task. Only provided fields are changed; omitted fields keep existing values.

```json
// Request body — partial update
{ "status": "done" }

// Request body — subtask toggle
{ "subtasks": [
    { "label": "Create workflow file", "done": true },
    { "label": "Add test step", "done": true }
  ]
}
```

Response: full updated task object.

## POST /api/tasks

Create a new task. Requires `epicId` and `slug`.

```json
{
  "epicId": "platform-infra",
  "slug": "add-monitoring",
  "title": "Add Monitoring",
  "description": "Set up Datadog integration.",
  "priority": "medium",
  "status": "todo",
  "subtasks": [
    { "label": "Install agent", "done": false },
    { "label": "Configure dashboards", "done": false }
  ]
}
```

Response: 201 with full task object. 409 if slug already exists.

## DELETE /api/tasks/:epicId/:taskSlug

Delete a task file.

```
DELETE /api/tasks/platform-infra/add-monitoring
```

Response: `{ "deleted": "platform-infra/add-monitoring" }`

## GET /api/prefs

```json
{ "sortOrder": ["platform-infra/setup-ci"], "fontSize": 18, "theme": "dark" }
```

## PATCH /api/prefs

Merge-update preferences.

```json
{ "theme": "light" }
```
