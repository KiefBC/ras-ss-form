import { Camera, ChevronRight } from "lucide-react";
import {
  formatPacificTime,
  formatWorkDate,
  todayPacific,
} from "../../lib/timezone";
import { SubmissionStatus } from "../safety/SubmissionStatus";
import type { AdminSubmission } from "./loadSubmissions";

type SubmissionTableProps = {
  submissions: AdminSubmission[];
  /// Called with the submission whose row was clicked.
  onOpen: (submission: AdminSubmission) => void;
};

/// The filtered submissions
export function SubmissionTable({ submissions, onOpen }: SubmissionTableProps) {
  const today = todayPacific();

  return (
    <div className="overflow-hidden rounded-lg border border-ras-ink/10 bg-ras-surface shadow-xs">
      {/*table-fixed: the columns keep these widths and long text truncates,
         instead of the table stretching to fit its longest cell*/}
      <table className="w-full table-fixed text-left text-sm">
        <thead className="border-b border-ras-ink/10 text-xs tracking-[0.15em] text-ras-ink/60 uppercase">
          <tr>
            <th className="w-40 px-4 py-2.5 font-semibold">Worker</th>
            <th className="w-40 px-4 py-2.5 font-semibold">Site</th>
            <th className="w-36 px-4 py-2.5 font-semibold">Date</th>
            <th className="px-4 py-2.5 font-semibold">Status</th>
            <th className="w-24 px-4 py-2.5 font-semibold">Photos</th>
            <th className="w-14">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-ras-ink/10">
          {submissions.map((s) => (
            <tr
              key={s.id}
              onClick={() => onOpen(s)}
              className="cursor-pointer transition hover:bg-ras-green/5"
            >
              <td className="truncate px-4 py-3 font-semibold text-ras-ink">
                {s.workerName}
              </td>
              <td className="truncate px-4 py-3 text-ras-ink/80">
                {s.siteName}
              </td>
              <td className="px-4 py-3 text-ras-ink/80">
                {s.workDate === today ? "Today" : formatWorkDate(s.workDate)}
                <span className="block text-xs text-ras-ink/50">
                  {formatPacificTime(s.submittedAt)}
                </span>
              </td>
              <td className="px-4 py-3">
                <SubmissionStatus flagged={s.flagged} issues={s.issues} />
              </td>
              <td className="px-4 py-3 text-ras-ink/70">
                {s.photoUrls.length > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <Camera aria-hidden="true" className="size-4" />
                    {s.photoUrls.length}
                  </span>
                ) : (
                  <span className="text-ras-ink/30">None</span>
                )}
              </td>
              <td className="py-3 pr-4">
                <button
                  type="button"
                  aria-label={`Open ${s.workerName}'s check for ${s.siteName}`}
                  className="flex size-8 items-center justify-center rounded-md text-ras-ink/40 transition hover:text-ras-green focus-visible:ring-3 focus-visible:ring-ras-green/30 focus-visible:outline-none"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
