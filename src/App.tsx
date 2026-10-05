import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { LoginPage } from './features/auth/LoginPage'

function App() {
  // undefined until Supabase reports the initial session, so we don't flash the login page
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (!session) return <LoginPage />

  // Placeholder until the signed-in screens land
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-ras-ink/70">
        Signed in as <span className="font-semibold text-ras-ink">{session.user.email}</span>
      </p>
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="rounded-md border border-ras-green px-4 py-2 font-semibold text-ras-green transition hover:bg-ras-green-tint"
      >
        Sign out
      </button>
    </main>
  )
}

export default App
