# QA REST 레시피 — 인증 쓰기 경로 직접 검증

브라우저/사용자 콘솔 없이 **실제 인증 JWT로 Supabase 쓰기·읽기 경로를 직접 재현**하는 방법.

## 왜 필요한가

헤드리스 QA(`/qa`, browse)로는 이 앱의 인증 플로우를 못 돈다:

- 인브라우저 React + Babel(CDN) JSX 데모라 헤드리스 구동이 불안정 (`datastore-supabase.js:9` 주석 참조)
- 로그인이 Google OAuth + 이메일 매직링크라 자동화가 막힘

그래서 "로그인 상태에서만 나는 버그"(예: [#822] 책 등록·진도 저장 실패)를 검증할 때
**publishable key + 비번 로그인으로 토큰을 받아 REST(`/rest/v1`)를 직접 때리는 것**이 가장 빠르고 결정적이다.
RLS·스키마·FK·트리거·임베드 조인이 서버에서 정상인지 vs 클라이언트 문제인지 즉시 가른다.

## 고정 QA 계정 (재사용 — 킵)

매번 새로 만들지 말고 이 계정을 재사용한다. `mailer_autoconfirm: true`라 이메일 확인 불필요.

| 항목 | 값 |
|---|---|
| email | `rg-qa-bot@example.com` |
| password | `ReadingGoQA!2026` |
| user_id | `9511c25d-2f85-4569-9ad9-0877dc2ce234` |

> ⚠️ 운영 데이터 아님. 보안 민감도 낮음(publishable key는 `config.js`에 이미 공개, RLS로 보호).
> 이 계정은 일반 사용자 권한(authenticated)이라 admin 작업은 불가.

## 레시피 (한 번에 복붙)

```bash
SUPA="https://cttllwwkaddghqttyhkg.supabase.co"
KEY="sb_publishable_R-f42NFOGq3dxqMlootNlQ_Us4AdUd-"
QA_EMAIL="rg-qa-bot@example.com"
QA_PW="ReadingGoQA!2026"

# 1) 비번 로그인 → access_token (1시간 유효)
LOGIN=$(curl -s "$SUPA/auth/v1/token?grant_type=password" -H "apikey: $KEY" \
  -H "Content-Type: application/json" -d "{\"email\":\"$QA_EMAIL\",\"password\":\"$QA_PW\"}")
TOKEN=$(printf '%s' "$LOGIN" | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
QAID=$(printf '%s' "$LOGIN" | python -c "import sys,json;print(json.load(sys.stdin)['user']['id'])")
AUTH=(-H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")

# 2) 읽기 — 내 책 목록(클라 myBooks.list 와 동일 쿼리)
curl -s "$SUPA/rest/v1/user_books?user_id=eq.$QAID&select=*,book:books(*)&order=started_at.desc" "${AUTH[@]}"

# 3) 쓰기 — 책 등록(코스모스). books.upsert → user_books.insert
BOOKID="536d3dae-422d-42bc-bab4-2e8ce6dfca82"   # 코스모스 (9788937463358)
curl -s -w "\nHTTP %{http_code}\n" -X POST "$SUPA/rest/v1/user_books?select=id,status" "${AUTH[@]}" \
  -H "Prefer: return=representation" \
  -d "{\"user_id\":\"$QAID\",\"book_id\":\"$BOOKID\",\"status\":\"reading\",\"current_page\":0}"

# 4) 정리 — 방금 만든 내 user_books 행 삭제(RLS: 본인 행만 가능)
curl -s -X DELETE "$SUPA/rest/v1/user_books?user_id=eq.$QAID&book_id=eq.$BOOKID" "${AUTH[@]}"
```

## 결과 해석

- `HTTP 200/201` → 백엔드 정상. 버그는 **클라이언트**(세션 미부착·id 매칭 등)에 있다.
- `HTTP 401` `PGRST301 "JWT ... failed"` / `"Empty JWT is sent"` → 토큰 무효/만료. 클라 세션 hydration 문제 재현.
- `HTTP 400/403` `42501` / `new row violates row-level security` → **RLS 정책** 문제(서버).
- `HTTP 409` → `on_conflict` 충돌.
- `23503` → FK 위반(book_id/user_id).

## 주의

- 토큰은 1시간 만료 → 다시 1) 실행해 갱신.
- example.com 메일은 실제 발송 안 되지만 autoconfirm이라 무관.
- 검증 후 만든 `user_books`/`sentences` 행은 4)처럼 본인 토큰으로 정리(누적 방지).
- 과거 throwaway 계정(`rg-debug-822-*@example.com`)이 Auth에 남아 있으면 대시보드에서 purge 가능(선택).

[#822]: https://github.com/GyehyuKim/glocalx/issues/822
