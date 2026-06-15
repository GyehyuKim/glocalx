-- 27_extinct_thought.sql
-- #596: '내 생각'(thought) 종류 폐기 — 기존 thought 한 문장을 quote 로 일괄 전환.
-- 코드에서 thought 생성·설정 경로는 전부 제거(책장/CompanionModal 토글, #420 휴리스틱),
-- DataStore.add 는 quote 고정. 본 마이그레이션으로 잔존 데이터까지 정리.
-- 적용: admin-cli.mjs sql 27_extinct_thought.sql (또는 Supabase SQL Editor)
-- 비고: sentences.kind 컬럼은 유지(롤백 안전·표시 분기 무해). 향후 quote 단일.

update public.sentences set kind = 'quote' where kind = 'thought';
