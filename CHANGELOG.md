# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
