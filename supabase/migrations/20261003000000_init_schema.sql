/*
RAS Site Safety Forms — initial schema
Tables: profiles, sites, submissions, submission_photos

One safety form per site per day. Any framer on the site can be the one
who submits it.

Roles:
  framer -> submits a form for today during the work-day window
            (5am-5pm Pacific), edits own during that window, can flag own
            submissions as incorrect (one-way), can never delete
  admin  -> full control over submissions, photos, sites, and profiles
            (user accounts themselves are created by an admin; public
            sign-up is disabled)

Row Level Security (RLS) prevents a framer
from calling the Supabase API directly and touching someone else's data.

Function grants: Supabase grants EXECUTE on new public functions directly to
`anon` (logged-out callers), so revoking from PUBLIC alone is not enough.
Every function here revokes from both, and any NEW function needs the same:
  revoke execute on function public.<fn>(<args>) from public, anon;
*/

-- Roles
create type public.user_role as enum ('framer', 'admin');

/*
Profiles
Someone who leaves is deactivated (active = false), never deleted: their
submissions and name stay on record. Supabase Auth doesn't read this table,
so a deactivated user can still sign in; RLS gives them nothing beyond their
own profile row (so the app can show "your account has been deactivated").
Existing sessions are cut off immediately because every policy checks it.
*/
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null,
  role        public.user_role not null default 'framer',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Sites
create table public.sites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  address     text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

/*
Helper for today's date in Pacific time
"Today" must match the crews' calendar day, not the server's UTC day,
otherwise an evening edit or submission lands on the wrong date.
*/
create or replace function public.today_pacific()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Vancouver')::date;
$$;

revoke execute on function public.today_pacific() from public, anon;

/*
Helper for submissions on whether this work date is still open to its framer
Open only on the work date itself, between 5:00am and 5:00pm Pacific.
Framers submit and edit only inside this window.
The hours live here in one place so the window is easy to change later.
*/
create or replace function public.within_edit_window(p_work_date date)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_work_date = public.today_pacific()
     and (now() at time zone 'America/Vancouver')::time >= time '05:00'
     and (now() at time zone 'America/Vancouver')::time <  time '17:00';
$$;

revoke execute on function public.within_edit_window(date) from public, anon;

/*
Submissions: the daily safety form for a site
One form per site per day, filed by whichever framer gets to it first.
worker_id records who submitted it.

Checklist semantics: each item box means "there is an issue with this item",
plus one explicit "No issues" box. The framer MUST answer the checklist:
  "No issues" ticked, no item boxes ticked -> All clear
  "No issues" unticked, 1+ item boxes ticked -> Issues noted

Ticking nothing, or ticking "No issues" alongside an item, is rejected by
the submissions_checklist_answered constraint. That means an untouched form
can never be mistaken for an all-clear.

`notes` is always available for context (e.g. "rope on north scaffold is
frayed") but is optional.

`has_issues` is a GENERATED column: Postgres computes it from the checklist.

work_date is a DATE (the day the work happened). submitted_at and updated_at
are exact timestamps maintained by a trigger, not by the client.

flagged_incorrect: a framer's "this submission is wrong" toggle.
*/
create table public.submissions (
  id                          uuid primary key default gen_random_uuid(),
  worker_id                   uuid not null references public.profiles (id),
  site_id                     uuid not null references public.sites (id),
  work_date                   date not null,

  -- PPE issues
  hard_hat_issue              boolean not null default false,
  vest_issue                  boolean not null default false,
  boots_issue                 boolean not null default false,
  eye_protection_issue        boolean not null default false,

  -- Site issues
  fall_protection_issue       boolean not null default false,
  ladders_scaffolding_issue   boolean not null default false,
  tools_cords_issue           boolean not null default false,
  hazards_issue               boolean not null default false,

  -- Explicit all-clear
  no_issues                   boolean not null default false,

  notes                       text check (char_length(notes) <= 2000),

  has_issues                  boolean generated always as (
                                hard_hat_issue
                                or vest_issue
                                or boots_issue
                                or eye_protection_issue
                                or fall_protection_issue
                                or ladders_scaffolding_issue
                                or tools_cords_issue
                                or hazards_issue
                              ) stored,

  flagged_incorrect           boolean not null default false,
  flagged_at                  timestamptz,

  submitted_at                timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint submissions_checklist_answered check (
    no_issues <> (
      hard_hat_issue
      or vest_issue
      or boots_issue
      or eye_protection_issue
      or fall_protection_issue
      or ladders_scaffolding_issue
      or tools_cords_issue
      or hazards_issue
    )
  )
);

