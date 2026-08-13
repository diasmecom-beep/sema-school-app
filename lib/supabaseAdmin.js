import { createClient } from "@supabase/supabase-js";

// Client Supabase privilégié (clé service_role) — utilisé UNIQUEMENT dans les
// API routes et les server components, jamais importé côté client.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

if (!supabaseAdmin && typeof window === "undefined") {
  console.warn(
    "[Sema] Supabase (service role) n'est pas configuré — voir .env.example. La connexion élève est inactive tant que ce n'est pas fait."
  );
}
