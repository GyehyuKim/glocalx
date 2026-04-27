# HW6 미션 가이드

KAIST BIZ.69911 — GlocalX 프로젝트
마감: 2026-04-30 (목) 11:59pm

이 파일은 Claude Code가 읽고 실행하는 미션 가이드입니다.
사용법: Claude Code에서 "90. Internal/hw6/hw6-team-prompts.md 읽고 미션 (알파벳) 수행해줘"

---

## 과제 요약

### 과제 1: /office-hours로 프로젝트 방향 리뷰
- gstack `/office-hours` 실행
- 제출물: biggest lesson, one action item, result of doing that action item

### 과제 2: 별도 branch에서 feature 구현
- 아래 미션 중 하나를 수행
- 제출물: git branch URL, biggest challenge, meta-cognition lesson, technical lesson, team responses

---

## 작업 순서

1. **환경 준비**
   - `find .git -name "desktop.ini" -type f -delete`
   - `git fetch origin`
   - `git checkout main && git pull origin main`
   - 본인 branch 생성: `git checkout -b <owner>/<topic-slug>`
   - owner는 CONTRIBUTING.md §1 참조 (사용자에게 물어볼 것)

2. **현황 파악**
   - docs/MANIFEST.md, docs/WHYTREE.md → 프로젝트 비전
   - 40. Development/TODOS.md → 남은 작업 목록
   - CONTRIBUTING.md → 브랜치/커밋 규칙
   - 40. Development/app.py, wizard_prompts.py, wizard_schema.py → 현재 코드 구조
   - 파악 완료 후 사용자에게 요약해줄 것

3. **spec 작성**: `docs/spec-{feature}.md`
   - 목적, 수정 대상 파일, 구현 방법, 테스트 방법 포함

4. **implement**: spec 기반 구현

5. **test**: 수동 또는 pytest 테스트

6. **commit & push**
   - Conventional Commits 형식 (feat:, fix: 등)
   - main에 직접 push 금지
   - .env, API 키 절대 커밋 금지

---

## 미션 목록 (B~E 중 택 1)

아래 B~E에서 1개를 골라 수행하세요. A(프롬프트 인젝션 방어)는 김계휴가 수행합니다.
완벽한 구현이 아니어도 됩니다. 과정에서 배운 것을 기록하는 게 목적입니다.

---

### 미션 A — 프롬프트 인젝션 방어 (김계휴 담당)

**목적**: 사용자 입력이 AI 프롬프트에 직접 주입되는 보안 취약점 해소. 파트너 확장 전 필수.

**예상 소요**: 2시간
**참고**: TODOS.md P2
**브랜치**: `gyehyu/prompt-injection-guard`

**배경**:
wizard_prompts.py의 build_adapt_user_prompt() (76-90행)에서 store_name, original_text가 f-string으로 프롬프트에 직접 주입됨. 악의적 입력이 AI 동작을 조작할 수 있음.

**수정 대상**:

(1) wizard_prompts.py
- 입력 최대 길이 제한 함수 추가 (store_name: 100자, original_text: 2000자)
- 제어문자 스트립: `re.sub(r'[\x00-\x1F]', '', input)`

(2) app.py
- `st.text_input`, `st.text_area`에 `max_chars` 파라미터 추가
- 입력값 sanitize 함수를 만들어 generate 버튼 클릭 시 적용

**테스트 방법**: 제어문자, 초과 길이 입력으로 앱이 정상 동작하는지 수동 확인

**산출물**:
- `docs/spec-prompt-injection-guard.md`
- wizard_prompts.py, app.py 수정 코드
- branch URL

---

### 미션 B — 응답 타임아웃 설정

**목적**: Gemini 서버 지연 시 무한 로딩 방지. 사용자 경험 안정화.

**예상 소요**: 30분
**참고**: TODOS.md P2
**브랜치 이름 예시**: `<owner>/response-timeout`

**배경**:
현재 Gemini API 호출 시 타임아웃이 없어서, 서버 지연 시 spinner가 무한 회전함.

**수정 대상**:

(1) app.py (run_adaptation 함수, GenerateContentConfig 부근)
- `GenerateContentConfig`에 `timeout=60` 추가
- 타임아웃 발생 시 _classify_error()가 이미 "timeout" 키워드를 감지하므로, 에러 메시지 자동 표시됨

**테스트 방법**: 정상 호출이 여전히 동작하는지 확인. 타임아웃 값이 설정에 반영되었는지 코드 리뷰.

