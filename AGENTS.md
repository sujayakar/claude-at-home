# AGENTS OVERVIEW

This document is meant to be injected into autonomous / AI coding agents that need a **concise mental model** of this repository.  Keep it around ±300 lines so it can be loaded as context without blowing the token budget.

---

## 1. High-Level Purpose

"**We have Claude at Home**" is a full-stack clone of modern AI chat apps (ChatGPT / Claude) that you can run with your own OpenAI key.  It provides:

• Real-time chat UI (React + Tailwind + Shadcn)  
• Back-end on **Convex** for realtime DB & serverless functions  
• **GPT-4o** powered assistant with streaming responses  
• OpenAI **tool-calls** wired to:
  – Long-term memory (semantic vector search)  
  – Tavily web search / Q&A / extract  
  – On-the-fly code execution inside **Modal** sandboxes  
• Clerk-based Google auth, conversation titles, theme switcher, etc.


## 2. Directory Map (what matters for agents)

```
// FE
src/                React front-end
  components/       Chat UI & Shadcn primitives
  lib/              FE convenience hooks/helpers

// BE (Convex)
convex/             Convex actions, queries, models
  ai.ts             Main action that streams GPT-4o + tool calls
  lib/              Utilities (OpenAI, Modal, Tavily, tool registry)
  model/            Thin model classes wrapping Convex tables
  schema.ts         Single source of truth for Convex schema

// Infra
python/             Modal webhook to create/exec sandboxes
vite.config.ts      FE build (Bun + Vite)
package.json        Bun workspace deps (both FE + Convex)
```

> Agents: **Do not** create new Convex tables directly—edit `convex/schema.ts` and matching `model/*` helpers, then run `bun convex codegen`.


## 3. Data Flow (chat message lifecycle)

1. **Front-end** sends `messages.send` mutation (convex/messages.ts).  
2. DB row inserted, then internal action `ai.chat` is scheduled.  
3. `ai.chat` feeds previous messages + system prompt into GPT-4o **with tool definitions** from `lib/toolDefinitions.ts`.  
4. While streaming:  
   • Tool call? → registry executes tool, logs in `ToolUse` table.  
   • Plain text? → streamed back via `streamMessage` mutation.  
5. When assistant message finishes, it is embedded & optionally saved as **Memory** for future semantic search.


## 4. Tooling for the Assistant (agents should reuse)

Tool definitions live in `convex/lib/toolDefinitions.ts`.  Each tool implements:
```
{
  name, description,
  parameters: zodSchema,
  execute: async (ctx, args) => {...},
  prompt?: docStringForSystemPrompt
}
```
`toolRegistry.register()` wires them into both OpenAI tool-calling JSON and local execution.

Adding a tool:
1. Implement it here + `registry.register()`.  
2. Update docs / prompts as needed.  
No FE change needed unless you want custom UI.


## 5. Memory System

• Table `memoriesToIndex` queues messages.  
• Action `model/Memories.indexMemories` embeds text via OpenAI embeddings, then stores vector in `memories` table.  
• Searching memories: tool `queryMemory` → Convex `vectorSearch()`.


## 6. Modal Sandboxes (code execution)

`python/main.py` is deployed on Modal.  Convex tools hit it over HTTPS with a shared secret and can:
• createSandbox  • execCommand  • readFile  • writeFile  • terminateSandbox

Agents can chain multiple execCommand calls against the same sandbox for efficiency.


## 7. Development Practices (from git history)

Scanned recent 100 commits:
• Commits are frequent & **small** ("Add cancel button", "Wire in caching").  
• Feature → UI wire-up → clean-up cycle is common (note the "cleanup", "Refactor" messages).  
• Use of **feature branches**; main remains deployable.  
• Reverts are fast when an experiment fails ("Remove Python" then immediate revert).  
• Documentation bumped alongside features (multiple "Update README.md").

Takeaway for agents:
1. Submit self-contained PR-sized patches. 2. Keep messages succinct & imperative. 3. Err on safety—prepare revert if needed.


## 8. How to Run Locally (human reference)

```
bun install
bun convex dev --once   # DB + backend
bunx convex env set OPENAI_API_KEY <key>
# Clerk envs… see README
bun run dev              # vite + frontend
```


---

### TL;DR for Coding Agents
• Use TypeScript (keep strict).  
• FE code lives under `src/`, BE Convex under `convex/`.  
• Touch `schema.ts` & models for DB shape changes.  
• Add any new AI tools through `toolDefinitions.ts`.  
• Follow incremental, atomic commits + matching tests/docs.