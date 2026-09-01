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

        <div className="grid md:grid-cols-4 gap-6 text-left items-stretch">
          {FORMULES.map((f) => (
            <div
              key={f.id}
              className={`relative overflow-hidden rounded-2xl flex flex-col transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl ${
                f.populaire
                  ? "bg-sage-800 text-cream hover:shadow-sage-900/30"
                  : "bg-cream text-ink hover:shadow-ink/10"
              }`}
            >
              {/* Bandeau "Le plus populaire" - en dehors du flux normal, donc
                  ne décale pas le contenu des autres cartes qui ne l'ont pas. */}
              {f.populaire && (
                <div className="absolute top-0 inset-x-0 h-7 bg-terracotta-500 flex items-center justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-white">
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="flex flex-col flex-1 pt-10 px-6 pb-6">
                {/* Hauteur réservée identique sur les 4 cartes, pour que les
                    boutons "S'inscrire" démarrent tous à la même hauteur
                    malgré la fréquence ou les conditions en plus/en moins. */}
                <div className="min-h-[176px]">
                  <p className="font-semibold">{f.nom}</p>
                  <p className="font-display font-extrabold text-4xl my-3">
                    {f.prix}€
                    {f.frequence && (
                      <span className="text-sm font-body font-normal block opacity-70">{f.frequence}</span>
                    )}
                  </p>
                  <p className={`text-xs mb-2 ${f.populaire ? "text-cream/70" : "text-ink/50"}`}>{f.valabilite}</p>
                  {f.conditions && (
                    <p className={`text-xs ${f.populaire ? "text-cream/70" : "text-ink/50"}`}>
                      Conditions : {f.conditions}
                    </p>
                  )}
                </div>

                <a
                  href={`/inscription?formule=${f.id}`}
                  className={`text-center font-semibold rounded-full py-3 mb-6 transition-colors ${
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
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
