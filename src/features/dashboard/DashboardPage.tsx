import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, LogOut, Plus } from "lucide-react";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";
import {
  formatPacificTime,
  formatTodayPacific,
  formatWorkDate,
} from "../../lib/timezone";
import rasMark from "../../assets/ras-mark-white.webp";
import type { MySubmission } from "../safety/loadMySubmissions";
import { MySubmissions } from "../safety/MySubmissions";
import { SafetyForm } from "../safety/SafetyForm";
import { SubmissionDetail } from "../safety/SubmissionDetail";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-ras-green hover:underline focus-visible:ring-3 focus-visible:ring-ras-green/30 focus-visible:outline-none"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      My submissions
    </button>
  );
}

export function DashboardPage({ session }: { session: Session }) {
  // The name on the user's profile. undefined until it loads, so we don't flash the email first.
  const [name, setName] = useState<string | undefined>(undefined);
  const [view, setView] = useState<"submissions" | "form">("submissions");
  // The submission shown on its details page, or null to show the list.
  const [openSubmission, setOpenSubmission] = useState<MySubmission | null>(
    null,
  );
  // How far down the list was scrolled when a card was opened, so "back" returns there.
  const listScrollY = useRef(0);
  // Changing this remounts the list, which reloads it (see markFlagged).
  const [listVersion, setListVersion] = useState(0);

  useEffect(() => {
    // If the profile can't be read, use the same fallback as handle_new_user():
    // the full name given at signup, else the email.
    const fallback: string =
      session.user.user_metadata.full_name || session.user.email;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setName(data?.full_name ?? fallback));
  }, [session]);

  // Once the list is showing again after a details page, scroll back to where it was.
  useEffect(() => {
    if (openSubmission === null) window.scrollTo(0, listScrollY.current);
  }, [openSubmission]);

  function openDetails(submission: MySubmission) {
    listScrollY.current = window.scrollY;
    setOpenSubmission(submission);
    window.scrollTo(0, 0);
  }

  function markFlagged() {
    if (openSubmission === null) return;
    setOpenSubmission({ ...openSubmission, flagged: true });
    // Reload the hidden list so its card shows the flag too.
    setListVersion(listVersion + 1);
    // The "flagged as incorrect" note is at the top of the details page.
    window.scrollTo(0, 0);
  }

  if (name === undefined) return null;

  const firstName = name.split(" ")[0];

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
        {view === "submissions" && (
          <>
            {/*HOME: GREETING AND SUBMISSIONS*/}
            {/*Hidden, not removed, while a submission is open, so going back
               doesn't reload the list and its photos.*/}
            <div hidden={openSubmission !== null}>
              <p className="font-display text-sm font-semibold tracking-[0.2em] text-ras-green uppercase">
                {formatTodayPacific()}
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-ras-ink uppercase sm:text-4xl">
                Hi, {firstName}
              </h1>
              <p className="mt-2 max-w-xl text-ras-ink/70">
                Fill in your own safety check for each site you work on today,
                before work starts.
              </p>
              <Button
                type="button"
                onClick={() => setView("form")}
                className="mt-6 px-8 sm:w-auto"
              >
                <Plus aria-hidden="true" className="size-5" />
                Start a safety check
              </Button>

              <h2 className="mt-12 font-display text-xl font-bold tracking-wide text-ras-ink uppercase">
                Your recent submissions
              </h2>
              <div className="mt-4">
                <MySubmissions
                  key={listVersion}
                  workerId={session.user.id}
                  onOpen={openDetails}
                />
              </div>
            </div>

            {/*ONE SUBMISSION'S DETAILS*/}
            {openSubmission && (
              <>
                <BackButton onClick={() => setOpenSubmission(null)} />
                <p className="font-display text-sm font-semibold tracking-[0.2em] text-ras-green uppercase">
                  {formatWorkDate(openSubmission.workDate)}
                </p>
                <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-ras-ink uppercase sm:text-4xl">
                  {openSubmission.siteName}
                </h1>
                <p className="mt-2 text-ras-ink/70">
                  Submitted at {formatPacificTime(openSubmission.submittedAt)}
                </p>

                <div className="mt-8">
                  <SubmissionDetail
                    submission={openSubmission}
                    onFlagged={markFlagged}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/*SAFETY FORM*/}
        {view === "form" && (
          <>
            <BackButton onClick={() => setView("submissions")} />
            <p className="font-display text-sm font-semibold tracking-[0.2em] text-ras-green uppercase">
              {formatTodayPacific()}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-ras-ink uppercase sm:text-4xl">
              Daily safety check
            </h1>
            <p className="mt-2 max-w-xl text-ras-ink/70">
              Fill in your own form for each site you work on today. Check your
              PPE and the site before work starts.
            </p>

            <div className="mt-8">
              <SafetyForm
                workerId={session.user.id}
                workerName={name}
                onDone={() => setView("submissions")}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
