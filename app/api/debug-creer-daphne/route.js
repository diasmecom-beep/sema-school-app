import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";
import { genererIdentifiantUnique } from "@/lib/identifiantEleve";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE (jeton) : réinscription de Daphné Mulongo payée hors
// Stripe (260 €, Annuel). Crée l'inscription (payée) et le compte élève.
// Les identifiants sont renvoyés une seule fois dans la réponse.
const EMAIL = "daphne.mulongo@hotmail.fr";

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "a2e562640f78847119fedb63") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const { data: dejaEleve } = await supabaseAdmin.from("eleves").select("id").eq("email", EMAIL).maybeSingle();
  if (dejaEleve) {
    return NextResponse.json({ error: "Un compte existe déjà pour cette adresse." }, { status: 409 });
  }

  const { error: erreurInscription } = await supabaseAdmin.from("inscriptions").insert({
    prenom: "Daphné",
    nom: "Mulongo",
    email: EMAIL,
    telephone: "Non renseigne",
    annee_naissance: "Non renseigne",
    pays_residence: "Non renseigne",
    groupe_id: "swahili-intermediaire",
    attentes: "Non renseigne",
    connu_via: "Réinscription",
    formule_id: "annuel",
    statut: "payee",
  });
  if (erreurInscription) {
    return NextResponse.json({ error: "Création de l'inscription impossible.", detail: erreurInscription.message }, { status: 500 });
  }

  const identifiant = await genererIdentifiantUnique("Daphné", "Mulongo");
  const motDePasse = generateCodeAcces();
  const { error: erreurEleve } = await supabaseAdmin.from("eleves").insert({
    identifiant,
    code_acces_hash: hashCode(motDePasse),
    nom: "Mulongo",
    prenom: "Daphné",
    email: EMAIL,
    groupe_id: "swahili-intermediaire",
    statut: "actif",
  });
  if (erreurEleve) {
    return NextResponse.json({ error: "Création du compte impossible.", detail: erreurEleve.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, identifiant: identifiant.toLowerCase(), motDePasse });
}
