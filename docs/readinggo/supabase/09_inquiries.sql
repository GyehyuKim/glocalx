-- 09_inquiries.sql
-- 문의(inquiry) 테이블 — 설정에서 운영자(admin)에게 문의. admin 대시보드에서 확인.
-- LLM 자동 처리는 Phase 2(Gemini 프록시)로 확장 — 지금은 저장+조회만.
-- 적용: node docs/readinggo/supabase/admin-cli.mjs sql 09_inquiries.sql

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  email       text,
  message     text not null,
  status      text not null default 'open',   -- open | answered | closed
  created_at  timestamptz not null default now()
);

create index if not exists idx_inquiries_created on public.inquiries(created_at desc);

alter table public.inquiries enable row level security;

-- insert: 로그인 사용자 본인 문의만 (user_id = auth.uid())
drop policy if exists inq_ins on public.inquiries;
create policy inq_ins on public.inquiries for insert with check (user_id = auth.uid());

-- select: 작성자 본인 + 운영자(is_admin). update: 운영자만(상태 변경)
drop policy if exists inq_sel on public.inquiries;
create policy inq_sel on public.inquiries for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists inq_upd on public.inquiries;
create policy inq_upd on public.inquiries for update using (public.is_admin()) with check (public.is_admin());

-- 길이 제약 (재실행 안전, not valid)
alter table public.inquiries drop constraint if exists inquiries_msg_len;
alter table public.inquiries add  constraint inquiries_msg_len
  check (char_length(message) between 1 and 2000) not valid;
