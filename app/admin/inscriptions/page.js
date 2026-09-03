import { redirect } from "next/navigation";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GROUPES, FORMULES } from "@/lib/content";
import EspaceHeader from "../../components/EspaceHeader";
import Footer from "../../components/Footer";

const STATUT_STYLE = {
  en_attente: "bg-cream text-ink/70",
  payee: "bg-sage-800 text-cream",
};

function libelleGroupe(groupeId) {
  const g = GROUPES.find((g) => g.id === groupeId);
  return g ? `${g.langue} - ${g.niveau}` : groupeId || "-";
}

function libelleFormule(formuleId) {
  const f = FORMULES.find((f) => f.id === formuleId);
  return f ? f.nom : formuleId || "-";
}

// Réservé aux comptes admin-all (élève ou prof) - liste toutes les
// inscriptions reçues, les plus récentes en premier. Simple vue de
// consultation, pas de notification automatique associée (voir la
// discussion sur l'e-mail de notif, mise de côté pour l'instant).
export default async function AdminInscriptionsPage() {
  const [eleve, prof] = await Promise.all([getEleveConnecte(), getProfConnecte()]);
  const estAdmin = eleve?.groupe_id === "admin-all" || prof?.groupes.includes("admin-all");
  if (!estAdmin) {
    redirect("/connexion");
  }
  const actionDeconnexion = eleve ? "/api/deconnexion" : "/api/deconnexion-prof";

  let inscriptions = [];
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("inscriptions").select("*").order("created_at", { ascending: false });
    inscriptions = data || [];
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <EspaceHeader label="Espace admin" actionDeconnexion={actionDeconnexion} />

      <div className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h1 className="font-display font-extrabold text-3xl text-ink">Inscriptions</h1>
          <a href="/espace-prof" className="text-sm text-terracotta-600 hover:underline">
            ← Retour aux groupes
          </a>
        </div>
        <p className="text-ink/50 text-sm mb-8">
          {inscriptions.length} inscription{inscriptions.length > 1 ? "s" : ""} reçue
          {inscriptions.length > 1 ? "s" : ""} - les plus récentes en premier.
        </p>

        {inscriptions.length === 0 ? (
          <p className="text-sm text-ink/40">Aucune inscription pour l&rsquo;instant.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm bg-white rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-sage-800 text-cream text-left">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Nom</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Contact</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Cours</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Formule</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Statut</th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map((i) => (
                  <tr key={i.id} className="border-t border-ink/5">
                    <td className="px-4 py-3 whitespace-nowrap text-ink/60">
                      {new Date(i.created_at).toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-ink">
                      {i.prenom} {i.nom}
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      <div>{i.email}</div>
                      <div className="text-xs text-ink/50">{i.telephone}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink/70">{libelleGroupe(i.groupe_id)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink/70">{libelleFormule(i.formule_id)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block text-xs font-semibold rounded-full px-3 py-1 ${
                          STATUT_STYLE[i.statut] || "bg-cream text-ink/70"
                        }`}
                      >
                        {i.statut === "payee" ? "Payée" : "En attente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
