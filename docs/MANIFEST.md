# MANIFEST: Giftaro

> 회사 동료에게 줄 선물을, 결제 창이 아니라 의미 카드와 전달 메시지로 마무리하는 공유 레이어.

## Why This Exists

기프타로는 이미 결제가 끝난 선물을 더 기억에 남게 전달하기 위한 도구다.
사용자는 외부 선물 구매 흐름에서 결제를 끝내고, 우리는 그 결과를 카카오톡에서 자연스럽게 전달할 수 있는 의미 패키지로 바꾼다.

우리가 해결하는 문제는 "무엇을 살까"가 아니라 "이 선물을 왜 보냈는지 어떻게 남길까"다.

## The Three Conditions

기프타로는 다음 셋이 동시에 맞아야 성립한다.

1. **전달감** — 구매가 아니라 전달이 중심이어야 한다.
2. **무드** — 생일과 관계 맥락을 바탕으로, 별자리나 Water 같은 가벼운 무드가 읽혀야 한다.
3. **회피감 최소화** — 받는 사람이 부담스럽지 않아야 한다.

## Principles

### 1. 결제는 다루지 않는다
결제, 주소, 주문 관리는 밖에 둔다. 우리는 의미와 전달만 만든다.

### 2. 개인정보는 최소만 쓴다
아이디, 주소, 주문번호, 결제 내역, 배송 상태는 다루지 않는다.

### 3. 의미는 가볍게 만든다
`Water`, `게자리`, `잠깐 쉬어가는 무드`처럼 읽히는 정도가 적당하다.

### 4. 받은 사람이 먼저다
받는 사람이 불편하면 의미는 실패다. 반응은 가볍게, 피드백은 한 번의 클릭으로 끝내는 쪽이 맞다.

### 5. 실제 상품과 실제 맥락만 쓴다
가짜 브랜드명보다 실제 상품명이 낫다. 다만 상품 추천은 외부 서비스의 결과를 존중하고, 우리는 그 위에 의미를 덧씌운다.

## Repository Layout

active main은 Giftaro만 담는다. 이전 프로젝트 자료는 archive 브랜치로만 보관한다.

- `docs/` — 현재 합의된 문서, 상태 공유본, GitHub Pages 진입점
- `research/` — 원본 PDF, 조사 메모, 상품 카탈로그, 리서치 산출물
- `development/` — 실행 코드, 테스트, 실험 코드
- `deliverables/` — 발표/제출용 최종 산출물
- `submissions/` — 수업 제출본
- `internal/` — 내부 메모, 로그, 캡처, 디버그 흔적

새 작업은 위 폴더 중 하나에만 넣는다. 숫자 prefix 폴더는 새 작업에 쓰지 않는다.

## What We Do Not Do

- 결제창을 만든다
- 배송지를 받는다
- 주문 상태를 관리한다
- 사주 풀이를 정답처럼 말한다
- 설문지처럼 긴 피드백을 강요한다

## Current Product Shape

- 입력: 관계, 생일, 상황, 톤
- 출력: 의미 카드, 선물명, 전달 문구, 카카오톡 공유용 결과
- 데모: [`docs/gifttarot/index.html`](./gifttarot/index.html)
- 중간 공유본: [`docs/giftaro-status.md`](./giftaro-status.md)

## Reading Order

1. [`docs/giftaro-status.md`](./giftaro-status.md)
2. [`docs/archive-index.md`](./archive-index.md)
3. [`docs/gifttarot/index.html`](./gifttarot/index.html)