**산출물**:
- `docs/spec-response-timeout.md`
- app.py 수정 코드
- branch URL

---

### 미션 C — 이미지 리사이즈

**목적**: 대용량 원본 이미지를 축소하여 Gemini 전송 효율 개선 + 응답 속도 향상.

**예상 소요**: 30분
**참고**: TODOS.md P3
**브랜치 이름 예시**: `<owner>/image-resize`

**배경**:
현재 사용자가 업로드한 사진이 원본 해상도(수 MB) 그대로 Gemini에 전송됨. 불필요한 대역폭 사용 + 응답 지연.

**수정 대상**:

(1) app.py (이미지 처리 부분, uploaded_file.seek(0) 이후)
- Gemini 전송 전 `image.thumbnail((1024, 1024), Image.LANCZOS)` 추가
- 원본은 유지하고 전송용 복사본만 리사이즈
- 리사이즈 적용 여부를 st.caption으로 표시 (예: "1024x1024로 리사이즈됨")

**테스트 방법**: 큰 사진(3000x4000 등) 업로드 후 정상 동작 확인. 작은 사진은 리사이즈 안 되는지 확인.

**산출물**:
- `docs/spec-image-resize.md`
- app.py 수정 코드
- branch URL

---

### 미션 D — 테스트 코드 작성

**목적**: GBP 이름 규칙 위반 감지 정확도 검증. 파트너 데모 전 필수.

**예상 소요**: 1시간
**참고**: TODOS.md P2
**브랜치 이름 예시**: `<owner>/test-suite`

**배경**:
현재 테스트 코드가 없어서 detect_name_violation()의 정확성을 검증할 수 없음.

**생성 파일**: `40. Development/test_app.py`

detect_name_violation() 테스트 (app.py에 정의된 함수)
- 슬래시(/) 구분 다국어 혼재 → 위반 감지
- 한글 + 일본어 혼재 → 위반 감지
- 한글 + 영문 + 중문 혼재 → 위반 감지
- 정상 이름 (예: "듀플릿 광안점") → 통과
- 빈 문자열 → 통과
- 파트너 스토어 실명 케이스: 듀플릿 광안점, 듀플릿 해운대 해리단길점, 캐버린하우스 Keveren House

**테스트 실행**: `cd "40. Development" && pip install pytest && pytest test_app.py -v`

**산출물**:
- `docs/spec-test-suite.md`
- `40. Development/test_app.py`
- pytest 통과 확인
- branch URL

---

### 미션 E — Gemini 클라이언트 캐싱

**목적**: 반복 호출 시 Gemini 클라이언트 재생성 오버헤드 제거.

**예상 소요**: 1시간
**참고**: TODOS.md P3
**브랜치 이름 예시**: `<owner>/gemini-client-cache`

**배경**:
현재 run_adaptation() 호출 때마다 `genai.Client(api_key=...)`를 새로 생성함. Streamlit의 리렌더링 특성상 매 호출마다 불필요한 초기화 발생.

**수정 대상**:

(1) app.py (run_adaptation 함수)
- 클라이언트 생성을 별도 함수로 추출
- `@st.cache_resource` 데코레이터로 감싸서 per-session 재사용
- 예시:
  ```python
  @st.cache_resource
  def get_gemini_client():
      return genai.Client(api_key=config.GEMINI_API_KEY)
  ```

**테스트 방법**: 연속 2회 생성 버튼 클릭 시 정상 동작 확인.

**산출물**:
- `docs/spec-gemini-client-cache.md`
- app.py 수정 코드
- branch URL

---

## 일정

| 언제 | 할 일 |
|------|------|
| 월(4/27) 점심 | 미션 선택 → 카톡에 알려주기 |
| ~수(4/29) 점심 | 각자 branch 작업 완료 + push + 카톡에 branch URL 공유 |
| 수(4/29) | 서로 피드백 교환 (team responses) |
| 목(4/30) 11:59pm | 제출 마감 |

## 제출물 체크리스트

### 과제 1 — /office-hours
- [ ] biggest lesson
- [ ] one action item
- [ ] result of doing that action item

### 과제 2 — feature branch
- [ ] git branch URL
- [ ] spec 파일 (docs/spec-xxx.md)
- [ ] 구현 코드 (branch에 포함)
- [ ] biggest challenge
- [ ] meta-cognition lesson
- [ ] technical lesson
- [ ] team responses (다른 팀원들의 피드백)
