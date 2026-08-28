import Link from "next/link";

export default function BoutonAccueil() {
  return (
    <Link
      href="/"
      aria-label="Accueil"
      className="h-9 w-9 rounded-full bg-terracotta-600 flex items-center justify-center text-cream hover:opacity-90 transition shrink-0"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
