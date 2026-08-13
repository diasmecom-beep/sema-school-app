import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { getGroupeAvecZoom, getTousLesGroupesAvecZoom } from "@/lib/groupesZoom";

export default async function EspaceElevePage() {
  const cookieValue = cookies().get(SESSION_COOKIE)?.value;
  const identifiant = await verifySession(cookieValue);

  if (!identifiant || !supabaseAdmin) {
    redirect("/connexion?next=/espace-eleve");
  }

  const { data: eleve } = await supabaseAdmin
    .from("eleves")
    .select("identifiant, nom, groupe_id, statut")
    .eq("identifiant", identifiant)
    .single();

  if (!eleve || eleve.statut !== "actif") {
    redirect("/connexion?next=/espace-eleve");
  }

  const isAdmin = eleve.groupe_id === "admin-all";
  const groupe = isAdmin ? null : getGroupeAvecZoom(eleve.groupe_id);
  const tousLesGroupes = isAdmin ? getTousLesGroupesAvecZoom() : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <p className="text-terracotta-600 font-bold tracking-widest text-sm">
          ESPACE ÉLÈVE · {eleve.nom} {isAdmin && "· ADMIN"}
        </p>
        <form action="/api/deconnexion" method="POST">
          <button type="submit" className="text-sm text-ink/40 hover:text-ink transition">
            Déconnexion
          </button>
        </form>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-ink mb-8">
        {isAdmin ? "Tous les cours" : "Mon cours"}
      </h1>

      {isAdmin ? (
        <div className="space-y-4">
          {tousLesGroupes.map((g) => (
            <div key={g.id} className="bg-sage-800 text-cream rounded-2xl p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">{g.jour}</p>
                <p className="font-display font-extrabold text-lg">
                  {g.langue} — {g.niveau}
                </p>
                <p className="text-cream/80 text-sm">{g.horaire}</p>
              </div>
              {g.zoomLink ? (
                <a
                  href={g.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 bg-cream text-sage-900 font-semibold rounded-full px-5 py-2.5 text-sm hover:opacity-90 transition"
                >
                  Rejoindre
                </a>
              ) : (
                <p className="shrink-0 text-xs text-cream/60">Lien non configuré</p>
              )}
            </div>
          ))}
        </div>
      ) : !groupe ? (
        <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
          Groupe introuvable — contacte l&rsquo;équipe Sema.
        </p>
      ) : (
        <div className="bg-sage-800 text-cream rounded-2xl p-8">
          <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">{groupe.jour}</p>
          <p className="font-display font-extrabold text-2xl mb-1">
            {groupe.langue} — {groupe.niveau}
          </p>
          <p className="text-cream/80 mb-6">{groupe.horaire}</p>

          {groupe.zoomLink ? (
            <a
              href={groupe.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-cream text-sage-900 font-semibold rounded-full px-6 py-3 hover:opacity-90 transition"
            >
              Rejoindre le cours
            </a>
          ) : (
            <p className="text-sm text-cream/70">
              Le lien Zoom de ce groupe n&rsquo;est pas encore configuré — contacte l&rsquo;équipe Sema.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
