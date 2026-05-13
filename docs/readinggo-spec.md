# ReadingGo Spec v4

> 기준일: 2026-05-14
> 상태: **백엔드 고려 MVP 스펙** — Phase 0(웹 데모) / Phase 1(웹 풀스택) / Phase 2(앱 + 푸시) 구분
> 작성 원칙: 이 문서만으로 시스템 구현이 가능해야 한다. 외부 문서 참조 없이 자기충족적.
> 입력 문서(아카이브): `docs/readinggo-discussion.md`, `docs/협동-기반-독서-루틴-조사.md`, `Reading_GO_Service_Planning_v1.pdf`

---

## 0. 한 줄

> 독서습관 앱계의 듀오링고.

---

## 1. 제품 약속

| 사용자가 얻는 것 | 제품이 책임지는 것 |
|---|---|
| 하루 1페이지 이상 읽는 습관 형성 | 듀오링고 수준의 지속성 엔진 (스트릭·방패·복귀) |
| 읽은 책의 핵심을 손에 남긴다 | "오늘의 문장" 누적 → 책 한 권의 엑기스 → Markdown export |
| 혼자가 아니라 같이 읽는다 | 단방향 팔로우 피드, 박수, NPC 동행 |

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
[책 등록]
   ↓
[앱 밖에서 읽기 — 하루 1페이지 이상이면 충분]
   ↓
[일일 미션: 현재 페이지 입력 + 오늘의 문장 입력(둘 다 강제)]
   ↓
[스트릭 갱신 → XP 보상 → 참새 한 칸 hop]
   ↓
[친구 피드 노출 → 박수(짝짝짝)]
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
| **Phase 0** | 2026-05-16 Peer Review 데모 | `docs/readinggo/index.html` 클릭 프로토타입 | **없음** | `localStorage` + 정적 TSV/CSV (`docs/readinggo/data/`) |
| **Phase 1** | MVP (웹) | 풀스택 웹앱 | **Supabase** (Auth + Postgres + pg_cron) | Postgres + Storage |
| **Phase 2** | 최종 발표 (학기말) | **Android APK** | Supabase + FCM | Postgres + 로컬 캐시 |

### Phase 0 제약

- 외부 API 호출 없음 (알라딘 키 미사용). 책 데이터는 `docs/readinggo/data/books.tsv` 정적 로드.
- 인증 없음. 닉네임은 입력만 받아 localStorage에 저장.
- NPC 활동은 시드 데이터로 시뮬레이션 (배치 없이 미리 박힌 가짜 기록).
- 알림 없음 (브라우저 알림은 데모에선 토스트 시뮬레이션).

### Phase 1 신규

- Supabase Auth (Google OAuth), Postgres, RLS, pg_cron 스트릭 배치
- Chrome Notification API (웹 푸시 권한)
- 클라이언트 사이드 fuzzy 검색 (Fuse.js)
- NPC 일일 활동 pg_cron 배치
- 닉네임 중복 검증 (서버), 금칙어 (LDNOOBW + 한국어 추가)

### Phase 2 신규

- Android APK (스택 미정 — React Native / Flutter / Expo)
- FCM 푸시 알림 (네이티브)
- NPC 다인·확장된 일과
- 챕터 자동 인식 (알라딘 프리미엄 또는 수동 입력 UI)

---

## 4. 유저 시나리오 — 신규 가입 여정

각 단계는 화면 단위이며, **Phase 0 데모에서 모두 클릭으로 확인 가능해야 한다**.

### A. 진입 (비로그인)

- 한 페이지에 헤더 슬로건 ("하루 한 페이지, 한 문장에서 시작해요"), 중앙 CTA `시작하기`
- 슬라이드·튜토리얼 없음. Phase 2 앱 빌드 시 스플래시 로딩 동안만 철학 카피 노출
- CTA → **C** (책 등록)

### B. 사전 질문

**삭제.** 마찰을 만드는 모든 사전 질문 제거. 일일 목표 페이지 개념 없음. **1일 1페이지 1문장이 유일한 목표**.

### C. 첫 책 등록 (가입 전 가능)

**C-1. 검색 화면**

- 검색창: ISBN / 제목 / 저자 입력
- 검색 동작: 클라이언트 사이드 fuzzy 매칭 (`docs/readinggo/data/books.tsv` 위에서). Phase 1+는 동일 fuzzy를 서버 보조
  - 한글: 자모 분해 라이브러리(`es-hangul`) 후 부분 일치
  - 영문: Fuse.js (Levenshtein 거리)
  - 오타·외국어 작가명 약한 일치 허용
