-- 34_co_reading_rooms.sql
-- 같이읽기(방) P1 — co-reading.md §6.1. 기존 마을 스키마(villages/village_members)를
-- 그대로 재사용하고 컬럼 2개만 더한다. 새 테이블·새 RLS 신설 없음(병렬 rooms 테이블 금지).
--   - password     : 비공개 방 선택적 비밀번호(§5.2). nullable.
--   - invite_token : 모든 방의 토큰 URL 입장(§5.2). unique. 추측 불가 랜덤(22+자, 어댑터 생성).
-- 적용: Supabase Dashboard > SQL Editor 또는 Management API. (read-only 검사는 migrations_applied.py)
--
-- RLS 메모: 기존 정책(villages_sel: public OR 생성자 OR is_village_member; vmembers_sel/_mod)을
--           그대로 쓴다. password/invite_token 은 단순 컬럼이라 RLS 변경 불필요 —
--           입장 검증(정원·비밀번호)은 어댑터·미리보기 단계, 멤버 insert 가 곧 접근권 부여(§6.3).

-- ── villages: 비밀번호(선택) + 토큰 URL 초대 ───────────────────────────
-- NOTE(#996): 구 평문 `password text` 컬럼은 35_room_password_hash.sql 이 bcrypt
--   해시(password_hash)로 격상하며 제거(drop)했다. 따라서 여기서 더 이상 추가하지 않는다
--   (이미 적용된 프로덕션엔 컬럼이 있었고 #35 가 변환 후 drop · 신규 DB 는 #35 가 해시 컬럼 생성).
--   migrations_applied.py 가 제거된 컬럼을 "기대"하지 않도록 이 줄을 주석으로 남긴다.
alter table public.villages add column if not exists invite_token  text unique;

-- 토큰 URL 입장(findByToken) 직접 조회용 인덱스 — unique 제약이 인덱스를 만들지만
-- 명시적으로 두어 의도를 드러낸다(부분 인덱스: 토큰 있는 방만).
create index if not exists idx_villages_invite_token
  on public.villages (invite_token) where invite_token is not null;
