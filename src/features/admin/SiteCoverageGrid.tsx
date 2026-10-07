import { CircleCheck, TriangleAlert } from "lucide-react";
import { daysBefore, formatWorkDate, todayPacific } from "../../lib/timezone";
import type { SiteOption } from "./filterOptions";
import { countForms, describeCount } from "./formCounts";
import {
  SUBMISSIONS_LIMIT,
  type AdminSubmission,
  type SubmissionFilters,
} from "./loadSubmissions";

/// The grid shows at most this many days
const MAX_DAYS = 31;

/// A work date's short weekday
function weekday(day: string) {
  return new Date(day).toLocaleDateString("en-CA", {
    timeZone: "UTC",
    weekday: "short",
  });
}

type SiteCoverageGridProps = {
  /// The sites to show, one row each.
  sites: SiteOption[];
  /// The filtered submissions, newest first
  submissions: AdminSubmission[];
  filters: SubmissionFilters;
};

/// One row per site and one column per day
export function SiteCoverageGrid({
  sites,
  submissions,
  filters,
}: SiteCoverageGridProps) {
  const today = todayPacific();
  // Ends on the "To" date, or today if it's empty or in the future.
  const lastDay = filters.to && filters.to < today ? filters.to : today;
  // Starts on the "From" date, but goes back MAX_DAYS at most.
  const earliest = daysBefore(lastDay, MAX_DAYS - 1);
  const firstDay =
    filters.from && filters.from > earliest ? filters.from : earliest;
  const cutShort = firstDay !== filters.from;

  // When the list hit its limit
  const truncated = submissions.length === SUBMISSIONS_LIMIT;
  const oldestLoaded =
    submissions.length > 0 ? submissions[submissions.length - 1].workDate : "";

  const days: string[] = [];
  for (let i = MAX_DAYS - 1; i >= 0; i--) {
    const day = daysBefore(lastDay, i);
    if (day < firstDay) continue;
    if (truncated && day <= oldestLoaded) continue;
    days.push(day);
  }

  if (days.length === 0 || sites.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-ras-ink/20 p-6 text-center text-sm text-ras-ink/60">
        No days to show.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-ras-ink/10 bg-ras-surface p-4 shadow-xs">
      <table className="w-full table-fixed border-separate border-spacing-0.5 text-sm">
        <thead>
          <tr>
            <th scope="col" className="w-44 text-left">
              <span className="sr-only">Site</span>
            </th>
            {days.map((day) => (
              <th
                key={day}
                scope="col"
                title={formatWorkDate(day)}
                className={`pb-1 text-xs font-semibold ${day === today ? "text-ras-green" : "text-ras-ink/60"}`}
              >
                <span className="block">
                  {day === today ? "Today" : weekday(day)}
                </span>
                <span className="block text-sm">{Number(day.slice(8))}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.id}>
              <th
                scope="row"
                className="truncate pr-3 text-left font-semibold text-ras-ink"
              >
                {site.name}
              </th>
              {days.map((day) => {
                const count = countForms(site.id, day, submissions);
                const label = describeCount(count);
                return (
                  <td
                    key={day}
                    title={`${site.name}, ${formatWorkDate(day)}: ${label}`}
                  >
                    {count.forms === 0 ? (
                      <div className="h-9 rounded border border-dashed border-ras-ink/25">
                        <span className="sr-only">{label}</span>
                      </div>
                    ) : count.withIssues > 0 ? (
                      <div className="flex h-9 items-center justify-center gap-0.5 rounded bg-ras-warning font-semibold text-ras-ink">
                        <TriangleAlert
                          aria-hidden="true"
                          className="size-3.5 shrink-0"
                        />
                        <span aria-hidden="true">{count.forms}</span>
                        <span className="sr-only">{label}</span>
                      </div>
                    ) : (
                      <div className="flex h-9 items-center justify-center gap-0.5 rounded bg-ras-green/20 font-semibold text-ras-ink">
                        <CircleCheck
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-ras-green"
                        />
                        <span aria-hidden="true">{count.forms}</span>
                        <span className="sr-only">{label}</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/*KEY, AND WHY SOME DAYS AREN'T SHOWN*/}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ras-ink/70">
        <span className="flex items-center gap-1.5">
          <span className="flex size-3.5 items-center justify-center rounded-sm bg-ras-green/20">
            <CircleCheck
              aria-hidden="true"
              className="size-2.5 text-ras-green"
            />
          </span>
          No issues
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex size-3.5 items-center justify-center rounded-sm bg-ras-warning">
            <TriangleAlert aria-hidden="true" className="size-2.5" />
          </span>
          Issues found
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-sm border border-dashed border-ras-ink/40" />
          No forms
        </span>
        <span>The number is how many forms were filed.</span>
        {cutShort && <span>Shows the last {MAX_DAYS} days at most.</span>}
        {truncated && (
          <span>
            Only the newest {SUBMISSIONS_LIMIT} forms loaded, so older days are
            left out.
          </span>
        )}
      </div>
    </div>
  );
}
