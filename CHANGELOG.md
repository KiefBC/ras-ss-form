# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added
- Supervisor dashboard, built for desktop screens. Admins now land on it instead of the framer's home screen. A table lists everyone's safety checks, newest first, with the worker, site, date and time, status (no issues, which items had issues, or flagged as incorrect) and number of photos. Filter by site, worker and date range; it starts on the last 7 days. "Who submitted, by site" shows the people who filed a form on each site in those dates, and active sites with no forms say so. Click a row to see the checklist and notes side by side, with the photos full width underneath.
- "Who did not submit" table beside the submissions table on the supervisor dashboard. It lists every active framer with no form on the "To" date (today by default), with the date of their last form before that day, so supervisors can see who hasn't filled in their safety form. Flagged forms don't count, admins aren't listed, and the site and worker filters don't change it. When nobody's missing it says "Everyone has submitted".

## [0.2.0] - 2026-10-05

### Added
- Sign-in page with email and password, styled in RAS brand colours. Accounts are created by an admin; there's no self sign-up.
- Tailwind CSS v4 with RAS brand colour and font settings.
- Signed-in dashboard with the daily site safety form: site and date, PPE and site checklist, notes, and photo attachments (JPG, PNG or WebP, up to 10 MB each). Submitting saves the form and then uploads its photos, and the site list shows the active sites from the database. If you've already filled in that site's form today, or it's outside 5am–5pm, the form says so. If a photo fails to upload, the form is still saved and the confirmation says how many photos didn't upload.
- Dashboard home screen. It greets you by the name on your profile and lists your 30 most recent safety checks as compact cards: the check's first photo, then the site, date and time, and "No issues", which items had issues, or "Flagged as incorrect". Click a card to open its details page with the full checklist (each item OK or Issue), notes, and all its photos; tap a photo to open it full size. From the details page you can flag your own check as incorrect, after confirming; only a supervisor can unflag it. "Start a safety check" opens the form, and after you submit you go back to the list.
- Dark theme in RAS colours, used when the device is set to dark mode. Issues on submission cards and details pages, and the form's "outside 5am–5pm" notice, are shown in a soft warning yellow; other warnings use RAS slate, and dark-mode browser extensions such as Dark Reader no longer recolour the app.
- Test data: four sites, four users (one admin, one deactivated) and their past submissions in `supabase/seed.sql`, plus photos for those submissions uploaded with `npm run seed:photos`.
- README setup steps for running the app on your own Supabase project, and a list of the everyday commands.

### Removed
- Vite starter page and its assets.
- `site_submission_status()` database function. It only made sense when a site shared one form per day.

### Fixed
- Every framer on a site now submits their own safety form. Previously only one form per site per day was accepted, so the rest of the crew couldn't submit. Each framer can have one active form per site per day.
- Deactivated accounts can no longer sign in, and their existing sessions end. Previously a deactivated person lost access to the data but could still sign in. Signing in to a deactivated account now shows "This account has been deactivated. Contact the office."

## [0.1.0] - 2026-10-04

### Added

- Vite + React + TypeScript project scaffold with the React Compiler enabled.
- EditorConfig and environment variable template.
- Nix Flake initialized with initial tooling and LSP's
- Supabase schema: profiles, sites, daily site safety submissions, and photos, with row level security.
- Profiles can be deactivated: the person's history is kept, but they lose all access.
- Framers can only submit a form for today, between 5am and 5pm Pacific.
- Flagging a submission as incorrect is one-way for framers; only an admin can unflag.

### Security

- Logged-out callers cannot execute database functions.
- Public sign-up is disabled; only admins create accounts.

[Unreleased]: https://github.com/KiefBC/ras-ss-form/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/KiefBC/ras-ss-form/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/KiefBC/ras-ss-form/releases/tag/v0.1.0
