import { GROUPES } from "@/lib/content";

// ATTENTION : ce module lit des liens Zoom privés depuis les variables
// d'environnement. Ne JAMAIS l'importer depuis un composant client
// ("use client") ni depuis une page publique — uniquement depuis
// app/espace-eleve/page.js (server component, après vérification de la
// session), pour que le lien ne soit envoyé qu'au navigateur de l'élève
// concerné, jamais aux autres.

const ENV_KEY_PAR_GROUPE = {
  "tshiluba-debutant": "ZOOM_LINK_TSHILUBA_DEBUTANT",
  "tshiluba-intermediaire": "ZOOM_LINK_TSHILUBA_INTERMEDIAIRE",
  "swahili-debutant": "ZOOM_LINK_SWAHILI_DEBUTANT",
  "swahili-intermediaire": "ZOOM_LINK_SWAHILI_INTERMEDIAIRE",
  "lingala-debutant": "ZOOM_LINK_LINGALA_DEBUTANT",
  "lingala-intermediaire": "ZOOM_LINK_LINGALA_INTERMEDIAIRE",
  "kikongo-debutant": "ZOOM_LINK_KIKONGO_DEBUTANT",
  "kikongo-intermediaire": "ZOOM_LINK_KIKONGO_INTERMEDIAIRE",
};

export function getGroupeAvecZoom(groupeId) {
  const groupe = GROUPES.find((g) => g.id === groupeId);
  if (!groupe) return null;

  const envKey = ENV_KEY_PAR_GROUPE[groupeId];
  const zoomLink = envKey ? process.env[envKey] : null;

  return { ...groupe, zoomLink: zoomLink || null };
}

// Réservé aux comptes "admin-all" (voir scripts/creer-eleve.mjs) — usage
// interne/test uniquement, jamais accessible à un compte élève normal.
export function getTousLesGroupesAvecZoom() {
  return GROUPES.map((g) => getGroupeAvecZoom(g.id));
}
