import { LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import rasMark from "../assets/ras-mark-white.webp";

/// The green bar across the top of every signed-in page: logo, the user's name and sign out.
/// `wide` matches the admin dashboard's wider page; otherwise it lines up with the framer's.
export function AppHeader({ name, wide }: { name: string; wide?: boolean }) {
  return (
    <header className="bg-ras-brand bg-studs text-white">
      <div
        className={`mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 ${wide ? "max-w-7xl" : "max-w-4xl"}`}
      >
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
  );
}
