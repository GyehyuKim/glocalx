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

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. The
skill has multi-step workflows, checklists, and quality gates that produce better
results than an ad-hoc answer. When in doubt, invoke the skill. A false positive is
cheaper than a false negative.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke /office-hours
- Strategy, scope, "think bigger", "what should we build" → invoke /plan-ceo-review
- Architecture, "does this design make sense" → invoke /plan-eng-review
- Design system, brand, "how should this look" → invoke /design-consultation
- Design review of a plan → invoke /plan-design-review
- Developer experience of a plan → invoke /plan-devex-review
- "Review everything", full review pipeline → invoke /autoplan
- Bugs, errors, "why is this broken", "wtf", "this doesn't work" → invoke /investigate
- Test the site, find bugs, "does this work" → invoke /qa (or /qa-only for report only)
- Code review, check the diff, "look at my changes" → invoke /review
- Visual polish, design audit, "this looks off" → invoke /design-review
- Developer experience audit, try onboarding → invoke /devex-review
- Ship, deploy, create a PR, "send it" → invoke /ship
- Merge + deploy + verify → invoke /land-and-deploy
- Configure deployment → invoke /setup-deploy
- Post-deploy monitoring → invoke /canary
- Update docs after shipping → invoke /document-release
- Weekly retro, "how'd we do" → invoke /retro
- Second opinion, codex review → invoke /codex
- Safety mode, careful mode, lock it down → invoke /careful or /guard
- Restrict edits to a directory → invoke /freeze or /unfreeze
- Upgrade gstack → invoke /gstack-upgrade
- Save progress, "save my work" → invoke /context-save
- Resume, restore, "where was I" → invoke /context-restore
- Security audit, OWASP, "is this secure" → invoke /cso
- Make a PDF, document, publication → invoke /make-pdf
- Launch real browser for QA → invoke /open-gstack-browser
- Import cookies for authenticated testing → invoke /setup-browser-cookies
- Performance regression, page speed, benchmarks → invoke /benchmark
- Review what gstack has learned → invoke /learn
- Tune question sensitivity → invoke /plan-tune
- Code quality dashboard → invoke /health
