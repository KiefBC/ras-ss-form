import { Flag } from "lucide-react";
import {
  ChecklistPanel,
  NotesPanel,
  PhotosPanel,
} from "../safety/SubmissionDetail";
import type { AdminSubmission } from "./loadSubmissions";

/// One submission, laid out for a desktop screen and stacked in one column on a phone
/// No flag button since flagging is the framer's action on their own check.
export function AdminSubmissionDetail({
  submission,
}: {
  submission: AdminSubmission;
}) {
  return (
    <div className="space-y-5">
      {submission.flagged && (
        <p className="flex items-start gap-2 rounded-md border border-ras-ink/20 bg-ras-surface px-3.5 py-3 text-sm text-ras-ink/80">
          <Flag aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          This check was flagged as incorrect.
        </p>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <ChecklistPanel issues={submission.issues} />
        <NotesPanel notes={submission.notes} />
      </div>

      <PhotosPanel
        photoUrls={submission.photoUrls}
        siteName={submission.siteName}
      />
    </div>
  );
}
