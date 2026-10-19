import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";
import { genererIdentifiantUnique } from "@/lib/identifiantEleve";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE (jeton) : crée le compte élève de Curtis Abeke (Lingala
// intermédiaire). Les identifiants sont renvoyés une seule fois dans la réponse.
const EMAIL = "abeke.curtis@gmail.com";

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "a75efc36ad5bc9186feaf066") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const { data: dejaEleve } = await supabaseAdmin.from("eleves").select("identifiant").eq("email", EMAIL).maybeSingle();
  if (dejaEleve) {
    return NextResponse.json({ error: "Un compte existe déjà pour cette adresse." }, { status: 409 });
  }

  const identifiant = await genererIdentifiantUnique("Curtis", "Abeke");
  const motDePasse = generateCodeAcces();
  const { error } = await supabaseAdmin.from("eleves").insert({
    identifiant,
    code_acces_hash: hashCode(motDePasse),
    nom: "Abeke",
    prenom: "Curtis",
    email: EMAIL,
    groupe_id: "lingala-intermediaire",
    statut: "actif",
  });
  if (error) {
    return NextResponse.json({ error: "Création du compte impossible.", detail: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, identifiant: identifiant.toLowerCase(), motDePasse });
}
