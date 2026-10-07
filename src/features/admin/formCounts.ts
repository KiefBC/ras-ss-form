import { issueLabels } from "../safety/checklist";
import type { AdminSubmission } from "./loadSubmissions";

/// The forms on one site on one day. Flagged forms aren't counted.
export type DayCount = { forms: number; withIssues: number };

export function countForms(
  siteId: string,
  day: string,
  submissions: AdminSubmission[],
): DayCount {
  let forms = 0;
  let withIssues = 0;
  for (const s of submissions) {
    if (s.siteId !== siteId || s.workDate !== day || s.flagged) continue;
    forms += 1;
    if (issueLabels(s.issues).length > 0) withIssues += 1;
  }
  return { forms, withIssues };
}

/// What a square means in words, e.g. "2 forms, 1 with issues".
export function describeCount(count: DayCount): string {
  if (count.forms === 0) return "No forms";
  const forms = count.forms === 1 ? "1 form" : `${count.forms} forms`;
  if (count.withIssues === 0) return `${forms}, no issues`;
  return `${forms}, ${count.withIssues} with issues`;
}

export type Submitter = { workerId: string; name: string; forms: number };

/// Who filed a form on one site, A to Z, with how many forms each.
/// Flagged forms don't count
export function submittersOn(
  siteId: string,
  submissions: AdminSubmission[],
): Submitter[] {
  const submitters: Submitter[] = [];
  for (const s of submissions) {
    if (s.siteId !== siteId || s.flagged) continue;
    const existing = submitters.find((p) => p.workerId === s.workerId);
    if (existing) {
      existing.forms += 1;
    } else {
      submitters.push({ workerId: s.workerId, name: s.workerName, forms: 1 });
    }
  }
  return submitters.sort((a, b) => a.name.localeCompare(b.name));
}
