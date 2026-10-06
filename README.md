# RAS SS Form

Daily site safety forms for RAS framing crews. Framers fill in a form for the site they're on, and supervisors review the submissions and photos.

React + Vite + TypeScript, on a hosted Supabase project.

ERD is located: [HERE](docs/ERD%20Diagram.pdf)

## Setup

You need your own Supabase project. The free tier is fine.

### 1. Tools (OPTIONAL YOU DONT NEED TO DO THIS, ONLY IF YOU USE NIX)

With Nix and direnv, from the repo folder:

```bash
direnv allow
```

### 2. Install packages

```bash
npm install
```

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` from your Supabase dashboard (Project Settings → API Keys and Data API):

- `VITE_SUPABASE_URL`: the project URL
- `VITE_SUPABASE_ANON_KEY`: the anon (publishable) key
- `SUPABASE_SERVICE_ROLE_KEY`: the service role (secret) key. Only the photo seed script uses it. Keep it secret.

### 4. Link and push the database

```bash
supabase login
```

```bash
supabase link --project-ref <your-project-ref>
```

```bash
supabase db push
```

### 5. Seed test data (optional)

First create these four users in the dashboard (Authentication → Users → Add user → Create new user, with "Auto Confirm User" ticked). Any passwords will do.

- `tom.nook@example.com` (becomes the admin)
- `mario@example.com`
- `isaac.clarke@example.com`
- `wario@example.com` (becomes a deactivated account with previous submissions)

**Password for all seed accounts**: `password` (yes, really)

Then add the sites, profiles and past submissions:

```bash
supabase db query --linked -f supabase/seed.sql
```

Or paste `supabase/seed.sql` into the dashboard's SQL Editor and run it.

Then upload the photos for those submissions:

```bash
npm run seed:photos
```

### 6. Run

```bash
npm run dev
```

Open the URL it prints (usually http://localhost:5173) and sign in.

## Conventions

- Changelog updates follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- Commits follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):
- Branches follow [Conventional Branch](https://conventional-branch.github.io/): `<type>/<description>`.
- The project follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).
- The version lives in `package.json`, and each release is tagged `vX.Y.Z`.

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.
