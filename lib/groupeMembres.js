import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GROUPES } from "@/lib/content";

// Liste les personnes qu'on peut taguer (@) dans le forum d'un groupe :
// les élèves de ce groupe + le(s) prof(s) qui l'enseignent.
export async function listerMembresGroupe(groupeId) {
  // groupeId est inséré dans un filtre .or() ci-dessous : on n'accepte que des
  // identifiants de groupe connus.
  if (!supabaseAdmin || !GROUPES.some((g) => g.id === groupeId)) return { eleves: [], profs: [] };

  const [{ data: eleves }, { data: profsData }] = await Promise.all([
    supabaseAdmin
      .from("eleves")
      .select("identifiant, nom, prenom, photo_chemin")
      .or(`groupe_id.eq.${groupeId},groupe_id_2.eq.${groupeId}`)
      .eq("statut", "actif"),
    supabaseAdmin.from("profs").select("identifiant, nom, prenom, photo_chemin, groupes").eq("statut", "actif"),
  ]);

  const profs = (profsData || []).filter((p) => p.groupes.includes(groupeId) || p.groupes.includes("admin-all"));

  return { eleves: eleves || [], profs };
}
