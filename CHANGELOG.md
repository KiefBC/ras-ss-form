# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added
- Sign-in page with email and password, styled in RAS brand colours. Accounts are created by an admin; there's no self sign-up.
- Tailwind CSS v4 with RAS brand colour and font settings.
- Signed-in dashboard with the daily site safety form: site and date, PPE and site checklist, notes, and photo attachments (JPG, PNG or WebP, up to 10 MB each). The form validates and confirms on submit but doesn't save anything yet, and the site list is placeholder data.
- Test data: four sites, four users (one admin, one deactivated) and their past submissions in `supabase/seed.sql`, plus photos for those submissions uploaded with `npm run seed:photos`.

### Removed
- Vite starter page and its assets.
- `site_submission_status()` database function. It only made sense when a site shared one form per day.

### Fixed
- Every framer on a site now submits their own safety form. Previously only one form per site per day was accepted, so the rest of the crew couldn't submit. Each framer can have one active form per site per day.

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

[Unreleased]: https://github.com/KiefBC/ras-ss-form/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/KiefBC/ras-ss-form/releases/tag/v0.1.0
