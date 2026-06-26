-- 35_room_password_hash.sql
-- 숲(방) 비밀번호 해시화 + 서버측 검증 — co-reading.md §6.4 / #996 (P1 평문 후속).
--
-- 문제(이전 상태, 34_co_reading_rooms.sql):
--   villages.password 가 평문(plaintext) text 컬럼이었고, 입장 검증을 클라이언트(어댑터
--   datastore-supabase.js rooms.join)가 `select password` 로 평문을 받아 JS 에서 비교했다.
--   villages_sel RLS 는 공개 방을 누구나 select 하게 하므로 password 가 그대로 노출됐다.
--
-- 해결(이 마이그레이션):
--   1) pgcrypto 의 crypt()+gen_salt('bf')(bcrypt)로 해시 저장 — 새 컬럼 password_hash.
--   2) 해시 컬럼은 클라이언트가 절대 읽지 못하도록 REVOKE SELECT (anon·authenticated).
--      = 검증은 SECURITY DEFINER RPC 가 서버에서만 수행, 해시는 select 표면에 안 나온다.
--   3) RPC 2개(둘 다 SECURITY DEFINER, search_path 고정):
--        - room_set_password(room_id, password) : host(created_by=auth.uid())만. 해시 저장/해제.
--        - room_verify_password(room_id, password) : boolean 만 반환(해시 비노출).
--   4) 기존 평문 password 는 password_hash 로 1회 마이그레이션 후 평문 컬럼 제거(drop).
--
-- 적용: Supabase Dashboard > SQL Editor 또는 Management API 로 **수동 1회 실행**.
--       (Supabase 마이그레이션은 자동 적용되지 않는다 — 코드 머지 ≠ DB 적용.
--        migrations_applied.py 는 컬럼·테이블만 검사하므로 RPC/REVOKE 는 수동 확인 필요.)
-- 재실행 안전(idempotent): if not exists / create or replace / 조건부 update.

-- ── pgcrypto (crypt·gen_salt) ────────────────────────────────────────
create extension if not exists pgcrypto;

-- ── villages: 해시 컬럼 + 비번여부 플래그 추가 ───────────────────────
-- password_hash : 클라 read 차단(아래 REVOKE) — 비밀.
-- has_password  : "이 방이 비번을 걸었나" 만 알려주는 비-비밀 boolean. 미리보기에서 입력칸 노출
--                 여부 판단용(해시 자체는 안 줘도 입력 프롬프트는 띄워야 하므로). 클라 read 허용.
alter table public.villages add column if not exists password_hash text;
alter table public.villages add column if not exists has_password  boolean not null default false;

-- ── 기존 평문 → bcrypt 해시 1회 마이그레이션 (평문 컬럼이 아직 있을 때만) ──
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'villages' and column_name = 'password'
  ) then
    update public.villages
       set password_hash = crypt(password, gen_salt('bf')),
           has_password  = true
     where password is not null and password <> '' and password_hash is null;
    -- 평문 컬럼 제거(드리프트·노출원 차단). co-reading.md §6.1 도 password_hash 로 갱신됨.
    alter table public.villages drop column password;
  end if;
end$$;

-- ── 해시 컬럼 클라이언트 read 차단 ───────────────────────────────────
-- grant select on all tables(schema.sql)가 password_hash 까지 열어주므로 컬럼 단위로 회수한다.
-- 검증은 아래 RPC(SECURITY DEFINER)만 수행 — 클라이언트 select 표면엔 절대 안 나온다.
revoke select (password_hash) on public.villages from anon, authenticated;

-- ── RPC ① 비밀번호 설정/해제 — host 만 ───────────────────────────────
-- p_password 가 null/빈문자면 해제(NULL), 아니면 bcrypt 해시 저장.
-- 가드: created_by = auth.uid() 인 방만(=host). SECURITY DEFINER 라 RLS 우회하되 가드로 한정.
create or replace function public.room_set_password(p_room_id uuid, p_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select created_by into v_owner from public.villages where id = p_room_id;
  if v_owner is null then
    raise exception 'room not found';
  end if;
  if v_owner <> auth.uid() then
    raise exception 'only the room host can set the password';
  end if;
  update public.villages
     set password_hash = case
           when p_password is null or p_password = '' then null
           else crypt(p_password, gen_salt('bf'))
         end,
         has_password = (p_password is not null and p_password <> '')
   where id = p_room_id;
end;
$$;

-- ── RPC ② 비밀번호 검증 — boolean 만 ─────────────────────────────────
-- 비밀번호 없는 방은 항상 true(입장 자유). 있는 방은 crypt(input, stored)=stored 로 서버 비교.
-- 해시는 절대 반환하지 않는다(boolean 만). 누구나 호출 가능(입장 전 미리보기/조인).
create or replace function public.room_verify_password(p_room_id uuid, p_password text)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_hash text;
  v_exists boolean;
begin
  select (id is not null), password_hash into v_exists, v_hash
    from public.villages where id = p_room_id;
  if not coalesce(v_exists, false) then
    return false;                          -- 없는 방 = 검증 실패
  end if;
  if v_hash is null then
    return true;                          -- 비밀번호 미설정 = 입장 자유
  end if;
  return v_hash = crypt(coalesce(p_password, ''), v_hash);
end;
$$;

-- 실행 권한 — 로그인 사용자가 호출(검증은 누구나, 설정은 함수 내부 host 가드).
grant execute on function public.room_set_password(uuid, text)    to authenticated;
grant execute on function public.room_verify_password(uuid, text) to anon, authenticated;
