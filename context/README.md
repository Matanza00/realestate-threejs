# context/ — shared memory for Claude Code and Claude Chat

This folder is the only place where the project's history lives. Claude Code (in
VS Code) and Claude Chat (claude.ai, any account) both **read it before working**
and **write to it after working**, so neither one misses what the other did.

```
context/
  README.md            ← this file: how the sync works
  PROJECT_CONTEXT.md   ← the living source of truth (decisions, status, next steps)
  PROMPTS.md           ← copy-paste prompts for starting and ending sessions
  research/            ← concept docs and setup notes
  log/
    claude-code/       ← full Claude Code transcripts as .txt (exported automatically)
    claude-chat/       ← Claude Chat session logs as .txt (pasted in by you)
```

## How it stays in sync

| | Claude Code (VS Code) | Claude Chat (claude.ai) |
|---|---|---|
| **Reads context** | Automatic: `CLAUDE.md` tells it to read `context/PROJECT_CONTEXT.md` and the newest logs. | Upload `PROJECT_CONTEXT.md` + newest logs (or add them to a Claude Project's knowledge), then paste the **Start prompt**. |
| **Writes its log** | Automatic: a `SessionEnd` hook runs `scripts/export-claude-code-log.mjs`, which saves the whole conversation to `log/claude-code/`. Run `npm run log:export` any time to save it manually. | Paste the **End prompt**; Chat replies with a log block. Save it as `log/claude-chat/YYYY-MM-DD_topic.txt`. |
| **Updates PROJECT_CONTEXT.md** | Edits the file itself before finishing (rule in `CLAUDE.md`). | The End prompt makes Chat output a "Context updates" list. Paste it into `PROJECT_CONTEXT.md`, or ask Claude Code to merge it. |

Rules:
1. Commit `context/` to git after every session, so every machine and account has it.
2. Logs are append-only: never edit an old log, add a new one.
3. `PROJECT_CONTEXT.md` stays short (under ~200 lines). Details belong in logs or research docs.
4. Name logs `YYYY-MM-DD_short-topic.txt`, so they sort by date.

Limit to know: Claude Chat cannot read or write files on your computer, so its half of the sync is
the upload at the start and the paste at the end. Everything on the Claude Code side is automatic.
