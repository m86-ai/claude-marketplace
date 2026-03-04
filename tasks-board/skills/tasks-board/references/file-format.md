# Task File Format

Detailed parsing rules for task markdown files.

## Structure

```markdown
# Task Title

Description paragraph(s). Everything between the title and the first
metadata line or checkbox is treated as description.

**Priority:** high
**Status:** in-progress
**Created:** 2026-01-15
**Owner:** rodrigo

- [x] Completed subtask
- [ ] Pending subtask
- [ ] Another pending subtask
```

## Parsing Rules

### Title
First `# ` heading in the file. Falls back to the filename (sans `.md`) if no heading found.

### Description
All lines between the title and the first `**Priority:**`, `**Status:**`, `**Created:**`, `**Owner:**`, or `- [ ]` / `- [x]` line. Leading/trailing whitespace trimmed.

### Inline Metadata
Case-insensitive regex matching:
- `**Priority:** <value>` → high, medium, low
- `**Status:** <value>` → todo, in-progress, done, blocked
- `**Created:** <value>` → ISO date string
- `**Owner:** <value>` → freeform string

All metadata values are lowercased on parse. Defaults: priority=medium, status=todo.

### Subtasks
Lines matching `- [ ] label` (unchecked) or `- [x] label` / `- [X] label` (checked). Parsed into `{ label: string, done: boolean }` objects.

### Frontmatter
If the file starts with `---`, everything up to the next `---` is stripped before parsing. This allows YAML frontmatter for tools that use it, without breaking the parser.

## Serialization

When writing back, the server rebuilds the entire file:

```
# {title}\n\n
{description}\n\n
**Priority:** {priority}\n
**Status:** {status}\n
**Created:** {created}\n     (if present)
**Owner:** {owner}\n          (if present)
\n
- [{x| }] {subtask.label}\n  (for each subtask)
```

This is a full file replacement — no partial writes.
