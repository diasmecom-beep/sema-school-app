import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getProfConnecte } from "@/lib/profs";
import { getGroupeAvecZoom } from "@/lib/groupesZoom";
import { listerSeancesGroupe, listerDevoirsGroupe } from "@/lib/seances";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SeanceProf from "../../components/SeanceProf";
import Chat from "../../components/Chat";

export default async function EspaceProfGroupePage({ params }) {
  const prof = await getProfConnecte();
  if (!prof) {
    redirect(`/connexion-prof?next=/espace-prof/${params.groupeId}`);
  }

  const estAdmin = prof.groupes.includes("admin-all");
  if (!estAdmin && !prof.groupes.includes(params.groupeId)) {
    notFound();
  }

  const groupe = getGroupeAvecZoom(params.groupeId);
  if (!groupe) notFound();

  const [seances, devoirsParSeance] = await Promise.all([
    listerSeancesGroupe(params.groupeId),
    listerDevoirsGroupe(params.groupeId),
  ]);

  // Noms des élèves pour affichage lisible des devoirs reçus.
  const identifiants = [...new Set([...devoirsParSeance.values()].flat().map((d) => d.eleve_identifiant))];
  let nomsParIdentifiant = new Map();
  if (identifiants.length && supabaseAdmin) {
    const { data } = await supabaseAdmin.from("eleves").select("identifiant, nom").in("identifiant", identifiants);
    nomsParIdentifiant = new Map((data || []).map((e) => [e.identifiant, e.nom]));
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

      <Link href="/espace-prof" className="text-sm text-ink/50 hover:text-ink transition mb-4 inline-block">
        ← Mes groupes
      </Link>

      <div className="bg-sage-800 text-cream rounded-2xl p-6 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">{groupe.jour}</p>
          <p className="font-display font-extrabold text-xl">
            {groupe.langue} — {groupe.niveau}
          </p>
          <p className="text-cream/80 text-sm">{groupe.horaire}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {groupe.zoomLink && (
            <a
              href={groupe.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cream text-sage-900 font-semibold rounded-full px-5 py-2.5 text-sm hover:opacity-90 transition"
            >
              Zoom
            </a>
          )}
          {groupe.whatsappLink && (
            <a
              href={groupe.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white font-semibold rounded-full px-5 py-2.5 text-sm hover:opacity-90 transition"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>

      <h2 className="font-display font-extrabold text-xl text-ink mb-4">Séances de l&rsquo;année</h2>
      <p className="text-sm text-ink/50 mb-4">
        Dépose les documents, l&rsquo;échéance et les notes de chaque séance à l&rsquo;avance — les élèves les
        verront automatiquement à la date du cours.
      </p>
      <div className="space-y-2 mb-12">
        {seances.map((seance) => {
          const devoirs = (devoirsParSeance.get(seance.id) || []).map((d) => ({
            ...d,
            eleveNom: nomsParIdentifiant.get(d.eleve_identifiant),
          }));
          return <SeanceProf key={seance.id} seance={seance} devoirsInitiaux={devoirs} />;
        })}
      </div>

      <h2 className="font-display font-extrabold text-xl text-ink mb-4">Questions des élèves</h2>
      <Chat groupeId={params.groupeId} role="prof" />
    </div>
  );
}
