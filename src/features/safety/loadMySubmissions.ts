import { supabase } from "../../lib/supabase";
import type { Issues } from "./checklist";

/// One of the signed-in user's own submissions: everything the card and the
/// details page show.
export type MySubmission = {
  id: string;
  siteName: string;
  workDate: string; // YYYY-MM-DD
  submittedAt: string; // ISO timestamp
  issues: Issues; // the checklist as submitted; true means that item had an issue
  notes: string | null;
  flagged: boolean;
  photoUrls: string[]; // signed URLs in upload order; empty if it has no photos
};

const RECENT_LIMIT = 30;
const PHOTO_URL_SECONDS = 60 * 60;

/// The worker's most recent submissions, newest first.
export async function loadMySubmissions(
  workerId: string,
): Promise<MySubmission[]> {
  // RLS already limits a framer to their own rows, but an admin can read
  // everyone's, so filter on worker_id too.
  const { data, error } = await supabase
    .from("submissions")
    .select("*, sites(name), submission_photos(storage_path)")
    .eq("worker_id", workerId)
    .order("work_date", { ascending: false })
    .order("submitted_at", { ascending: false })
    .order("created_at", { referencedTable: "submission_photos" })
    .limit(RECENT_LIMIT);
  if (error) throw error;

  const allPhotoPaths: string[] = [];
  for (const row of data) {
    for (const photo of row.submission_photos) {
      allPhotoPaths.push(photo.storage_path);
    }
  }
  const signedUrls = await signPhotoUrls(allPhotoPaths);

  const submissions: MySubmission[] = [];
  for (const row of data) {
    const photoUrls: string[] = [];
    for (const photo of row.submission_photos) {
      const url = signedUrls.get(photo.storage_path);
      if (url) photoUrls.push(url);
    }

    submissions.push({
      id: row.id,
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

/// Signed URLs for photos in the private bucket, by storage path, in one request.
/// A photo that can't be signed is left out, so it just doesn't show
/// instead of the whole list failing.
export async function signPhotoUrls(
  paths: string[],
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (paths.length === 0) return urls;

  const { data } = await supabase.storage
    .from("safety-photos")
    .createSignedUrls(paths, PHOTO_URL_SECONDS);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }
  return urls;
}
