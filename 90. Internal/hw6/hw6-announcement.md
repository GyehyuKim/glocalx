# [GlocalX HW6 공지]

안녕하세요, HW6 안내드립니다.
마감: **4/30(목) 밤 11:59pm**

---

## 현재 상태

데모를 먼저 확인해주세요:
https://huggingface.co/spaces/Gyehyu2726/glocalx-demo

현재 구현된 것:
- Gemini 멀티모달 AI 파이프라인: 사진 1장 + 점주 카톡 원문 → 4개 언어(KO/EN/JA/ZH-TW) GBP 포스팅 자동 생성
- Streamlit 기반 wizard UI (위 데모 링크)
- 파트너 매장 3곳(듀플릿 광안점, 듀플릿 해운대, 캐버린하우스) GBP 관리자 권한 확보
- 부산 서면권 65곳 GBP 현장 데이터 수집 완료
- GBP API 승인 확인 완료 (4/27)

데모에서 "데모 샘플" 드롭다운 선택 후 "어댑테이션 생성" 버튼을 누르면 실제 동작을 확인할 수 있습니다.

---

## 왜 이 미션들인가

gstack `/plan-eng-review`로 현재 코드를 리뷰한 결과, TODOS.md에 개선 항목들이 정리되었습니다.
P1(긴급) 항목은 이미 모두 처리 완료되었고, 남은 P2~P3 항목 중에서 **각자 독립적으로 작업 가능한 것**을 메뉴로 만들었습니다.
5월 Build Sprint 전에 안정성+기능 확장 목적입니다.

---

## 미션 메뉴 (B~E 중 택 1)

| 미션 | 내용 | 예상 소요 |
|------|------|----------|
| B | 응답 타임아웃 설정 (Gemini 지연 시 무한 로딩 방지) | 30분 |
| C | 이미지 리사이즈 (원본 사진 그대로 전송 → 축소 후 전송) | 30분 |
| D | 테스트 코드 작성 (GBP 이름 규칙 위반 감지 테스트) | 1시간 |
| E | Gemini 클라이언트 캐싱 (반복 호출 시 오버헤드 제거) | 1시간 |

A(프롬프트 인젝션 방어)는 계휴가 진행합니다.
예상 소요시간은 Claude Code 셋업~커밋까지 전체 시간입니다.

**오늘(4/27 월) 점심까지 하고 싶은 미션 골라서 카톡에 알려주세요.**
겹치면 조정합니다. 목요일 마감까지 3일밖에 없어서 빠르게 정해야 합니다.

---

## 진행 순서

### Step 1. Claude Code 설치

Node.js가 없으면 먼저 설치해주세요.
- Node.js: https://nodejs.org (LTS 버전)

그 다음 터미널에서:
npm install -g @anthropic-ai/claude-code

- 처음 실행하면 Anthropic 계정 로그인이 필요합니다
- Claude Pro 또는 Max 구독 계정으로 로그인하면 됩니다
- 구독이 없으면 https://console.anthropic.com 에서 API 키 발급

### Step 2. 프로젝트 clone

git clone https://github.com/GyehyuKim/glocalx.git
cd glocalx

### Step 3. Claude Code 실행 + gstack 설치

claude

Claude Code가 열리면 아래 입력:
"gstack을 설치해줘. https://github.com/garrytan/gstack 참고해서."

- 설치 후 /office-hours 입력해서 반응하면 OK

### Step 4. Python 설치 (필요시)

프로젝트가 Python(Streamlit) 기반이라 구현/테스트에 Python이 필요합니다.
- 없으면: https://www.python.org/downloads/ (3.11 이상)
- 확인: python --version 또는 python3 --version

### Step 5. /office-hours 수행 (과제 1)

Claude Code에서 /office-hours 실행

산출물 (과제 1):
1. biggest lesson: office-hours에서 얻은 가장 큰 인사이트
2. action item: 그 인사이트를 바탕으로 실행할 한 가지
3. result: action item을 실행한 결과

### Step 6. 본인 미션 수행 (과제 2)

Claude Code에서:
"90. Internal/hw6/hw6-team-prompts.md 읽고 미션 (본인이 고른 알파벳) 수행해줘"

예: "hw6-team-prompts.md 읽고 미션 B 수행해줘"

Claude Code가 자동으로 브랜치 생성, 현황 파악, spec 작성, 구현까지 진행합니다.

### Step 7. commit & push (화요일 점심까지)

작업이 끝나면:
"변경사항 commit하고 push해줘"

산출물 (화요일 점심까지 카톡에 공유):
1. branch URL: https://github.com/GyehyuKim/glocalx/tree/본인브랜치명
2. spec 파일: docs/spec-xxx.md (branch에 포함)
3. 구현 코드: branch에 포함

### Step 8. 팀 피드백 교환 (화요일)

카톡으로 공유된 다른 팀원의 branch URL을 보고 피드백을 남겨주세요.
- 간단한 피드백 1~2줄이면 충분합니다

산출물 (과제 2 - 각자 정리):
1. git branch URL
2. biggest challenge: 구현 중 가장 어려웠던 점
3. meta-cognition lesson: 나 자신의 학습/사고 과정에서 배운 점
4. technical lesson: 기술적으로 배운 점
5. team responses: 다른 팀원들에게 받은 피드백

---

## 일정

| 일정 | 할 일 |
|------|------|
| **월(4/27) 점심** | 미션 선택 → 카톡에 알려주기 |
| **~수(4/29) 점심** | 각자 branch 작업 완료 + push + 카톡에 branch URL 공유 |
| **수(4/29)** | 서로 피드백 교환 |
| **목(4/30) 밤 11:59pm** | 제출 마감 |

**오늘 점심까지 미션 선택 부탁드립니다!**
