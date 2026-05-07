# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

This is a course project folder for **BIZ.69911 — IT경영 특수논제: AI 기반 비즈니스 진화, 전략 및 실습** (KAIST IMMS, Spring 2026, instructor: 이지수).

As of 2026-05-07, the active project has pivoted from **GlocalX** to **기프타로**. 기프타로 is a content curation service that helps office workers choose a meaningful, lightweight birthday gift for a coworker in about five minutes.

## Current Project Direction

- Active project: **기프타로**
- Previous project: **GlocalX**
- Pivot date: 2026-05-07
- Current source of truth: `docs/MANIFEST.md`, `00. Project/service-planning.md`
- Source PDFs: `10. Research/source-pdfs/`
- Pre-pivot materials: `99. Archive/2026-05-07-glocalx/`

## Archive Policy

`99. Archive/` stores pre-pivot GlocalX materials. Do not read or use it for active project decisions, document drafting, code implementation, or broad search by default.

Only inspect `99. Archive/` when the user explicitly asks to review archive, GlocalX, or pre-pivot materials.

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

## PR 머지 전 체크리스트

PR 생성 또는 머지 요청 전 반드시 아래 순서를 따른다.

1. **브랜치 최신화 확인**: PR 페이지에 "This branch is out-of-date" 메시지가 있으면 머지 전에 반드시 해결.
   ```bash
   # 로컬에서 최신화
   git fetch origin
   git rebase origin/main
   git push --force-with-lease
   ```
   또는 GitHub PR 페이지 하단의 **`Update branch`** 버튼 클릭 (더 간단).

2. **왜 필요한가**: 다른 팀원의 PR이 먼저 main에 머지되면 내 브랜치가 뒤처진다. 이 상태로 머지하면 충돌이 발생하거나 변경사항이 덮어써질 수 있다. `Require branches to be up to date` 브랜치 보호 규칙이 이를 시스템적으로 강제한다.

3. **머지 권한**: main 머지는 계휴(gyehyu)가 GitHub 웹에서 수행. LLM이 직접 머지하지 않고 PR 생성까지만 한다.

## Archived Deploy Configuration

The following deployment configuration belongs to the pre-pivot GlocalX project and is inactive for 기프타로 unless explicitly re-enabled.

Platform: Hugging Face Spaces
Production URL: https://huggingface.co/spaces/Gyehyu2726/glocalx-demo
App directory: 40. Development/
Deploy workflow: .github/workflows/deploy-hf-spaces.yml
Trigger: push to main (paths: 40. Development/**, workflow file)
Secret required: HF_TOKEN (GitHub repo secret — HF write token for Gyehyu2726/glocalx-demo)
