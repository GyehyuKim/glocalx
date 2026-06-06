-- 15_add_nest_emoji.sql
-- users 테이블에 둥지 이모지 컬럼 추가 (마을 멤버 탭 표시용)
-- 적용: Supabase Dashboard > SQL Editor 에서 실행 (또는 admin-cli.mjs)
alter table public.users add column if not exists nest_emoji text not null default '🪺';
