import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GROUPES } from "@/lib/content";

// Documents du dossier "Cours" d'un groupe (indépendants des dates de
// séance). Ne casse jamais l'affichage : si la table n'existe pas encore ou
// si la requête échoue, on renvoie simplement une liste vide.
export async function listerRessourcesCours(groupeId) {
  if (!supabaseAdmin || !GROUPES.some((g) => g.id === groupeId)) return [];

  const { data, error } = await supabaseAdmin
    .from("ressources_cours")
    .select("id, type, titre, url, created_at")
    .eq("groupe_id", groupeId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Lecture du dossier Cours impossible:", error.message);
    return [];
  }
  return data || [];
}

// Id "pseudo-séance" utilisé pour le chemin de stockage du dossier Cours :
// "<groupe_id>__cours" - groupeIdDepuisSeanceId() en retrouve le groupe.
export function idDossierCours(groupeId) {
  return `${groupeId}__cours`;
}
