# TODOS — GlocalX 위자드 (40. Development)

이 파일은 `/plan-eng-review` + `/plan-design-review` 리뷰 중 발견된
MVP 이후 개선 항목을 추적합니다.
마감(HW6, 2026-04-30) 이후 우선순위에 따라 처리하세요.

---

## P1 — 즉각 처리 필요 (이미 완료)

- [x] `app.py:255` — `uploaded_file.seek(0)` 추가 (retry 시 빈 bytes 버그)
- [x] `app.py:268` — `except RuntimeError` → `except Exception` (Gemini SDK 예외 누락)
- [x] `wizard_prompts.py:86` — `datetime.date.today()` 날짜 주입 (계절 추론 개선)

---

## P2 — HW6 이후 빠른 처리 권장

- [x] **프롬프트 인젝션 방어** (`wizard_prompts.py`)
  - sanitize_input() + STORE_NAME_MAX_LEN/ORIGINAL_TEXT_MAX_LEN 상수 + XML delimiter 적용
  - Unicode Cf 방향 제어 문자 + < > 제거 포함 (adversarial review 반영)
  - post_type 서버사이드 allowlist 검증 추가
  - 완료: 2026-04-27 (gyehyu/prompt-injection-guard)

- [ ] **응답 타임아웃 설정** (`app.py:123`)
  - `GenerateContentConfig`에 `timeout=60` 추가
  - Gemini 서버 지연 시 무한 spinner 방지

- [x] **테스트 파일 생성** (`test_app.py`)
  - `detect_name_violation()` 파트너 스토어 실명 회귀 포함 12케이스 테스트
  - `_classify_error()` 테스트는 후속 PR로 분리 (spec-test-suite.md §6)
  - 완료: 2026-04-28 (seungwon/hw6-mission-d)

---

## P3 — 프로덕션 전 처리

- [ ] **이미지 리사이즈** (`app.py:257`)
  - Gemini 전송 전 `image.thumbnail((1024, 1024), Image.LANCZOS)` 추가
  - 현재: 원본 해상도 그대로 업로드 (Gemini 서버측 처리로 커버 중)

- [ ] **Gemini 클라이언트 캐싱** (`app.py:120`)
  - `@st.cache_resource` 데코레이터로 per-session 재사용
  - 데모 1회 호출 환경에서는 불필요

- [ ] **`render_lang_tab` 타입 힌트** (`app.py:145`)
  - `bundle` 파라미터에 `LangBundle` 타입 힌트 추가

---

## 아키텍처 개선 (MVP 이후)

- [ ] **GBP API 직접 푸시** (현재 클립보드 복사 방식) ← **핵심 기능**
  - ~~GBP API 얼로우리스트 승인 대기 중~~ → **2026-04-27 승인 완료 확인**
  - OAuth2 인증 구현 + `app.py`에 push 버튼 추가
  - 참고: gcloud ADC로는 business.manage scope 불가, OAuth2 Client ID 직접 사용 필요

- [ ] **테스트용 GBP 프로필 생성** ← GBP API 푸시 선행 조건
  - API로 unverified location 생성 → 실매장 건드리지 않고 API 연동 테스트 가능
  - 인증(우편엽서/전화) 불필요, API CRUD 동작 확인용
  - 테스트 완료 후 삭제
  - Build Sprint(5/16~) 착수 시 가장 먼저 처리할 것

- [x] ~~**Streamlit Cloud 배포**~~ → **HF Spaces로 대체 완료** (2026-04-27)
  - https://huggingface.co/spaces/Gyehyu2726/glocalx-demo

- [ ] **다중 사진 지원**
  - 현재: 1장 고정
  - 향후: 메뉴판, 인테리어, 대표 메뉴 등 최대 5장 → 더 풍부한 콘텐츠

---

_마지막 업데이트: 2026-04-27 (GBP API 승인 확인, HF Spaces 배포)_
