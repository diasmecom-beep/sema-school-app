import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getProfConnecte } from "@/lib/profs";
import { getGroupeAvecZoom } from "@/lib/groupesZoom";
import { listerSeancesGroupe, listerDevoirsGroupe } from "@/lib/seances";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SeanceProf from "../../components/SeanceProf";
import Chat from "../../components/Chat";
import ProfilForm from "../../components/ProfilForm";
import EspaceHeader from "../../components/EspaceHeader";
import Footer from "../../components/Footer";

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
    <div className="min-h-screen bg-cream flex flex-col">
      <EspaceHeader label={estAdmin ? "Espace admin" : "Espace prof"} actionDeconnexion="/api/deconnexion-prof" />

      <div className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <details className="mb-8 border border-ink/10 rounded-xl bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-ink text-sm flex items-center justify-between">
            👤 Mon profil — {prof.prenom ? `${prof.prenom} ${prof.nom}` : prof.nom}
            <span>⌄</span>
          </summary>
          <div className="px-4 pb-4 pt-1 border-t border-ink/5">
            <ProfilForm prenom={prof.prenom} nom={prof.nom} photoChemin={prof.photo_chemin} />
          </div>
        </details>

        <Link href="/espace-prof" className="text-sm text-ink/50 hover:text-ink transition mb-4 inline-block">
          ← Mes groupes
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="bg-sage-800 text-cream rounded-2xl p-6 mb-8 flex items-center justify-between gap-4 flex-wrap shadow-sm">
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

            <h2 className="font-display font-extrabold text-xl text-ink mb-4">📁 Séances de l&rsquo;année</h2>
            <p className="text-sm text-ink/50 mb-4">
              Dépose les documents, l&rsquo;échéance et les notes de chaque séance à l&rsquo;avance — les élèves les
              verront automatiquement à la date du cours.
            </p>
            <div className="space-y-2">
              {seances.map((seance) => {
                const devoirs = (devoirsParSeance.get(seance.id) || []).map((d) => ({
                  ...d,
                  eleveNom: nomsParIdentifiant.get(d.eleve_identifiant),
                }));
                return <SeanceProf key={seance.id} seance={seance} devoirsInitiaux={devoirs} />;
              })}
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <h2 className="font-display font-extrabold text-xl text-ink mb-4">💬 Forum du groupe</h2>
            <p className="text-xs text-ink/50 mb-3">
              Questions des élèves, tags entre eux ou vers toi — tout le groupe y a accès.
            </p>
            <Chat groupeId={params.groupeId} role="prof" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
