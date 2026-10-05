/*
One safety form per framer, not per site

  submissions index         -> one active form per framer per site per day
  site_submission_status()  -> dropped. It told a framer who had already filed
                               the site's shared form; there is no shared form
                               now. A framer checks for their own form by
                               reading public.submissions, which RLS allows.
  set_submission_flag()     -> same behaviour, unflag error reworded
  sites_without_submission() -> unchanged: active sites where no framer filed
                               a valid form
*/

/*
One ACTIVE form per framer per site per day. A framer submitting twice for the
same site and day gets a unique violation, which the app shows as "you've
already filled in today's form for this site".
A flagged (incorrect) form is excluded, so once a framer flags a mistake they
can file the replacement.
*/
create unique index submissions_one_active_per_worker_site_day
on public.submissions (worker_id, site_id, work_date)
where not flagged_incorrect;

drop index public.submissions_one_active_per_site_day;

drop function public.site_submission_status(uuid, date);

/*
Flagging a submission as incorrect
SECURITY DEFINER lets it bypass the same-day UPDATE policy; the WHERE clause
re-implements the ownership check so it can't be used on others' rows.

One-way for framers: a framer can flag their own form but never unflag it
*/
create or replace function public.set_submission_flag(
p_submission_id uuid,
p_flagged boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_admin boolean := public.is_admin();
begin
  if not p_flagged and not v_is_admin then
    raise exception 'Only an admin can unflag a submission'
      using errcode = '42501';
  end if;

  update public.submissions
  set flagged_incorrect = p_flagged
  where id = p_submission_id
    and (
      v_is_admin
      or (worker_id = (select auth.uid()) and public.is_active_user())
    );

  if not found then
    raise exception 'Submission not found or not yours'
      using errcode = '42501'; -- insufficient_privilege
  end if;
exception
  when unique_violation then
    raise exception 'This framer has already filed a replacement form for this site and day'
      using errcode = '23505';
end;
$$;

revoke execute on function public.set_submission_flag(uuid,
boolean) from public,
anon;
grant  execute on function public.set_submission_flag(uuid,
boolean) to authenticated;