- 결과 카드: 표지 / 제목 / 저자 / 총 페이지
- 검색어 비어있을 때 **하단 추천**:
  - 탭 1: 요즘 Top 10 (`books.tsv`에서 `rank_recent` 컬럼 ASC 10권)
  - 탭 2: 스테디 Top 10 (`rank_steady` ASC 10권)
- 결과 없을 시 카드: "직접 등록" → C-2(직접 입력 모드)

**C-2. 확인 / 직접 등록**

- 검색 결과 선택 → 표지 크게 / 제목·저자·총페이지 표시
- "현재 어디까지 읽었어요?" 입력 (기본 0)
- 총 페이지: API 값 prefill, 수정 가능
- 직접 등록 모드: 제목 / 저자 / 총 페이지만 입력 (표지는 플레이스홀더)
- CTA `이 책으로 시작` → **D**

### D. 첫 기록 (가입 전 try — sticky moment)

**D-1. 페이지 입력**

- 화면 중앙에 큰 숫자: 현재까지 도달한 페이지 (기본 = 등록 시 입력값)
- 좌우 버튼: `[−1]` `[+1]`, 추가 `[+10]`
- 숫자 영역 탭 → 직접 입력 모달 (숫자 키패드)
- 검증: 0 ≤ 입력 ≤ 책 총 페이지, 입력 ≥ 직전 기록
- 다음 버튼 → D-2

**D-2. 오늘의 문장 입력 (필수)**

- 텍스트 영역, placeholder: "마음에 든 한 줄을 적어주세요 (최대 200자)"
- 최소 1자 최대 200자. 빈 입력 시 다음 버튼 비활성화
- 자동 임시 저장 (localStorage `pending_sentence`)
- 다음 버튼 → D-3

**D-3. 세리머니 (성공 화면)**

- "+10 XP · 🔥 1일차 · 첫 발자국을 찍었어요!"
- 참새 hop 애니메이션, 책 표지 옆 진척 바 증가
- CTA `계속하려면 로그인` → **E**

D-1, D-2 입력 모두 완료해야 D-3 진입 (= "오늘 읽기 완료").

### E. 가입

- 카피: "하루 한 페이지, 한 문장에서 시작해요. 계속 이어가려면 로그인하세요."
- 단일 버튼: `Google로 계속`
- OAuth 성공 후:
  - localStorage에 임시 저장된 (책, 페이지, 문장, 닉네임 시드) → Supabase로 동기화
  - 닉네임 미입력 시 다음 화면(E-1)
  - 친구 추가 화면은 **표시하지 않음**. 가입 직후 바로 **H** (홈)

**E-1. 닉네임 설정** (이미 가입 시점에 입력했으면 스킵)

- 입력 필드: 핸들 형식 `@nickname`
- 규칙 표시 (입력 필드 하단 항상 노출):
  - 영소문자 / 숫자 / 한글 / 언더스코어
  - 2자 이상 16자 이하
  - 다른 사용자가 사용 중인 닉네임은 사용 불가
  - 부적절한 단어 사용 불가
- 입력 동안 디바운스 300ms 후 `/api/check-handle` 호출 (Phase 1+). Phase 0은 localStorage 안의 NPC 핸들과만 중복 비교
- 실패 시 어떤 규칙 위반인지 명시: "사용할 수 없는 문자가 포함되어 있어요", "이미 사용 중이에요" 등
- 변경: 가입 후 언제든 변경 가능 (횟수 제한 없음)

### F. 알림 권한 요청

**진입 트리거**: 첫 기록(D-3) 완료 후 다음 진입 시점. **가입 직후가 아니라 성공 직후에 묻는다** (수락률 ↑).

- Phase 0: 토스트로 시뮬레이션만 ("알림 받으시려면 앱 버전을 기다려주세요")
- Phase 1: `Notification.requestPermission()` 호출. 거절 시 설정 화면에서 재시도 가능
- Phase 2: 네이티브 푸시 권한 표준 플로우

**알림 정책**:

| 항목 | 정책 |
|---|---|
| 디폴트 시간 | 21:00 (사용자 로컬 타임존) |
| 사용자 변경 | 가능. 단 22:00 이후로는 설정 불가 (저녁 알림 정책) |
| 알림 문구 (일반) | "🌱 오늘의 한 페이지, 한 문장 어때요?" |
| 긴급 알림 | 미참여 + 23:00 도달 시. "🛡 오늘 한 문장만! {N}일 연속 기록이 사라지려 해요 🥺" |

