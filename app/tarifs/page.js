import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import { FORMULES } from "@/lib/content";

export default function TarifsPage() {
  return (
    <div>
      <AnnouncementBar />
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display font-extrabold text-3xl text-ink mb-2">Formules</h1>
        <p className="text-ink/60 mb-12">
          Des formules flexibles pour apprendre où vous voulez, quand vous voulez.
        </p>

        <div className="grid md:grid-cols-4 gap-6 text-left">
          {FORMULES.map((f) => (
            <div
              key={f.id}
              className={`rounded-2xl p-6 flex flex-col ${
                f.populaire ? "bg-sage-800 text-cream" : "bg-cream text-ink"
              }`}
            >
              {f.populaire && (
                <span className="text-xs font-bold text-terracotta-500 mb-2">Le plus populaire</span>
              )}
              <p className="font-semibold">{f.nom}</p>
              <p className="font-display font-extrabold text-4xl my-3">
                {f.prix}€
                {f.frequence && (
                  <span className="text-sm font-body font-normal block opacity-70">{f.frequence}</span>
                )}
              </p>
              <p className={`text-xs mb-4 ${f.populaire ? "text-cream/70" : "text-ink/50"}`}>{f.valabilite}</p>
              {f.conditions && (
                <p className={`text-xs mb-4 ${f.populaire ? "text-cream/70" : "text-ink/50"}`}>
                  Conditions : {f.conditions}
                </p>
              )}
              <a
                href={`/inscription?formule=${f.id}`}
                className={`text-center font-semibold rounded-full py-3 mb-6 transition ${
                  f.populaire
                    ? "bg-white text-sage-900 hover:opacity-90"
                    : "bg-brown-600 text-cream hover:bg-brown-700"
                }`}
              >
                S&rsquo;inscrire
              </a>
              <ul className={`space-y-2 text-sm mt-auto ${f.populaire ? "text-cream/90" : "text-ink/70"}`}>
                {f.features.map((ft) => (
                  <li key={ft} className="flex gap-2">
                    <span>✓</span>
                    {ft}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
