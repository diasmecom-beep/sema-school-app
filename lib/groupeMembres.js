import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Liste les personnes qu'on peut taguer (@) dans le forum d'un groupe :
// les élèves de ce groupe + le(s) prof(s) qui l'enseignent.
export async function listerMembresGroupe(groupeId) {
  if (!supabaseAdmin) return { eleves: [], profs: [] };

  const [{ data: eleves }, { data: profsData }] = await Promise.all([
    supabaseAdmin
      .from("eleves")
      .select("identifiant, nom, prenom, photo_chemin")
      .eq("groupe_id", groupeId)
      .eq("statut", "actif"),
    supabaseAdmin.from("profs").select("identifiant, nom, prenom, photo_chemin, groupes").eq("statut", "actif"),
  ]);

  const profs = (profsData || []).filter((p) => p.groupes.includes(groupeId) || p.groupes.includes("admin-all"));

  return { eleves: eleves || [], profs };
}
