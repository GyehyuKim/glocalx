# Spec: Prompt Injection Guard

**Branch:** `gyehyu/prompt-injection-guard`
**Date:** 2026-04-27
**Author:** 김계휴

---

## 문제

`wizard_prompts.py`의 `build_adapt_user_prompt()`(97-130행)에서 `store_name`과
`original_text`가 f-string으로 AI 프롬프트에 직접 삽입됨.
악의적 사용자가 `original_text`에 `"Ignore all previous instructions and..."` 류의
텍스트를 입력하면 AI가 시스템 프롬프트를 무시하거나 의도치 않은 콘텐츠를 생성할 수 있음.

`app.py`의 `st.text_input`, `st.text_area`에 `max_chars` 제한이 없어
UI 레이어에서도 무한 길이 입력이 가능한 상태였음.

> **프롬프트 인젝션(prompt injection):** 사용자 입력이 AI의 지시문(instruction)과
> 같은 레이어에 놓이면서, 입력값이 데이터가 아닌 명령으로 해석되도록 유도하는 공격.
> LLM 앱에서 OWASP Top 10 수준의 취약점.

---

## 구현 결정사항

### 선택된 접근법: Sanitize + XML Delimiter (Approach B)

| 옵션 | 설명 | 선택 여부 |
|------|------|-----------|
| A. 최소 이행 | sanitize 함수 + max_chars만 추가 | 미선택 |
| **B. Sanitize + XML delimiter** | A + 프롬프트 내 XML 태그로 경계 명시 | **선택** |

**선택 이유:** sanitize만으로는 `"Ignore above instructions"` 같은 텍스트 인젝션을
막지 못함. XML-style delimiter로 경계를 명시하면 AI가 해당 블록을 데이터 영역으로
인식하기 쉬워짐. Anthropic 프롬프트 엔지니어링 가이드 권장 패턴.

---

## 변경 파일

### `wizard_prompts.py`

**추가 1 — 상수 (단일 소스)**

```python
STORE_NAME_MAX_LEN = 100
ORIGINAL_TEXT_MAX_LEN = 2000
```

UI(`max_chars`)와 백엔드(`sanitize_input`) 양쪽에서 동일한 값을 import해 사용.
매직 넘버 분산 방지.

**추가 2 — `sanitize_input()` 함수**

```python
def sanitize_input(text: str, max_length: int) -> str:
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    return text[:max_length]
```

- 제거: `\x00-\x08` (NULL~BS), `\x0B-\x0C` (VT, FF), `\x0E-\x1F` (SO-US), `\x7F` (DEL)
- 제거: `\u200B-\u200F`, `\u202A-\u202E`, `\u2066-\u206F`, `\uFEFF` (Unicode Cf 카테고리 — 보이지 않는 방향 제어 문자, 프롬프트 인젝션 벡터)
- 제거: `<`, `>` (XML delimiter 탈출 방지)
- 보존: `\x09` (탭), `\x0A` (LF 줄바꿈), `\x0D` (CR 줄바꿈)
- 정상적인 점주 카톡 원문(줄바꿈 포함)은 변형 없이 통과

**변경 3 — `build_adapt_user_prompt()` 내부**

```python
# 백엔드 정규 방어선
store_name = sanitize_input(store_name, STORE_NAME_MAX_LEN)
original_text = sanitize_input(original_text, ORIGINAL_TEXT_MAX_LEN)
```

```
STORE NAME: <store_name>{store_name}</store_name>
...
OWNER'S ORIGINAL MESSAGE (Korean):
<user_input>
{original_text}
</user_input>
```

### `app.py`

**변경 1 — import 추가**

```python
from wizard_prompts import (
    ...,
    sanitize_input,
    STORE_NAME_MAX_LEN,
    ORIGINAL_TEXT_MAX_LEN,
)
```

**변경 2 — UI 입력 길이 제한 (UX)**

```python
store_name = st.text_input(..., max_chars=STORE_NAME_MAX_LEN)
original_text = st.text_area(..., max_chars=ORIGINAL_TEXT_MAX_LEN)
```

`max_chars`는 브라우저에서만 동작하는 UX 편의 기능. 보안 방어선 아님.

**변경 3 — 생성 버튼 핸들러 (belt-and-suspenders)**

```python
store_name = sanitize_input(store_name, STORE_NAME_MAX_LEN)
original_text = sanitize_input(original_text, ORIGINAL_TEXT_MAX_LEN)
```

---

## 방어 레이어 정리

```
사용자 입력
     │
     ▼
[Layer 1] app.py max_chars            ← UX 편의 (브라우저 전용, 보안 방어선 아님)
     │
     ▼
[Layer 2] app.py sanitize_input       ← belt-and-suspenders (백엔드 중복이지만 명시적)
     │
     ▼
[Layer 2.5] app.py empty check        ← sanitize 후 빈 문자열 방어
              if not store_name.strip() or not original_text.strip(): st.stop()
              (제어문자만 입력된 경우 Gemini 호출 자체를 차단)
     │
     ▼
[Layer 3] wizard_prompts.py sanitize_input  ← 정규 방어선 (UI 우회 시에도 동작)
     │
     ▼
[Layer 4] XML delimiter <user_input>...</user_input>  ← 구조적 경계 분리
     │
     ▼
  Gemini API
```

---

## 한계

- XML delimiter는 확률적 방어임. 모델이 `</user_input>` 탈출을 통한 인젝션에
  완전히 면역은 아님.
- `post_type` 서버사이드 allowlist 검증 완료 (`wizard_prompts.py:107-108`,
  `if post_type not in POST_TYPES: raise ValueError`). UI 우회 시에도 차단.
- `analyze_photo.py`는 동일 패턴 적용 필요하나 이번 스코프 밖 (5월 Build Sprint).

---

## 수동 테스트 체크리스트

- [x] 가게 이름 100자 초과 입력 → UI에서 차단, 백엔드에서 자동 절단
- [x] 카톡 원문 2000자 초과 입력 → UI에서 차단, 백엔드에서 자동 절단
- [x] `\x00` (NULL) 포함 입력 → 제거 확인
- [x] 줄바꿈(`\n`) 포함 입력 → 보존 확인
- [x] `"Ignore all previous instructions"` 입력 → `<user_input>` 태그 내 격리 확인
- [x] 정상 한국어 입력 → 기존과 동일하게 동작
