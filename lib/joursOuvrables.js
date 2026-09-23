// Ajoute un nombre de jours ouvrables (lundi-vendredi, sans gestion des
// jours fériés) à une date donnée.
export function ajouterJoursOuvrables(date, nombreJours) {
  const resultat = new Date(date);
  let joursAjoutes = 0;
  while (joursAjoutes < nombreJours) {
    resultat.setDate(resultat.getDate() + 1);
    const jourSemaine = resultat.getDay(); // 0 = dimanche, 6 = samedi
    if (jourSemaine !== 0 && jourSemaine !== 6) {
      joursAjoutes++;
    }
  }
  return resultat;
}
