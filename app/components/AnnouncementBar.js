import Image from "next/image";

export default function AnnouncementBar() {
  const message = "Rentrée le 5 octobre !";
  const items = Array.from({ length: 6 }, () => message);

  return (
    <div className="bg-sage-800 text-cream">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <a href="/" className="flex items-center gap-3 shrink-0">
          <div className="relative h-11 w-11 shrink-0">
            <Image src="/images/logo.png" alt="Sema" fill className="object-contain" />
            <div className="absolute -top-1.5 -right-2.5 h-4 w-4 rounded-full bg-teal-400 flex items-center justify-center gap-[1.5px]">
              <span className="h-[3px] w-[3px] rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
              <span className="h-[3px] w-[3px] rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
              <span className="h-[3px] w-[3px] rounded-full bg-white animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-terracotta-600" />
          </div>
          <span className="hidden sm:block text-xs font-body text-cream/90 leading-tight">
            cours de langue
            <br />
            en ligne
          </span>
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

        <div className="shrink-0 flex items-center gap-4">
          <a
            href="/connexion"
            className="hidden sm:block bg-terracotta-600 text-cream text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition"
          >
            Espace élève
          </a>
          <a
            href="/"
            aria-label="Accueil"
            className="h-9 w-9 rounded-full bg-terracotta-600 flex items-center justify-center text-cream hover:opacity-90 transition"
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
