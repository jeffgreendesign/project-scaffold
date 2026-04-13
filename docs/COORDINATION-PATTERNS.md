# Coordination Patterns

How the scaffold maps to Anthropic's five multi-agent coordination patterns, published 2026-04-10:
https://claude.com/blog/multi-agent-coordination-patterns

These patterns apply regardless of which AI coding tool your team uses (Claude Code, Codex, Gemini CLI, Cursor, etc.). The scaffold delivers the same coordination guidance across platforms through platform-specific instruction files.

---

## Pattern-to-Primitive Mapping

| Pattern | Scaffold primitive | Platform delivery | Default? |
|---------|-------------------|-------------------|----------|
| **Orchestrator-Subagent** | Plan-first workflow | Claude: `/design` command; Codex/Gemini: AGENTS.md rule 5 | **Yes — default** |
| **Generator-Verifier** | Quality gate | All platforms: `pnpm verify` / `gates` + `tests/test_architecture.ts` | Yes — always-on |
| **Shared State** | Session context | All platforms: `NOW.md` | Yes (Tier 2+) |
| **Agent Teams** | Not provided | Use platform-native parallel agents when needed | No |
| **Message Bus** | Not provided | Out of scope for single-repo scaffolds | No |

---

## Default: Orchestrator-Subagent

> "For most use cases, we recommend starting with orchestrator-subagent. It handles the widest range of problems with the least coordination overhead. Observe where it struggles, then evolve toward other patterns as specific needs become clear."
>
> — [Multi-agent coordination patterns](https://claude.com/blog/multi-agent-coordination-patterns), Anthropic, 2026-04-10

The scaffold implements this as a **plan-first workflow with human-in-the-loop verification:**

1. **Research** — agent reads CLAUDE.md, explores the codebase, finds reference implementations
2. **Propose** — agent presents understanding, approach, files to change, trade-offs, risks
3. **Human approval** — user reviews, annotates, corrects assumptions, then approves
4. **Implement** — agent writes code only after explicit approval
5. **Verify** — agent runs `pnpm verify` (Generator-Verifier gate)

The human approval step (step 3) is the key differentiator from a naive orchestrator-subagent. The blog warns that a verifier without clear criteria will "rubber-stamp the generator's output." The human-in-the-loop prevents this — the user brings domain context that no automated verifier can replicate.

### How each platform gets this workflow

| Platform | Mechanism | File |
|----------|-----------|------|
| Claude Code | `/design` slash command | `scaffold/.claude/commands/design.md` |
| Codex (GPT-5.4+) | Working rule 5 in AGENTS.md | `scaffold/AGENTS.md.template` |
| Gemini CLI / Code Assist | Working rule in GEMINI.md + AGENTS.md fallback | `scaffold/GEMINI.md.template` |
| Cursor | Inherits from CLAUDE.md conventions | `.cursor/rules/` |

---

## Generator-Verifier: Quality Gates

The scaffold ships a single-command quality gate (`pnpm verify` / `gates`) that runs lint + typecheck + test + build. This is the Generator-Verifier pattern:

- **Generator:** the agent writing code
- **Verifier:** the `gates` script with explicit pass/fail criteria
- **Feedback loop:** agent reads error output, fixes issues, re-runs gates

Architecture guardrail tests (`tests/test_architecture.ts`, `tests/test_workspace_boundaries.ts`) extend the verifier with structural rules that linters can't enforce — import boundaries, dependency direction, database access patterns.

---

## Shared State: NOW.md

`NOW.md` implements the Shared State pattern for cross-session context persistence. Multiple agent sessions (or human developers) read and write to the same file to maintain continuity:

- Current sprint status
- Recently completed work
- Blockers and waiting items
- Next actions

The blog warns about reactive loops in shared state systems. NOW.md avoids this because it's updated by one agent at a time (per session), not by concurrent writers.

---

## When to Evolve

Start with Orchestrator-Subagent (the plan-first workflow). Evolve only when you observe specific symptoms:

| Symptom | Consider | Why |
|---------|----------|-----|
| Orchestrator hitting context limits on large tasks | **Agent Teams** — split into parallel independent subtasks | Each team member accumulates domain context for its subtask without bottlenecking the orchestrator |
| Bidirectional reactive edits between agents | **Shared State** with explicit termination conditions | Removes the coordinator as a single point of failure, but requires clear stopping rules |
| Unpredictable event-driven pipelines | **Message Bus** | Decouples producers from consumers; new agents subscribe without modifying existing ones |
| Quality checks need iteration beyond pass/fail | **Generator-Verifier** loop with specific criteria | Already provided by `gates`; add custom verifiers for domain-specific quality |

Do not adopt Agent Teams, Message Bus, or Shared State loops preemptively. The coordination overhead is real and the benefits only materialize when Orchestrator-Subagent demonstrably struggles.

---

## Official references

- Anthropic multi-agent coordination patterns (2026-04-10): https://claude.com/blog/multi-agent-coordination-patterns
- Anthropic building multi-agent systems: https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them
- AGENTS.md open standard: https://agents.md/
- OpenAI Codex AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Gemini CLI GEMINI.md: https://geminicli.com/docs/cli/gemini-md/
