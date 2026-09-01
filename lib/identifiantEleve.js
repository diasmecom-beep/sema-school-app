import { supabaseAdmin } from "./supabaseAdmin";

function sansAccents(str) {
  return (str || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Format demandé : initiale du prénom + nom complet accolé, ex. "aambali"
// pour Achaiso Ambali. Toujours généré en MAJUSCULES car la connexion
// (voir app/api/connexion/route.js) normalise systématiquement la saisie en
// majuscules avant de comparer - stocker en minuscules casserait le login.
function baseIdentifiant(prenom, nom) {
  const initiale = sansAccents(prenom).trim().charAt(0).toLowerCase();
  const nomAttache = sansAccents(nom).toLowerCase().replace(/[^a-z]/g, "");
  return `${initiale}${nomAttache}`.toUpperCase();
}

// Garantit l'unicité en ajoutant un chiffre en cas de collision
// (ex. AAMBALI, puis AAMBALI2, AAMBALI3...).
export async function genererIdentifiantUnique(prenom, nom) {
  const base = baseIdentifiant(prenom, nom);
  let candidat = base;
  let suffixe = 1;

  while (true) {
    const { data } = await supabaseAdmin
      .from("eleves")
      .select("identifiant")
      .eq("identifiant", candidat)
      .maybeSingle();
    if (!data) return candidat;
    suffixe += 1;
    candidat = `${base}${suffixe}`;
  }
}
