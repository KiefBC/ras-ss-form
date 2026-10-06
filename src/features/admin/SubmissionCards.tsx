import { ChevronRight } from "lucide-react";
import {
  formatPacificTime,
  formatWorkDate,
  todayPacific,
} from "../../lib/timezone";
import { SubmissionStatus } from "../safety/SubmissionStatus";
import type { AdminSubmission } from "./loadSubmissions";

type SubmissionCardsProps = {
  submissions: AdminSubmission[];
  /// Called with the submission whose card was tapped.
  onOpen: (submission: AdminSubmission) => void;
};

/// The submissions as tappable cards, for phones, where the table doesn't fit.
/// Same look as the framer's own submission cards.
export function SubmissionCards({ submissions, onOpen }: SubmissionCardsProps) {
  const today = todayPacific();

  return (
    <ul className="space-y-3">
      {submissions.map((s) => (
        <li key={s.id}>
          {/*A button can only hold inline content, so the text is in spans.*/}
          <button
            type="button"
            onClick={() => onOpen(s)}
            className={`flex w-full items-center gap-3 rounded-lg border bg-ras-surface p-3 text-left shadow-xs transition hover:border-ras-green/50 focus-visible:ring-3 focus-visible:ring-ras-green/30 focus-visible:outline-none ${
              s.flagged
                ? "border-dashed border-ras-ink/25 opacity-70"
                : "border-ras-ink/10"
            }`}
          >
            {/*min-w-0 lets long text truncate instead of widening the card*/}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ras-ink">
                {s.workerName}
              </span>
              <span className="block truncate text-xs text-ras-ink/60">
                {s.siteName} ·{" "}
                {s.workDate === today ? "Today" : formatWorkDate(s.workDate)} ·{" "}
                {formatPacificTime(s.submittedAt)}
              </span>
              <SubmissionStatus
                flagged={s.flagged}
                issues={s.issues}
                className="mt-1"
              />
            </span>

            <ChevronRight
              aria-hidden="true"
              className="size-5 shrink-0 text-ras-ink/30"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
