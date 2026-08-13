import Image from "next/image";

export default function AnnouncementBar() {
  const message = "Rentrée le 5 octobre !";
  const items = Array.from({ length: 6 }, () => message);

  return (
    <div className="bg-sage-800 text-cream">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <a href="/" className="flex flex-col shrink-0">
          <div className="relative h-24 w-52 shrink-0">
            <Image src="/images/logo.png" alt="Sema" fill className="object-contain object-left" />
            <svg
              viewBox="0 0 60 50"
              className="absolute -bottom-6 -right-1 h-8 w-10"
              aria-hidden="true"
            >
              <path
                d="M46 4c7.7 0 14 5.6 14 12.5S53.7 29 46 29c-1.3 0-2.6-.2-3.8-.5l-6.2 3.5 1.4-6.3C34.3 23.4 32 20.2 32 16.5 32 9.6 38.3 4 46 4Z"
                fill="#C53D0E"
              />
              <circle cx="41.5" cy="16" r="1.8" fill="white" className="animate-typing-dot [animation-delay:0s]" />
              <circle cx="46.5" cy="16" r="1.8" fill="white" className="animate-typing-dot [animation-delay:0.2s]" />
              <circle cx="51.5" cy="16" r="1.8" fill="white" className="animate-typing-dot [animation-delay:0.4s]" />
              <path
                d="M23 15c8.3 0 15 6 15 13.5S31.3 42 23 42c-1.4 0-2.7-.2-4-.5l-6.7 4 1.6-6.9C10 36.2 8 32.5 8 28.5 8 21 14.7 15 23 15Z"
                fill="#61C3B6"
              />
              <circle cx="18" cy="28" r="1.8" fill="white" className="animate-typing-dot [animation-delay:0s]" />
              <circle cx="23" cy="28" r="1.8" fill="white" className="animate-typing-dot [animation-delay:0.2s]" />
              <circle cx="28" cy="28" r="1.8" fill="white" className="animate-typing-dot [animation-delay:0.4s]" />
            </svg>
          </div>
          <span className="hidden sm:block text-sm italic font-body text-cream/90 leading-tight mt-6 ml-1">
            cours de langue en ligne
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
