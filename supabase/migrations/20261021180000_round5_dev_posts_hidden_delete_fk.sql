-- ============================================================
-- FieldOrtho round 5: developer posts hidden, user delete never blocked
-- Project: whwpkcdpahhaxexxmbwq. Authored 10.21.2026.
-- ============================================================
-- 1. Posts written by the app developer (users.is_developer) are hidden from
--    everyone but developers, server side, the same way 20261018230000 hid
--    their comments and likes. RESTRICTIVE, so it only ever removes rows.
-- 2. chat_members.added_by was the one reference to public.users with no
--    ON DELETE rule, so deleting anyone who had added a chat member failed.
--    It is nullable and only records who did the adding, so SET NULL: the
--    other person's membership stays.
--
-- No existing row changes.
-- ============================================================

set local lock_timeout = '5s';

-- ------------------------------------------------------------
-- 1. Developer posts
-- ------------------------------------------------------------
drop policy if exists "Hide app developer rows" on public.posts;
create policy "Hide app developer rows" on public.posts
  as restrictive for select to public
  using (
    user_id = (select auth.uid())
    or not (user_id = any (coalesce((select private.developer_user_ids()), '{}'::uuid[])))
    or coalesce((select auth.uid()) = any (coalesce((select private.developer_user_ids()), '{}'::uuid[])), false)
  );

-- ------------------------------------------------------------
-- 2. chat_members.added_by: NO ACTION -> SET NULL
-- ------------------------------------------------------------
alter table public.chat_members
  drop constraint if exists chat_members_added_by_fkey;
alter table public.chat_members
  add constraint chat_members_added_by_fkey
  foreign key (added_by) references public.users(id) on delete set null;
