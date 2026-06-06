-- 14_fix_village_rls_recursion.sql
-- =====================================================================
-- 문제: village_members SELECT 정책(vmembers_sel)이 village_members를
--       재귀 조회 → "infinite recursion detected in policy" 오류.
--
-- 원인:
--   create policy vmembers_sel on public.village_members for select using (
--     ...
--     or exists (select 1 from public.village_members m2  -- 자기 참조!
--       where m2.village_id = village_id and m2.user_id = auth.uid())
--   );
--
-- 해결: SECURITY DEFINER 함수 is_village_member()가 RLS를 우회하므로
--       순환 참조 없이 멤버십 확인 가능.
--       villages_sel / vparts_sel 도 동일 패턴으로 교체해 잠재 순환 차단.
-- =====================================================================

-- ── 1. SECURITY DEFINER 헬퍼 함수 ──────────────────────────────────────
-- auth.uid() 는 session-level setting 으로 SECURITY DEFINER 안에서도 작동.
create or replace function public.is_village_member(p_village_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.village_members
    where village_id = p_village_id
      and user_id = auth.uid()
  );
$$;

-- ── 2. village_members SELECT 정책 — 자기참조 제거 ─────────────────────
drop policy if exists vmembers_sel on public.village_members;
create policy vmembers_sel on public.village_members for select using (
  user_id = auth.uid()                                                       -- 내 행
  or public.is_village_member(village_id)                                    -- 같은 마을 멤버
  or exists (                                                                 -- 공개 마을
    select 1 from public.villages v
    where v.id = village_id and v.visibility = 'public'
  )
);

-- ── 3. villages SELECT 정책 — 동일 패턴 교체 ───────────────────────────
drop policy if exists villages_sel on public.villages;
create policy villages_sel on public.villages for select using (
  visibility = 'public'
  or created_by = auth.uid()
  or public.is_village_member(id)
);

-- ── 4. village_parts SELECT 정책 — 동일 패턴 교체 ──────────────────────
drop policy if exists vparts_sel on public.village_parts;
create policy vparts_sel on public.village_parts for select using (
  exists (
    select 1 from public.villages v
    where v.id = village_id
      and (
        v.visibility = 'public'
        or v.created_by = auth.uid()
        or public.is_village_member(v.id)
      )
  )
);
