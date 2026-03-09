# Gemini Peer Review Plugin

Invoke Google's Gemini CLI as a peer reviewer from Claude Code. Get a second opinion on code quality, architecture decisions, debugging, and security — synthesized into a unified recommendation.

## Prerequisites

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed and authenticated
- Claude Code with plugin support

## Usage

```
/gemini-peer-review <instructions> [file paths]
```

### Examples

```
/gemini-peer-review review src/auth/login.ts for security issues
/gemini-peer-review architecture advice on our API gateway design
/gemini-peer-review debug — getting ECONNREFUSED on redis connection
/gemini-peer-review security audit the payment processing module
```

## Components

| Component | Purpose |
|-----------|---------|
| Skill: `gemini-peer-review` | Slash command that classifies the task, selects a Gemini model, constructs an AI-to-AI prompt, and synthesizes both perspectives |

## How It Works

1. You invoke `/gemini-peer-review` with a description of what you need reviewed
2. Claude classifies the task (code review, architecture, debug, security)
3. Claude selects the appropriate Gemini model (Flash for speed, Pro for depth)
4. Claude constructs a prompt using AI-to-AI templates that prevent role confusion
5. Gemini responds with its analysis
6. Claude synthesizes both perspectives into a unified recommendation

## Model Selection

| Task Type | Default Model | Upgrade Condition |
|-----------|--------------|-------------------|
| Code review | gemini-2.5-flash | Complex multi-system review → 3-pro-preview |
| Architecture | gemini-2.5-pro | — |
| Debug | gemini-2.5-flash | — |
| Security | gemini-2.5-pro | — |

You can override by mentioning a model in your instructions (e.g., "use pro for this review").
