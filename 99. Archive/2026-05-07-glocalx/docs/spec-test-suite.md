# Spec — `detect_name_violation()` 테스트 스위트

작성: 2026-04-28
작성자: 이승원 (`seungwon`)
브랜치: `seungwon/hw6-mission-d`
관련: HW6 미션 D, TODOS.md P2

---

## 1. 목적

GBP 이름 필드 위반 감지 함수 `detect_name_violation()`(`40. Development/app.py:85`)
의 정확성을 pytest로 검증한다. 파트너 데모 전에 핵심 4규칙(슬래시/한일혼재/한영중혼재/통과)
이 100% 정확하게 동작함을 보장하고, 회귀 방지를 위한 안전망을 만든다.

## 2. 배경

`detect_name_violation()`은 다음 4가지 입력 패턴을 위반으로 감지한다:

1. 슬래시(`/` 또는 전각 `／`)로 다국어 구분된 이름 — Google이 가장 적극적으로 정지시키는 패턴
2. 한글 + 일본어(히라가나·가타카나) 혼재
3. 한글 + 영문 + CJK(중일 한자) 혼재
4. 그 외(한영 혼재, 한국어 단일, 빈 문자열) — 통과

이 함수가 잘못 동작하면:

- **거짓 양성(False positive)** → 정상 이름이 차단되어 점주가 화남
- **거짓 음성(False negative)** → 위반 이름이 통과되어 GBP 계정 정지 위험

파트너 스토어(두플릿 광안점, 듀플릿 해운대 해리단길점, 캐버린하우스)의 실명에서
거짓 양성이 발생하면 데모 자체가 무너지므로 명시적 회귀 테스트가 필수다.

## 3. 수정 대상 파일

| 파일 | 변경 |
|---|---|
| `40. Development/test_app.py` | **신규 생성** |
| `docs/spec-test-suite.md` | **신규 생성** (이 파일) |

기존 코드는 변경하지 않는다(테스트 도입만).

## 4. 구현 방법

### 4.1 의존성 격리 전략

`app.py`는 모듈 로드 시 `streamlit`, `google.genai`, `PIL`, `pydantic`을 import할
뿐 아니라, **모듈 레벨에서 Streamlit 위자드 UI 코드를 그대로 실행**한다 (`st.selectbox`,
`DEMO_SAMPLES[demo_choice]` 등). 따라서 `from app import ...`는 streamlit 런타임 밖에서
반드시 실패한다. 단순 `sys.modules` 모킹만으로는 `st.selectbox()`가 MagicMock을
리턴해 `DEMO_SAMPLES[<MagicMock>]`이 KeyError로 깨짐을 확인했다.

**해결**: `app.py`를 import하지 않고, **소스를 AST로 파싱해 필요한 노드만 추출**한다.
- `import re`
- `_*_RE = re.compile(...)` 형태의 정규식 상수 6개
- `def detect_name_violation(...)` 함수 정의

추출된 노드는 격리된 `dict` 네임스페이스에서 `exec`되며, 함수 본체는 100% 동일한
코드(같은 source_path로 컴파일)라 실제 함수와 행동이 다를 수 없다.

**장점**:
- `app.py` 미수정 — 함수가 app.py에 정의되어 있다는 사실 유지.
- streamlit/genai/PIL/pydantic 미설치 환경에서도 테스트 실행 가능.
- `app.py`의 UI 코드 변경이 테스트에 영향을 주지 않음 (함수명·시그니처가 유지되는 한).

**위험**: `detect_name_violation` 이름이 바뀌거나 다른 모듈로 이동하면 추출 로더가
명시적 `RuntimeError`로 실패한다 (silent skip 아님 → 회귀 즉시 인지).

### 4.2 테스트 케이스 (총 12개)

#### 4.2.1 위반 감지 (각 규칙별 1+ 케이스)

| ID | 입력 | 기대 결과 | 검증 규칙 |
|---|---|---|---|
| V1 | `"가게 / Store"` | `(True, "슬래시(/) 구분 다국어 혼재")` | 반각 슬래시 |
| V2 | `"가게／Store"` | `(True, "슬래시(/) 구분 다국어 혼재")` | 전각 슬래시 |
| V3 | `"한글 ひらがな"` | `(True, "한글 + 일본어 혼재")` | 히라가나 |
| V4 | `"한글 カタカナ"` | `(True, "한글 + 일본어 혼재")` | 가타카나 |
| V5 | `"한글 English 中文"` | `(True, "한글 + 영문 + 중문 혼재")` | 3-way mix |

#### 4.2.2 정상 통과

| ID | 입력 | 기대 결과 | 검증 의도 |
|---|---|---|---|
| P1 | `"듀플릿 광안점"` | `(False, "")` | 한국어 단일, 일반 점포명 |
| P2 | `""` | `(False, "")` | 빈 문자열 |
| P3 | `"   "` | `(False, "")` | 공백만 |
| P4 | `"Coffee Bean"` | `(False, "")` | 영문 단일 |
| P5 | `"카페 Bean"` | `(False, "")` | 한영 혼재(허용) |

#### 4.2.3 파트너 스토어 실명 회귀 테스트

| ID | 입력 | 기대 결과 |
|---|---|---|
| R1 | `"듀플릿 광안점"` | `(False, "")` |
| R2 | `"듀플릿 해운대 해리단길점"` | `(False, "")` |
| R3 | `"캐버린하우스 Keveren House"` | `(False, "")` (한영 혼재, CJK 한자 없음) |

## 5. 테스트 방법

### 5.1 의존성 설치 (최소)

```bash
cd "40. Development"
python3 -m venv .venv-test
source .venv-test/bin/activate
pip install pytest
```

`requirements.txt` 전체 설치는 불필요(모킹으로 격리). `.venv-test/`는 `.gitignore`에
추가하지 않아도 venv는 일반적으로 untracked. 커밋 전 `git status`로 확인.

### 5.2 실행

```bash
cd "40. Development"
pytest test_app.py -v
```

### 5.3 통과 기준

- 모든 12개 테스트 케이스 통과 (`12 passed`)
- 경고나 에러 없음 (모킹 관련 경고는 허용)

## 6. 비범위 (Out of Scope)

다음은 이번 PR에서 다루지 않는다:

- `_classify_error()` 테스트 (TODOS.md에는 언급되지만 미션 D 명세에는 없음 → 후속 PR)
- 통합 테스트(streamlit 런타임 검증) — 데모 전 수동 QA로 커버
- CI 파이프라인 등록(`.github/workflows/`) — 후속 작업
- `app.py` 리팩터(detect_name_violation 모듈 분리) — 현 구조 유지

## 7. 위험 및 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| Python 3.14 환경에서 streamlit 미지원 | 테스트 실행 불가 | AST 추출로 streamlit 의존 회피 (app.py 통째 import 불필요) |
| `app.py`에서 `detect_name_violation` 함수명 변경 또는 다른 모듈로 이동 | 테스트 추출 실패 | 명시적 `RuntimeError`로 실패 → silent skip 아님 |
| `app.py` regex 상수 명명 규칙(`_*_RE`) 변경 | 추출 누락 → 테스트가 NameError | spec에 규칙 명시, 위반 시 코드 리뷰에서 동시 수정 |
| 로컬 venv 경로(`.venv-test/`)를 실수로 커밋 | repo 오염 | 글로벌 gitignore가 이미 차단 (`git status --ignored`로 확인) |

## 8. 산출물

- `docs/spec-test-suite.md` (이 파일)
- `40. Development/test_app.py`
- `pytest test_app.py -v` 통과 로그
- 브랜치 `seungwon/hw6-mission-d` push URL
