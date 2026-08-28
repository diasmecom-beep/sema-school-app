import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

// Retourne l'élève connecté (ligne Supabase complète) ou null — à appeler
// uniquement depuis un server component ou une route API, jamais côté client.
export async function getEleveConnecte() {
  if (!supabaseAdmin) return null;
  const cookieValue = cookies().get(SESSION_COOKIE)?.value;
  const identifiant = await verifySession(cookieValue);
  if (!identifiant) return null;

  const { data: eleve } = await supabaseAdmin
    .from("eleves")
    .select("identifiant, nom, prenom, photo_chemin, groupe_id, statut")
    .eq("identifiant", identifiant)
    .single();

  if (!eleve || eleve.statut !== "actif") return null;
  return eleve;
}
