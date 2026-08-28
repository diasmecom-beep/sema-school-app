// Génère les dates de séances de l'année scolaire Sema — un calcul pur, sans
// base de données : les 30 dates par jour de la semaine sont toujours les
// mêmes, donc pas besoin de les stocker pour les connaître.

export const DEBUT_ANNEE = "2026-10-05"; // lundi
export const FIN_ANNEE = "2027-05-29"; // samedi — borne haute de la dernière semaine de cours

export const VACANCES = [
  { nom: "Toussaint", debut: "2026-10-19", fin: "2026-10-25" },
  { nom: "Noël", debut: "2026-12-21", fin: "2026-12-27" },
  { nom: "Carnaval", debut: "2027-02-22", fin: "2027-02-28" },
  { nom: "Pâques", debut: "2027-04-26", fin: "2027-05-02" },
];

const JOUR_INDEX = { DIMANCHE: 0, LUNDI: 1, MARDI: 2, MERCREDI: 3, JEUDI: 4, VENDREDI: 5, SAMEDI: 6 };

function estEnVacances(iso) {
  return VACANCES.some(({ debut, fin }) => iso >= debut && iso <= fin);
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

// Retourne la liste des dates ISO (YYYY-MM-DD) des séances pour un jour de la
// semaine donné ("LUNDI", "MARDI", ...), congés exclus.
export function genererDatesSeances(jour) {
  const jourIndex = JOUR_INDEX[jour];
  if (jourIndex === undefined) return [];

  const dates = [];
  const fin = new Date(`${FIN_ANNEE}T00:00:00Z`);
  const d = new Date(`${DEBUT_ANNEE}T00:00:00Z`);
  while (d.getUTCDay() !== jourIndex) d.setUTCDate(d.getUTCDate() + 1);

  while (d <= fin) {
    const iso = toIso(d);
    if (!estEnVacances(iso)) dates.push(iso);
    d.setUTCDate(d.getUTCDate() + 7);
  }
  return dates;
}

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function formaterDateLongue(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MOIS[m - 1]} ${y}`;
}