알림 시간 변경: 설정 → 알림 → 슬라이더 또는 시간 입력. 22:00 이후 입력은 검증 차단.

### G. 친구 / NPC (홈 진입 후 별도)

가입 직후 자동:

- NPC 2명 자동 팔로우: **`@book_bear` (책읽는곰돌이)** / **`@activist_raccoon` (활자라쿤)**
- NPC는 일반 유저와 UI 상 동일하게 보임 (`users.is_npc` 컬럼은 백엔드 내부에만)

상호작용 규칙:

- **반응 = 박수(👏)만**. 다른 이모지·축하·댓글 없음
- 박수: 1-탭 토글. 누적 카운트만 표시
- NPC도 매일 일부 유저 세션에 무작위로 박수 (배치)

NPC 운영:

- 진짜 책(우리 100권 중 일부)에 NPC 진도 부여, 문장은 시드 풀에서 추첨
- pg_cron으로 매일 자정 진도 증가 + 시드 문장 1개 게시
- 시드 책 큐: NPC별 5권 정도 등록 → 끝나면 자동 다음 책으로 이동
- LLM 호출 없음 (비용·지연 0)

### H. 홈 도착 (Day 1 상태)

레이아웃:

```
┌─────────────────────────────────────┐
│ 🔥 1   💎 +10 XP   🛡 0/3            │ ← 상단 바
├─────────────────────────────────────┤
│ [오늘 미션 완료 ✓]                   │ ← 카드 1
│ 어제 5p → 오늘 5p · "오늘의 문장"  │
├─────────────────────────────────────┤
│ [책 표지] 사피엔스                  │ ← 카드 2
│ ▓▓░░░░░░░░░  20% (Dynamic Stage 1) │
├─────────────────────────────────────┤
│ 친구 피드                           │
│ @book_bear: "..." 👏 3              │ ← 카드 3
│ @activist_raccoon: "..." 👏 1       │
└─────────────────────────────────────┘
[ 둥지 · 책장 · 친구 · 나 ]            ← 하단 탭
```

각 탭:

- **둥지** (홈): 위 레이아웃
- **책장**: 내가 등록한 책 목록. 책 탭하면 §5.6 책 상세
- **친구**: 팔로잉 리스트 + 핸들 검색
- **나**: 닉네임, 알림 설정, Export, 로그아웃

---

## 5. 화면 스펙 상세

### 5.1 둥지 탭 — The Path

| 요소 | 동작 |
|---|---|
| 상단 바 | 🔥 Streak / 💎 XP / 🛡 방패 (보유/최대) |
| The Path | 챕터(또는 페이지 20% 단위) 노드를 구불구불 길에 배치. 완료/현재/잠금 |
| 캐릭터 | 참새. 현재 노드에 위치 |
| CTA | "오늘의 미션 시작" (이미 했으면 "내일 만나요") |

상태:
- 완료 노드: 색 채워짐
- 현재 노드: 펄스 + 미니 프로그레스 바
- 잠금 노드: 회색 + 자물쇠

### 5.2 Dynamic Stage 계산

```
챕터 정보가 있는 책:
  스테이지 = 챕터 단위. 현재 챕터 내 페이지 진척 = 미니 바

챕터 정보가 없는 책:
  스테이지 = 책 총 페이지를 5등분 (20%씩).
  단계명: 0~20% 기초공사 / 21~50% 오두막 / 51~80% 집 / 81~99% 저택 / 100% 팰리스
```

### 5.3 책 등록 — §4 C 참조

추가 규칙:
- 동시에 진행 중인 책 수 제한 없음 (MVP)
- 책 삭제: 책장에서 길게 누름 → 확인 모달. 누적 기록은 보존 (soft delete)

### 5.4 일일 미션 — §4 D 참조

추가 규칙:
- 하루 1세션. 같은 날 다시 진입 시 "오늘은 이미 완료했어요" + 추가 문장 입력 옵션(서브 액션, 스트릭 영향 없음)
- 자정 직전(23:55+) 입력은 그 날짜로 카운트. UTC 15:00 배치가 다음 KST 자정에 정산

### 5.5 친구 피드

- 피드: 팔로잉한 유저(+NPC)의 오늘 문장 카드 시간순 역정렬
- 박수 버튼: 카드 우하단. 한 번 누르면 토글. 누적 표시 ("👏 3")
- 비공개 모드: 내 문장을 본인만 보기. `sentences.is_private` BOOL

