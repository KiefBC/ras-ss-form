import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatWorkDate, todayPacific } from "../../lib/timezone";
import { loadNotSubmitted, type MissingFramer } from "./loadNotSubmitted";

/// "Who did not submit"
export function NotSubmittedTable({ date }: { date: string }) {
  // null while loading
  const [framers, setFramers] = useState<MissingFramer[] | null>(null);
  const [failed, setFailed] = useState(false);
  const today = todayPacific();

  useEffect(() => {
    // If the date changes before this load finishes, drop its result.
    let ignore = false;
    loadNotSubmitted(date)
      .then((rows) => {
        if (!ignore) setFramers(rows);
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });
    return () => {
      ignore = true;
    };
  }, [date]);

  return (
    <section>
      <h2 className="font-display text-xl font-bold tracking-wide text-ras-ink uppercase">
        Who did not submit{" "}
        {framers !== null && (
          <span className="text-ras-ink/50">({framers.length})</span>
        )}
      </h2>
      <p className="mt-1 text-sm text-ras-ink/70">
        {date === today ? "Today" : formatWorkDate(date)} · uses the "To" date
      </p>

      <div className="mt-4">
        {failed ? (
          <ErrorMessage>
            Couldn't load who did not submit. Refresh the page.
          </ErrorMessage>
        ) : framers === null ? (
          <p className="text-sm text-ras-ink/60">Loading…</p>
        ) : framers.length === 0 ? (
          <p className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-ras-ink/20 p-6 text-sm font-semibold text-ras-green">
            <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
            Everyone has submitted
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-ras-ink/10 bg-ras-surface shadow-xs">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-ras-ink/10 text-xs tracking-[0.15em] text-ras-ink/60 uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Worker</th>
                  <th className="w-40 px-4 py-2.5 font-semibold">Last form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ras-ink/10">
                {framers.map((framer) => (
                  <tr key={framer.id}>
                    <td className="truncate px-4 py-3 font-semibold text-ras-ink">
                      {framer.name}
                    </td>
                    <td className="px-4 py-3 text-ras-ink/80">
                      {framer.lastFormDate ? (
                        formatWorkDate(framer.lastFormDate)
                      ) : (
                        <span className="text-ras-ink/40">Never</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
