import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE : nouveaux mots de passe pour 3 élèves, renvoyés une seule
// fois dans la réponse (protégée par un jeton) pour rédiger les e-mails.
const EMAILS = ["dimitripinzi@gmail.com", "wmkinwani@gmail.com", "chdekeyser@hotmail.com"];

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "73922225baef96a18e051b09") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const { data: eleves } = await supabaseAdmin
    .from("eleves")
    .select("id, identifiant, prenom, nom, email, groupe_id")
    .in("email", EMAILS);
  if (!eleves || eleves.length !== EMAILS.length) {
    return NextResponse.json({ error: "Élèves introuvables ou en nombre inattendu." }, { status: 404 });
  }

  const resultats = [];
  for (const eleve of eleves) {
    const motDePasse = generateCodeAcces();
    const { error } = await supabaseAdmin
      .from("eleves")
      .update({ code_acces_hash: hashCode(motDePasse) })
      .eq("id", eleve.id);
    if (error) {
      return NextResponse.json({ error: "Mise à jour impossible.", pour: eleve.email }, { status: 500 });
    }
    resultats.push({
      nom: `${eleve.prenom} ${eleve.nom}`,
      email: eleve.email,
      identifiant: eleve.identifiant.toLowerCase(),
      motDePasse,
    });
  }
  return NextResponse.json({ ok: true, resultats });
}