### 5.6 책 상세 / Export

- 책 표지·제목·진척
- 오늘의 문장 타임라인 (날짜·페이지·문장)
- Export 버튼 → Markdown 다운로드
  - 포맷:
    ```
    # {책 제목} — {저자}

    ## YYYY-MM-DD (p.{page})
    > {문장}
    ```

### 5.7 닉네임 규칙 — §4 E-1 참조

서버 검증 (Phase 1+):

```
정규식: ^[a-z0-9가-힣_]{2,16}$
금칙어: LDNOOBW (https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words)
        + 한국어 욕설 사전 (별도 큐레이션, docs/readinggo/data/banned_ko.txt)
중복: users.handle UNIQUE 인덱스
```

---

## 6. 시스템 로직

### 6.1 스트릭

| 항목 | 규칙 |
|---|---|
| 갱신 조건 | "오늘의 문장" 1개 이상 + 페이지 입력 1회 (= ReadingSession 1행 생성) |
| 갱신 시점 | 입력 즉시 `streak.current += 1`, `last_check_in_date = today` |
| 미참여 정산 | pg_cron (UTC 15:00 = KST 00:00) |

### 6.2 방패 (Shield) — Sticky 방어

| 항목 | 규칙 |
|---|---|
| 초기 보유 | **0개** |
| 최초 지급 | 첫 7일 연속 스트릭 달성 시 +1 |
| 보충 규칙 | 방패 1개 소모 후 **7일 뒤 +1** (사용 시점 + 7일) |
| 최대 보유 | 3개 |
| 자동 적용 | 미참여일 발생 시 방패 1개 소모하고 스트릭 유지. 0개면 스트릭 0으로 리셋 |
| 결제 구매 | Phase 2 이후 검토 |

배치(pg_cron, UTC 15:00):

```sql
select cron.schedule(
  'streak-shield-daily',
  '0 15 * * *',
  $$
    -- 어제 세션 없는 유저의 방패 소모 또는 스트릭 리셋
    update streak
    set
      shields_remaining = case
        when shields_remaining > 0 then shields_remaining - 1
        else 0
      end,
      current = case
        when shields_remaining > 0 then current
        else 0
      end
    where last_check_in_date < current_date - interval '1 day';

    -- 방패 사용 후 7일 경과 시 자동 +1 (최대 3)
    update streak s
    set shields_remaining = least(s.shields_remaining + 1, 3)
    from shield_log l
    where l.user_id = s.user_id
      and l.consumed_at <= now() - interval '7 days'
      and l.refunded = false;

    update shield_log set refunded = true
    where consumed_at <= now() - interval '7 days' and refunded = false;

    -- 첫 7일 스트릭 달성자에 +1 (단 1회)
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
| 박수 받음 (일일 상한 +20) | +5 |
| 7일 스트릭 | +100 + 배지 |
| 30일 스트릭 | +500 + 배지 |

XP 수치는 Phase 1 종료 시점에 재조정.

### 6.4 NPC 운영 — pg_cron 배치

`npc_sentence_seeds(npc_id, text)`에 NPC별 60~100개 문장 시드.

배치(매일 KST 00:00, streak 배치와 동일 스케줄에 묶음):

```sql
-- NPC 진도 증가
update user_books ub
set current_page = least(current_page + u.daily_pace, b.total_pages)
from users u, books b
where ub.user_id = u.id and ub.book_id = b.id and u.is_npc = true;

-- 시드 문장 추첨 후 sentences insert
insert into sentences (user_id, user_book_id, text, page, created_at)
select u.id, ub.id,
       (select text from npc_sentence_seeds s
         where s.npc_id = u.id order by random() limit 1),
       ub.current_page, now()
from users u join user_books ub on ub.user_id = u.id
where u.is_npc = true;

-- NPC 랜덤 박수 (오늘 활동한 실유저 일부에게)
insert into claps (from_user_id, to_session_id)
select npc.id, s.id
from users npc, reading_sessions s
where npc.is_npc = true
  and s.session_date = current_date
  and s.user_id <> npc.id
