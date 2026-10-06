import { useEffect, useState } from "react";
import {
  ChevronRight,
  CircleCheck,
  Flag,
  ImageOff,
  TriangleAlert,
} from "lucide-react";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  formatPacificTime,
  formatWorkDate,
  todayPacific,
} from "../../lib/timezone";
import { issueLabels } from "./checklist";
import { loadMySubmissions, type MySubmission } from "./loadMySubmissions";

function SubmissionCard({
  submission,
  today,
  onOpen,
}: {
  submission: MySubmission;
  today: string;
  onOpen: () => void;
}) {
  const date =
    submission.workDate === today
      ? "Today"
      : formatWorkDate(submission.workDate);
  const issues = issueLabels(submission.issues);

  // A button can only hold inline content, so the text is in spans, not headings.
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`flex w-full items-center gap-3 rounded-lg border bg-ras-surface p-3 text-left shadow-xs transition hover:border-ras-green/50 focus-visible:ring-3 focus-visible:ring-ras-green/30 focus-visible:outline-none ${
          submission.flagged
            ? "border-dashed border-ras-ink/25 opacity-70"
            : "border-ras-ink/10"
        }`}
      >
        {/*FIRST PHOTO, OR A PLACEHOLDER WHEN THERE ISN'T ONE*/}
        {submission.photoUrls.length > 0 ? (
          <img
            src={submission.photoUrls[0]}
            alt=""
            loading="lazy"
            className="size-16 shrink-0 rounded-md bg-ras-mist object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-md bg-ras-mist text-ras-ink/30">
            <ImageOff aria-hidden="true" className="size-6" />
          </span>
        )}

        {/*min-w-0 lets long text truncate instead of widening the card*/}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-base font-bold tracking-wide text-ras-ink uppercase">
            {submission.siteName}
          </span>
          <span className="block text-xs text-ras-ink/60">
            {date} · {formatPacificTime(submission.submittedAt)}
          </span>

          {submission.flagged ? (
            <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ras-ink/70">
              <Flag aria-hidden="true" className="size-4 shrink-0" />
              Flagged as incorrect
            </span>
          ) : issues.length === 0 ? (
            <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ras-green">
              <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
              No issues
            </span>
          ) : (
            <span className="mt-1 flex w-fit max-w-full items-center gap-1.5 rounded-sm bg-ras-warning px-1.5 py-0.5 text-sm font-semibold text-ras-ink">
              <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">Issues: {issues.join(", ")}</span>
            </span>
          )}
        </span>

        <ChevronRight
          aria-hidden="true"
          className="size-5 shrink-0 text-ras-ink/30"
        />
      </button>
    </li>
  );
}

type MySubmissionsProps = {
  workerId: string;
  /// Called with the submission whose card was clicked.
  onOpen: (submission: MySubmission) => void;
};

/// The signed-in user's recent safety checks, as cards. Loads when it mounts.
export function MySubmissions({ workerId, onOpen }: MySubmissionsProps) {
  // null while loading
  const [submissions, setSubmissions] = useState<MySubmission[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadMySubmissions(workerId)
      .then((rows) => setSubmissions(rows))
      .catch(() => setFailed(true));
  }, [workerId]);

  if (failed) {
    return (
      <ErrorMessage>
        Couldn't load your submissions. Check your connection and refresh the
        page.
      </ErrorMessage>
    );
  }

  if (submissions === null) {
    return <p className="text-sm text-ras-ink/60">Loading your submissions…</p>;
  }

  if (submissions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-ras-ink/20 p-6 text-center text-sm text-ras-ink/60">
        You haven't submitted any safety checks yet.
      </p>
    );
  }

  const today = todayPacific();
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {submissions.map((s) => (
        <SubmissionCard
          key={s.id}
          submission={s}
          today={today}
          onOpen={() => onOpen(s)}
        />
      ))}
    </ul>
  );
}
