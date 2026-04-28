# GlocalX 진행 로그

> 주요 마일스톤, 외부 케이스 ID, 블로커 현황을 기록한다.
> 상세 계획은 `90. Internal/CHEATSHEET.md` §7 참조.

---

## 진행 현황 요약 (2026-04-28 기준)

| 단계 | 상태 | 비고 |
|------|------|------|
| 문서 기반 (MANIFEST / WHYTREE / PREMORTEM) | ✅ 완료 | main 머지 |
| 사업계획서 + GBP 가이드 (HTML/PDF) | ✅ 완료 | `30. Deliverables/` |
| 현장 데이터 수집 (서면 GBP 조사 n=65) | ✅ 완료 | `10. Research/` |
| AI 파이프라인 PoC (Gemini 멀티모달) | ✅ 완료 | `40. Development/` |
| 거버넌스 (CONTRIBUTING.md / AGENTS.md) | ✅ 완료 | PR #37 |
| 파트너 매장 GBP 관리자 권한 확보 | ✅ 완료 | 3곳 (아래 참조) |
| GBP API 액세스 심사 | ✅ **승인 완료** | 2026-04-27 확인, OAuth Playground로 검증 |
| Streamlit wizard 데모 배포 | ✅ 완료 | HF Spaces: huggingface.co/spaces/Gyehyu2726/glocalx-demo |
| 프롬프트 인젝션 방어 | ✅ 완료 | `wizard_prompts.py`에 `sanitize_input()` 추가 (제어문자·Unicode 방향제어문자·`<>` 제거, 줄바꿈 보존), 입력 길이 상수 STORE_NAME_MAX_LEN=100 / ORIGINAL_TEXT_MAX_LEN=2000, `<store_name>` · `<user_input>` XML delimiter로 AI 프롬프트와 사용자 입력 영역 분리, post_type 서버사이드 allowlist 검증. `app.py`에 UI max_chars 제한 + belt-and-suspenders sanitize 추가. 4개 방어 레이어 구성. (PR #45, 2026-04-27) |
| CI/CD 자동 배포 파이프라인 | ✅ 완료 | GitHub Actions → HF Spaces, main 머지 시 자동 배포 (2026-04-28) |

### 배포 플랫폼 선택 배경 (HF Spaces)

- GitHub 레포가 private이라 Streamlit Cloud 무료 플랜 사용 불가 (private repo = 유료 플랜 필요)
- 무료 대안 중 Streamlit 앱을 그대로 올릴 수 있는 플랫폼이 HF Spaces뿐이었음
- 결과적으로 Streamlit 프레임워크는 유지하면서 HF Spaces에 우회 배포하는 방식 채택
- CI/CD는 GitHub Actions에서 `huggingface_hub.upload_folder()`로 `40. Development/`를 HF Spaces 레포에 직접 푸시하는 방식으로 구축
| AI 파이프라인 실매장 테스트 | ⏳ 대기 | API 승인됨, Build Sprint에서 착수 |
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
| **승인 확인일** | **2026-04-27** |
| 상태 | ✅ **승인 완료** |

### 승인 확인 과정 (2026-04-27)

Google에서 별도 알림 없이 승인 처리함. 아래 방법으로 직접 확인:

1. Google Cloud Console → APIs & Services → Enabled APIs에서 GBP 관련 API 4종 활성화 확인:
   - My Business Account Management API
   - My Business Business Information API
   - My Business Notifications API
   - My Business Q&A API

2. OAuth 2.0 Playground (developers.google.com/oauthplayground)에서 실제 API 호출 검증:
   - Scope: `https://www.googleapis.com/auth/business.manage`
   - GET `https://mybusinessaccountmanagement.googleapis.com/v1/accounts`
   - HTTP 200 + 계정 정보 반환 확인

   ```json
   {
     "accounts": [{
       "name": "accounts/105174839765206787627",
       "accountName": "Gyehyu Kim",
       "type": "PERSONAL"
     }]
   }
   ```

> 참고: gcloud CLI의 ADC(Application Default Credentials)로는 `business.manage` scope 획득 불가.
> GBP API 테스트 시 OAuth Playground 또는 직접 OAuth2 Client ID 사용 필요.

---

## Plan B — Deep Link 폴백 (API 장애 시)

GBP API 승인 완료(2026-04-27)로 Plan B 필요성은 크게 감소.
단, API 장애 또는 rate limit 시 Deep Link 방식으로 폴백 가능:

- AI 파이프라인이 콘텐츠 생성 → 점주가 Deep Link로 GBP 게시 화면 진입 → 복붙 게시
- `40. Development/analyze_photo.py` 는 API 독립적으로 동작

---

## 주요 마일스톤 (CHEATSHEET §7 기반)

| 주차 | 날짜 | 목표 | 상태 |
|------|------|------|------|
| Week 8 | 4/25 | 문제 정의서, PoC 매장 확정, 점주 관리자 추가 | 진행 중 |
| Week 11~13 | 5/16~30 | Build Sprint — MVP, API 연동, 실제 게시 | 예정 |
| Week 14 | 6/6 | 유저 테스트, Before/After 데이터 확보 | 예정 |
| Week 16 | 6/20 | **Demo Day** | — |
