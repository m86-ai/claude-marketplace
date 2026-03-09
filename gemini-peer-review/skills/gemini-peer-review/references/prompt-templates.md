# Prompt Templates

## AI-to-AI Prompting Format

Always use this format when constructing prompts for Gemini. It prevents role confusion — Gemini knows it's advising Claude Code, not talking to the human.

```
[Claude Code consulting Gemini for peer review]

Task: [Specific task description]

Provide direct analysis with file:line references. I will synthesize your findings with mine before presenting to the developer.
```

## Per-Mode Templates

### Code Review

```
[Claude Code consulting Gemini for peer review]

Task: Code review — check for bugs, logic errors, security vulnerabilities (SQL injection, XSS, etc.), performance issues, best practice violations, type safety problems, and missing error handling.

[If reference docs available:]
Check against these official docs:
- [URL]

Provide direct analysis with file:line references. I will synthesize your findings with mine before presenting to the developer.
```

### Architecture Advice

```
[Claude Code consulting Gemini for peer review]

Task: Architecture advice — [description of the decision or problem]

Analyse for: architectural anti-patterns, scalability concerns, maintainability issues, better alternatives, potential technical debt.

Provide specific, actionable recommendations and rationale. I will synthesize your findings with mine before presenting to the developer.
```

### Debugging Help

```
[Claude Code consulting Gemini for peer review]

Task: Debug analysis — identify root cause (not just symptoms), explain why it's happening, suggest specific fix with code example, and how to prevent in future.

Error: [error message/description]
What was tried: [previous attempts if any]

Provide direct analysis with file:line references. I will synthesize your findings with mine before presenting to the developer.
```

### Security Scan

```
[Claude Code consulting Gemini for peer review]

Task: Security audit — check for injection vulnerabilities, authentication/authorisation issues, data exposure, insecure defaults, missing input validation, CORS misconfiguration, and credential handling.

Provide direct analysis with file:line references and severity ratings. I will synthesize your findings with mine before presenting to the developer.
```

## Model Selection Guide

- **Gemini 2.5 Flash**: Fast (~5-15s). Good for code reviews, debugging, most tasks.
- **Gemini 2.5 Pro**: Better reasoning (~15-30s). Preferred for complex architecture decisions and security reviews.
- **Gemini 3 Pro Preview**: State-of-the-art reasoning with multimodal support. Best for the most complex reasoning tasks.

Both Flash and Pro have similar quality on straightforward tasks. Pro's advantage shows on complex reasoning where trade-off analysis matters.
