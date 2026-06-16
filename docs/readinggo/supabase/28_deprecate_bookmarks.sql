-- 28_deprecate_bookmarks.sql
-- #641: 짹 + 책갈피(sentence_bookmarks) → 단일 "좋아요"(claps) 수렴.
--   책갈피는 폐기(deprecate)하고 저장 use-case 는 '좋아요한 문장 모아보기'(claps.list)가 대체한다.
--   자기 문장 좋아요(저장)를 허용하므로(feed.md §5.7) 기존 책갈피를 전량 claps 로 백필할 수 있다.
-- 적용: admin-cli.mjs sql 28_deprecate_bookmarks.sql (또는 Supabase SQL Editor)
-- 비고: sentence_bookmarks 테이블·데이터는 롤백 안전상 보존(DROP 하지 않음). 신규 쓰기는 코드에서 제거됨.
--       claps 의 UNIQUE(from_user_id, to_sentence_id) 로 재실행해도 중복 없이 idempotent.

-- 기존 책갈피 → 좋아요(claps) 백필. 이미 좋아요한 문장은 충돌 무시.
insert into public.claps (from_user_id, to_sentence_id)
select user_id, sentence_id
from public.sentence_bookmarks
on conflict (from_user_id, to_sentence_id) do nothing;

-- 폐기 표시(문서화용 코멘트). 테이블은 보존하되 신규 쓰기 없음.
comment on table public.sentence_bookmarks is
  'DEPRECATED (#641, 2026-06-16): claps(좋아요)로 흡수. 신규 쓰기 없음, 롤백 안전상 보존.';
