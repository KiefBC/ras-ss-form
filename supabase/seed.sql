begin;

-- Job sites for the form's dropdown
insert into public.sites (name, address) values
  ('Kakariko Village', 'Hyrule'),
  ('Pallet Town', 'Kanto'),
  ('Rapture', 'North Atlantic Ocean'),
  ('Vault 101', 'Capital Wasteland')
on conflict (name) do nothing;

update public.profiles set full_name = 'Tom Nook', role = 'admin'
where id = (select id from auth.users where email = 'tom.nook@example.com');

update public.profiles set full_name = 'Mario Mario'
where id = (select id from auth.users where email = 'mario@example.com');

update public.profiles set full_name = 'Isaac Clarke'
where id = (select id from auth.users where email = 'isaac.clarke@example.com');

-- Deactivated account, to test the "This account has been deactivated" sign-in message
update public.profiles set full_name = 'Wario', active = false
where id = (select id from auth.users where email = 'wario@example.com');

set local timezone to 'America/Vancouver';

delete from public.submissions
where worker_id in (
  select id from auth.users
  where email in ('tom.nook@example.com', 'mario@example.com', 'isaac.clarke@example.com', 'wario@example.com')
);

-- The trigger normally stamps submitted_at with now(); turn it off so these keep their past times.
alter table public.submissions disable trigger submissions_set_timestamps;

-- Mario Mario: 5
insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, no_issues)
select u.id, s.id, current_date - 1, current_date - 1 + time '07:12', current_date - 1 + time '07:12', true
from auth.users u, public.sites s
where u.email = 'mario@example.com' and s.name = 'Kakariko Village';

insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, vest_issue, notes)
select u.id, s.id, current_date - 2, current_date - 2 + time '06:48', current_date - 2 + time '06:48', true,
  'Two hi-vis vests torn. Swapped for spares from the trailer.'
from auth.users u, public.sites s
where u.email = 'mario@example.com' and s.name = 'Pallet Town';

insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, no_issues)
select u.id, s.id, current_date - 3, current_date - 3 + time '07:05', current_date - 3 + time '07:05', true
from auth.users u, public.sites s
where u.email = 'mario@example.com' and s.name = 'Kakariko Village';

insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, fall_protection_issue, hazards_issue, notes)
select u.id, s.id, current_date - 5, current_date - 5 + time '08:20', current_date - 5 + time '08:20', true, true,
  'Guardrail missing at the level 3 floor opening. Taped off until it''s rebuilt.'
from auth.users u, public.sites s
where u.email = 'mario@example.com' and s.name = 'Rapture';

insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, no_issues)
select u.id, s.id, current_date - 6, current_date - 6 + time '07:30', current_date - 6 + time '07:30', true
from auth.users u, public.sites s
where u.email = 'mario@example.com' and s.name = 'Vault 101';

-- Tom Nook: 2
insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, no_issues)
select u.id, s.id, current_date - 2, current_date - 2 + time '09:15', current_date - 2 + time '09:15', true
from auth.users u, public.sites s
where u.email = 'tom.nook@example.com' and s.name = 'Rapture';

insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, tools_cords_issue, notes)
select u.id, s.id, current_date - 4, current_date - 4 + time '10:02', current_date - 4 + time '10:02', true,
  'Frayed extension cord on the chop saw. Tagged out and replaced.'
from auth.users u, public.sites s
where u.email = 'tom.nook@example.com' and s.name = 'Pallet Town';

-- Wario: 3
insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, hard_hat_issue, eye_protection_issue, notes)
select u.id, s.id, current_date - 9, current_date - 9 + time '11:40', current_date - 9 + time '11:40', true, true,
  'Cracked hard hat on one framer, and half the crew without safety glasses.'
from auth.users u, public.sites s
where u.email = 'wario@example.com' and s.name = 'Vault 101';

insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, no_issues)
select u.id, s.id, current_date - 12, current_date - 12 + time '07:55', current_date - 12 + time '07:55', true
from auth.users u, public.sites s
where u.email = 'wario@example.com' and s.name = 'Rapture';

insert into public.submissions (worker_id, site_id, work_date, submitted_at, updated_at, ladders_scaffolding_issue, notes)
select u.id, s.id, current_date - 15, current_date - 15 + time '06:30', current_date - 15 + time '06:30', true,
  'North scaffold has no inspection tag.'
from auth.users u, public.sites s
where u.email = 'wario@example.com' and s.name = 'Pallet Town';

alter table public.submissions enable trigger submissions_set_timestamps;

commit;
