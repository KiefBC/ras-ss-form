import { supabase } from "../../lib/supabase";

export type SiteOption = { id: string; name: string; active: boolean };
export type WorkerOption = { id: string; name: string; active: boolean };

/// Every site, A to Z, including inactive ones: their old submissions are still on record.
export async function loadAllSites(): Promise<SiteOption[]> {
  const { data, error } = await supabase
    .from("sites")
    .select("id, name, active")
    .order("name");
  if (error) throw error;
  return data;
}

/// Everyone with a profile, A to Z, including deactivated people: their old
/// submissions are still on record. Admins are included, since they can submit too.
export async function loadWorkers(): Promise<WorkerOption[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, active")
    .order("full_name");
  if (error) throw error;

  const workers: WorkerOption[] = [];
  for (const row of data) {
    workers.push({ id: row.id, name: row.full_name, active: row.active });
  }
  return workers;
}
