import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";
import { genererIdentifiantUnique } from "@/lib/identifiantEleve";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE (jeton) : crée le compte élève de Sanka Badibanga (Lingala
// intermédiaire), sans adresse e-mail connue. Les identifiants sont renvoyés
// une seule fois dans la réponse.
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "fd56b2a0080a083573b9a772") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const { data: dejaEleve } = await supabaseAdmin
    .from("eleves")
    .select("identifiant")
    .eq("prenom", "Sanka")
    .eq("nom", "Badibanga")
    .maybeSingle();
  if (dejaEleve) {
    return NextResponse.json({ error: "Ce compte existe déjà.", identifiant: dejaEleve.identifiant }, { status: 409 });
  }

  const identifiant = await genererIdentifiantUnique("Sanka", "Badibanga");
  const motDePasse = generateCodeAcces();
  const ligne = {
    identifiant,
    code_acces_hash: hashCode(motDePasse),
    nom: "Badibanga",
    prenom: "Sanka",
    groupe_id: "lingala-intermediaire",
    statut: "actif",
  };

  let { error } = await supabaseAdmin.from("eleves").insert({ ...ligne, email: null });
  if (error) {
    // Colonne e-mail obligatoire : on enregistre une valeur vide.
    ({ error } = await supabaseAdmin.from("eleves").insert({ ...ligne, email: "" }));
  }
  if (error) {
    return NextResponse.json({ error: "Création du compte impossible.", detail: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, identifiant: identifiant.toLowerCase(), motDePasse });
}
