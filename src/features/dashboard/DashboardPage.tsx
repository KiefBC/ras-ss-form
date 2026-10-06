import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import { AppHeader } from "../../components/AppHeader";
import { BackButton } from "../../components/BackButton";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";
import {
  formatPacificTime,
  formatTodayPacific,
  formatWorkDate,
} from "../../lib/timezone";
import { AdminDashboardPage } from "../admin/AdminDashboardPage";
import type { MySubmission } from "../safety/loadMySubmissions";
import { MySubmissions } from "../safety/MySubmissions";
import { SafetyForm } from "../safety/SafetyForm";
import { SubmissionDetail } from "../safety/SubmissionDetail";

export function DashboardPage({ session }: { session: Session }) {
  // The name on the user's profile. undefined until it loads, so we don't flash the email first.
  const [name, setName] = useState<string | undefined>(undefined);
  // Supervisors are the admin role
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<"submissions" | "form">("submissions");
  // The submission shown on its details page, or null to show the list.
  const [openSubmission, setOpenSubmission] = useState<MySubmission | null>(
    null,
  );
  // How far down the list was scrolled when a card was opened, so "back" returns there
  const listScrollY = useRef(0);
  // Changing this remounts the list
  const [listVersion, setListVersion] = useState(0);

  useEffect(() => {
    // If the profile can't be read, use the full name given at signup, else the email
    const fallback: string =
      session.user.user_metadata.full_name || session.user.email;
    supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setName(data?.full_name ?? fallback);
        setIsAdmin(data?.role === "admin");
      });
  }, [session]);

  // Once the list is showing again after a details page, scroll back to where it was
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
    setListVersion(listVersion + 1);
    window.scrollTo(0, 0);
  }

  if (name === undefined) return null;
  if (isAdmin) return <AdminDashboardPage name={name} />;

  const firstName = name.split(" ")[0];

  return (
    <div className="min-h-dvh">
      <AppHeader name={name} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        {view === "submissions" && (
          <>
            {/*HOME: GREETING AND SUBMISSIONS*/}
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
                <BackButton onClick={() => setOpenSubmission(null)}>
                  My submissions
                </BackButton>
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
            <BackButton onClick={() => setView("submissions")}>
              My submissions
            </BackButton>
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
