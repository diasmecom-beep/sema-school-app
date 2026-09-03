import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfConnecte } from "@/lib/profs";
import { GROUPES } from "@/lib/content";
import ProfilForm from "../components/ProfilForm";
import EspaceHeader from "../components/EspaceHeader";
import Footer from "../components/Footer";
import Avatar from "../components/Avatar";
import { salutationPourLangue, langueDuProf } from "@/lib/salutations";

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

  const salutation = estAdmin ? "Bonjour" : salutationPourLangue(langueDuProf(prof));
  const prenomAffiche = prof.prenom || prof.nom;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <EspaceHeader
        label={estAdmin ? "Espace admin" : "Espace prof"}
        actionDeconnexion="/api/deconnexion-prof"
        inscriptionsHref={estAdmin ? "/admin/inscriptions" : undefined}
      />

      <div className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full">
        <details className="mb-10 border border-ink/10 rounded-xl bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-ink text-sm flex items-center gap-3">
            <Avatar prenom={prof.prenom} nom={prof.nom} photoChemin={prof.photo_chemin} taille={8} />
            <span className="flex-1">
              {salutation} {prenomAffiche}
            </span>
            <span>⌄</span>
          </summary>
          <div className="px-4 pb-4 pt-1 border-t border-ink/5">
            <ProfilForm prenom={prof.prenom} nom={prof.nom} photoChemin={prof.photo_chemin} />
          </div>
        </details>

        <h1 className="font-display font-extrabold text-3xl text-ink mb-8">Mes groupes</h1>

        {groupes.length === 0 ? (
          <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
            Aucun groupe assigné à ce compte - contacte l&rsquo;équipe Sema.
          </p>
        ) : (
          <div className="space-y-3">
            {groupes.map((g) => (
              <Link
                key={g.id}
                href={`/espace-prof/${g.id}`}
                className="flex items-center justify-between bg-sage-800 text-cream rounded-2xl p-6 hover:opacity-90 transition shadow-sm"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">{g.jour}</p>
                  <p className="font-display font-extrabold text-lg">
                    {g.langue} - {g.niveau}
                  </p>
                  <p className="text-cream/80 text-sm">{g.horaire}</p>
                </div>
                <span>→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
