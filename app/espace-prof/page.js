import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfConnecte } from "@/lib/profs";
import { GROUPES } from "@/lib/content";

export default async function EspaceProfPage() {
  const prof = await getProfConnecte();
  if (!prof) {
    redirect("/connexion-prof?next=/espace-prof");
  }

  const estAdmin = prof.groupes.includes("admin-all");
  const groupes = estAdmin ? GROUPES : GROUPES.filter((g) => prof.groupes.includes(g.id));

  if (groupes.length === 1) {
    redirect(`/espace-prof/${groupes[0].id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <p className="text-terracotta-600 font-bold tracking-widest text-sm">
          ESPACE PROF · {prof.nom} {estAdmin && "· ADMIN"}
        </p>
        <form action="/api/deconnexion-prof" method="POST">
          <button type="submit" className="text-sm text-ink/40 hover:text-ink transition">
            Déconnexion
          </button>
        </form>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-ink mb-8">Mes groupes</h1>

      {groupes.length === 0 ? (
        <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
          Aucun groupe assigné à ce compte — contacte l&rsquo;équipe Sema.
        </p>
      ) : (
        <div className="space-y-3">
          {groupes.map((g) => (
            <Link
              key={g.id}
              href={`/espace-prof/${g.id}`}
              className="flex items-center justify-between bg-sage-800 text-cream rounded-2xl p-6 hover:opacity-90 transition"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">{g.jour}</p>
                <p className="font-display font-extrabold text-lg">
                  {g.langue} — {g.niveau}
                </p>
                <p className="text-cream/80 text-sm">{g.horaire}</p>
              </div>
              <span>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
