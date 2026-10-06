# Admin dashboard: "Not submitted" card

Status: built 2026-10-05, then changed the same day from a card to a table (see "Update: card became a table" below). Code: `NotSubmittedTable.tsx`, `loadNotSubmitted.ts`. The list is computed in the app.

## Update: card became a table

After the card was built, Kiefer asked for the Submissions section to hold two tables side by side. The submissions table is on the left, and a **Who did not submit** table is on the right, in the same table style. The card was removed from the "Who submitted, by site" row.

- **Rows:** only the To date, one row per missing framer. We rejected one row per framer per missed day across the From–To range, which would mirror the left table but grow to framers × days.
- **Columns:** Worker, and Last form, the date of the framer's latest valid form before the To date ("Never" if none). It's found with one `limit(1)` query per missing framer. Loading everyone's whole history could pass Supabase's 1,000-row `max_rows` limit and quietly give wrong dates.
- **Layout:** the left table takes the rest of the width and the right table is fixed at 22rem. The left table's fixed columns were narrowed to fit, and the page's minimum width went from 1024px to 1152px.

The rules below (who's expected, what counts, which filters apply) didn't change.

## Problem

The assignment asks for a simple summary on the admin dashboard, e.g. submissions per site or who has not submitted today; charts are a bonus.

RAS's rule is that every framer fills in a safety form. Supervisors need to see who hasn't, so they can follow up.

## Decision

Add one card, **Not submitted**, to the existing "Who submitted, by site" card row on the supervisor dashboard. The site cards already cover "submissions per site", so this card covers the "who hasn't submitted" part.

- **Date:** the filter's **To** date, or today if To is empty. The card title shows the date, e.g. "Not submitted · Mon, Oct 5". With the default filters that's today, and setting To to an earlier day answers "who missed that day?"
- **Who is expected:** every active framer (`profiles.role = 'framer'` and `active = true`). Admins and deactivated people are left out.
- **What counts as submitted:** at least one unflagged submission on that date, on any site. A flagged form doesn't count, because it was marked as wrong.
- **Filters:** the card ignores the site and worker filters. The app doesn't know who works on which site, so a missing form isn't tied to a site. Counting only Rapture's forms would wrongly list someone who filed at Kakariko Village.
- **Everyone is assumed to be working.** There's no roster or schedule.
- **Nobody missing:** the card says "Everyone has submitted" in green.
- **Charts:** not now. They're a bonus, and this option was chosen as the smallest change.

## Rejected alternatives

- **A fixed "Today" panel above the filters.** It adds a new section, and it would always show today whatever the filters say.
- **A summary that follows the filters, with charts** (e.g. forms per site). It's the bigger build, and charts are only a bonus.
- **A card that always shows today.** Next to site cards for an earlier range (e.g. last week), "Not submitted today: Luigi" reads as if Luigi skipped last week.
- **Listing sites with no form** (`sites_without_submission()` already exists). The rule is about people, not sites.
- **A roster of who works where and when.** It would make the list exact, but it's a much bigger feature, and we decided to assume everyone works.
- **Including admins.** Supervisors aren't held to the daily-form rule.

## Accepted limitations

- Early in the morning the card lists everyone, because work hasn't started yet. On a day nobody works (e.g. a weekend) it also lists everyone. Anyone who is off that day shows as missing.
- A framer who filed for one site but not for a second site that same day counts as submitted.
- A To date in the future lists everyone.

## Open questions for the plan

- **Where the list is computed.**
  - In the app: load active framers, then the worker ids with an unflagged submission on the date. Admin RLS already allows both reads, and no migration is needed. This is the leaning.
  - Or a new DB function `framers_without_submission(date)`, mirroring `sites_without_submission()`. It needs a migration, `revoke execute ... from public, anon`, and regenerated types.
- **Card position in the row:** first or last. The leaning is first, so it's seen before the site cards.
- **Look when names are listed:** the same card style as the site cards, or a warning tint like the issue badges.
