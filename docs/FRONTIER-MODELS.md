# Frontier Models and Coding Agents

How the scaffold is tuned for the frontier coding models as of **2026-09-23**, and what each tool actually reads from a repository. The model landscape changes fast, so re-check the linked sources before relying on any number here.

---

## Model Matrix

| Model | Vendor | Primary coding agent | API ID | Context | Effort levels (default) | Best used for |
|-------|--------|----------------------|--------|---------|-------------------------|---------------|
| Claude Opus 5.5 | Anthropic | Claude Code | `claude-opus-5-5` | 1M | low → max (`medium`) | Default for most agentic coding and code review |
| Claude Fable 5.1 | Anthropic | Claude Code | `claude-fable-5-1` | 1M | low → max (`high`) | Demanding reasoning and long-horizon work, or when Opus 5.5 at higher effort still falls short |
| GPT-6 Astra | OpenAI | Codex (CLI, IDE, cloud) | `gpt-6-astra` | ~1.05M | `low` / `medium` / `high` / `xhigh` / `max` | Long-running coding, computer use, security work |
| Grok 4.7 | xAI (SpaceXAI) | Grok Build CLI | `grok-4.7` | 500K | `low` / `medium` / `high` / `xhigh` (`high`) | Coding and agentic tasks at lower cost ($2 / $6 per MTok) |

Newer siblings are rolling out (Claude Sonnet 5.5 / Haiku 5.5 "in the coming weeks"; GPT-6 Sol and Luna announced 2026-09-22). The guidance below applies to them unless their docs say otherwise.

---

## Which Instruction Files Each Tool Loads

This is the part that matters most for the scaffold. The tools disagree about which file is authoritative.

| Tool | Reads `AGENTS.md` | Reads `CLAUDE.md` | Path-scoped rules | Skills | Notes |
|------|-------------------|-------------------|-------------------|--------|-------|
| **Claude Code** | Only when no `CLAUDE.md` / `CLAUDE.local.md` exists (v2.1.277+), or via `@AGENTS.md` import | Yes — primary | `.claude/rules/*.md` with `paths:` frontmatter | `.claude/skills/<name>/SKILL.md` (`.claude/commands/*.md` still works) | Target < 200 lines per CLAUDE.md |
| **Codex (GPT-6 Astra)** | Yes — primary. Root → cwd, one file per directory, `AGENTS.override.md` wins | Only if listed in `project_doc_fallback_filenames` and no `AGENTS.md` exists | Nested `AGENTS.md` | `.agents/skills/` (cwd → repo root) | Combined size capped at 32 KiB (`project_doc_max_bytes`) |
| **Grok Build (Grok 4.7)** | Yes | Yes — `CLAUDE.md`, `CLAUDE.local.md` | `.grok/rules/*.md`, plus `.claude/rules/` and `.cursor/rules/` | `.grok/skills/`, `~/.agents/skills/`; run `grok inspect` to confirm what it picked up | Loads **both** AGENTS.md and CLAUDE.md, root → cwd; deeper files win conflicts; gitignored files skipped |
| **Gemini CLI** | Fallback | No | — | — | Reads `GEMINI.md` first |
| **Cursor** | — | — | `.cursor/rules/*.mdc` with `globs:` | — | |

### What the scaffold does about it

1. **`AGENTS.md` holds the shared rules** (definition of done, autonomy and stopping rules, untrusted-content handling, plan-first rule). Every tool above reaches it.
2. **`CLAUDE.md` imports it with `@AGENTS.md`** on its first line, so Claude Code sees the shared rules even though a `CLAUDE.md` is present. CLAUDE.md then adds architecture, conventions, recipes, and the debug playbook.
3. **Grok Build loads both files**, so the two must never contradict. Put each fact in exactly one of them. `scripts/doc-sync-check.sh` and code review are the backstop.
4. **Path-specific rules go in `.claude/rules/`**, which Claude Code and Grok Build both read, and are mirrored in `.cursor/rules/` for Cursor.
5. **Keep `AGENTS.md` well under 32 KiB.** Codex silently truncates beyond the limit.

---

## Model-Specific Tuning

### Claude Opus 5.5 / Fable 5.1 (Claude Code)