/*
One ACTIVE form per site per day, no matter who submits it. A second framer
trying to submit for the same site and day gets a unique violation, which
the app shows as "this site's form is already in for today".
A flagged (incorrect) form is excluded, so once the submitter flags a
mistake, anyone can file the replacement.
*/
create unique index submissions_one_active_per_site_day
  on public.submissions (site_id, work_date)
  where not flagged_incorrect;

-- Dashboard filters by site + date range and by worker + date range.
create index submissions_site_date_idx   on public.submissions (site_id, work_date);
create index submissions_worker_date_idx on public.submissions (worker_id, work_date);

/*
Timestamps are set by the database, never trusted from the client.
    insert: submitted_at = updated_at = now()
    update: submitted_at can't change, updated_at = now()
    flag toggled: flagged_at records when (cleared when unflagged)
*/
create or replace function public.submissions_set_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.submitted_at := now();
    new.updated_at   := now();
    new.flagged_at   := case when new.flagged_incorrect then now() else null end;
  else
    new.submitted_at := old.submitted_at;
    new.updated_at   := now();
    if new.flagged_incorrect is distinct from old.flagged_incorrect then
      new.flagged_at := case when new.flagged_incorrect then now() else null end;
    else
      new.flagged_at := old.flagged_at;
    end if;
  end if;
  return new;
end;
$$;

-- Trigger functions are never called directly by anyone.
revoke execute on function public.submissions_set_timestamps() from public, anon, authenticated;

create trigger submissions_set_timestamps
  before insert or update on public.submissions
  for each row execute function public.submissions_set_timestamps();

/*
submission_photos is the metadata for each uploaded photo
The image bytes live in Supabase Storage; this table stores where they are.
Path convention: {worker_id}/{submission_id}/{uuid}.jpg
*/
create table public.submission_photos (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references public.submissions (id) on delete cascade,
  storage_path   text not null unique,
  mime_type      text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes     integer not null check (size_bytes > 0 and size_bytes <= 10485760), -- 10 MB
  created_at     timestamptz not null default now()
);

create index submission_photos_submission_idx on public.submission_photos (submission_id);


/*
Helper for is the current user an (active) admin?
SECURITY DEFINER runs with the function owner's rights, so it can read
profiles without triggering profiles' own RLS policies

search_path = '' prevents search-path hijacking.
*/
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and active
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

-- Helper for is the current user's profile active? (see profiles)
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and active
  );
$$;

revoke execute on function public.is_active_user() from public, anon;
grant  execute on function public.is_active_user() to authenticated;

/*
Admin lockout guard
An admin can't deactivate or demote themselves, and nobody (including the
dashboard) can remove the last active admin.
*/
create or replace function public.profiles_guard_admins()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (old.role = 'admin' and old.active)
     and not (new.role = 'admin' and new.active) then

    if new.id = (select auth.uid()) then
      raise exception 'You can''t deactivate or demote your own account'
        using errcode = '42501';
    end if;

    if not exists (
      select 1 from public.profiles
      where id <> old.id and role = 'admin' and active
    ) then
      raise exception 'At least one active admin is required'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.profiles_guard_admins() from public, anon, authenticated;

create trigger profiles_guard_admins
  before update on public.profiles
  for each row execute function public.profiles_guard_admins();

