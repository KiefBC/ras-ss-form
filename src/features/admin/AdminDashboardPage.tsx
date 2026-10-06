import { useEffect, useRef, useState } from "react";
import { AppHeader } from "../../components/AppHeader";
import { BackButton } from "../../components/BackButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  daysBefore,
  formatPacificTime,
  formatTodayPacific,
  formatWorkDate,
  todayPacific,
} from "../../lib/timezone";
import { AdminSubmissionDetail } from "./AdminSubmissionDetail";
import {
  loadAllSites,
  loadWorkers,
  type SiteOption,
  type WorkerOption,
} from "./filterOptions";
import { Filters } from "./Filters";
import { NotSubmittedTable } from "./NotSubmittedTable";
import {
  loadSubmissions,
  SUBMISSIONS_LIMIT,
  type AdminSubmission,
  type SubmissionFilters,
} from "./loadSubmissions";
import { SubmissionTable } from "./SubmissionTable";
import { SubmittersBySite } from "./SubmittersBySite";

/// The supervisor's (admin's) home, built for a desktop screen, not a phone
export function AdminDashboardPage({ name }: { name: string }) {
  // The site and worker lists for the filters. Empty until they load.
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [workers, setWorkers] = useState<WorkerOption[]>([]);
  const [optionsFailed, setOptionsFailed] = useState(false);

  // Starts on the last 7 days, today included.
  const [filters, setFilters] = useState<SubmissionFilters>(() => ({
    siteId: "",
    workerId: "",
    from: daysBefore(todayPacific(), 6),
    to: todayPacific(),
  }));

  const [submissions, setSubmissions] = useState<AdminSubmission[] | null>(
    null,
  );
  const [failed, setFailed] = useState(false);

  // The submission shown on its details page, or null to show the list.
  const [openSubmission, setOpenSubmission] = useState<AdminSubmission | null>(
    null,
  );
  // How far down the list was scrolled when a row was opened, so "back" returns there.
  const listScrollY = useRef(0);

  useEffect(() => {
    loadAllSites()
      .then((rows) => setSites(rows))
      .catch(() => setOptionsFailed(true));
    loadWorkers()
      .then((rows) => setWorkers(rows))
      .catch(() => setOptionsFailed(true));
  }, []);

  // Reload whenever the filters change.
  useEffect(() => {
    // If the filters change again before this load finishes, drop its result
    let ignore = false;
    loadSubmissions(filters)
      .then((rows) => {
        if (!ignore) setSubmissions(rows);
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });
    return () => {
      ignore = true;
    };
  }, [filters]);

  // Once the list is showing again after a details page, scroll back to where it was.
  useEffect(() => {
    if (openSubmission === null) window.scrollTo(0, listScrollY.current);
  }, [openSubmission]);

  function changeFilters(next: SubmissionFilters) {
    setFilters(next);
    // Show "Loading…" until the effect above has the new rows.
    setSubmissions(null);
    setFailed(false);
  }

  function openDetails(submission: AdminSubmission) {
    listScrollY.current = window.scrollY;
    setOpenSubmission(submission);
    window.scrollTo(0, 0);
  }

  const firstName = name.split(" ")[0];

  return (
    <div className="min-h-dvh min-w-6xl">
      <AppHeader name={name} wide />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/*HOME: FILTERS, WHO SUBMITTED ON EACH SITE, AND THE TABLE
        Hidden, not removed, while a submission is open, so going back
        keeps the filters and doesn't reload the list.*/}
        <div hidden={openSubmission !== null}>
          <p className="font-display text-sm font-semibold tracking-[0.2em] text-ras-green uppercase">
            {formatTodayPacific()}
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-wide text-ras-ink uppercase">
            Hi, {firstName}
          </h1>
          <p className="mt-2 text-ras-ink/70">
            Review your crews' safety checks. Filter by site, worker or dates,
            and open a check to see its photos.
          </p>

          <div className="mt-8">
            <Filters
              filters={filters}
              sites={sites}
              workers={workers}
              onChange={changeFilters}
            />
            {optionsFailed && (
              <ErrorMessage className="mt-3">
                Couldn't load the site and worker lists. Check your connection
                and refresh the page.
              </ErrorMessage>
            )}
          </div>

          {failed ? (
            <ErrorMessage className="mt-10">
              Couldn't load submissions. Check your connection and refresh the
              page.
            </ErrorMessage>
          ) : submissions === null ? (
            <p className="mt-10 text-sm text-ras-ink/60">
              Loading submissions…
            </p>
          ) : (
            <>
              <h2 className="mt-10 font-display text-xl font-bold tracking-wide text-ras-ink uppercase">
                Who submitted, by site
              </h2>
              <p className="mt-1 text-sm text-ras-ink/70">
                People who filed a form on each site in these dates. Flagged
                forms aren't counted.
              </p>
              <div className="mt-4">
                <SubmittersBySite
                  sites={sites}
                  submissions={submissions}
                  siteId={filters.siteId}
                />
              </div>

              {/*SUBMISSIONS ON THE LEFT, WHO DID NOT SUBMIT ON THE RIGHT*/}
              <div className="mt-10 grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-6">
                <section>
                  <h2 className="font-display text-xl font-bold tracking-wide text-ras-ink uppercase">
                    Submissions{" "}
                    <span className="text-ras-ink/50">
                      ({submissions.length})
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-ras-ink/70">
                    {submissions.length === SUBMISSIONS_LIMIT
                      ? `Showing the newest ${SUBMISSIONS_LIMIT}. Narrow the filters to see older ones.`
                      : "Newest first. Click a row to open it."}
                  </p>
                  <div className="mt-4">
                    {submissions.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-ras-ink/20 p-6 text-center text-sm text-ras-ink/60">
                        No submissions match these filters.
                      </p>
                    ) : (
                      <SubmissionTable
                        submissions={submissions}
                        onOpen={openDetails}
                      />
                    )}
                  </div>
                </section>

                {/*Uses only the To date (today if it's empty)*/}
                <NotSubmittedTable date={filters.to || todayPacific()} />
              </div>
            </>
          )}
        </div>

        {/*ONE SUBMISSION'S DETAILS*/}
        {openSubmission && (
          <>
            <BackButton onClick={() => setOpenSubmission(null)}>
              All submissions
            </BackButton>
            <p className="font-display text-sm font-semibold tracking-[0.2em] text-ras-green uppercase">
              {formatWorkDate(openSubmission.workDate)}
            </p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-wide text-ras-ink uppercase">
              {openSubmission.siteName}
            </h1>
            <p className="mt-2 text-ras-ink/70">
              Submitted by {openSubmission.workerName} at{" "}
              {formatPacificTime(openSubmission.submittedAt)}
            </p>

            <div className="mt-8">
              <AdminSubmissionDetail submission={openSubmission} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
