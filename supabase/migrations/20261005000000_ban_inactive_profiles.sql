/*
Deactivated users can't sign in

Supabase Auth never reads public.profiles, so profiles.active = false only
cut off data (via RLS) and the user could still sign in. This mirrors
profiles.active onto auth.users.banned_until

  deactivate -> banned_until far in the future, sessions deleted. Sign-in
                fails with error code 'user_banned' (LoginPage shows "This
                account has been deactivated") and refresh tokens stop working.
  reactivate -> banned_until cleared.

An access token already issued stays valid until it expires so we use
RLS which gives the inactive user nothing beyond their own profile row.

100 years is to matche the Auth admin API's own long bans and
avoids Auth parsing issues
 */
create or replace function public.profiles_sync_ban()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.active then
    update auth.users
    set banned_until = null
    where id = new.id;
  else
    update auth.users
    set banned_until = now() + interval '100 years'
    where id = new.id;

    delete from auth.sessions where user_id = new.id;
  end if;
  return null;
end;
$$;

revoke execute on function public.profiles_sync_ban() from public,
anon,
authenticated;

create trigger profiles_sync_ban
after update of active on public.profiles
for each row
when (old.active is distinct from new.active)
execute function public.profiles_sync_ban();

-- Ban anyone already deactivated before this migration
update auth.users u
set banned_until = now() + interval '100 years'
from public.profiles p
where p.id = u.id
and not p.active
and (u.banned_until is null or u.banned_until < now());

delete from auth.sessions s
using public.profiles p
where p.id = s.user_id
and not p.active;
