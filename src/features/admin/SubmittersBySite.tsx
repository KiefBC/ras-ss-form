import type { SiteOption } from "./filterOptions";
import { submittersOn } from "./formCounts";
import type { AdminSubmission } from "./loadSubmissions";

type SubmittersBySiteProps = {
  /// The sites to show, one card each.
  sites: SiteOption[];
  /// The filtered submissions; the summary counts these.
  submissions: AdminSubmission[];
};

/// One card per site listing the people who filed a form there.
export function SubmittersBySite({
  sites,
  submissions,
}: SubmittersBySiteProps) {
  return (
    <ul className="grid grid-cols-4 gap-3">
      {sites.map((site) => {
        const submitters = submittersOn(site.id, submissions);
        return (
          <li
            key={site.id}
            className="rounded-lg border border-ras-ink/10 bg-ras-surface p-4 shadow-xs"
          >
            <h3 className="truncate font-display text-base font-bold tracking-wide text-ras-ink uppercase">
              {site.name}
            </h3>

            {submitters.length === 0 ? (
              <p className="mt-1 text-sm text-ras-ink/50">No forms</p>
            ) : (
              <ul className="mt-1 divide-y divide-ras-ink/10">
                {submitters.map((person) => (
                  <li
                    key={person.workerId}
                    className="flex items-center justify-between gap-3 py-1.5 text-sm"
                  >
                    <span className="truncate text-ras-ink">{person.name}</span>
                    <span className="shrink-0 text-ras-ink/60">
                      {person.forms === 1 ? "1 form" : `${person.forms} forms`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
