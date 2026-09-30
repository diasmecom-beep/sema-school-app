import Image from "next/image";

export default function RemiseFamille() {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden order-2 md:order-1">
          <Image
            src="/images/remise-famille.jpg"
            alt="Un couple souriant apprenant ensemble sur un ordinateur portable"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>

        <div className="order-1 md:order-2">
          <p className="font-display font-extrabold text-2xl md:text-3xl text-ink mb-4">
            Envie d&rsquo;apprendre en famille ou envie d&rsquo;apprendre plusieurs langues ?
          </p>
          <p className="text-ink/70 text-lg">
            Bénéficie de <strong>-5% sur l&rsquo;abonnement trimestriel</strong> et{" "}
            <strong>-10% sur l&rsquo;abonnement annuel</strong> pour la deuxième langue !
          </p>
        </div>
      </div>
    </section>
  );
}
