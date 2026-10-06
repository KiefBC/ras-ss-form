import { supabase } from "../../lib/supabase";

export type MissingFramer = {
  id: string;
  name: string;
  lastFormDate: string | null; // YYYY-MM-DD of their latest valid form before the date; null if none
};

/// Active framers with no valid form on the date, A to Z.
/// A form on any site counts. A flagged form doesn't
/// Admins aren't expected to submit
export async function loadNotSubmitted(date: string): Promise<MissingFramer[]> {
  const framers = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "framer")
    .eq("active", true)
    .order("full_name");
  if (framers.error) throw framers.error;

  const forms = await supabase
    .from("submissions")
    .select("worker_id")
    .eq("work_date", date)
    .eq("flagged_incorrect", false);
  if (forms.error) throw forms.error;

  const submittedIds: string[] = [];
  for (const form of forms.data) {
    submittedIds.push(form.worker_id);
  }

  const missing = framers.data.filter((f) => !submittedIds.includes(f.id));

  // One small query per missing framer, run at the same time.
  const lastFormDates = await Promise.all(
    missing.map((f) => loadLastFormDate(f.id, date)),
  );

  const result: MissingFramer[] = [];
  for (let i = 0; i < missing.length; i++) {
    result.push({
      id: missing[i].id,
      name: missing[i].full_name,
      lastFormDate: lastFormDates[i],
    });
  }
  return result;
}

/// The framer's latest valid form date before `date`, or null if they have none.
async function loadLastFormDate(
  workerId: string,
  date: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("submissions")
    .select("work_date")
    .eq("worker_id", workerId)
    .eq("flagged_incorrect", false)
    .lt("work_date", date)
    .order("work_date", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data.length > 0 ? data[0].work_date : null;
}
