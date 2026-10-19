import { redirect } from "next/navigation";
import Link from "next/link";
import { getEleveConnecte, groupesDeEleve } from "@/lib/eleves";
import { getGroupeAvecZoom } from "@/lib/groupesZoom";
import { GROUPES } from "@/lib/content";
import { listerSeancesGroupe, listerDevoirsGroupe } from "@/lib/seances";
import SeanceEleve from "../components/SeanceEleve";
import Chat from "../components/Chat";
import ProfilForm from "../components/ProfilForm";
import EspaceHeader from "../components/EspaceHeader";
import Footer from "../components/Footer";
import Avatar from "../components/Avatar";
import MembresGroupe from "../components/MembresGroupe";
import DossierCours from "../components/DossierCours";
import { listerRessourcesCours } from "@/lib/ressourcesCours";
import { salutationPourLangue } from "@/lib/salutations";

export default async function EspaceElevePage({ searchParams }) {
  const eleve = await getEleveConnecte();
  if (!eleve) {
    redirect("/connexion?next=/espace-eleve");
  }

  const isAdmin = eleve.groupe_id === "admin-all";
  // Un compte peut suivre deux cours : ?cours=<groupe> choisit celui qu'on
  // affiche (le premier par défaut). Un compte admin peut ouvrir n'importe
  // quel cours et voit exactement ce que voient les élèves de ce groupe.
  const mesGroupes = isAdmin ? GROUPES.map((g) => g.id) : groupesDeEleve(eleve);
  const coursDemande = searchParams?.cours;
  const idGroupeEleve = mesGroupes.includes(coursDemande) ? coursDemande : mesGroupes[0];
  const groupe = getGroupeAvecZoom(idGroupeEleve);

  const groupeAffiche = idGroupeEleve;
  const [seances, devoirsParSeance, ressourcesCours] = groupeAffiche
    ? await Promise.all([
        listerSeancesGroupe(groupeAffiche),
        listerDevoirsGroupe(groupeAffiche, eleve.identifiant),
        listerRessourcesCours(groupeAffiche),
      ])
    : [[], new Map(), []];

  // On met en avant le prochain cours (ou le dernier passé, si l'année est
  // terminée) plutôt que d'afficher 30 séances à plat.
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const indexProchaine = seances.findIndex((s) => s.date >= aujourdhui);
  const indexEnAvant = indexProchaine === -1 ? seances.length - 1 : indexProchaine;
  const seanceEnAvant = seances[indexEnAvant];
  const autresSeances = seances.filter((_, i) => i !== indexEnAvant);

  const salutation = isAdmin ? "Bonjour" : salutationPourLangue(groupe?.langue);
  const prenomAffiche = eleve.prenom || eleve.nom;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <EspaceHeader
        label={isAdmin ? "Espace admin" : "Espace élève"}
        actionDeconnexion="/api/deconnexion"
        inscriptionsHref={isAdmin ? "/admin/inscriptions" : undefined}
      />

      <div className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <details className="mb-10 border border-ink/10 rounded-xl bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-ink text-sm flex items-center gap-3">
            <Avatar prenom={eleve.prenom} nom={eleve.nom} photoChemin={eleve.photo_chemin} taille={8} />
            <span className="flex-1">
              {salutation} {prenomAffiche}
            </span>
            <span>⌄</span>
          </summary>
          <div className="px-4 pb-4 pt-1 border-t border-ink/5">
            <ProfilForm prenom={eleve.prenom} nom={eleve.nom} photoChemin={eleve.photo_chemin} />
          </div>
        </details>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <h1 className="font-display font-extrabold text-3xl text-ink mb-8">
              {isAdmin ? "Aperçu des cours" : mesGroupes.length > 1 ? "Mes cours" : "Mon cours"}
            </h1>

            {isAdmin && (
              <p className="bg-sage-800/10 text-sage-900 text-sm rounded-lg px-4 py-3 mb-4">
                👁️ Aperçu admin : choisis un cours, tu vois exactement ce que voient ses élèves.
              </p>
            )}

            {mesGroupes.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {mesGroupes.map((id) => {
                  const g = getGroupeAvecZoom(id);
                  const actif = id === idGroupeEleve;
                  return (
                    <Link
                      key={id}
                      href={`/espace-eleve?cours=${id}`}
                      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                        actif ? "bg-sage-800 text-cream" : "bg-white border border-ink/15 text-ink/70 hover:text-ink"
                      }`}
                    >
                      {g ? `${g.langue} - ${g.niveau}` : id}
                    </Link>
                  );
                })}
              </div>
            )}

            {!groupe ? (
              <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-12">
                Groupe introuvable - contacte l&rsquo;équipe Sema.
              </p>
            ) : (
              <div className="bg-sage-800 text-cream rounded-2xl p-8 mb-12 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">{groupe.jour}</p>
                <p className="font-display font-extrabold text-2xl mb-1">
                  {groupe.langue} - {groupe.niveau}
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
                  Un dossier par date de cours - documents à télécharger, replay, et zone pour remettre ton devoir.
                </p>

                {seanceEnAvant && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-terracotta-600 uppercase tracking-widest mb-2">
                      {indexProchaine === -1 ? "Dernier cours" : "Prochain cours"}
                    </p>
                    <SeanceEleve
                      seance={seanceEnAvant}
                      devoirInitial={devoirsParSeance.get(seanceEnAvant.id)?.[0] || null}
                      ouvertParDefaut
                      enAvant
                    />
                  </div>
                )}

                {autresSeances.length > 0 && (
                  <details className="border border-ink/10 rounded-xl bg-white">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink/70 hover:text-ink transition">
                      Voir les autres séances ({autresSeances.length})
                    </summary>
                    <div className="px-3 pb-3 pt-1 space-y-2 border-t border-ink/5">
                      {autresSeances.map((seance) => (
                        <SeanceEleve
                          key={seance.id}
                          seance={seance}
                          devoirInitial={devoirsParSeance.get(seance.id)?.[0] || null}
                        />
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}
          </div>

          {groupeAffiche && (
            <div className="lg:sticky lg:top-8">
              <DossierCours key={groupeAffiche} groupeId={groupeAffiche} ressourcesInitiales={ressourcesCours} />
              <MembresGroupe groupeId={groupeAffiche} />
              <Chat
                groupeId={groupeAffiche}
                role="eleve"
                moi={{ prenom: eleve.prenom, nom: eleve.nom }}
                titre="Forum du groupe"
                description="Pose une question, tague quelqu'un avec @ ou écris à tout le groupe (prof et admin y compris)."
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
