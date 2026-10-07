import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/// Typed with the generated schema, so query results know their columns.
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
