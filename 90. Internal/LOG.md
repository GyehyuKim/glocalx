# GlocalX 진행 로그

> 주요 마일스톤, 외부 케이스 ID, 블로커 현황을 기록한다.
> 상세 계획은 `90. Internal/CHEATSHEET.md` §7 참조.

---

## 진행 현황 요약 (2026-04-22 기준)

| 단계 | 상태 | 비고 |
|------|------|------|
| 문서 기반 (MANIFEST / WHYTREE / PREMORTEM) | ✅ 완료 | main 머지 |
| 사업계획서 + GBP 가이드 (HTML/PDF) | ✅ 완료 | `30. Deliverables/` |
| 현장 데이터 수집 (서면 GBP 조사 n=65) | ✅ 완료 | `10. Research/` |
| AI 파이프라인 PoC (Gemini 멀티모달) | ✅ 완료 | `40. Development/` |
| 거버넌스 (CONTRIBUTING.md / AGENTS.md) | ✅ 완료 | PR #37 |
| 파트너 매장 GBP 관리자 권한 확보 | ✅ 완료 | 3곳 (아래 참조) |
| GBP API 액세스 심사 신청 | ✅ 신청 완료 | **승인 대기 중** |
| AI 파이프라인 실매장 테스트 | ⏳ 대기 | API 승인 후 착수 |
| MVP 실제 게시 | ⏳ 대기 | Build Sprint (5/16~) |

---

## 파트너 매장 현황

| 매장명 | 주소 | GBP 상태 |
|--------|------|---------|
| 듀플릿 광안점 | 광남로 195-6 | Verified ✅ |
| 듀플릿 해운대 해리단길점 | 우동1로 20번길 27-13 | Verified ✅ |
| 캐버린하우스 Keveren House | 우동1로38번가길 14-5 | Verified ✅ |

관리 계정: `glocalx.kaist2026@gmail.com`

---

## GBP API 심사 신청 기록

| 항목 | 값 |
|------|-----|
| 신청일 | 2026-04-22 |
| 케이스 ID | **5-1216000041298** |
| Google Cloud 프로젝트 | `glocalx-492416` (번호: `446892137706`) |
| 예상 검토 기간 | 7~10 영업일 |
| 예상 승인 시점 | 2026-05-06 전후 |
| 상태 | ⏳ 검토 중 |

> 승인 메일 수신 후 이 파일의 상태를 ✅ 완료로 업데이트할 것.

---

## Plan B — API 승인 전 병렬 진행

API 미승인 시 Deep Link 방식으로 Demo Day 시연 가능 (PREMORTEM #1 대응).

- AI 파이프라인이 콘텐츠 생성 → 점주가 Deep Link로 GBP 게시 화면 진입 → 복붙 게시
- `40. Development/analyze_photo.py` 는 API 독립적으로 동작 — 지금 바로 테스트 가능

---

## 주요 마일스톤 (CHEATSHEET §7 기반)

| 주차 | 날짜 | 목표 | 상태 |
|------|------|------|------|
| Week 8 | 4/25 | 문제 정의서, PoC 매장 확정, 점주 관리자 추가 | 진행 중 |
| Week 11~13 | 5/16~30 | Build Sprint — MVP, API 연동, 실제 게시 | 예정 |
| Week 14 | 6/6 | 유저 테스트, Before/After 데이터 확보 | 예정 |
| Week 16 | 6/20 | **Demo Day** | — |
