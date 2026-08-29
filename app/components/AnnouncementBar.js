import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";

// Bouton "Connexion" adapté au rôle de la personne déjà connectée (élève,
// prof ou admin) - couleur et libellé différents selon le cas.
async function boutonConnexion() {
  const [eleve, prof] = await Promise.all([getEleveConnecte(), getProfConnecte()]);

  if (prof?.groupes.includes("admin-all") || eleve?.groupe_id === "admin-all") {
    const href = prof?.groupes.includes("admin-all") ? "/espace-prof" : "/espace-eleve";
    return { href, label: "Espace admin", classe: "bg-ink" };
  }
  if (prof) {
    return { href: "/espace-prof", label: "Espace prof", classe: "bg-brown-600" };
  }
  if (eleve) {
    return { href: "/espace-eleve", label: "Mon espace", classe: "bg-terracotta-600" };
  }
  return { href: "/connexion", label: "Connexion", classe: "bg-terracotta-600" };
}

export default async function AnnouncementBar() {
  const message = "Rentrée le 5 octobre !";
  const items = Array.from({ length: 6 }, () => message);
  const bouton = await boutonConnexion();

  return (
    <div className="bg-sage-800 text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-6">
        <a href="/" className="flex flex-col shrink-0">
          <svg
            viewBox="0 0 1356 631"
            preserveAspectRatio="xMinYMid meet"
            className="h-14 w-32 sm:h-24 sm:w-52 shrink-0"
          >
            <image href="/images/logo.png" x="0" y="0" width="1356" height="631" />
            <circle cx="1195.5" cy="426.5" r="11" fill="white" className="animate-typing-dot-1" />
            <circle cx="1236.5" cy="419.5" r="11" fill="white" className="animate-typing-dot-2" />
            <circle cx="1279.5" cy="410.5" r="11" fill="white" className="animate-typing-dot-3" />
            <circle cx="1119.5" cy="526.5" r="11" fill="white" className="animate-typing-dot-1" />
            <circle cx="1162.5" cy="517.5" r="11" fill="white" className="animate-typing-dot-2" />
            <circle cx="1203.5" cy="509.5" r="11" fill="white" className="animate-typing-dot-3" />
          </svg>
        </a>

        <div className="hidden md:block flex-1 overflow-hidden">
          <div className="flex gap-10 text-sm font-semibold whitespace-nowrap w-max animate-marquee">
            {[...items, ...items].map((m, i) => (
              <span key={i} className="flex items-center gap-2">
                📅 {m}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 sm:gap-4">
          <a
            href={bouton.href}
            className={`${bouton.classe} text-cream text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:opacity-90 transition whitespace-nowrap`}
          >
            {bouton.label}
          </a>
          <a
            href="/"
            aria-label="Accueil"
            className="h-9 w-9 shrink-0 rounded-full bg-terracotta-600 flex items-center justify-center text-cream hover:opacity-90 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
