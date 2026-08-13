import Image from "next/image";

const SOCIALS = [
  { name: "Instagram", href: "https://instagram.com", icon: "/images/social/instagram.png" },
  { name: "Facebook", href: "https://facebook.com", icon: "/images/social/facebook.png" },
  { name: "LinkedIn", href: "https://linkedin.com", icon: "/images/social/linkedin.png" },
  { name: "WhatsApp", href: "https://wa.me", icon: "/images/social/whatsapp.png" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/80">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col items-center gap-4 text-sm">
        <a href="mailto:semalangues@gmail.com" className="hover:text-cream transition">
          semalangues@gmail.com
        </a>
        <div className="flex gap-5 items-center">
          {SOCIALS.map((s) => (
            <a key={s.name} href={s.href} aria-label={s.name} className="opacity-80 hover:opacity-100 transition">
              <Image src={s.icon} alt={s.name} width={24} height={24} />
            </a>
          ))}
        </div>
        <p className="text-xs text-cream/50">© {new Date().getFullYear()} made with love by Diasmecom</p>
      </div>
    </footer>
  );
}
