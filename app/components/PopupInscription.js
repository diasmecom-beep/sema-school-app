"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Popups affichés l'un après l'autre (le suivant s'ouvre quand on ferme le
// précédent). Chacun n'apparaît qu'une fois par session de navigation, et
// `jusquAu` (jour inclus, format AAAA-MM-JJ) le retire automatiquement du
// site une fois l'information périmée.
const POPUPS = [
  {
    cle: "sema-popup-reprise-tshiluba-vu",
    image: "/images/popup-reprise-tshiluba.webp",
    alt: "Reprise des cours de Tshiluba ce lundi soir dès 19h30",
    ratio: "1240 / 1269",
    jusquAu: "2026-11-02",
  },
  {
    cle: "sema-popup-conge-automne-vu",
    image: "/images/popup-conge-automne.jpg",
    alt: "Congé d'automne - reprise des cours le lundi 26 octobre, inscriptions toujours ouvertes",
    jusquAu: "2026-10-26",
  },
  {
    cle: "sema-popup-inscription-vu",
    image: "/images/flyer-recto.jpg",
    alt: "Flyer Sema - rentrée le 5 octobre",
  },
];

function aEteVu(cle) {
  try {
    return sessionStorage.getItem(cle) === "1";
  } catch {
    // stockage indisponible - on affiche quand même, tant pis pour la mémorisation
    return false;
  }
}

function marquerVu(cle) {
  try {
    sessionStorage.setItem(cle, "1");
  } catch {
    // pas grave
  }
}

// Index du premier popup encore à montrer à partir de `debut`, ou -1.
function prochainIndex(debut) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  for (let i = debut; i < POPUPS.length; i++) {
    const p = POPUPS[i];
    if (p.jusquAu && aujourdhui > p.jusquAu) continue;
    if (aEteVu(p.cle)) continue;
    return i;
  }
  return -1;
}

// Popups d'invitation à s'inscrire - fermables par la croix, le clic en
// dehors, « Plus tard » ou la touche Échap.
export default function PopupInscription() {
  const [courant, setCourant] = useState(null);

  useEffect(() => {
    const premier = prochainIndex(0);
    if (premier === -1) return;
    const id = setTimeout(() => setCourant(premier), 1200);
    return () => clearTimeout(id);
  }, []);

  function fermer() {
    if (courant === null) return;
    marquerVu(POPUPS[courant].cle);
    const suivant = prochainIndex(courant + 1);
    setCourant(null);
    if (suivant !== -1) setTimeout(() => setCourant(suivant), 350);
  }

  useEffect(() => {
    if (courant === null) return;
    function surEchap(e) {
      if (e.key === "Escape") fermer();
    }
    window.addEventListener("keydown", surEchap);
    return () => window.removeEventListener("keydown", surEchap);
  });

  if (courant === null) return null;
  const popup = POPUPS[courant];

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={fermer}
    >
      <div
        className="relative w-full max-w-sm bg-sage-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={fermer}
          aria-label="Fermer"
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-ink/60 text-cream flex items-center justify-center hover:bg-ink/80 transition"
        >
          ✕
        </button>

        <div className="relative w-full" style={{ aspectRatio: popup.ratio || "4 / 5" }}>
          <Image key={popup.cle} src={popup.image} alt={popup.alt} fill className="object-cover" priority sizes="384px" />
        </div>

        <div className="p-5 text-center">
          <a
            href="/tarifs"
            className="block w-full bg-terracotta-600 text-cream font-semibold py-3 rounded-full hover:opacity-90 transition"
          >
            Je m&rsquo;inscris
          </a>
          <button
            type="button"
            onClick={fermer}
            className="mt-3 text-xs text-cream/60 hover:text-cream transition"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
