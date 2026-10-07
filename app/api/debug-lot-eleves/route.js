import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";
import { genererIdentifiantUnique } from "@/lib/identifiantEleve";

export const dynamic = "force-dynamic";

const ID_INSCRIPTION_NOAH = "b61a80ce-85d8-4957-b09e-253d10a49af6";

// Route TEMPORAIRE (jeton) : 1) nouveau mot de passe pour le 2e compte de
// Laura (LLOPONGO2), 2) création du compte de Noah Badibanga (paiement
// confirmé par l'équipe hors Stripe). Les identifiants sont renvoyés une
// seule fois dans la réponse.
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "cba0a0e5760a4304bd251177") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const resultats = {};

  // 1) Laura - 2e compte
  const { data: laura2 } = await supabaseAdmin
    .from("eleves")
    .select("id, identifiant")
    .eq("identifiant", "LLOPONGO2")
    .maybeSingle();
  if (!laura2) {
    return NextResponse.json({ error: "Compte LLOPONGO2 introuvable." }, { status: 404 });
  }
  const mdpLaura = generateCodeAcces();
  const { error: erreurLaura } = await supabaseAdmin
    .from("eleves")
    .update({ code_acces_hash: hashCode(mdpLaura) })
    .eq("id", laura2.id);
  if (erreurLaura) {
    return NextResponse.json({ error: "Mise à jour Laura impossible." }, { status: 500 });
  }
  resultats.laura2 = { identifiant: laura2.identifiant.toLowerCase(), motDePasse: mdpLaura };

  // 2) Noah - création du compte (uniquement si pas déjà fait)
  const { data: inscription } = await supabaseAdmin
    .from("inscriptions")
    .select("*")
    .eq("id", ID_INSCRIPTION_NOAH)
    .maybeSingle();
  if (!inscription) {
    return NextResponse.json({ error: "Inscription de Noah introuvable.", resultats }, { status: 404 });
  }
  const { data: dejaEleve } = await supabaseAdmin
    .from("eleves")
    .select("id")
    .eq("email", inscription.email)
    .maybeSingle();
  if (dejaEleve) {
    return NextResponse.json({ error: "Noah a déjà un compte.", resultats }, { status: 409 });
  }

  const identifiant = await genererIdentifiantUnique(inscription.prenom, inscription.nom);
  const mdpNoah = generateCodeAcces();
  const { error: erreurEleve } = await supabaseAdmin.from("eleves").insert({
    identifiant,
    code_acces_hash: hashCode(mdpNoah),
    nom: inscription.nom,
    prenom: inscription.prenom,
    email: inscription.email,
    groupe_id: inscription.groupe_id,
    statut: "actif",
  });
  if (erreurEleve) {
    return NextResponse.json({ error: "Création du compte de Noah impossible.", resultats }, { status: 500 });
  }
  await supabaseAdmin.from("inscriptions").update({ statut: "payee" }).eq("id", ID_INSCRIPTION_NOAH);
  resultats.noah = { identifiant: identifiant.toLowerCase(), motDePasse: mdpNoah };

  return NextResponse.json({ ok: true, resultats });
}
