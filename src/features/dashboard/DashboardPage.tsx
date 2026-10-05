import type { Session } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatTodayPacific } from "../../lib/timezone";
import rasMark from "../../assets/ras-mark-white.webp";
import { SafetyForm } from "../safety/SafetyForm";

export function DashboardPage({ session }: { session: Session }) {
  // Same fallback as handle_new_user(): the full name given at signup, else the email.
  const name: string =
    session.user.user_metadata.full_name || session.user.email;

  return (
    <div className="min-h-dvh">
      <header className="bg-ras-green bg-studs text-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <img src={rasMark} alt="RAS" className="h-8 w-auto" />
          <span className="hidden font-display text-sm font-semibold tracking-[0.2em] text-white/80 uppercase sm:block">
            Site Safety
          </span>

          <div className="ml-auto flex min-w-0 items-center gap-3">
            <span className="truncate text-sm text-white/80">{name}</span>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="font-display text-sm font-semibold tracking-[0.2em] text-ras-green uppercase">
          {formatTodayPacific()}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-ras-ink uppercase sm:text-4xl">
          Daily safety check
        </h1>
        <p className="mt-2 max-w-xl text-ras-ink/70">
          One form per site per day. Check your crew's PPE and the site before
          work starts.
        </p>

        <div className="mt-8">
          <SafetyForm workerId={session.user.id} workerName={name} />
        </div>
      </main>
    </div>
  );
}
