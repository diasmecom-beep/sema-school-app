import Image from "next/image";

export default function RemiseFamille() {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="font-display font-extrabold text-2xl md:text-3xl text-ink mb-4">
            Envie d&rsquo;apprendre en famille ou envie d&rsquo;apprendre plusieurs langues ?
          </p>
          <p className="text-ink/70 text-lg mb-8">
            Bénéficie de <strong>-5% sur l&rsquo;abonnement trimestriel</strong>
            <br />
            et <strong>-10% sur l&rsquo;abonnement annuel</strong> pour la deuxième langue !
          </p>
          <a
            href="/tarifs"
            className="inline-block bg-terracotta-600 text-cream font-semibold rounded-full px-8 py-3 hover:opacity-90 transition"
          >
            J&rsquo;en profite !
          </a>
        </div>

        <div className="relative max-w-sm mx-auto md:mx-0">
          <div className="absolute -top-4 -right-4 h-full w-full bg-sage-800 rounded-lg" />
          <div className="absolute -bottom-4 -left-4 h-full w-full bg-terracotta-600 rounded-lg" />
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
            <Image
              src="/images/remise-famille.jpg"
              alt="Un ordinateur portable affichant le logo Sema, dans un salon convivial"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 90vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
