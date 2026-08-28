import { GROUPES } from "@/lib/content";

const SALUTATION_PAR_LANGUE = {
  Swahili: "Jambo",
  Lingala: "Mbote",
  Kikongo: "Mbote",
  Tshiluba: "Wetuau",
};

export function salutationPourLangue(langue) {
  return SALUTATION_PAR_LANGUE[langue] || "Bonjour";
}

// Langue "principale" d'un prof = celle de son premier groupe assigné (un
// prof peut enseigner plusieurs langues ; on prend juste la première pour
// la salutation). Renvoie null pour un compte admin-all.
export function langueDuProf(prof) {
  if (!prof || prof.groupes.includes("admin-all")) return null;
  const premier = GROUPES.find((g) => prof.groupes.includes(g.id));
  return premier?.langue || null;
}
