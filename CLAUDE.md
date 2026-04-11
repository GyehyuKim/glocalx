# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

This is a course project folder for **BIZ.69911 — IT경영 특수논제: AI 기반 비즈니스 진화, 전략 및 실습** (KAIST IMMS, Spring 2026, instructor: 이지수).

The project is **GlocalX** — a service that automates multilingual Google Business Profile (GBP) content for Korean SMB restaurants targeting foreign tourists. Primary deliverables live under `30. Deliverables/` (business-plan.html, gbp-guide.html) and `docs/` (MANIFEST, WHYTREE, PREMORTEM).

## Governance — MANDATORY

Before making any git/PR operation, read and follow **[`CONTRIBUTING.md`](./CONTRIBUTING.md)**. It is the single source of truth for:

- Branch naming (`<owner>/<topic-slug>`, owner ∈ {gyehyu, gyeongmun, seungwon, yoonji})
- PR size and lifetime rules
- Conventional Commits message format
- Forbidden operations (direct push to main, --force, --no-verify, committing secrets)
- Concurrent work and rebase protocol (web editor stale-base sacrifice zone — §3.4)
- LLM-specific behavior rules (§9)

**Priority on conflict**: `CONTRIBUTING.md` > `CLAUDE.md` > `AGENTS.md` > other docs.

Other agents (Cursor, Continue, Aider) should enter via [`AGENTS.md`](./AGENTS.md) — same governance, same rules.

## Google Drive environment

This repo lives inside a Google Drive sync folder. The Drive client periodically creates `desktop.ini` files inside `.git/refs/`, `.git/objects/`, etc., which breaks `git pull`/`fetch` with `fatal: bad object refs/.../desktop.ini`. **Before any git command, run:**

```bash
find .git -name "desktop.ini" -type f -delete
```

If an error mentions `desktop.ini`, clean first, then retry.

## Working with PPTX Files

Use the `pptx` skill to read, edit, or create `.pptx` files:
- `/pptx` — invoked via the Skill tool in Claude Code

## Language

All course content and communication is in **Korean** unless the user writes in English.
