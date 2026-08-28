"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TEMOIGNAGES } from "@/lib/content";

// Glissement en douceur, avec accélération/décélération — plus agréable à
// l'œil que le scroll "smooth" natif du navigateur, souvent trop sec et de
// durée non maîtrisable.
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function defilerVers(el, cible, duree = 900) {
  const depart = el.scrollLeft;
  const distance = cible - depart;
  if (Math.abs(distance) < 1) return;
  const debut = performance.now();

  function etape(maintenant) {
    const ecoule = maintenant - debut;
    const progres = Math.min(ecoule / duree, 1);
    el.scrollLeft = depart + distance * easeInOutCubic(progres);
    if (progres < 1) requestAnimationFrame(etape);
  }
  requestAnimationFrame(etape);
}

export default function Community() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(i) {
    const track = trackRef.current;
    if (!track) return;
    const wrapped = (i + TEMOIGNAGES.length) % TEMOIGNAGES.length;
    const card = track.children[wrapped];
    if (!card) return;
    defilerVers(track, card.offsetLeft - track.offsetLeft);
    setActive(wrapped);
  }

  function next() {
    scrollToIndex(active + 1);
  }

  function prev() {
    scrollToIndex(active - 1);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => {
        const nextIndex = (a + 1) % TEMOIGNAGES.length;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, 4500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.children[0]?.offsetWidth || 1;
    const gap = 16;
    const i = Math.round(track.scrollLeft / (cardWidth + gap));
    setActive(i);
  }

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <p className="font-display font-extrabold text-3xl md:text-4xl text-ink leading-snug">
            Rejoins la communauté
            <br />
            et apprends à ton rythme
            <br />
            dans une ambiance
            <br />
            conviviale et bienveillante.
          </p>

          <div className="relative min-w-0">
            <div
              ref={trackRef}
              onScroll={onScroll}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TEMOIGNAGES.map((t, i) => (
                <div
                  key={i}
                  className="relative shrink-0 w-full sm:w-52 aspect-[4/5] rounded-xl overflow-hidden snap-center sm:snap-start"
                >
                  <Image src={t.photo} alt="" fill className="object-cover" sizes="(min-width: 640px) 208px, 100vw" />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={prev}
              aria-label="Précédent"
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow items-center justify-center text-ink hover:bg-cream transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Suivant"
              className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow flex items-center justify-center text-ink hover:bg-cream transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex justify-center gap-2 mt-4">
              {TEMOIGNAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Aller à l'image ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={`h-2 w-2 rounded-full transition ${
                    active === i ? "bg-terracotta-600" : "bg-ink/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-ink/50 mt-8">
          Les classes seront ouvertes sous réserve d&rsquo;un nombre d&rsquo;inscription suffisant.
        </p>
      </div>
    </section>
  );
}
