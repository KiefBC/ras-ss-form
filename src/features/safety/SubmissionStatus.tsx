import { CircleCheck, Flag, TriangleAlert } from "lucide-react";
import { issueLabels, type Issues } from "./checklist";

/// One-line status of a submission: flagged, no issues, or which items had issues.
/// Used on the framer's cards and in the supervisor's list, so both look the same.
export function SubmissionStatus({
  flagged,
  issues,
  className = "",
}: {
  flagged: boolean;
  issues: Issues;
  className?: string;
}) {
  const labels = issueLabels(issues);

  if (flagged) {
    return (
      <span
        className={`flex items-center gap-1.5 text-sm font-semibold text-ras-ink/70 ${className}`}
      >
        <Flag aria-hidden="true" className="size-4 shrink-0" />
        Flagged as incorrect
      </span>
    );
  }

  if (labels.length === 0) {
    return (
      <span
        className={`flex items-center gap-1.5 text-sm font-semibold text-ras-green ${className}`}
      >
        <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
        No issues
      </span>
    );
  }

  return (
    <span
      className={`flex w-fit max-w-full items-center gap-1.5 rounded-sm bg-ras-warning px-1.5 py-0.5 text-sm font-semibold text-ras-ink ${className}`}
    >
      <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
      <span className="truncate">Issues: {labels.join(", ")}</span>
    </span>
  );
}
