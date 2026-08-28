import { redirect } from "next/navigation";
import { getEleveConnecte } from "@/lib/eleves";
import { getGroupeAvecZoom, getTousLesGroupesAvecZoom } from "@/lib/groupesZoom";
import { listerSeancesGroupe, listerDevoirsGroupe } from "@/lib/seances";
import SeanceEleve from "../components/SeanceEleve";
import Chat from "../components/Chat";
import ProfilForm from "../components/ProfilForm";
import EspaceHeader from "../components/EspaceHeader";
import Footer from "../components/Footer";

export default async function EspaceElevePage() {
  const eleve = await getEleveConnecte();
  if (!eleve) {
    redirect("/connexion?next=/espace-eleve");
  }

  const isAdmin = eleve.groupe_id === "admin-all";
  const groupe = isAdmin ? null : getGroupeAvecZoom(eleve.groupe_id);
  const tousLesGroupes = isAdmin ? getTousLesGroupesAvecZoom() : null;

  const groupeAffiche = isAdmin ? tousLesGroupes?.[0]?.id : eleve.groupe_id;
  const [seances, devoirsParSeance] = groupeAffiche
    ? await Promise.all([
        listerSeancesGroupe(groupeAffiche),
        listerDevoirsGroupe(groupeAffiche, isAdmin ? null : eleve.identifiant),
      ])
    : [[], new Map()];

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <EspaceHeader label={isAdmin ? "Espace admin" : "Espace élève"} actionDeconnexion="/api/deconnexion" />

      <div className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <details className="mb-10 border border-ink/10 rounded-xl bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-ink text-sm flex items-center justify-between">
            👤 Mon profil — {eleve.prenom ? `${eleve.prenom} ${eleve.nom}` : eleve.nom}
            <span>⌄</span>
          </summary>
          <div className="px-4 pb-4 pt-1 border-t border-ink/5">
            <ProfilForm prenom={eleve.prenom} nom={eleve.nom} photoChemin={eleve.photo_chemin} />
          </div>
        </details>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <h1 className="font-display font-extrabold text-3xl text-ink mb-8">
              {isAdmin ? "Tous les cours" : "Mon cours"}
            </h1>

            {isAdmin ? (
              <div className="space-y-4 mb-12">
                {tousLesGroupes.map((g) => (
                  <div key={g.id} className="bg-sage-800 text-cream rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap shadow-sm">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">{g.jour}</p>
                      <p className="font-display font-extrabold text-lg">
                        {g.langue} — {g.niveau}
                      </p>
                      <p className="text-cream/80 text-sm">{g.horaire}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {g.zoomLink && (
                        <a
                          href={g.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-cream text-sage-900 font-semibold rounded-full px-5 py-2.5 text-sm hover:opacity-90 transition"
                        >
                          Zoom
                        </a>
                      )}
                      {g.whatsappLink && (
                        <a
                          href={g.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] text-white font-semibold rounded-full px-5 py-2.5 text-sm hover:opacity-90 transition"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !groupe ? (
              <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-12">
                Groupe introuvable — contacte l&rsquo;équipe Sema.
              </p>
            ) : (
              <div className="bg-sage-800 text-cream rounded-2xl p-8 mb-12 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">{groupe.jour}</p>
                <p className="font-display font-extrabold text-2xl mb-1">
                  {groupe.langue} — {groupe.niveau}
                </p>
                <p className="text-cream/80 mb-6">{groupe.horaire}</p>

                <div className="flex flex-wrap items-center gap-3">
                  {groupe.zoomLink ? (
                    <a
                      href={groupe.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-cream text-sage-900 font-semibold rounded-full px-6 py-3 hover:opacity-90 transition"
                    >
                      Rejoindre le cours (Zoom)
                    </a>
                  ) : (
                    <p className="text-sm text-cream/70">Lien Zoom pas encore configuré.</p>
                  )}
                  {groupe.whatsappLink && (
                    <a
                      href={groupe.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#25D366] text-white font-semibold rounded-full px-6 py-3 hover:opacity-90 transition"
                    >
                      Groupe WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {groupeAffiche && (
              <>
                <h2 className="font-display font-extrabold text-xl text-ink mb-4">📁 Mes fichiers &amp; devoirs</h2>
                <p className="text-sm text-ink/50 mb-4">
                  Un dossier par date de cours — documents à télécharger, replay, et zone pour remettre ton devoir.
                </p>
                <div className="space-y-2">
                  {seances.map((seance) => (
                    <SeanceEleve
                      key={seance.id}
                      seance={seance}
                      devoirInitial={devoirsParSeance.get(seance.id)?.[0] || null}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {groupeAffiche && (
            <div className="lg:sticky lg:top-8">
              <h2 className="font-display font-extrabold text-xl text-ink mb-4">💬 Forum du groupe</h2>
              <p className="text-xs text-ink/50 mb-3">
                Pose une question, tague quelqu&rsquo;un avec @ ou écris à tout le groupe (prof et admin y compris).
              </p>
              <Chat groupeId={groupeAffiche} role="eleve" />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
