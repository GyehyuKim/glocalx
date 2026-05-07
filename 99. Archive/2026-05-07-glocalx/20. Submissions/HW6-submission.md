# HW6 제출 — 김계휴

---

## Part 1. AI로 프로젝트 방향 리뷰

### 가장 큰 교훈 (What is the biggest lesson?)

v1 위자드는 AI가 한국어 콘텐츠를 처음부터 생성했는데, 실제 운영은 점주가 카톡으로 원문을 보내는 구조였다. AI 설계와 운영 모델이 처음부터 불일치했다는 것을 /office-hours를 통해 발견했다.

### /office-hours에서 나온 action items

- AI 역할을 "생성"에서 "어댑테이션"으로 전환
- 점주 원문을 입력받아 KO 보정 + EN/JA/ZH-TW 문화 어댑테이션 출력
- DO NOT INVENT INFORMATION 규칙 명시 (추측 생성 금지)

### 선택한 action item

v2 포스팅 어댑테이션 모델 구현

### 결과

v2 위자드 완성, HF Spaces 배포 완료
https://huggingface.co/spaces/Gyehyu2726/glocalx-demo

---

## Part 2. 피처 브랜치 빌드

### Git 브랜치 URL

gyehyu/v2-post-adaptation → PR #43 (MERGED)
https://github.com/GyehyuKim/glocalx/pull/43

### 가장 큰 개발 과제 (What is the biggest challenge?)

Gemini 2.5 Flash의 thinking 기능이 기본 활성화되어 있어 생성에 5분 이상 소요되었다. thinking_budget=0으로 비활성화해서 10~30초로 해결했다.

### 메타인지 교훈 (What is the biggest meta-cognition lesson?)

설계 검토 없이 구현부터 하면 운영 모델과 어긋난 코드가 나온다. /office-hours로 한 번 멈춰서 검토한 것이 v1 → v2 피벗의 계기가 되었다.

### 기술적 교훈 (What is the biggest technical lesson?)

Pydantic max_length Field 제약으로 GBP 글자 수 제한을 AI 출력 단에서 강제할 수 있다. 프롬프트만으로는 불안정하다.

### 팀원 반응 (What are the responses from your team members?)

- 이승원: 테스트 코드 작성 (PR #50) — detect_name_violation 회귀 테스트 13케이스 구현
- 정윤지: 대화형 인터페이스 방향으로 매니페스토 업데이트 (PR #47), 카카오 비즈니스채널 연동 가능성 탐색 중
