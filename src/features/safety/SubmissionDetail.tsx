import { useState, type ReactNode } from "react";
import { CircleCheck, Flag, TriangleAlert } from "lucide-react";
import { Button } from "../../components/Button";
import { ErrorMessage } from "../../components/ErrorMessage";
import { supabase } from "../../lib/supabase";
import { CHECKLIST_GROUPS, issueLabels, type Issues } from "./checklist";
import type { MySubmission } from "./loadMySubmissions";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-ras-ink/10 bg-ras-surface p-5 shadow-xs sm:p-6">
      <h2 className="mb-4 font-display text-xl font-bold tracking-wide text-ras-ink uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

/// Every checklist item, OK or Issue, with the issue count on top.
export function ChecklistPanel({ issues }: { issues: Issues }) {
  const issueCount = issueLabels(issues).length;

  return (
    <Panel title="Safety checklist">
      {issueCount === 0 ? (
        <p className="flex items-center gap-1.5 font-semibold text-ras-green">
          <CircleCheck aria-hidden="true" className="size-5 shrink-0" />
          No issues
        </p>
      ) : (
        <p className="flex w-fit items-center gap-1.5 rounded-sm bg-ras-warning px-2 py-0.5 font-semibold text-ras-ink">
          <TriangleAlert aria-hidden="true" className="size-5 shrink-0" />
          {issueCount === 1 ? "1 issue" : `${issueCount} issues`}
        </p>
      )}

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {CHECKLIST_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="font-display text-sm font-bold tracking-[0.15em] text-ras-ink/70 uppercase">
              {group.title}
            </h3>
            <ul className="mt-1 divide-y divide-ras-ink/10">
              {group.items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="text-ras-ink">{item.label}</span>
                  {issues[item.key] ? (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-sm bg-ras-warning px-1.5 py-0.5 text-sm font-semibold text-ras-ink">
                      <TriangleAlert aria-hidden="true" className="size-4" />
                      Issue
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ras-green">
                      <CircleCheck aria-hidden="true" className="size-4" />
                      OK
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function NotesPanel({ notes }: { notes: string | null }) {
  return (
    <Panel title="Notes">
      {notes ? (
        <p className="whitespace-pre-line text-ras-ink/80">{notes}</p>
      ) : (
        <p className="text-ras-ink/50">No notes.</p>
      )}
    </Panel>
  );
}

/// The photos as square thumbnails. Tap one to open it full size in a new tab.
export function PhotosPanel({
  photoUrls,
  siteName,
}: {
  photoUrls: string[];
  siteName: string;
}) {
  return (
    <Panel title="Photos">
      {photoUrls.length === 0 ? (
        <p className="text-ras-ink/50">No photos.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photoUrls.map((url, i) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-md focus-visible:ring-3 focus-visible:ring-ras-green/30 focus-visible:outline-none"
              >
                <img
                  src={url}
                  alt={`Photo ${i + 1} from ${siteName}`}
                  className="aspect-square w-full bg-ras-mist object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/// Flags the user's own check as incorrect, after they confirm.
// A framer can't undo this; only a supervisor can
function FlagSection({
  submissionId,
  onFlagged,
}: {
  submissionId: string;
  onFlagged: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function flag() {
    setFlagging(true);
    setError(null);
    const { error } = await supabase.rpc("set_submission_flag", {
      p_submission_id: submissionId,
      p_flagged: true,
    });
    setFlagging(false);
    if (error) {
      setError(
        "Couldn't flag this check. Check your connection and try again.",
      );
      return;
    }
    onFlagged();
  }

  return (
    <Panel title="Something wrong?">
      <p className="text-ras-ink/70">
        If you picked the wrong site or ticked the wrong items, flag this check
        as incorrect, then fill in a new one.
      </p>

      {confirming ? (
        <div className="mt-4 rounded-md border border-ras-slate/30 bg-ras-slate/10 p-4 text-ras-ink">
          <p className="font-semibold">Flag this check as incorrect?</p>
          <p className="mt-1 text-sm">
            You can't undo this. Only a supervisor can unflag it.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              pending={flagging}
              onClick={flag}
            >
              Yes, flag it
            </Button>
            <button
              type="button"
              disabled={flagging}
              onClick={() => setConfirming(false)}
              className="rounded-sm px-2 py-2.5 text-sm font-semibold hover:underline focus-visible:ring-3 focus-visible:ring-ras-slate/40 focus-visible:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(true)}
          className="mt-4"
        >
          <Flag aria-hidden="true" className="size-4" />
          Flag as incorrect
        </Button>
      )}

      {error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}
    </Panel>
  );
}

type SubmissionDetailProps = {
  submission: MySubmission;
  /// Called once the submission has been flagged as incorrect.
  onFlagged: () => void;
};

/// Everything on one of the user's submissions, as they filed it.
export function SubmissionDetail({
  submission,
  onFlagged,
}: SubmissionDetailProps) {
  return (
    <div className="space-y-5">
      {submission.flagged && (
        <p className="flex items-start gap-2 rounded-md border border-ras-ink/20 bg-ras-surface px-3.5 py-3 text-sm text-ras-ink/80">
          <Flag aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          This check was flagged as incorrect. Only a supervisor can unflag it.
        </p>
      )}

      <ChecklistPanel issues={submission.issues} />
      <NotesPanel notes={submission.notes} />
      <PhotosPanel
        photoUrls={submission.photoUrls}
        siteName={submission.siteName}
      />

      {!submission.flagged && (
        <FlagSection submissionId={submission.id} onFlagged={onFlagged} />
      )}
    </div>
  );
}
