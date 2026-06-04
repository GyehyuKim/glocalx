-- 07_sentence_1000.sql
-- 한 문장 인용 길이 제한 200자 → 1000자 확장 (사용자 요청: 감상이 1000자인데 본문 200자는 짜다)
-- 적용: node docs/readinggo/supabase/admin-cli.mjs sql 07_sentence_1000.sql
-- 04_constraints.sql sentences_text_len(1~200) 대체

alter table public.sentences drop constraint if exists sentences_text_len;
alter table public.sentences add  constraint sentences_text_len
  check (char_length(text) between 1 and 1000) not valid;

-- 끝. 클라(config.js RG_VALIDATE.sentence)도 1000자로 동기화됨.
