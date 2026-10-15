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
    .select("identifiant, nom, prenom, photo_chemin, groupe_id, groupe_id_2, statut")
    .eq("identifiant", identifiant)
    .single();

  if (!eleve || eleve.statut !== "actif") return null;
  return eleve;
}

// Un compte élève peut suivre jusqu'à deux cours (groupe_id + groupe_id_2,
// voir scripts/migration-8-deuxieme-groupe-eleve.sql). Retourne la liste des
// groupes auxquels il a accès ("admin-all" reste un cas à part).
export function groupesDeEleve(eleve) {
  if (!eleve) return [];
  return [eleve.groupe_id, eleve.groupe_id_2].filter(Boolean);
}

export function eleveAAccesGroupe(eleve, groupeId) {
  return groupesDeEleve(eleve).some((g) => g === groupeId || g === "admin-all");
}
