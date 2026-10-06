import { supabase } from "../../lib/supabase";

export type Site = { id: string; name: string };

/// Active job sites for the form's dropdown, A to Z.
export async function loadActiveSites(): Promise<Site[]> {
  const { data, error } = await supabase
    .from("sites")
    .select("id, name")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return data;
}
