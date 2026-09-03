import BoutonAccueil from "./BoutonAccueil";

// En-tête commun aux espaces connectés (élève, prof, admin) : fine bande
// d'accent, logo, mention de l'espace, bouton accueil et déconnexion.
export default function EspaceHeader({ label, actionDeconnexion, inscriptionsHref }) {
  return (
    <>
      <div className="h-1.5 bg-sage-900" aria-hidden="true" />
      <div className="bg-sage-800 text-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/" className="shrink-0">
              <svg viewBox="0 0 1356 631" preserveAspectRatio="xMinYMid meet" className="h-10 w-[5.5rem] sm:h-14 sm:w-32 shrink-0">
                <image href="/images/logo.png" x="0" y="0" width="1356" height="631" />
                <circle cx="1195.5" cy="426.5" r="11" fill="white" className="animate-typing-dot-1" />
                <circle cx="1236.5" cy="419.5" r="11" fill="white" className="animate-typing-dot-2" />
                <circle cx="1279.5" cy="410.5" r="11" fill="white" className="animate-typing-dot-3" />
                <circle cx="1119.5" cy="526.5" r="11" fill="white" className="animate-typing-dot-1" />
                <circle cx="1162.5" cy="517.5" r="11" fill="white" className="animate-typing-dot-2" />
                <circle cx="1203.5" cy="509.5" r="11" fill="white" className="animate-typing-dot-3" />
              </svg>
            </a>
            <span className="text-[11px] sm:text-sm font-bold tracking-widest uppercase text-cream/90 whitespace-nowrap">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            {inscriptionsHref && (
              <a
                href={inscriptionsHref}
                className="text-xs sm:text-sm font-semibold bg-terracotta-600 text-cream rounded-full px-3 py-1.5 hover:opacity-90 transition whitespace-nowrap"
              >
                Inscriptions
              </a>
            )}
            <BoutonAccueil />
            <form action={actionDeconnexion} method="POST">
              <button type="submit" className="text-xs sm:text-sm text-cream/70 hover:text-cream transition">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
