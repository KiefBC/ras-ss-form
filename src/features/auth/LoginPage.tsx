import { useState, type SubmitEvent } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import rasMark from "../../assets/ras-mark-white.webp";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { TextInput } from "../../components/TextInput";

/// The message to show for a sign-in error.
function signInErrorMessage(error: AuthError) {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match.";
    case "user_banned":
      return "This account has been deactivated. Contact the office.";
    case "over_request_rate_limit":
      return "Too many attempts. Wait a minute and try again.";
    default:
      return "Couldn't sign in. Check your connection and try again.";
  }
}

/// Represents the left-hand green section
function BrandPanel() {
  return (
    <aside className="relative overflow-hidden bg-ras-brand text-white">
      <div className="relative flex h-full flex-col px-6 pt-10 pb-8 sm:px-10 lg:px-12 lg:pt-16 lg:pb-12">
        <img
          src={rasMark}
          alt="RAS"
          className="h-12 w-auto self-start lg:h-20"
        />

        <div className="mt-6 lg:mt-auto">
          <p className="font-display text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">
            Framing &amp; Formwork
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-bold tracking-wide uppercase sm:text-4xl lg:text-5xl">
            Site Safety
            <br className="hidden lg:block" /> Check-in
          </h1>
          <p className="mt-4 hidden max-w-sm text-base text-white/80 lg:block">
            Daily PPE and site checks for Ron Anderson &amp; Sons crews across
            Vancouver Island.
          </p>
        </div>

        <div className="mt-auto hidden items-center gap-3 pt-12 font-display text-xs font-semibold tracking-[0.2em] text-white/60 uppercase lg:flex">
          <span className="h-px flex-1 bg-white/30" />
          Design. Supply. Install. Since 1998.
          <span className="h-px flex-1 bg-white/30" />
        </div>
      </div>
    </aside>
  );
}

/// The email and password form.
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // On success, App.tsx hears the new session and swaps to the dashboard.
  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setError(error ? signInErrorMessage(error) : null);
    setPending(false);
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="font-display text-2xl font-bold tracking-wide text-ras-ink uppercase">
        Sign in
      </h2>
      <p className="mt-1 text-sm text-ras-ink/70">
        Use the email and password the office set up for you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-ras-ink"
          >
            Email
          </label>
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-ras-ink"
          >
            Password
          </label>
          <div className="relative mt-1.5">
            <TextInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-ras-ink/50 transition hover:text-ras-green focus-visible:ring-3 focus-visible:ring-ras-green/30 focus-visible:outline-none"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-5" />
              ) : (
                <Eye aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button type="submit" pending={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 border-t border-ras-ink/10 pt-6 text-sm text-ras-ink/70">
        No account, or forgot your password? Ask your site supervisor or the
        office to set you up.
      </p>
    </div>
  );
}

export function LoginPage() {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[5fr_7fr]">
      <BrandPanel />
      <section className="flex items-start justify-center px-4 py-10 sm:px-6 lg:items-center lg:py-16">
        <LoginForm />
      </section>
    </main>
  );
}
