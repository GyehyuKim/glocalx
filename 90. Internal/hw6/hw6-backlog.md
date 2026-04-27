# HW6 개선 항목 백로그

HW6 과제 준비 과정에서 도출된 개선 항목 전체 목록.
이번 HW6에서 전부 처리하지 않아도 됨. 5월 Build Sprint에서 이어서 진행.

---

## P2 — 빠른 처리 권장

- [ ] **프롬프트 인젝션 방어** (wizard_prompts.py, app.py)
  - store_name, original_text가 f-string으로 직접 주입됨
  - 입력 길이 제한 + 제어문자 스트립

- [ ] **응답 타임아웃 설정** (app.py)
  - GenerateContentConfig에 timeout=60 추가

- [ ] **테스트 코드 작성** (새 파일)
  - detect_name_violation(), _classify_error() 테스트

## P3 — 프로덕션 전 처리

- [ ] **이미지 리사이즈** (app.py)
  - Gemini 전송 전 thumbnail(1024, 1024) 적용

- [ ] **Gemini 클라이언트 캐싱** (app.py)
  - @st.cache_resource로 per-session 재사용

- [ ] **render_lang_tab 타입 힌트** (app.py)
  - bundle 파라미터에 LangBundle 타입 힌트

## 아키텍처 개선

- [ ] **다중 사진 지원** (app.py, wizard_prompts.py)
  - 1장 → 최대 5장

- [ ] **GBP API 직접 푸시** ← 핵심, 계휴 진행 중
  - 2026-04-27 API 승인 확인
  - 테스트용 GBP 프로필 생성 + OAuth2 + 포스팅 PoC

---

_출처: TODOS.md + /plan-eng-review 결과_
