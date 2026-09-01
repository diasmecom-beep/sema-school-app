import { groupesParJour } from "@/lib/content";

export default function Schedule() {
  const jours = groupesParJour();

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {jours.map(({ jour, groupes }) => (
            <div key={jour}>
              <p className="text-xs font-bold text-ink/60 tracking-widest mb-2">{jour}</p>
              <div className="space-y-3">
                {groupes.map((g) => (
                  <a
                    key={g.id}
                    href={`/tarifs?groupe=${g.id}`}
                    className="flex items-center justify-between border border-ink/20 rounded-2xl px-4 py-4 hover:border-terracotta-600 transition"
                  >
                    <span className="font-semibold text-ink">
                      {g.langue}
                      <br />
                      {g.niveau}
                    </span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-ink/60 mt-6 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="whitespace-nowrap">Cours débutants : 19h30 – 20h30</span>
          <span className="hidden sm:inline">·</span>
          <span className="whitespace-nowrap">Cours intermédiaires : 20h45 – 21h45</span>
        </p>
      </div>
    </section>
  );
}