/*
Auto-create a profile when an auth user is created.
Role is ALWAYS 'framer' here; we ignore any role a client might put in
metadata. Admins are promoted by updating profiles.
full_name falls back to the email in case the admin forgot to enter a name.
*/
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/*
Row Level Security with access is DENIED by default.
Policies for the same action are OR'd: a row is allowed if ANY policy allows
it.

The `anon` role gets no policies at all, so logged-out users see nothing.

Helpers are wrapped as (select public.is_admin()) so Postgres evaluates them
once per query (an InitPlan) instead of once for every row scanned.
*/
alter table public.profiles          enable row level security;
alter table public.sites             enable row level security;
alter table public.submissions       enable row level security;
alter table public.submission_photos enable row level security;

-- Framers see their own profile (even when deactivated); admins see everyone.
create policy "profiles: read own or admin reads all"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- Only admins change profiles.
create policy "profiles: admin updates"
  on public.profiles for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Every active user needs the site list for the form dropdown.
create policy "sites: active users read"
  on public.sites for select
  to authenticated
  using ((select public.is_active_user()));

-- Admins create, edit, and delete sites.
create policy "sites: admin full control"
  on public.sites for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Framers view only their own submissions; admins view all.
create policy "submissions: read own or admin reads all"
  on public.submissions for select
  to authenticated
  using (
    (worker_id = (select auth.uid()) and (select public.is_active_user()))
    or (select public.is_admin())
  );

-- Framers insert only as themselves, for an active site, for today, 5am-5pm.
create policy "submissions: framer inserts own"
  on public.submissions for insert
  to authenticated
  with check (
    worker_id = (select auth.uid())
    and (select public.is_active_user())
    and public.within_edit_window(work_date)
    and not flagged_incorrect
    and exists (
      select 1 from public.sites s
      where s.id = site_id and s.active
    )
  );

/*
Framers edit their own submission only during the work-day window
(including moving it to another active site if they picked the wrong one).
A flagged form is locked for its framer: it's been declared wrong, and this
also stops a framer from unflagging it with a direct UPDATE.
*/
create policy "submissions: framer edits own during work day"
  on public.submissions for update
  to authenticated
  using (
    worker_id = (select auth.uid())
    and (select public.is_active_user())
    and not flagged_incorrect
    and public.within_edit_window(work_date)
  )
  with check (
    worker_id = (select auth.uid())
    and public.within_edit_window(work_date)
    and exists (
      select 1 from public.sites s
      where s.id = site_id and s.active
    )
  );

/*
Admins can insert, edit, and delete any submission.
Deliberately NO framer delete policy: a safety record is never removed
Mistakes are flagged and replaced instead.
*/
create policy "submissions: admin full control"
  on public.submissions for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

