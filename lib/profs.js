import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySession, SESSION_COOKIE_PROF } from "@/lib/session";

// Retourne le prof connecté (ligne Supabase complète) ou null — à appeler
// uniquement depuis un server component ou une route API, jamais côté client.
export async function getProfConnecte() {
  if (!supabaseAdmin) return null;
  const cookieValue = cookies().get(SESSION_COOKIE_PROF)?.value;
  const identifiant = await verifySession(cookieValue);
  if (!identifiant) return null;

  const { data: prof } = await supabaseAdmin
    .from("profs")
    .select("identifiant, nom, prenom, photo_chemin, email, groupes, statut")
    .eq("identifiant", identifiant)
    .single();

  if (!prof || prof.statut !== "actif") return null;
  return prof;
}
