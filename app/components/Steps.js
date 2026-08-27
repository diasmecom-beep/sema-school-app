import Image from "next/image";
import { ETAPES } from "@/lib/content";

export default function Steps() {
  return (
    <>
      <div className="bg-white text-center px-6 pt-24">
        <p className="font-display font-extrabold text-[clamp(1.25rem,5.5vw,2.25rem)] md:text-4xl text-ink">
          <span className="whitespace-nowrap">Zéro base ? Zéro jugement !</span>
          <br />
          100% progression.
        </p>
      </div>

      <section className="bg-sage-800 text-cream mt-14">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="absolute -bottom-4 -left-4 h-full w-full bg-terracotta-600 rounded-lg" />
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-sage-900">
              <Image
                src="/images/slider/slide-laptop.jpg"
                alt=""
                fill
                className="object-contain"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
          <ol className="space-y-8">
            {ETAPES.map((e) => (
              <li key={e.n} className="flex items-center gap-4">
                <span className="shrink-0 h-12 w-12 rounded-full bg-ink text-terracotta-500 flex items-center justify-center font-bold text-lg">
                  {e.n}
                </span>
                <span className="font-semibold text-[clamp(0.85rem,3.6vw,1.25rem)] md:text-xl text-teal-400 whitespace-nowrap">
                  {e.titre}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
