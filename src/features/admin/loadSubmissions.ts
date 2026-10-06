import { supabase } from "../../lib/supabase";
import type { Issues } from "../safety/checklist";
import { signPhotoUrls } from "../safety/loadMySubmissions";

/// A submission in the supervisor's list
export type AdminSubmission = {
  id: string;
  workerId: string;
  workerName: string;
  siteId: string;
  siteName: string;
  workDate: string; // YYYY-MM-DD
  submittedAt: string; // ISO timestamp
  issues: Issues; // the checklist as submitted; true means that item had an issue
  notes: string | null;
  flagged: boolean;
  photoUrls: string[]; // signed URLs in upload order; empty if it has no photos
};

/// What the list is filtered by. An empty string means "any".
export type SubmissionFilters = {
  siteId: string;
  workerId: string;
  from: string; // YYYY-MM-DD, inclusive
  to: string; // YYYY-MM-DD, inclusive
};

/// At most this many rows load at once. The page says so when it's hit.
export const SUBMISSIONS_LIMIT = 500;

/// Everyone's submissions that match the filters, newest first.
/// RLS lets an admin read every submission and anyone else would get their own.
export async function loadSubmissions(
  filters: SubmissionFilters,
): Promise<AdminSubmission[]> {
  let query = supabase
    .from("submissions")
    .select(
      "*, sites(name), profiles(full_name), submission_photos(storage_path)",
    );
  if (filters.siteId) query = query.eq("site_id", filters.siteId);
  if (filters.workerId) query = query.eq("worker_id", filters.workerId);
  if (filters.from) query = query.gte("work_date", filters.from);
  if (filters.to) query = query.lte("work_date", filters.to);

  const { data, error } = await query
    .order("work_date", { ascending: false })
    .order("submitted_at", { ascending: false })
    .order("created_at", { referencedTable: "submission_photos" })
    .limit(SUBMISSIONS_LIMIT);
  if (error) throw error;

  const allPhotoPaths: string[] = [];
  for (const row of data) {
    for (const photo of row.submission_photos) {
      allPhotoPaths.push(photo.storage_path);
    }
  }
  const signedUrls = await signPhotoUrls(allPhotoPaths);

  const submissions: AdminSubmission[] = [];
  for (const row of data) {
    const photoUrls: string[] = [];
    for (const photo of row.submission_photos) {
      const url = signedUrls.get(photo.storage_path);
      if (url) photoUrls.push(url);
    }

    submissions.push({
      id: row.id,
      workerId: row.worker_id,
      workerName: row.profiles.full_name,
      siteId: row.site_id,
      siteName: row.sites.name,
      workDate: row.work_date,
      submittedAt: row.submitted_at,
      issues: {
        hard_hat_issue: row.hard_hat_issue,
        vest_issue: row.vest_issue,
        boots_issue: row.boots_issue,
        eye_protection_issue: row.eye_protection_issue,
        fall_protection_issue: row.fall_protection_issue,
        ladders_scaffolding_issue: row.ladders_scaffolding_issue,
        tools_cords_issue: row.tools_cords_issue,
        hazards_issue: row.hazards_issue,
      },
      notes: row.notes,
      flagged: row.flagged_incorrect,
      photoUrls,
    });
  }
  return submissions;
}