order by random()
limit 5;
```

NPC 페르소나:

| 핸들 | 표시명 | daily_pace | 시드 책 큐 | 톤 |
|---|---|---|---|---|
| `@book_bear` | 책읽는곰돌이 | 5p | 사피엔스, 데미안, 어린왕자, … | 따뜻함, 짧은 감상 |
| `@activist_raccoon` | 활자라쿤 | 12p | 1984, 총균쇠, 코스모스, … | 분석적, 인용 위주 |

---

## 7. 백엔드 스펙

### 7.1 플랫폼

**Supabase** (Phase 1+). Auth + PostgreSQL + Storage + pg_cron.

| 역할 | 컴포넌트 |
|---|---|
| 인증 | Supabase Auth (Google OAuth) |
| DB | PostgreSQL + RLS |
| 표지 | Storage (선택) 또는 외부 URL 직접 (`books.cover_url`) |
| 배치 | pg_cron (UTC 15:00 일일) |
| 풀텍스트 보조 | `pg_trgm` extension (퍼지 검색 보조) |

### 7.2 인증

Supabase Auth Google Provider. Phase 0은 인증 없음(가짜 세션 localStorage).

### 7.3 데이터 모델 (관계형)

```
users
  id            uuid PK
  handle        text UNIQUE          -- 닉네임, ^[a-z0-9가-힣_]{2,16}$
  display_name  text
  avatar_url    text
  timezone      text                 -- "Asia/Seoul" 등
  is_npc        bool DEFAULT false
  daily_pace    int  NULL            -- NPC 전용. 실유저는 NULL
  settings      jsonb DEFAULT '{}'   -- 알림 시간, 비공개 모드 등
  xp            int  DEFAULT 0
  created_at    timestamptz

books
  id            uuid PK
  isbn13        text UNIQUE
  title         text
  author        text
  publisher     text
  total_pages   int
  cover_url     text
  rank_recent   int  NULL            -- 요즘 Top
  rank_steady   int  NULL            -- 스테디 Top
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
  status        text                 -- 'reading' | 'completed'
  current_page  int  DEFAULT 0
  started_at    timestamptz
  completed_at  timestamptz NULL
  UNIQUE(user_id, book_id)

reading_sessions
  id               uuid PK
  user_book_id     uuid FK user_books.id
  user_id          uuid                 -- 비정규화 (피드 쿼리 성능)
  session_date     date
  current_page     int
  pages_read_today int                  -- 비정규화
  xp_earned        int
  created_at       timestamptz
  UNIQUE(user_book_id, session_date)

sentences
  id            uuid PK
  user_id       uuid FK users.id
  user_book_id  uuid FK user_books.id
  session_id    uuid FK reading_sessions.id NULL
  page          int
  text          text                 -- 200자 이내, 클라이언트 검증
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
  refunded     bool DEFAULT false   -- 7일 경과 후 보충 처리 완료

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

npc_sentence_seeds
  id        uuid PK
  npc_id    uuid FK users.id (where is_npc=true)
  text      text
  weight    int DEFAULT 1            -- 추첨 가중치 (선택)
