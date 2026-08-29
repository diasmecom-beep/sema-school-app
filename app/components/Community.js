import Image from "next/image";
import { TEMOIGNAGES } from "@/lib/content";

// Bande de photos défilant en continu de droite à gauche (comme le bandeau
// "Rentrée le 5 octobre" en haut du site) - pas de boutons ni de points,
// juste un ruban agréable à regarder. Composant statique (pas de JS), donc
// pas de "use client" nécessaire.
export default function Community() {
  const temoignages = [...TEMOIGNAGES, ...TEMOIGNAGES];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-14 items-center mb-12">
          <p className="font-display font-extrabold text-3xl md:text-4xl text-ink leading-snug">
            Rejoins la communauté
            <br />
            et apprends à ton rythme
            <br />
            dans une ambiance
            <br />
            conviviale et bienveillante.
          </p>
        </div>

        <div className="overflow-hidden -mx-6 px-6">
          <div className="flex gap-4 w-max animate-marquee-slow hover:[animation-play-state:paused]">
            {temoignages.map((t, i) => (
              <div
                key={i}
                className="relative shrink-0 w-40 sm:w-52 aspect-[4/5] rounded-xl overflow-hidden"
              >
                <Image src={t.photo} alt="" fill className="object-cover" sizes="208px" />
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink/50 mt-8">
          Les classes seront ouvertes sous réserve d&rsquo;un nombre d&rsquo;inscription suffisant.
        </p>
      </div>
    </section>
  );
}
