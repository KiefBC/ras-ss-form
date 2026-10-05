import { useActionState, useState } from 'react'
import type { AuthError } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import rasMark from '../../assets/ras-mark-white.webp'
import { Eye, EyeOff, CircleAlert, LoaderCircle } from 'lucide-react'

/// Used for returning a message based on the error code
function signInErrorMessage(error: AuthError) {
  switch (error.code) {
    case 'invalid_credentials': return "That email and password don't match."
    case 'user_banned': return 'This account has been deactivated. Contact the office.'
    case 'over_request_rate_limit': return 'Too many attempts. Wait a minute and try again.'
    default: return "Couldn't sign in. Check your connection and try again."
  }
}

/// Represents the left-hand green section
function BrandPanel() {
  return (
    <aside className="relative overflow-hidden bg-ras-green bg-studs text-white">
      <div className="relative flex h-full flex-col px-6 pt-10 pb-8 sm:px-10 lg:px-12 lg:pt-16 lg:pb-12">
        <img src={rasMark} alt="RAS" className="h-12 w-auto self-start lg:h-20" />

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
  )
}

/// Represents the... login form
function LoginForm() {
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [error, signIn, pending] = useActionState<string | null, FormData>(
    async (_prev, formData) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: String(formData.get('password') ?? ''),
      })
      return error ? signInErrorMessage(error) : null
    },
    null,
  )

  return (
    <div className="w-full max-w-sm">
      <h2 className="font-display text-2xl font-bold tracking-wide text-ras-ink uppercase">
        Sign in
      </h2>
      <p className="mt-1 text-sm text-ras-ink/70">
        Use the email and password the office set up for you.
      </p>

      <form action={signIn} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ras-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            className="mt-1.5 block h-12 w-full rounded-md border border-ras-ink/20 bg-white px-3.5 text-base text-ras-ink shadow-xs transition placeholder:text-ras-ink/40 focus:border-ras-green focus:ring-3 focus:ring-ras-green/20 focus:outline-none aria-invalid:border-red-600"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-ras-ink">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              aria-invalid={error ? true : undefined}
              className="block h-12 w-full rounded-md border border-ras-ink/20 bg-white pr-12 pl-3.5 text-base text-ras-ink shadow-xs transition focus:border-ras-green focus:ring-3 focus:ring-ras-green/20 focus:outline-none aria-invalid:border-red-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
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

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ras-green font-display text-lg font-semibold tracking-wider text-white uppercase shadow-sm transition hover:bg-ras-green-dark focus-visible:ring-3 focus-visible:ring-ras-green/40 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {pending && <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />}
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 border-t border-ras-ink/10 pt-6 text-sm text-ras-ink/70">
        No account, or forgot your password? Ask your site supervisor or the
        office to set you up.
      </p>
    </div>
  )
}

export function LoginPage() {
  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[5fr_7fr]">
      <BrandPanel />
      <section className="flex items-start justify-center px-4 py-10 sm:px-6 lg:items-center lg:py-16">
        <LoginForm />
      </section>
    </main>
  )
}