/*
Flagging a submission as incorrect
SECURITY DEFINER lets it bypass the same-day UPDATE policy; the WHERE clause
re-implements the ownership check so it can't be used on others' rows.

One-way for framers: a framer can flag their own form but never unflag it,
since someone may already have filed the replacement. Admins can unflag; if
a replacement already exists that would leave two active forms, so it's
refused with a readable message instead of a raw unique-violation error.
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
    raise exception 'A replacement form has already been filed for this site and day'
      using errcode = '23505';
end;
$$;

revoke execute on function public.set_submission_flag(uuid, boolean) from public, anon;
grant  execute on function public.set_submission_flag(uuid, boolean) to authenticated;


/*
Pre-check: has this site's form already been submitted for this date?
Called when a framer picks a site and date, BEFORE they fill in the form,
so they see "Already submitted by Frank at 7:12am" instead of discovering it
when their submit fails.

Framers can't read other framers' submissions (RLS), so we use SECURITY
DEFINER to look past that, but it deliberately returns only:
  submitted_by -> the submitter's name
  submitted_at -> when
  is_own -> true if the caller submitted it
  submission_id -> only when is_own, so the app can link to "edit yours";
                   null for someone else's form

Never the checklist, notes, or photos. Returns no row if the site is clear,
or if the caller isn't an active user.
*/
create or replace function public.site_submission_status(
  p_site_id uuid,
  p_work_date date
)
returns table (
  submitted_by   text,
  submitted_at   timestamptz,
  is_own         boolean,
  submission_id  uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.full_name,
    s.submitted_at,
    s.worker_id = (select auth.uid()),
    case when s.worker_id = (select auth.uid()) then s.id end
  from public.submissions s
  join public.profiles p on p.id = s.worker_id
  where s.site_id = p_site_id
    and s.work_date = p_work_date
    and not s.flagged_incorrect
    and public.is_active_user();
$$;

revoke execute on function public.site_submission_status(uuid, date) from public, anon;
grant  execute on function public.site_submission_status(uuid, date) to authenticated;

-- You can see a photo row if you can see its parent submission.
create policy "photos: read if parent submission visible"
  on public.submission_photos for select
  to authenticated
  using (
    exists (
      select 1 from public.submissions s
      where s.id = submission_id
        and (
          (s.worker_id = (select auth.uid()) and (select public.is_active_user()))
          or (select public.is_admin())
        )
    )
  );

/*
Framers attach photos to their own submission while it's editable, OR
within 30 minutes of submitting it. The grace period covers the upload step
that runs right after the form is created, so a form submitted at 4:59pm
still gets its photos attached after the window closes.
*/
create policy "photos: framer adds to own editable submission"
  on public.submission_photos for insert
  to authenticated
  with check (
    storage_path like (select auth.uid())::text || '/%'
    and (select public.is_active_user())
    and exists (
      select 1 from public.submissions s
      where s.id = submission_id
        and s.worker_id = (select auth.uid())
        and (
          public.within_edit_window(s.work_date)
          or s.submitted_at > now() - interval '30 minutes'
        )
    )
  );

-- Admins can do anything with photo rows. Framers can't delete photos.
create policy "photos: admin full control"
  on public.submission_photos for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

/*
Storage: private bucket for photos
Private = no public URLs. The app requests short-lived signed URLs, which
Supabase only issues if the storage SELECT policy allows the user.

Files can only be removed through the Storage API (Supabase blocks deleting
from storage tables in SQL), so deleting a submission's photo rows does not
remove the files: the admin delete flow calls storage.remove() itself.
*/
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'safety-photos',
  'safety-photos',
  false,
  10485760, -- 10 MB, same as the table check
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Upload only into your own top-level folder: {your_user_id}/...
create policy "storage: framer uploads to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'safety-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_active_user())
  );

-- Read your own folder, or anything if admin.
create policy "storage: read own folder or admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'safety-photos'
    and (
      ((storage.foldername(name))[1] = (select auth.uid())::text
        and (select public.is_active_user()))
      or (select public.is_admin())
    )
  );

-- Only admins can replace or remove stored photos.
create policy "storage: admin updates"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'safety-photos' and (select public.is_admin()))
  with check (bucket_id = 'safety-photos' and (select public.is_admin()));

create policy "storage: admin deletes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'safety-photos' and (select public.is_admin()));

/*
Summary helper for active sites with no valid form on a given date
Handles "which sites haven't submitted today". The client passes today's
Pacific date. Flagged (incorrect) forms don't count as submitted.

Admin-only: a framer can't see other framers' forms, so for them every site
they didn't submit would look "missing". The is_admin() guard returns an
empty list instead of a misleading one.

SECURITY INVOKER = runs as the caller, so RLS still applies.
*/
create or replace function public.sites_without_submission(p_date date)
returns table (id uuid, name text)
language sql
stable
security invoker
set search_path = ''
as $$
  select st.id, st.name
  from public.sites st
  where public.is_admin()
    and st.active
    and not exists (
      select 1 from public.submissions s
      where s.site_id = st.id
        and s.work_date = p_date
        and not s.flagged_incorrect
    )
  order by st.name;
$$;

revoke execute on function public.sites_without_submission(date) from public, anon;
grant  execute on function public.sites_without_submission(date) to authenticated;
