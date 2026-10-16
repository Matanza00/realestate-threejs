#!/usr/bin/env node
// Saves a Claude Code conversation as plain text in context/log/claude-code/.
// Runs from the SessionEnd hook (transcript path arrives as JSON on stdin), or by hand:
//   npm run log:export                 newest transcript for this folder
//   node scripts/export-claude-code-log.mjs path/to/transcript.jsonl
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const outDir = path.join(root, 'context', 'log', 'claude-code');

function readStdin() {
  if (process.stdin.isTTY) return '';
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function newestTranscript() {
  const base = path.join(os.homedir(), '.claude', 'projects');
  const slug = root.replace(/[^A-Za-z0-9]/g, '-');
  const dirs = fs.existsSync(path.join(base, slug)) ? [slug] : fs.readdirSync(base);
  let best = null;
  for (const d of dirs) {
    const dir = path.join(base, d);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.jsonl')) continue;
      const p = path.join(dir, f);
      const t = fs.statSync(p).mtimeMs;
      if (!best || t > best.t) best = { p, t };
    }
  }
  return best?.p;
}

const clean = (s) =>
  s.replace(/<(system-reminder|session-context)[^>]*>[\s\S]*?<\/\1[^>]*>/g, '').trim();

function blocks(content) {
  if (typeof content === 'string') return [{ kind: 'text', text: clean(content) }];
  return (content ?? []).flatMap((b) => {
    if (b.type === 'text') return [{ kind: 'text', text: clean(b.text) }];
    if (b.type === 'tool_use') {
      // Messages sent through a chat tool are the reply itself, keep them in full.
      if (/reply|post_message/.test(b.name) && b.input?.text) return [{ kind: 'text', text: b.input.text }];
      const hint = b.input?.description || b.input?.file_path || b.input?.command?.slice(0, 120) || '';
      return [{ kind: 'tool', text: `[tool] ${b.name}${hint ? ': ' + hint : ''}` }];
    }
    return [];
  });
}

const stdin = readStdin();
let hook = {};
try { hook = stdin ? JSON.parse(stdin) : {}; } catch {}
const file = process.argv[2] || hook.transcript_path || newestTranscript();
if (!file || !fs.existsSync(file)) {
  console.error('No Claude Code transcript found.');
  process.exit(0);
}

const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
const out = [];
let first;
for (const line of lines) {
  let e;
  try { e = JSON.parse(line); } catch { continue; }
  if (e.isSidechain || !e.message || (e.type !== 'user' && e.type !== 'assistant')) continue;
  first ??= e.timestamp;
  for (const b of blocks(e.message.content)) {
    if (!b.text) continue;
    const who = e.type === 'user' ? 'USER' : 'CLAUDE';
    out.push(b.kind === 'tool' ? `    ${b.text}` : `\n=== ${who} · ${e.timestamp ?? ''}\n${b.text}`);
  }
}

const date = (first ?? new Date().toISOString()).slice(0, 10);
const id = path.basename(file, '.jsonl').slice(0, 8);
fs.mkdirSync(outDir, { recursive: true });
const target = path.join(outDir, `${date}_${id}.txt`);
fs.writeFileSync(target, `SESSION: Claude Code · ${date} · ${id}\nSOURCE: ${path.basename(file)}\n${out.join('\n')}\n`);
console.log(`Saved ${path.relative(root, target)}`);