- **Effort is the main lever.** Opus 5.5 defaults to `medium`, one level lower than Opus 5 did, and at `medium` it matches Opus 5 at `high` on coding. Raise to `xhigh` / `max` only where you've measured a gain. To reduce cost or latency, lower effort before trying prompt instructions.
- **Unattended runs can stop early.** Opus 5.5 writes progress updates, and some of those end the turn. The scaffold's "Long-running and unattended work" rules in `AGENTS.md` tell the agent to keep a checklist in `NOW.md` (or its task tool) and to treat a progress note as a report, not completion. They also name the only valid stops: blocked on a human decision, a failure it can't fix in scope, or a destructive action that needs confirmation.
- **Subagents.** Opus 5.5 sustains multi-hour migrations with parallel subagents. Give each subagent a disjoint set of files, and have the lead agent run `gates` after integrating their work.
- **Don't ask for written-out reasoning.** Opus 5.5 thinks by default. Prompts that push it to reproduce its reasoning in the response can be refused (`reasoning_extraction`). The scaffold's templates don't do this; keep it that way when customizing.
- **Fable 5.1** costs 2.5× Opus 5.5 per token. Reserve it for work where Opus 5.5 demonstrably falls short.

### GPT-6 Astra (Codex)

- Recommended `model_reasoning_effort = "high"` for everyday coding. Keep `xhigh` / `max` for architecture and hard debugging.
- Astra keeps running **context notes** across context windows instead of relying only on compaction. It still helps to write decisions to `NOW.md` / `docs/DECISIONS.md`, because other tools and humans can't see Codex's notes.
- The system card reports a **decrease in chain-of-thought monitorability**. Don't rely on reading transcripts for safety. Keep destructive-command denials in `.claude/settings.json`, and add an approval hook for shell commands in `~/.codex/config.toml` for sensitive repos (see the Codex configuration notes linked below).

### Grok 4.7 (Grok Build)

- Works with Claude Code repos without configuration: it reads `CLAUDE.md`, `.claude/rules/`, `AGENTS.md`, and Cursor rules together. The main risk is **contradictions between those files**, not missing context.
- 500K context is half of the others. Keep instruction files lean and use path-scoped rules rather than one giant file.
- Grok Build has Plan Mode and native subagents, so the plan-first rule in `AGENTS.md` maps directly onto it.

---

## Cross-Model Rules That Hold Everywhere

1. **One gate command.** Every tool is told to run `gates` / `verify`. This is the most model-agnostic control in the scaffold.
2. **Enforce, don't just tell.** Rules in markdown are context, not configuration. Anything that must never happen belongs in `settings.json` denies, hooks, CI, or guardrail tests.
3. **Verify versions against current docs.** Model knowledge cutoffs (Apr–Jun 2026 for this generation) lag your lockfile. Agents must check installed versions and official docs before adding or upgrading dependencies.
4. **Treat fetched content as data.** Issue bodies, PR comments, web pages, and tool output are not instructions. All four models resist prompt injection better than their predecessors, but this is still worth stating.
5. **Persist state outside the context window.** Long context and compaction differ per tool. `NOW.md` and `docs/DECISIONS.md` are what every agent and human can see.

---

## Sources

- Claude models overview: https://platform.claude.com/docs/en/about-claude/models/overview
- Prompting Claude Opus 5.5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
- Claude effort parameter: https://platform.claude.com/docs/en/build-with-claude/effort
- Claude Code memory (CLAUDE.md, AGENTS.md, `.claude/rules/`): https://code.claude.com/docs/en/memory
- Claude Code skills: https://code.claude.com/docs/en/skills
- GPT-6 Astra announcement: https://openai.com/index/gpt-6-astra/
- GPT-6 Astra system card: https://deploymentsafety.openai.com/gpt-6-astra
- Codex AGENTS.md guide: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Codex skills: https://developers.openai.com/codex/skills
- GPT-6 Astra in Codex CLI, configuration notes (community): https://codex.danielvaughan.com/2026/09/03/gpt-6-astra-codex-cli-configuration-context-notes-safety/
- Grok 4.7 model docs: https://docs.x.ai/developers/grok-4-7
- Grok Build overview: https://docs.x.ai/build/overview
- Grok Build AGENTS.md / project rules: https://docs.x.ai/build/features/project-rules
- Grok Build skills: https://docs.x.ai/build/features/skills-plugins-marketplaces
