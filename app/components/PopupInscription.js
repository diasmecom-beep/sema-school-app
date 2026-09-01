"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const CLE_VU = "sema-popup-inscription-vu";

// Popup d'invitation à s'inscrire, avec le flyer Sema - affichée une seule
// fois par session de navigation (pas à chaque page), fermable par la croix,
// le clic en dehors, ou la touche Échap.
export default function PopupInscription() {
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    let dejaVu = false;
    try {
      dejaVu = sessionStorage.getItem(CLE_VU) === "1";
    } catch {
      // stockage indisponible - on affiche quand même, tant pis pour la mémorisation
    }
    if (dejaVu) return;

    const id = setTimeout(() => setOuvert(true), 1200);
    return () => clearTimeout(id);
  }, []);

  function fermer() {
    setOuvert(false);
    try {
      sessionStorage.setItem(CLE_VU, "1");
    } catch {
      // pas grave
    }
  }

  useEffect(() => {
    if (!ouvert) return;
    function surEchap(e) {
      if (e.key === "Escape") fermer();
    }
    window.addEventListener("keydown", surEchap);
    return () => window.removeEventListener("keydown", surEchap);
  }, [ouvert]);

  if (!ouvert) return null;

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

        <div className="relative w-full aspect-[4/5]">
          <Image src="/images/flyer-recto.jpg" alt="Flyer Sema - rentrée le 5 octobre" fill className="object-cover" priority sizes="384px" />
        </div>

        <div className="p-5 text-center">
          <a
            href="/inscription"
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
