import type { TablesInsert } from "../../lib/database.types";
import type { Issues } from "./checklist";

export type SafetyFormInput = {
  workerId: string;
  siteId: string;
  workDate: string;
  issues: Issues;
  noIssues: boolean;
  notes: string;
  photos: File[];
};

export async function submitSafetyForm(input: SafetyFormInput) {
  const notes = input.notes.trim();
  const submission: TablesInsert<"submissions"> = {
    worker_id: input.workerId,
    site_id: input.siteId,
    work_date: input.workDate,
    ...input.issues,
    no_issues: input.noIssues,
    notes: notes || null,
  };
  const photos = input.photos.map((file) => ({
    mime_type: file.type,
    size_bytes: file.size,
  }));

  await new Promise((resolve) => setTimeout(resolve, 900));
  return { submission, photos };
}
