---
name: gemini-peer-review
description: Consult Google Gemini CLI as a peer reviewer for code review, architecture advice, debugging, and security audits.
disable-model-invocation: true
argument-hint: <review-type or instructions> [file paths]
allowed-tools: Bash(gemini*), Read, Grep, Glob
---

# Gemini Peer Review

Consult Google's Gemini CLI to get a second opinion on code, architecture, debugging, or security. Synthesize both perspectives into a unified recommendation for the developer.

## Invocation

```
/gemini-peer-review $ARGUMENTS
```

## Task Classification

Read `$ARGUMENTS` and classify into one of four modes. If ambiguous, default to **code-review**.

| Mode | Triggers | Gemini Model |
|------|----------|-------------|
| **code-review** | "review", "check", "bugs", file paths without other context | gemini-2.5-flash |
| **architecture** | "architecture", "design", "scalability", "refactor", "pattern" | gemini-2.5-pro |
| **debug** | "debug", "error", "fix", "broken", "failing", stack traces | gemini-2.5-flash |
| **security** | "security", "audit", "vulnerability", "auth", "injection", "XSS" | gemini-2.5-pro |

For tasks involving complex trade-off analysis or multi-system reasoning, upgrade to `gemini-3-pro-preview` regardless of mode.

## Execution Steps

1. **Classify the task** from `$ARGUMENTS` using the table above.
2. **Gather context** — read relevant files, collect error messages, recent diffs (`git diff`), or architecture docs as needed.
3. **Select the prompt template** from [references/prompt-templates.md](references/prompt-templates.md) matching the classified mode.
4. **Construct the Gemini prompt** using the AI-to-AI format from the template. Always prefix with:
   ```
   [Claude Code consulting Gemini for peer review]
   ```
   Fill in task-specific sections with gathered context.
5. **Invoke Gemini** non-interactively:
   ```bash
   # For file-based review (pipe content):
   cat <file> | gemini -m <model> -p "<prompt>"

   # For multi-file or general queries:
   gemini -m <model> -p "<prompt with inline context>"
   ```
6. **Synthesize findings** — present a unified analysis:
   - **My analysis**: your own findings from reading the code
   - **Gemini's analysis**: key points from Gemini's response
   - **Unified recommendation**: reconciled view, noting where you agree and any disagreements with reasoning

## Prompt Construction

Use the templates in [references/prompt-templates.md](references/prompt-templates.md). The core format is always:

```
[Claude Code consulting Gemini for peer review]

Task: [Selected template for the classified mode, with context filled in]

Provide direct analysis with file:line references. I will synthesize your findings with mine before presenting to the developer.
```

Append gathered file contents, error messages, or diffs directly into the prompt body after the task description.

## Model Selection Logic

Apply in order:

1. If `$ARGUMENTS` mentions a specific model name (`flash`, `pro`, `3-pro`), use it.
2. If the task involves complex trade-offs across multiple systems → `gemini-3-pro-preview`
3. If mode is **architecture** or **security** → `gemini-2.5-pro`
4. Otherwise → `gemini-2.5-flash`

## Output Format

Present findings to the developer as:

```markdown
## Peer Review: [Mode] — [brief subject]

### My Analysis
[Your findings with file:line references]

### Gemini's Analysis
[Key findings from Gemini, attributed]

### Unified Recommendation
[Reconciled view — agreements, disagreements with reasoning, action items]
```

## Error Handling

- If `gemini` CLI is not found: tell the developer to install it (`npm install -g @anthropic-ai/gemini-cli` or check Google's docs) and retry.
- If Gemini returns an error or empty response: report the error, present your own analysis only, and note Gemini was unavailable.
- If context is too large for a single prompt: split into focused sub-queries (e.g., review file-by-file) and aggregate.

## Constraints

- Never forward raw Gemini output without synthesis.
- Always attribute which findings come from Gemini vs your own analysis.
- Do not pipe sensitive credentials or environment variables to Gemini.
- Respect `.gitignore` patterns when gathering file context.
