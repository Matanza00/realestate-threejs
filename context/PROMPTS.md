# Prompts for keeping Claude Code and Claude Chat in sync

## 1. Start prompt for Claude Chat (paste after uploading the files)

Upload `context/PROJECT_CONTEXT.md`, the newest 1–3 files from `context/log/claude-code/`
and `context/log/claude-chat/`, and any file you want to discuss. Then paste:

```
You are working on my project "realestate-threejs", a scroll-driven, interactive
Three.js real estate website. The attached PROJECT_CONTEXT.md is the source of truth:
decisions, code map, status and next steps. The attached logs are recent sessions from
Claude Code and from earlier Claude Chat sessions. Read all of them before answering.
Follow the decisions already made unless I change them. If something in the logs
contradicts PROJECT_CONTEXT.md, PROJECT_CONTEXT.md wins, and tell me about the conflict.
Today's task: <describe the task>
```

## 2. End prompt for Claude Chat (paste before you close the chat)

```
We're ending this session. Write a session log I can save as a .txt file, in exactly
this format, as one plain-text code block:

SESSION: Claude Chat · <date> · <short topic>
MY REQUESTS: every request I made, in my own words, in order.
WHAT WE DID: what you produced or explained, in order, with file names.
DECISIONS: each decision made, with the reason.
CODE: any code you gave me, with the file path it belongs in (full code, not summaries).
OPEN QUESTIONS: anything unresolved.
CONTEXT UPDATES: exact lines to add or change in PROJECT_CONTEXT.md
(under "Decisions made", "Status" or "Next steps").
```

Save the block as `context/log/claude-chat/YYYY-MM-DD_topic.txt` and commit it. Then paste the
CONTEXT UPDATES into `PROJECT_CONTEXT.md` yourself, or ask Claude Code:
"Merge the CONTEXT UPDATES from the newest Claude Chat log into PROJECT_CONTEXT.md."

## 3. Start prompt for Claude Code in VS Code

Not needed: `CLAUDE.md` makes it read the context automatically. To be explicit:

```
Read context/PROJECT_CONTEXT.md and the newest logs in context/log/ (both folders),
then continue with: <task>
```

## 4. End prompt for Claude Code (optional, the hook saves the transcript anyway)

```
Before we finish: update context/PROJECT_CONTEXT.md with today's decisions, status and
next steps, keep it short, and commit context/ with the code.
```

## 5. Moving from this cloud project to VS Code (first time)

1. `git clone https://github.com/Matanza00/realestate-threejs && cd realestate-threejs && npm install`
2. Open the folder in VS Code with the Claude Code extension.
3. Install the design plugins and Graphify once (see `context/research/claude-setup.md`), then run
   `graphify claude install --project` and `/graphify .`.
4. In Claude Chat on your other account, create a Project named "realestate-threejs" and add
   `PROJECT_CONTEXT.md` and the logs to its knowledge, so every chat starts with them.
