# AGENTS.md — AI Agent Instructions for Giftaro

이 파일은 **Cursor, Continue, Aider, Windsurf** 등 AGENTS.md 표준을 따르는 코딩 에이전트를 위한
진입점이다. Claude Code는 `CLAUDE.md`를 우선 로드하지만, 동일 규범을 참조하도록 이 파일도
동기화되어 있다.

---

## 필수 준수 문서

이 프로젝트에서 작업하는 모든 AI 에이전트는 **작업을 시작하기 전에** 다음 문서를 읽고 준수해야 한다:

1. **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** — 브랜치 네이밍, PR 규칙, 커밋 메시지, 금지 사항,
   LLM 행동 규칙(§9). **이것이 단일 진실 소스.**
2. **[`docs/MANIFEST.md`](./docs/MANIFEST.md)** — 프로젝트의 핵심 원칙과 팀 구성. 왜 이 프로젝트가
   존재하는지, 무엇을 하지 않기로 약속했는지.
3. **[`CLAUDE.md`](./CLAUDE.md)** — Claude Code 전용 보조 지침. 다른 에이전트도 참고 가능.

우선순위 (모순이 있을 때): `CONTRIBUTING.md` > `CLAUDE.md` > `AGENTS.md` > 기타 문서.

---

## 프로젝트 개요 (1분 요약)

- **코스**: KAIST IMMS BIZ.69911 — IT경영 특수논제: AI 기반 비즈니스 진화, 전략 및 실습 (2026 Spring, 이지수 교수)
- **프로젝트**: **기프타로** — 회사 동료의 생일 선물을 5분 안에 의미 있게 고르도록 돕는
  선물 전달 레이어. 생일·관계 맥락 → 무드 카드 → 실제 브랜드 선물 후보.
- **팀**: 3명 (김계휴 Dev/Product, 이승원 Content/Marketing, 정윤지 UX/AX)
- **주요 산출물**: `docs/MANIFEST.md`, `docs/giftaro-status.md`, `docs/archive-index.md`,
  `docs/gifttarot/index.html`, `research/source-pdfs/`
- **피벗 전 자료**: `gyehyu/glocalx-archive-2026-05-07`
- **언어**: 모든 커뮤니케이션과 문서는 **한국어**가 기본. 코드 식별자만 영어.

---

## 권장 폴더 구조

- `docs/` — 현재 합의된 문서, 상태 공유본, GitHub Pages 진입점
- `research/` — 원본 PDF, 조사 메모, 상품 카탈로그, 리서치 산출물
- `development/` — 실행 코드, 테스트, 실험 코드
- `deliverables/` — 발표/제출용 최종 산출물
- `submissions/` — 수업 제출본
- `internal/` — 내부 메모, 로그, 캡처, 디버그 흔적

## 자주 하는 작업과 출발점

| 작업 | 시작 파일 |
|---|---|
| 현재 원칙 확인 | `docs/MANIFEST.md` |
| 팀 공유 상태 확인 | `docs/giftaro-status.md` |
| 원본 PDF 확인 | `research/source-pdfs/` |
| 데모 페이지 확인 | `docs/gifttarot/index.html` |
| 상품 카탈로그 확인 | `research/giftaro-product-catalog.md` |
| 아카이브 위치 확인 | `docs/archive-index.md` |
| 코드 작업 | `development/` |
| 발표/제출물 작성 | `deliverables/` / `submissions/` |

---

## 워크플로 최소 요구사항 (상세는 CONTRIBUTING.md)

```bash
# 1. 최신화
git checkout main && git pull origin main

# 2. 브랜치 생성 (규칙: <owner>/<topic-slug>)
git checkout -b gyehyu/example-topic

# 3. 편집 및 커밋 (Conventional Commits)
git add <files>
git commit -m "docs: 왜 바꿨는지 한 문장"

# 4. main이 움직였다면 rebase
git fetch origin && git rebase origin/main

# 5. 푸시 + PR
git push -u origin gyehyu/example-topic
gh pr create --title "..." --body "..."
```

**금지**: `main` 직접 push · `git push --force` · `--no-verify` · `.env` 커밋 ·
임의로 `feat/`, `fix/` 같은 type prefix 브랜치 생성.

---

## 환경 특이사항

- **플랫폼**: Windows 11, bash shell, repo는 **Google Drive 동기화 폴더 안**에 있다.
- **Google Drive 이슈**: `.git/` 내부에 `desktop.ini`가 자동 생성되어 `git pull`/`fetch`를
  깨뜨리는 문제가 반복된다. git 명령 실행 **전에 항상** 다음을 선제 실행하라:
  ```bash
  find .git -name "desktop.ini" -type f -delete
  ```
- **경로 공백**: 폴더명에 한글과 공백이 많다 (`20. KAIST-IMMS`, `30. Deliverables` 등).
  반드시 따옴표로 감싸라.

---

## 에이전트 작업 스타일

- **과분할 금지**: 관련된 변경을 과도하게 쪼개 PR 여러 개를 만들지 말 것. 1 PR = 1 논리 단위.
- **단정하지 말 것**: 프로젝트 맥락이 불충분하면 사용자에게 묻는다. 특히 비즈니스 의사결정,
  페르소나 정의, 숫자 추산은 임의로 채우지 않는다.
- **Critical 모드**: 사업/전략/pivot 논의에서는 default로 비판적 접근. 응원은 명시 요청 시만.
- **한국어 응답**: 사용자가 영어로 쓰지 않는 한 한국어로 답한다.

---

자세한 규칙·예시·과거 사고 기록은 `CONTRIBUTING.md`를 참조.
