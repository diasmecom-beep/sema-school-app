import { createClient } from "@supabase/supabase-js";

// Client Supabase public (clé anon) — utilisé UNIQUEMENT côté navigateur,
// et uniquement pour envoyer un fichier vers une URL signée déjà autorisée
// par le serveur (voir createSignedUploadUrl dans les routes /upload-url).
// La clé anon ne donne accès à rien d'autre : RLS est activé sans policy
// sur toutes les tables, et les URLs signées portent leur propre
// autorisation indépendante de RLS.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
