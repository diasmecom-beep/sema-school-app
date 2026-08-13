import Image from "next/image";
import { TEMOIGNAGES } from "@/lib/content";

export default function Community() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <p className="font-display font-extrabold text-2xl md:text-3xl text-ink leading-snug">
            Rejoins la communauté
            <br />
            et apprends à ton rythme
            <br />
            dans une ambiance
            <br />
            conviviale et bienveillante.
          </p>
          <div className="flex gap-4 overflow-x-auto">
            {TEMOIGNAGES.map((t, i) => (
              <div key={i} className="relative shrink-0 w-40 aspect-[9/16] rounded-xl overflow-hidden">
                <Image src={t.photo} alt="" fill className="object-cover" sizes="160px" />
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
