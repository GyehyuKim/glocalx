# ReadingGo Spec v4.1

> 기준일: 2026-05-14
> 상태: **백엔드 고려 MVP 스펙** — Phase 0(웹 데모) / Phase 1(웹 풀스택) / Phase 2(앱 + 푸시)
> 작성 원칙: 이 문서만으로 시스템 구현이 가능해야 한다. 외부 문서 참조 없이 자기충족적.
> 입력 문서(아카이브): `docs/readinggo-discussion.md`, `docs/협동-기반-독서-루틴-조사.md`, `Reading_GO_Service_Planning_v1.pdf`
> v4 → v4.1 변경: 윤지 데모(PR #86) 통합 인사이트 반영 — 마을 탭 부활, 주간 리그, 노드=세션 단위 확정, The Path 시각 명세, 디자인 토큰, 다중 책 활성화 전환

---

## 0. 한 줄

> 독서습관 앱계의 듀오링고.

---

## 1. 제품 약속

| 사용자가 얻는 것 | 제품이 책임지는 것 |
|---|---|
| 하루 1페이지 이상 읽는 습관 형성 | 듀오링고 수준의 지속성 엔진 (스트릭·방패·복귀) |
| 읽은 책의 핵심을 손에 남긴다 | "오늘의 문장" 누적 → 책 한 권의 엑기스 → Markdown export |
| 혼자가 아니라 같이 읽는다 | 단방향 팔로우 + 마을 둥지 시각화 + 박수 + NPC 동행 |

타겟: **읽고 싶은데 이어나가지 못하는 사람**. 안 읽는 사람을 끌어오는 제품 아님.

### 1.1 왜 책 / 왜 페이지

- 모두가 하고 싶어하는 행동 — "더 읽고 싶다"는 보편적 욕구
- 최소한의 정량화가 가능한 유일한 일상 카테고리 — 1페이지가 명확한 진척 단위

### 1.2 슬로건

> **"하루 한 페이지, 한 문장에서 시작해요."**

UI 상 진입 화면 헤더·로그인 화면·온보딩 카피에서 일관되게 사용.

---

## 2. 핵심 루프

```
[책 등록] (여러 권 가능, 1권을 "활성 책"으로 지정)
   ↓
[앱 밖에서 읽기 — 하루 1페이지 이상이면 충분]
   ↓
[일일 미션: 활성 책의 현재 페이지 입력 + 오늘의 문장 입력(둘 다 강제)]
   ↓
[스트릭 갱신 → XP 보상 → 참새 다음 노드로 hop]
   ↓
[마을에서 친구 둥지 불빛 ON, 소셜 피드 노출 → 박수(짝짝짝)]
   ↓
[다음날 21:00 알림. 미참여 시 23:00 긴급 알림]
```

**목표 페이지 설정 없음.** 부담을 없애는 게 핵심 — 1페이지만 읽어도 오늘은 성공.

### 2.1 핵심 체크인 트리거

**"오늘의 문장" 입력 (강제, 200자 이내).**

페이지 입력만으로는 읽음을 검증할 수 없다. 한 문장을 직접 적는 행위가 (a) 읽음의 증명이며 (b) 사용자에게 누적되는 자산이 된다.

### 2.2 이탈 방어선

- **스트릭 lock-in** — 끊기지 않은 연속일이 머무를 이유
- **누적 문장 export** — 떠나도 가져갈 수 있다는 신뢰가 lock-in의 윤리적 부담 상쇄

---

## 3. Phase 구분

| Phase | 대상 | 산출물 | 백엔드 | 데이터 저장 |
|---|---|---|---|---|
| **Phase 0** | 2026-05-16 Peer Review 데모 | `docs/readinggo/index.html` 클릭 프로토타입 | **없음** | `localStorage` + 정적 TSV (`docs/readinggo/data/`) |
| **Phase 1** | MVP (웹) | 풀스택 웹앱 | **Supabase** (Auth + Postgres + pg_cron) | Postgres + Storage |
| **Phase 2** | 최종 발표 (학기말) | **Android APK** | Supabase + FCM | Postgres + 로컬 캐시 |

### Phase 0 제약

- 외부 API 호출 없음 (알라딘 키 미사용). 책 데이터는 `docs/readinggo/data/books.tsv` 정적 로드
- 인증 없음. 닉네임은 입력만 받아 localStorage 저장
- NPC 활동은 시드 데이터로 시뮬레이션 (배치 없이 미리 박힌 가짜 기록)
- 알림 없음 (브라우저 알림은 토스트 시뮬레이션)
- **다중 책 진도는 localStorage에 책별로 분리 저장** (책 전환 시 진도 초기화 금지)

### Phase 1 신규

- Supabase Auth (Google OAuth), Postgres, RLS, pg_cron 스트릭 배치
- Chrome Notification API (웹 푸시 권한)
- 클라이언트 사이드 fuzzy 검색 (Fuse.js)
- NPC 일일 활동 pg_cron 배치
- 닉네임 중복 검증 (서버), 금칙어 (LDNOOBW + 한국어 추가)
- 주간 리그 (XP 합산 개인 랭킹)

### Phase 2 신규

- Android APK (스택 미정 — React Native / Flutter / Expo)
- FCM 푸시 알림 (네이티브)
- NPC 다인·확장된 일과
- 챕터 자동 인식 (알라딘 프리미엄 또는 수동 입력 UI)
- 결제 / 방패 추가 구매 검토

---

## 4. 유저 시나리오 — 신규 가입 여정

각 단계는 화면 단위이며, **Phase 0 데모에서 모두 클릭으로 확인 가능해야 한다**.

### A. 진입 (비로그인)

- 한 페이지에 헤더 슬로건 ("하루 한 페이지, 한 문장에서 시작해요"), 중앙 CTA `시작하기`
- 슬라이드·튜토리얼 없음. Phase 2 앱 빌드 시 스플래시 로딩 동안만 철학 카피 노출
- CTA → **C** (책 등록)

### B. 사전 질문

**삭제.** 마찰 제거. 1일 1페이지 1문장이 유일한 목표.

### C. 첫 책 등록 (가입 전 가능)

**C-1. 검색 화면**

- 검색창: ISBN / 제목 / 저자 입력
- 검색 동작: 클라이언트 사이드 fuzzy 매칭 (`docs/readinggo/data/books.tsv` 위에서). Phase 1+는 동일 fuzzy를 서버 보조
  - 한글: 자모 분해 (`es-hangul`) 후 부분 일치
  - 영문: Fuse.js (Levenshtein 거리)
  - 오타·외국어 작가명 약한 일치 허용
- 결과 카드: 표지 / 제목 / 저자 / 총 페이지
- 검색어 비어있을 때 **하단 추천**:
  - 탭 1: 요즘 Top 10 (`rank_recent` ASC)
  - 탭 2: 스테디 Top 10 (`rank_steady` ASC)
- 결과 없을 시 카드: "직접 등록" → C-2

**C-2. 확인 / 직접 등록**

- 선택한 책의 표지·제목·저자·총페이지 표시
- "현재 어디까지 읽었어요?" 입력 (기본 0)
- 총 페이지: API 값 prefill, 수정 가능
- 직접 등록: 제목 / 저자 / 총 페이지 입력 (표지는 플레이스홀더)
- CTA `이 책으로 시작` → 이 책이 **활성 책**으로 지정됨 → **D**

### D. 첫 기록 (가입 전 try — sticky moment)

활성 책 기준으로 입력.

**D-1. 페이지 입력**

- 화면 중앙 큰 숫자: 현재까지 도달한 페이지 (기본 = 등록 시 입력값)
- 좌우 버튼: `[−1]` `[+1]`, 추가 `[+10]`
- 숫자 영역 탭 → 직접 입력 모달 (숫자 키패드)
- 검증: 0 ≤ 입력 ≤ 책 총 페이지, 입력 ≥ 직전 기록
- 다음 → D-2

**D-2. 오늘의 문장 입력 (필수)**

- 텍스트 영역, placeholder: "마음에 든 한 줄을 적어주세요 (최대 200자)"
- 최소 1자 최대 200자. 빈 입력 시 다음 버튼 비활성화
- 자동 임시 저장 (localStorage `pending_sentence`)
- 다음 → D-3

**D-3. 세리머니 (성공 화면)**

레이아웃 명세:

```
┌─────────────────────────┐
│   [confetti 18조각]      │   ← 5색(green/yellow/blue/red/purple) 1.0~2.0s
│                          │
│      🐦 (참새 bounce)    │   ← popIn 0.4s
│      훌륭해요!            │
│   로드맵 N번째 노드 획득!  │
│                          │
│  ┌──┬──┬──┐              │   ← 보상 카드 3그리드
│  │🔥│⚡ │⬆️ │              │
│  │+1│+10│hop│              │
│  └──┴──┴──┘              │
│  [계속하기]               │
└─────────────────────────┘
```

- 참새 hop 애니메이션, 책 표지 옆 진척 바 증가
- 가입 전이면 CTA `계속하려면 로그인` → **E**, 이미 로그인이면 홈 복귀

D-1, D-2 입력 모두 완료해야 D-3 진입 (= "오늘 읽기 완료").

### E. 가입

- 카피: "하루 한 페이지, 한 문장에서 시작해요. 계속 이어가려면 로그인하세요."
- 단일 버튼: `Google로 계속`
- OAuth 성공 후:
  - localStorage 임시 데이터 → Supabase 동기화
  - 닉네임 미입력 시 E-1
  - 친구 추가 화면 표시 안 함. 바로 **H** (홈)

**E-1. 닉네임 설정** (이미 입력했으면 스킵)

- 입력 필드: `@nickname`
- 규칙 표시 (입력 필드 하단 항상 노출):
  - 영소문자 / 숫자 / 한글 / 언더스코어
  - 2자 이상 16자 이하
  - 다른 사용자가 사용 중인 닉네임 불가
  - 부적절한 단어 불가
- 입력 동안 디바운스 300ms 후 `/rpc/check_handle` 호출
- 실패 시 위반 항목 명시
- 변경: 가입 후 언제든 무제한

### F. 알림 권한 요청

**진입 트리거**: 첫 기록(D-3) 완료 후 다음 진입.

- Phase 0: 토스트 시뮬레이션
- Phase 1: `Notification.requestPermission()`. 거절 시 설정에서 재시도
- Phase 2: 네이티브 푸시 표준 플로우

알림 정책:

| 항목 | 정책 |
|---|---|
| 디폴트 시간 | 21:00 (사용자 로컬 타임존) |
| 사용자 변경 | 가능. 22:00 이후로는 설정 불가 |
| 알림 문구 (일반) | "🌱 오늘의 한 페이지, 한 문장 어때요?" |
| 긴급 알림 | 미참여 + 23:00 도달 시. "🛡 오늘 한 문장만! {N}일 연속 기록이 사라지려 해요 🥺" |
| 모이 알림 (마을) | 친구가 모이를 보냈을 때 즉시. "🪱 @{nickname} 님이 오늘도 같이 읽자고 해요" |

### G. 친구 / NPC

가입 직후 자동:

- NPC 2명 자동 팔로우: `@book_bear`(책읽는곰돌이) / `@activist_raccoon`(활자라쿤)
- NPC는 UI상 일반 유저와 동일 (`users.is_npc`는 내부)

상호작용 규칙:

- **소셜 피드 카드 반응 = 박수(👏) 1버튼만**. 댓글·다중 이모지 없음
- **마을 둥지 카드 반응 = 콕찌르기(🪱 모이 보내기) 1버튼만** (불 꺼진 친구에게만)
- 박수와 모이는 다른 행위:
  - **박수** = 오늘 작성된 문장 카드에 대한 응원 (소셜 피드)
  - **모이** = 오늘 아직 읽지 않은 친구에게 푸시 알림 트리거 (마을)
- 모이는 친구당 하루 1회 제한 (남발 방지)

NPC 운영:

- 진짜 책에 NPC 진도 부여, 문장은 시드 풀에서 추첨
- pg_cron 매일 자정 진도 증가 + 시드 문장 1개 게시
- NPC별 시드 책 큐 5권 → 끝나면 자동 다음 책
- LLM 호출 없음 (비용·지연 0)

### H. 홈 도착 (Day 1 상태)

기본 탭 = **둥지**.

```
┌─────────────────────────────────────┐
│ 🐦 reading[Go]    🔥 1  ⚡ +10  Lv1  │ ← 상단 바
├─────────────────────────────────────┤
│ ┌──────────────────────────────┐    │
│ │ 🪵 기초공사       20%        │    │ ← 둥지 진화 배너
│ │ ▓▓░░░░░░  사피엔스 · 5/300p  │    │   (활성 책 표지 탭 → 활성 책 전환 시트)
│ └──────────────────────────────┘    │
├─────────────────────────────────────┤
│ ─── 나의 독서 로드맵 ───              │
│         ┌──┐                         │ ← The Path
│         │✓ │  5/13 p.5               │   (세션 단위 노드)
│         └──┘                         │
│                ┌──┐                  │
│                │🐦│  ← 현재(미션)    │
│                └──┘                  │
│              [오늘 기록하기]         │
│         ┌──┐                         │
│         │ ?│  ← ghost next           │
│         └──┘                         │
├─────────────────────────────────────┤
│ [ 둥지 ·  마을  ·  소셜  ·  내서재 ]   │ ← 하단 탭
└─────────────────────────────────────┘
```

상단 바: 로고 + 🔥 스트릭 / ⚡ XP / Lv N
하단 탭(4개): **둥지 / 마을 / 소셜 / 내서재**

각 탭:

- **둥지**: 활성 책의 The Path
- **마을**: 친구 + NPC 둥지 그리드, 불빛 ON/OFF, 모이 보내기
- **소셜**: 주간 리그 + 피드(박수)
- **내서재**: 책 목록, 책 상세, Export, 설정(닉네임·알림·로그아웃)

---

## 5. 화면 스펙 상세

### 5.1 둥지 탭 — The Path

| 요소 | 동작 |
|---|---|
| 상단 바 | 🐦 로고 / 🔥 스트릭 / ⚡ XP / Lv |
| 둥지 진화 배너 | 활성 책 진척률 % + 5단계 (§5.2) + 미니 진척 바 + 책 정보 |
| The Path | 세션 1건 = 노드 1개. 지그재그 4지점 배치, 점선 커넥터 |
| 캐릭터 | 참새. 현재(다음) 노드 자리에 위치, bounce |
| CTA | "오늘 기록하기" (미완료) / "오늘 완료! 🎉" (완료) |

**The Path 시각 명세**:

```
x 좌표 패턴(반복): 22%  →  50%  →  72%  →  50%
y 간격: 96px / 노드
노드 크기: 56×56 원
커넥터: 점선 (stroke #D7F0BF, width 5, dasharray "10 6")
완료 노드(node-done):    배경 #58CC02, 보더 #46A302, 그림자 0 4px 0 #46A302, 중앙 ✓
현재 노드(node-current): 배경 #fff, 보더 #58CC02, 외곽 ring rgba(88,204,2,0.2), 펄스 애니메이션
잠금/ghost(node-ghost):  배경 #E5E5E5, 보더 #d0d0d0, opacity 0.2, 중앙 ?
참새: 현재 노드 위 50px 자리에 bounce (1.4s ease-in-out infinite)
호버 툴팁(완료 노드): 그 세션 날짜(M/D) · 페이지(p.N) · 문장(line-clamp 2줄)
```

**노드의 단위**: 세션(reading_session) 1건 = 노드 1개. 챕터는 별도 개념(둥지 진화 배너에서 다룸).

**자동 스크롤**: 현재(또는 마지막) 노드가 보이도록 진입 시 `scrollIntoView({behavior:"smooth",block:"center"})`.

### 5.2 둥지 진화 (Dynamic Stage) — 5단계

활성 책 진척률(`current_page / total_pages * 100`)에 따라:

| 진척률 | 이모지 | 단계명 | 색상 | 배경색 |
|---|---|---|---|---|
| 0~20% | 🪵 | 기초공사 | #AFAFAF | #f3f4f6 |
| 21~50% | 🪹 | 포근한 둥지 | #F59E0B | #FEF3C7 |
| 51~80% | 🏠 | 튼튼한 나무집 | #58CC02 | #F0FDF4 |
| 81~99% | 🏡 | 고급 저택 | #1CB0F6 | #EFF6FF |
| 100% | 🏰 | 리딩 팰리스 | #CE82FF | #FAF5FF |

**완독 시(100%)**: §5.4 D-3에 별도 "완독 세리머니" 모달 (🏰 + 완독 배지 + Confetti).

### 5.3 활성 책 전환

여러 책을 동시에 읽을 수 있으나, **항상 한 권이 "활성 책"**.

- 활성 책 = 둥지 탭의 The Path가 그리는 책
- 둥지 진화 배너의 책 표지/제목 탭 → **활성 책 전환 시트** 슬라이드업
- 시트 내용: 내 책장의 책 목록(읽는 중만), 각 카드에 표지·제목·진척
- 카드 탭 → 활성 책 변경, 시트 닫힘, The Path 해당 책의 세션들로 재구성
- **각 책의 세션·진척·문장은 독립적으로 보존됨** (책 전환 시 데이터 초기화 금지)
- 데이터: `users.active_user_book_id` (§7.3)

### 5.4 일일 미션 — §4 D 참조

추가:
- 하루 1세션. 같은 날 재진입 시 "오늘은 이미 완료했어요" + 추가 문장 입력 옵션(서브 액션, 스트릭 영향 없음)
- 자정 직전(23:55+) 입력은 그 날짜로 카운트. UTC 15:00 배치가 다음 KST 자정에 정산

### 5.5 마을 탭 — 리딩 빌리지

친구+NPC 둥지를 그리드로 시각화.

```
┌─────────────────────────────────────┐
│ 🏘️ 리딩 빌리지                       │
│ 💡 불빛 ON = 오늘 읽음 · 🪱 모이 = 독려 │
├─────────────────────────────────────┤
│ ┌──────────┐  ┌──────────┐          │
│ │ 🏠 ✨    │  │ 🪹       │          │
│ │ @계휴    │  │ @승원    │          │   ← 친구 둥지 카드
│ │ "..."    │  │          │          │     (2열 그리드)
│ │ [읽는중] │  │ [🪱 모이] │          │
│ └──────────┘  └──────────┘          │
│ ┌──────────┐  ┌──────────┐          │
│ │ 🏰 ✨    │  │ 🪵       │          │
│ │ @지수    │  │ @민준    │          │
│ │ "..."    │  │          │          │
│ │ [읽는중] │  │ [🪱 모이] │          │
│ └──────────┘  └──────────┘          │
└─────────────────────────────────────┘
```

| 요소 | 규칙 |
|---|---|
| 둥지 아이콘 | 친구의 활성 책 진척 단계의 이모지 (§5.2) |
| 불빛 (✨) | 해당 친구가 오늘 세션 완료했으면 노란 ping. 미완료면 회색 + grayscale |
| 닉네임 | `@handle` |
| 인용 1줄 | 오늘 작성한 문장 (없으면 미표시) |
| 액션 | 불빛 ON: "읽는 중" 배지 / 불빛 OFF: `🪱 모이 보내기` 버튼 |

**모이 보내기**:
- 친구당 하루 1회 (`claps` 테이블과 별도 `pokes(from_user_id, to_user_id, day)` 테이블)
- 누르면 친구에게 푸시 알림. 본인 버튼은 "전송됨 ✓" 3초 표시 후 비활성
- NPC에게는 모이 못 보냄 (또는 NPC는 항상 자정 이후 곧 불빛 ON되니 자연스럽게 불가)

### 5.6 소셜 탭

```
┌─────────────────────────────────────┐
│ 👥 소셜                              │
├─────────────────────────────────────┤
│ ┌──────────────────────────────┐    │
│ │ 🏆 이번 주 리그              │    │   ← 주간 리그(§6.5)
│ │ 🥇 @계휴      420 XP         │    │
│ │ 🥈 @지수      380 XP         │    │
│ │ 🥉 @리리      240 XP  ←본인  │    │
│ │  4 @승원      180 XP         │    │
│ └──────────────────────────────┘    │
├─────────────────────────────────────┤
│ ┌──────────────────────────────┐    │
│ │ 🐦 @계휴 · 어린왕자 · 2시간 전│    │
│ │ "별은 아름답다, 모래들이..."  │    │   ← 피드 카드
│ │ [👏 3]                       │    │
│ └──────────────────────────────┘    │
└─────────────────────────────────────┘
```

| 섹션 | 규칙 |
|---|---|
| 주간 리그 | 본인 + 팔로우 친구 + NPC 중 상위 N명. 본인 row 강조(배경 #F0FDF4) |
| 피드 | 팔로잉 유저의 오늘 문장 카드 시간순 역정렬. NPC도 포함 |
| 박수 | 카드 우하단 버튼. 1회 토글. 누적 카운트 표시. 본인 카드는 박수 비활성 |
| 시간 표기 | "방금" / "N시간 전" / "어제" / "M/D" (절대 시점) |
| 비공개 모드 | `sentences.is_private=true`인 카드는 소셜·마을 모두 노출 안 함 |
| 빈 상태 | "아직 친구가 없어요. NPC와 함께 시작해보세요 🐦" |

### 5.7 내서재 탭

```
┌─────────────────────────────────────┐
│ 📚 내 서재         [⚙️ 설정]          │
├─────────────────────────────────────┤
│ ┌──────────────────────────────┐    │
│ │ 📖 현재 읽는 중              │    │
│ │ 사피엔스 · 5/300p            │    │
│ └──────────────────────────────┘    │
├─────────────────────────────────────┤
│ [검색창]                             │   ← 책장 내 검색
│                                      │
│ ┌──────────────────────────────┐    │
│ │ 📖 어린왕자 · 72/160p · 진행중│    │
│ └──────────────────────────────┘    │
│ ┌──────────────────────────────┐    │
│ │ 📗 데미안 · 228/228p · 완독  │    │
│ └──────────────────────────────┘    │
│ [+ 책 추가하기]                      │
└─────────────────────────────────────┘
```

- 책 카드 탭 → **책 상세** 화면
- "현재 읽는 중" 카드 탭 → §5.3 활성 책 전환 시트
- ⚙️ 설정 → 닉네임 변경, 알림 시간, 로그아웃

**책 상세 / Export**:
- 표지·제목·저자·진척 바
- 오늘의 문장 타임라인 (날짜 desc, 페이지 / 문장)
- Export 버튼 → Markdown 다운로드
  - 포맷:
    ```
    # {책 제목} — {저자}

    ## YYYY-MM-DD (p.{page})
    > {문장}
    ```
- 책 삭제: 길게 누름 → 확인 모달. 누적 기록은 보존 (soft delete)

### 5.8 닉네임 규칙 — §4 E-1 참조

서버 검증 (Phase 1+):

```
정규식: ^[a-z0-9가-힣_]{2,16}$
금칙어: LDNOOBW (https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words)
        + docs/readinggo/data/banned_ko.txt (한국어 큐레이션)
중복: users.handle UNIQUE 인덱스
변경: 무제한, 횟수 제한 없음
```

---

## 6. 시스템 로직

### 6.1 스트릭

| 항목 | 규칙 |
|---|---|
| 갱신 조건 | "오늘의 문장" 1개 이상 + 페이지 입력 1회 (= ReadingSession 1행 생성) |
| 갱신 시점 | 입력 즉시 `streak.current += 1`, `last_check_in_date = today` |
| 미참여 정산 | pg_cron (UTC 15:00 = KST 00:00) |
| 활성 책 무관 | 어느 책에 기록하든 1세션 = 스트릭 +1 (책별 스트릭 아님, 사용자 단위) |

### 6.2 방패 (Shield)

| 항목 | 규칙 |
|---|---|
| 초기 보유 | 0개 |
| 최초 지급 | 첫 7일 연속 스트릭 달성 시 +1 |
| 보충 규칙 | 방패 1개 소모 후 7일 뒤 +1 |
| 최대 보유 | 3개 |
| 자동 적용 | 미참여 → 방패 1개 소모, 스트릭 유지. 0개면 스트릭 0 리셋 |
| 결제 구매 | Phase 2 이후 검토 |

배치(pg_cron, UTC 15:00):

```sql
select cron.schedule(
  'streak-shield-daily',
  '0 15 * * *',
  $$
    update streak
    set
      shields_remaining = case when shields_remaining > 0 then shields_remaining - 1 else 0 end,
      current = case when shields_remaining > 0 then current else 0 end
    where last_check_in_date < current_date - interval '1 day';

    update streak s
    set shields_remaining = least(s.shields_remaining + 1, 3)
    from shield_log l
    where l.user_id = s.user_id
      and l.consumed_at <= now() - interval '7 days'
      and l.refunded = false;

    update shield_log set refunded = true
    where consumed_at <= now() - interval '7 days' and refunded = false;

    update streak
    set shields_remaining = least(shields_remaining + 1, 3),
        first_shield_granted = true
    where current >= 7 and first_shield_granted = false;
  $$
);
```

### 6.3 XP / 배지

| 행동 | XP |
|---|---|
| 일일 미션 완료 | +10 |
| 챕터 완료 (해당 시) | +50 |
| 책 완독 | +200 |
| 박수 받음 (일일 +20 상한) | +5 |
| 7일 스트릭 | +100 + 배지 |
| 30일 스트릭 | +500 + 배지 |

레벨 계산: `level = floor(sqrt(xp / 100)) + 1` (Phase 1 시점 재조정 가능).

### 6.4 NPC 운영 — pg_cron 배치

`npc_sentence_seeds(npc_id, text)` NPC별 60~100개 시드.

배치(매일 KST 00:00, streak 배치와 묶음):

```sql
-- NPC 진도 증가
update user_books ub
set current_page = least(current_page + u.daily_pace, b.total_pages)
from users u, books b
where ub.user_id = u.id and ub.book_id = b.id and u.is_npc = true;

-- 시드 문장 추첨 후 sentences insert
insert into sentences (user_id, user_book_id, text, page, created_at)
select u.id, ub.id,
       (select text from npc_sentence_seeds s where s.npc_id = u.id order by random() limit 1),
       ub.current_page, now()
from users u join user_books ub on ub.user_id = u.id
where u.is_npc = true;

-- NPC 랜덤 박수 (오늘 활동한 실유저 일부)
insert into claps (from_user_id, to_session_id)
select npc.id, s.id
from users npc, reading_sessions s
where npc.is_npc = true and s.session_date = current_date and s.user_id <> npc.id
order by random()
limit 5;
```

NPC 페르소나:

| 핸들 | 표시명 | daily_pace | 시드 책 큐 | 톤 |
|---|---|---|---|---|
| `@book_bear` | 책읽는곰돌이 | 5p | 사피엔스, 데미안, 어린왕자, … | 따뜻함, 짧은 감상 |
| `@activist_raccoon` | 활자라쿤 | 12p | 1984, 총균쇠, 코스모스, … | 분석적, 인용 위주 |

### 6.5 주간 리그

| 항목 | 규칙 |
|---|---|
| 집계 단위 | 본인 + 팔로잉 + NPC |
| 점수 | 그 주(월~일) XP 누적 |
| 리셋 | 매주 월 00:00 KST (pg_cron) — 표시는 시작 시점부터 0 |
| 표시 | 소셜 탭 상단 카드. 상위 N명(N=10) + 본인은 항상 강조 표시 |
| 배지 | 🥇🥈🥉 1~3위, 4위 이하 숫자. 본인 row 배경 #F0FDF4 |

집계 쿼리 예시:

```sql
select u.id, u.handle, u.display_name,
       coalesce(sum(rs.xp_earned), 0) as week_xp
from users u
left join reading_sessions rs
  on rs.user_id = u.id
  and rs.session_date >= date_trunc('week', current_date)
where u.id in (
    select following_id from follows where follower_id = $me
  ) or u.id = $me or u.is_npc = true
group by u.id
order by week_xp desc
limit 10;
```

---

## 7. 백엔드 스펙

### 7.1 플랫폼

**Supabase** (Phase 1+). Auth + PostgreSQL + Storage + pg_cron.

| 역할 | 컴포넌트 |
|---|---|
| 인증 | Supabase Auth (Google OAuth) |
| DB | PostgreSQL + RLS |
| 표지 | Storage 또는 외부 URL (`books.cover_url`) |
| 배치 | pg_cron (UTC 15:00 일일, 월 00:00 주간) |
| 풀텍스트 보조 | `pg_trgm` extension |

### 7.2 인증

Supabase Auth Google Provider. Phase 0은 가짜 세션 localStorage.

### 7.3 데이터 모델 (관계형)

```
users
  id                    uuid PK
  handle                text UNIQUE
  display_name          text
  avatar_url            text
  timezone              text                 -- "Asia/Seoul"
  is_npc                bool DEFAULT false
  daily_pace            int  NULL            -- NPC 전용
  active_user_book_id   uuid NULL FK user_books.id   -- 현재 활성 책
  settings              jsonb DEFAULT '{}'   -- 알림 시간, 비공개 모드 등
  xp                    int  DEFAULT 0
  created_at            timestamptz

books
  id            uuid PK
  isbn13        text UNIQUE
  title         text
  author        text
  publisher     text
  total_pages   int
  cover_url     text
  rank_recent   int  NULL
  rank_steady   int  NULL
  created_at    timestamptz

chapters
  id            uuid PK
  book_id       uuid FK books.id
  title         text
  start_page    int
  end_page      int
  chapter_order int

user_books
  id            uuid PK
  user_id       uuid FK users.id
  book_id       uuid FK books.id
  status        text                 -- 'reading' | 'completed' | 'archived'
  current_page  int  DEFAULT 0
  started_at    timestamptz
  completed_at  timestamptz NULL
  UNIQUE(user_id, book_id)

reading_sessions
  id               uuid PK
  user_book_id     uuid FK user_books.id
  user_id          uuid                 -- 비정규화
  session_date     date
  current_page     int
  pages_read_today int
  xp_earned        int
  created_at       timestamptz
  UNIQUE(user_book_id, session_date)

sentences
  id            uuid PK
  user_id       uuid FK users.id
  user_book_id  uuid FK user_books.id
  session_id    uuid FK reading_sessions.id NULL
  page          int
  text          text                 -- 200자 이내 (클라이언트 검증)
  is_private    bool DEFAULT false
  created_at    timestamptz

streak
  user_id              uuid PK FK users.id
  current              int  DEFAULT 0
  longest              int  DEFAULT 0
  last_check_in_date   date
  shields_remaining    int  DEFAULT 0
  first_shield_granted bool DEFAULT false

shield_log
  id           uuid PK
  user_id      uuid FK users.id
  consumed_at  timestamptz
  refunded     bool DEFAULT false

follows
  follower_id   uuid FK users.id
  following_id  uuid FK users.id
  created_at    timestamptz
  PRIMARY KEY (follower_id, following_id)

claps
  id              uuid PK
  from_user_id    uuid FK users.id
  to_session_id   uuid FK reading_sessions.id
  created_at      timestamptz
  UNIQUE(from_user_id, to_session_id)

pokes
  id              uuid PK
  from_user_id    uuid FK users.id
  to_user_id      uuid FK users.id
  day             date                 -- 일자별 1회 제한
  created_at      timestamptz
  UNIQUE(from_user_id, to_user_id, day)

npc_sentence_seeds
  id        uuid PK
  npc_id    uuid FK users.id (where is_npc=true)
  text      text
  weight    int DEFAULT 1
```

JSONB 사용:
- `users.settings` — `{"reminder_hour": 21, "private_mode": false}`
- 그 외 관계형 컬럼. JSON 남발 금지.

### 7.4 인덱스

```
follows(follower_id), follows(following_id)
sentences(user_id, created_at desc), sentences(user_book_id, created_at)
reading_sessions(user_id, session_date desc)
reading_sessions(user_id, session_date) where session_date >= date_trunc('week', current_date)  -- 리그 쿼리 보조
books(rank_recent), books(rank_steady)
pokes(to_user_id, day)
users using gin (handle gin_trgm_ops)
books using gin (title gin_trgm_ops)
```

### 7.5 RLS 정책 (요약)

- `users`: 본인 row update. 다른 유저 select 가능 (피드용 공개 정보)
- `sentences`: `is_private=true`면 본인만 select. 그 외 모두 select. insert는 본인만
- `reading_sessions`, `streak`, `user_books`: insert/update 본인. select 모두
- `follows`: follower_id가 본인인 행만 insert/delete
- `claps`: from_user_id가 본인인 행만 insert
- `pokes`: from_user_id가 본인인 행만 insert. to_user_id가 본인이면 select (수신 확인용)

### 7.6 닉네임 RPC

```
POST /rpc/check_handle  { handle }
→ { ok: true } | { ok: false, reason: 'taken' | 'format' | 'banned' }
```

### 7.7 가입 전 데이터 동기화

Phase 1: 클라이언트는 가입 전 입력을 localStorage 보관:

```json
{
  "pending_book":     { "isbn13": "...", "title": "...", "total_pages": 300, "current_page": 5 },
  "pending_sentence": { "text": "...", "page": 5 }
}
```

OAuth 콜백 직후 동기화 → localStorage 비움:

1. `books` upsert by ISBN
2. `user_books` insert (status=reading, current_page) → `user_books.id` 받음
3. `users.active_user_book_id` = 위 id
4. `reading_sessions` insert (당일)
5. `sentences` insert
6. `streak` 초기화 (current=1, last_check_in_date=today)

### 7.8 다중 책 / 활성 책 전환

- `user_books` 다수 행 보유 가능 (status='reading' 여러 권)
- `users.active_user_book_id`가 현재 활성 책 가리킴 (NULL 가능: 책 없을 때)
- 활성 책 전환 = `users.active_user_book_id` UPDATE만으로 끝
- The Path 쿼리: `reading_sessions where user_book_id = users.active_user_book_id order by session_date asc`
- **각 책의 진척·세션·문장은 `user_book_id` 단위로 분리 저장되므로 책 전환 시 데이터 손실 없음**

Phase 0 (localStorage):

```json
{
  "user_books": [
    { "id": "uuid", "book": { ... }, "current_page": 72, "sessions": [...], "sentences": [...] },
    { "id": "uuid", "book": { ... }, "current_page": 5,  "sessions": [...], "sentences": [...] }
  ],
  "active_user_book_id": "uuid"
}
```

---

## 8. 미결 → 확정 사항

| 이슈 | 결정 |
|---|---|
| "오늘의 문장" 강제/선택 | 강제 |
| 페이지 입력 UI | `[−1]` `[+1]` `[+10]` + 숫자 직접 입력 |
| 오늘의 문장 글자 수 | 최대 200자, TEXT |
| 사전 질문 | 전부 제거 |
| 초기 방패 | 0개. 첫 7일 +1. 사용 후 7일 보충. 최대 3 |
| 챕터 미정의 책 | 페이지 20%씩 5단계 (둥지 진화) |
| 피드 카드 반응 | 박수(👏) 1버튼만 |
| 마을 둥지 카드 반응 | 콕찌르기(🪱 모이) 1버튼, 친구당 일 1회 |
| NPC 운영 | pg_cron + 시드 풀, LLM 없음 |
| NPC 핸들 | `@book_bear`, `@activist_raccoon` |
| 닉네임 변경 | 무제한 |
| 닉네임 규칙 | `^[a-z0-9가-힣_]{2,16}$` + 중복 X + 금칙어 |
| 알림 디폴트 | 21:00, 22:00 이후 설정 차단, 23:00 긴급 |
| 알라딘 API | Phase 0/1 미사용. 정적 파일 |
| 책 검색 | 클라이언트 fuzzy (Fuse.js + 자모 분해) |
| 노드의 단위 | 세션 1건 = 노드 1개 |
| 하단 탭 구성 | 둥지 / 마을 / 소셜 / 내서재 (4탭) |
| 주간 리그 | Phase 1부터. 본인+팔로잉+NPC, 주간 XP, 월요일 00:00 KST 리셋 |
| 다중 책 진도 | `user_books` 단위 독립 저장. `users.active_user_book_id`로 활성 책 지정 |
| 활성 책 전환 UI | 둥지 탭 진화 배너 탭 → 슬라이드업 시트 |
| DB | 관계형 + `users.settings` JSONB |
| Phase 분리 | 0 데모 / 1 Supabase 웹 / 2 Android+FCM |

---

## 9. Phase 0 데모 시나리오 (#58, 2026-05-16)

3분 클릭 시연. 데이터는 localStorage + 정적 TSV.

| 시간 | 화면 | 동작 |
|---|---|---|
| 0:00 | A 진입 | 슬로건, `시작하기` |
| 0:15 | C-1 검색 | "사피" 입력 → 사피엔스 fuzzy 매칭 |
| 0:30 | C-2 확인 | 표지 확인, 현재 페이지 0 |
| 0:45 | D-1 페이지 | `[+10]` → 10p |
| 1:00 | D-2 문장 | "역사는 픽션이 만든 질서다" |
| 1:15 | D-3 세리머니 | Confetti, 보상 카드 3그리드 |
| 1:30 | E 가입 | Google 로그인 시뮬레이션 |
| 1:45 | H 둥지 | 둥지 진화 배너 + The Path 노드 1개 |
| 2:00 | 마을 탭 | 친구 둥지 4개. 1개는 불 꺼짐 → 🪱 모이 보내기 |
| 2:15 | 소셜 탭 | 리그 표시 + `@book_bear` 카드 👏 |
| 2:30 | 내서재 | 책 추가, 두 번째 책 등록 후 활성 책 전환 시연 (둥지 진척 다른지 확인) |
| 2:45 | "미참여 시뮬" 토글 | 방패 0 → 스트릭 리셋 화면 |
| 3:00 | 마무리 | 슬로건 |

---

## 10. 오픈 태스크

| # | 항목 | Phase |
|---|---|---|
| 1 | `docs/readinggo/index.html` Phase 0 데모 (이 스펙대로) | 0 |
| 2 | 책 100권 데이터 cover_url 보강 + TSV 정리 | 0 |
| 3 | NPC 시드 문장 2명 × 60개 작성 | 0 |
| 4 | 디자인 토큰 적용 (§11) | 0 |
| 5 | Supabase 프로젝트 셋업, 7.3 스키마 마이그레이션 | 1 |
| 6 | Google OAuth 연동 | 1 |
| 7 | pg_cron 스트릭/방패/NPC/리그 배치 | 1 |
| 8 | Chrome Notification 알림 | 1 |
| 9 | 닉네임 RPC + 금칙어 사전 | 1 |
| 10 | 주간 리그 쿼리·캐시 | 1 |
| 11 | Android APK 빌드 스택 결정 | 2 |
| 12 | FCM 푸시 | 2 |

---

## 11. 디자인 토큰

폰트: **Nunito** (Google Fonts). 가중치 400/600/700/800/900.

색상 (Duolingo 톤):

```
duo.green   #58CC02   메인 액션
duo.dgreen  #46A302   그린 3D 그림자
duo.xgreen  #89E219   그린 강조
duo.yellow  #FFC800   하이라이트, 모이 알림
duo.blue    #1CB0F6   XP, 정보
duo.dblue   #1899D6   블루 3D 그림자
duo.red     #FF4B4B   경고, 에러
duo.orange  #FF9600   스트릭(🔥)
duo.purple  #CE82FF   레벨, 팰리스
duo.navy    #1F1F1F   본문
duo.gray    #AFAFAF   서브 텍스트
duo.light   #F7F7F7   배경
duo.border  #E5E5E5   보더, 비활성
```

3D 버튼:
```
.btn-green  { background:#58CC02; color:#fff; box-shadow:0 4px 0 #46A302; border-radius:16px; padding:14px 24px; font-weight:800; }
.btn-white  { background:#fff;    color:#58CC02; box-shadow:0 4px 0 #E5E5E5; border:2px solid #E5E5E5; }
.btn-yellow { background:#FFC800; color:#fff;    box-shadow:0 4px 0 #E6A800; }
:active     { transform:translateY(3px); box-shadow:none; }
```

애니메이션:
```
bounce    1.4s ease-in-out infinite (참새)
slideUp   0.3s ease (바텀 시트)
popIn     0.4s cubic-bezier(0.34,1.56,0.64,1) (보상 모달)
confetti  1.0~2.0s ease-in (세리머니)
ping      1.2s ease-out infinite (마을 불빛)
```

참새 SVG: `Sparrow` 컴포넌트(앵글, 색상 #C49A4A 본체 + #8B6234 날개 + #E8D5A3 배). 윤지 PR #86의 자산 재사용.

---

## 12. 빈 상태 / 마이크로카피

| 위치 | 카피 |
|---|---|
| 마을 게시판 빈 상태 | "첫 글을 남겨보세요 ✍️" |
| 소셜 피드 빈 상태 | "아직 친구가 없어요. NPC와 함께 시작해보세요 🐦" |
| 책장 빈 상태 | "첫 책을 등록해보세요 📚" |
| 책 상세 문장 없음 | "오늘의 문장을 첫 페이지에 남겨보세요" |
| 검색 결과 0건 | "찾으시는 책이 없나요? 직접 등록할 수 있어요" |
| 미션 완료 후 재진입 | "오늘은 이미 완료했어요 🎉 내일 만나요" |
| 방패 0 + 스트릭 리셋 | "괜찮아요. 오늘부터 다시 1일차예요 🌱" |

---

*v4.1 · 2026-05-14 · 윤지 데모 인사이트 통합 (마을·리그·The Path 시각·다중 책 활성화·디자인 토큰)*
