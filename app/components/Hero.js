export default function Hero() {
  return (
    <section className="bg-sage-800 text-cream">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-[1.15] tracking-tight">
            ici tu apprends et pratiques
            <br />
            <em className="italic">le LINGALA</em>, <em className="italic">le SWAHILI</em>,
            <br />
            <em className="italic">le TSHILUBA</em> et <em className="italic">le KIKONGO</em>,
            <br />
            de niveau débutant ou
            <br />
            intermédiaire.
          </h1>
          <a
            href="/inscription"
            className="mt-10 inline-block bg-brown-600 text-cream font-semibold px-8 py-4 rounded-full hover:bg-brown-700 transition"
          >
            Inscription
          </a>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/hero.mp4"
            poster="/images/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </div>
    </section>
  );
}