```

JSONB 사용 원칙:
- `users.settings` — `{"reminder_hour": 21, "private_mode": false}` 등 자주 추가되는 환경 설정
- 그 외는 관계형 컬럼으로 명시. JSON 남발 금지.

### 7.4 인덱스

```
follows(follower_id), follows(following_id)
sentences(user_id, created_at desc), sentences(user_book_id, created_at)
reading_sessions(user_id, session_date desc)
books(rank_recent), books(rank_steady)
users using gin (handle gin_trgm_ops)        -- 닉네임 검색 보조
books using gin (title gin_trgm_ops)         -- 책 제목 fuzzy 보조
```

### 7.5 RLS 정책 (요약)

- `users`: 본인 row update 가능. 다른 유저 row select 가능 (피드용 공개 정보).
- `sentences`: `is_private=true`면 본인만 select. 그 외 모두 select. insert는 본인만.
- `reading_sessions`, `streak`, `user_books`: insert/update는 본인만. select는 모두 (피드).
- `follows`: 본인이 follower_id인 행만 insert/delete.
- `claps`: from_user_id가 본인인 행만 insert.

### 7.6 닉네임 중복 / 금칙어 (서버)

```
POST /rpc/check_handle  { handle }
→ { ok: true } | { ok: false, reason: 'taken' | 'format' | 'banned' }
```

Edge Function 또는 PostgREST RPC.

### 7.7 가입 전 데이터 동기화

Phase 1: 클라이언트는 가입 전 입력을 `localStorage`에 보관:

```json
{
  "pending_book": { "isbn13": "...", "title": "...", "total_pages": 300, "current_page": 5 },
  "pending_sentence": { "text": "...", "page": 5 }
}
```

OAuth 콜백 성공 직후 다음 순서로 동기화 → localStorage 비움:

1. `books` upsert by ISBN
2. `user_books` insert (status=reading, current_page)
3. `reading_sessions` insert (당일)
4. `sentences` insert
5. `streak` 초기화 (current=1, last_check_in_date=today)

---

## 8. 미결 → 확정 사항 (이 스펙에서 결정)

| 이슈 | 결정 |
|---|---|
| "오늘의 문장" 강제/선택 | **강제** |
| 페이지 입력 UI | `[−1]` `[+1]` `[+10]` + 숫자 직접 입력 모달 |
| 오늘의 문장 글자 수 | 최대 200자, TEXT 컬럼 |
| 사전 질문 (목표 페이지·동기 등) | **전부 제거** |
| 초기 방패 | 0개. 첫 7일 스트릭 시 +1. 소모 후 7일 보충. 최대 3 |
| 챕터 미정의 책 | 페이지 20%씩 5단계 Dynamic Stage |
| 친구 반응 | 박수(👏) 1버튼만. 댓글·이모지 없음 |
| NPC 운영 | pg_cron + 시드 풀. LLM 없음 |
| NPC 핸들 | `@book_bear`, `@activist_raccoon` |
| 닉네임 변경 | 무제한 (언제든 변경 가능) |
| 닉네임 규칙 | `^[a-z0-9가-힣_]{2,16}$` + 중복 X + 금칙어(LDNOOBW + ko 사전) |
| 알림 디폴트 | 21:00, 22:00 이후 설정 불가, 23:00 긴급 알림 |
| 알라딘 API | Phase 0/1 미사용. 표지·메타는 정적 파일에서 미리 수집 |
| 책 검색 | 클라이언트 fuzzy (Fuse.js + 한글 자모 분해) |
| DB 모델 | 관계형 기본 + `users.settings` JSONB |
| Phase 분리 | 0 = HTML 데모 / 1 = Supabase 웹 / 2 = Android APK + FCM |

---

## 9. Phase 0 데모 시나리오 (#58, 2026-05-16)

3분 클릭 시연. 데이터는 localStorage + 정적 TSV.

| 시간 | 화면 | 동작 |
|---|---|---|
| 0:00 | A 진입 | 슬로건 노출, `시작하기` 클릭 |
| 0:15 | C-1 검색 | "사피"라고 일부만 입력 → 사피엔스 검색됨(fuzzy) |
| 0:30 | C-2 확인 | 표지 확인, 현재 페이지 0 입력 |
| 0:45 | D-1 페이지 | `[+10]` 한 번 → 10p |
| 1:00 | D-2 문장 | "역사는 픽션이 만든 질서다" 입력 |
| 1:15 | D-3 세리머니 | +10 XP, 🔥 1일차, 참새 hop |
| 1:30 | E 가입 | Google 로그인 시뮬레이션 |
| 1:45 | H 홈 | NPC 2명 피드 카드 2장 표시 |
| 2:00 | 피드 | `@book_bear` 카드에 👏 |
| 2:15 | 책장 → 책 상세 | 오늘 입력한 문장 1줄 + Export 버튼 |
| 2:30 | "미참여 시뮬" 토글 | 방패 0 상태에서는 스트릭 리셋 화면 데모 |
| 2:45 | 마무리 | 슬로건 다시 노출 |

---

## 10. 오픈 태스크

| # | 항목 | Phase |
|---|---|---|
| 1 | `docs/readinggo/index.html` Phase 0 데모 구현 (이 스펙대로) | 0 |
| 2 | 책 100권 데이터 cover_url 보강 + TSV 정리 | 0 |
| 3 | NPC 시드 문장 2명 × 60개 작성 | 0 |
| 4 | 디자인 토큰 (색·타이포) — 듀오링고/투두메이트 톤 | 0 |
| 5 | Supabase 프로젝트 셋업, 7.3 스키마 마이그레이션 | 1 |
| 6 | Google OAuth 연동 | 1 |
| 7 | pg_cron 스트릭/방패/NPC 배치 (§6.2, §6.4) | 1 |
| 8 | Chrome Notification 알림 | 1 |
| 9 | 닉네임 검증 RPC + 금칙어 사전 (`banned_ko.txt`) | 1 |
| 10 | Android APK 빌드 스택 결정 | 2 |
| 11 | FCM 푸시 | 2 |

---

*v4 · 2026-05-14 · Phase 분리, 시나리오·데이터모델·정책 자기충족 작성*
