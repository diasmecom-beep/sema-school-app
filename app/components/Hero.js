import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-sage-800 text-cream">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
            Ici tu apprends et pratiques{" "}
            <em className="italic">le LINGALA</em>,{" "}
            <em className="italic">le SWAHILI</em>,{" "}
            <em className="italic">le TSHILUBA</em> et{" "}
            <em className="italic">le KIKONGO</em>, de niveau débutant ou intermédiaire.
          </h1>
          <a
            href="/inscription"
            className="mt-8 inline-block bg-brown-600 text-cream font-semibold px-8 py-4 rounded-full hover:bg-brown-700 transition"
          >
            Inscription
          </a>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/steps-photo.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-black/30 flex items-end p-6">
            <p className="font-display font-extrabold text-3xl leading-tight">
              SAISIR
              <br />
              <em className="italic font-normal text-xl">les opportunités</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
