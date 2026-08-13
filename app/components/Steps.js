import Image from "next/image";
import { ETAPES } from "@/lib/content";

export default function Steps() {
  return (
    <>
      <div className="bg-white text-center px-6 pt-16">
        <p className="font-display font-extrabold text-2xl md:text-3xl text-ink">
          Zéro base ? Zéro jugement !
          <br />
          100% progression.
        </p>
      </div>

      <section className="bg-sage-800 text-cream mt-10">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border-4 border-terracotta-600">
            <Image
              src="/images/steps-photo.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <ol className="space-y-6">
            {ETAPES.map((e) => (
              <li key={e.n} className="flex items-center gap-4">
                <span className="shrink-0 h-10 w-10 rounded-full bg-ink text-cream flex items-center justify-center font-bold">
                  {e.n}
                </span>
                <span className="font-semibold text-lg">{e.titre}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
