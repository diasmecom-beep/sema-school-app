import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GROUPES, FORMULES } from "@/lib/content";
import { ajouterJoursOuvrables } from "@/lib/joursOuvrables";
import { envoyerRelancePaiement } from "@/lib/email";

const JOURS_OUVRABLES_AVANT_RELANCE = 7;

// Appelée quotidiennement par Vercel Cron (voir vercel.json) - envoie un
// rappel unique à chaque inscription restée "en_attente" plus de 7 jours
// ouvrables, avec le lien Stripe correspondant à la formule choisie.
// Protégée par CRON_SECRET pour éviter qu'un tiers ne déclenche l'envoi.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const { data: inscriptions, error } = await supabaseAdmin
    .from("inscriptions")
    .select("*")
    .eq("statut", "en_attente")
    .is("relance_envoyee_at", null);

  if (error) {
    console.error("Erreur récupération inscriptions pour relance:", error);
    return NextResponse.json({ error: "Échec de la récupération." }, { status: 500 });
  }

  const maintenant = new Date();
  const resultats = [];

  for (const inscription of inscriptions || []) {
    // Sans formule choisie, ou sans lien Stripe connu, on ne peut pas
    // proposer de relance exploitable - on laisse pour une relance manuelle.
    const formule = FORMULES.find((f) => f.id === inscription.formule_id);
    if (!formule?.stripeLink) continue;

    const dateEligible = ajouterJoursOuvrables(new Date(inscription.created_at), JOURS_OUVRABLES_AVANT_RELANCE);
    if (maintenant < dateEligible) continue;

    const groupe = GROUPES.find((g) => g.id === inscription.groupe_id);
    const { envoye, envoyeAdmin } = await envoyerRelancePaiement({
      prenom: inscription.prenom,
      nom: inscription.nom,
      email: inscription.email,
      coursLabel: groupe ? `${groupe.langue}, niveau ${groupe.niveau}` : inscription.groupe_id,
      formuleNom: formule.nom,
      formulePrix: formule.prix,
      stripeLink: formule.stripeLink,
    });

    await supabaseAdmin
      .from("inscriptions")
      .update({ relance_envoyee_at: maintenant.toISOString() })
      .eq("id", inscription.id);

    resultats.push({ id: inscription.id, prenom: inscription.prenom, nom: inscription.nom, envoye, envoyeAdmin });
  }

  return NextResponse.json({ relancesEnvoyees: resultats.length, resultats });
}
