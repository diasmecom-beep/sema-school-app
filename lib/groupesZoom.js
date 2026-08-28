import { GROUPES } from "@/lib/content";

// ATTENTION : ce module lit des liens Zoom/WhatsApp privés depuis les
// variables d'environnement. Ne JAMAIS l'importer depuis un composant client
// ("use client") ni depuis une page publique — uniquement depuis
// app/espace-eleve/page.js et app/espace-prof/**  (server components, après
// vérification de la session), pour que les liens ne soient envoyés qu'au
// navigateur de la personne concernée, jamais à tout le monde.

const ENV_KEY_ZOOM_PAR_GROUPE = {
  "tshiluba-debutant": "ZOOM_LINK_TSHILUBA_DEBUTANT",
  "tshiluba-intermediaire": "ZOOM_LINK_TSHILUBA_INTERMEDIAIRE",
  "swahili-debutant": "ZOOM_LINK_SWAHILI_DEBUTANT",
  "swahili-intermediaire": "ZOOM_LINK_SWAHILI_INTERMEDIAIRE",
  "lingala-debutant": "ZOOM_LINK_LINGALA_DEBUTANT",
  "lingala-intermediaire": "ZOOM_LINK_LINGALA_INTERMEDIAIRE",
  "kikongo-debutant": "ZOOM_LINK_KIKONGO_DEBUTANT",
  "kikongo-intermediaire": "ZOOM_LINK_KIKONGO_INTERMEDIAIRE",
};

const ENV_KEY_WHATSAPP_PAR_GROUPE = {
  "tshiluba-debutant": "WHATSAPP_LINK_TSHILUBA_DEBUTANT",
  "tshiluba-intermediaire": "WHATSAPP_LINK_TSHILUBA_INTERMEDIAIRE",
  "swahili-debutant": "WHATSAPP_LINK_SWAHILI_DEBUTANT",
  "swahili-intermediaire": "WHATSAPP_LINK_SWAHILI_INTERMEDIAIRE",
  "lingala-debutant": "WHATSAPP_LINK_LINGALA_DEBUTANT",
  "lingala-intermediaire": "WHATSAPP_LINK_LINGALA_INTERMEDIAIRE",
  "kikongo-debutant": "WHATSAPP_LINK_KIKONGO_DEBUTANT",
  "kikongo-intermediaire": "WHATSAPP_LINK_KIKONGO_INTERMEDIAIRE",
};

export function getGroupeAvecZoom(groupeId) {
  const groupe = GROUPES.find((g) => g.id === groupeId);
  if (!groupe) return null;

  const zoomEnvKey = ENV_KEY_ZOOM_PAR_GROUPE[groupeId];
  const whatsappEnvKey = ENV_KEY_WHATSAPP_PAR_GROUPE[groupeId];

  return {
    ...groupe,
    zoomLink: zoomEnvKey ? process.env[zoomEnvKey] || null : null,
    whatsappLink: whatsappEnvKey ? process.env[whatsappEnvKey] || null : null,
  };
}

// Réservé aux comptes "admin-all" (voir scripts/creer-eleve.mjs) — usage
// interne/staff uniquement, jamais accessible à un compte élève normal.
export function getTousLesGroupesAvecZoom() {
  return GROUPES.map((g) => getGroupeAvecZoom(g.id));
}
