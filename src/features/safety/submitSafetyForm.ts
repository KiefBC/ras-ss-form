import { supabase } from "../../lib/supabase";
import type { Issues } from "./checklist";

type SafetyFormInput = {
  workerId: string;
  siteId: string;
  workDate: string;
  issues: Issues;
  noIssues: boolean;
  notes: string;
  photos: File[];
};

/// The photo types the safety-photos bucket accepts, and the file extension for each.
/// PhotoPicker uses the keys to decide what can be picked.
export const PHOTO_EXTENSIONS: { [mimeType: string]: string } = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/// Saves the form, then uploads its photos.
/// Throws an Error with a message for the user if the form isn't saved.
export async function submitSafetyForm(
  input: SafetyFormInput,
): Promise<{ failedPhotos: number }> {
  // Save the form and get its id back.
  const notes = input.notes.trim();
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      worker_id: input.workerId,
      site_id: input.siteId,
      work_date: input.workDate,
      ...input.issues, // the Issues keys are the column names
      no_issues: input.noIssues,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error) {
    // Postgres error codes: 23505 = unique violation, 42501 = blocked by RLS.
    if (error.code === "23505") {
      throw new Error(
        "You've already filled in today's form for this site. If it's wrong, flag it as incorrect from your submissions, then fill in a new one.",
      );
    }
    if (error.code === "42501") {
      throw new Error(
        "This form wasn't accepted. Forms are only accepted for today, between 5:00am and 5:00pm.",
      );
    }
    throw new Error(
      "Couldn't submit the form. Check your connection and try again.",
    );
  }

  // Upload each photo to {worker_id}/{submission_id}/{random}.{ext}
  let failedPhotos = 0;
  for (const file of input.photos) {
    const path = `${input.workerId}/${data.id}/${crypto.randomUUID()}.${PHOTO_EXTENSIONS[file.type]}`;

    const upload = await supabase.storage
      .from("safety-photos")
      .upload(path, file, { contentType: file.type });
    if (upload.error) {
      failedPhotos += 1;
      continue;
    }

    const photoRow = await supabase.from("submission_photos").insert({
      submission_id: data.id,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    });
    if (photoRow.error) failedPhotos += 1;
  }

  return { failedPhotos };
}
