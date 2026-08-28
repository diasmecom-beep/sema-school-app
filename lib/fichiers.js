export const BUCKET_FICHIERS = "sema-fichiers";

// Un id de séance est toujours "<groupe_id>__<date>" — on peut donc en
// retrouver le groupe sans requête supplémentaire.
export function groupeIdDepuisSeanceId(seanceId) {
  const [groupeId] = String(seanceId).split("__");
  return groupeId || null;
}

export function cheminMateriau(seanceId, nomFichier) {
  const unique = crypto.randomUUID();
  return `materiaux/${seanceId}/${unique}-${nomFichier}`;
}

export function cheminDevoir(seanceId, eleveIdentifiant, nomFichier) {
  const unique = crypto.randomUUID();
  return `devoirs/${seanceId}/${eleveIdentifiant}/${unique}-${nomFichier}`;
}

// Le 2e segment du chemin est toujours le seance_id (voir les deux
// fonctions ci-dessus), qu'on peut ensuite faire passer par
// groupeIdDepuisSeanceId pour l'autorisation.
export function seanceIdDepuisChemin(chemin) {
  const parts = String(chemin).split("/");
  return parts[1] || null;
}
