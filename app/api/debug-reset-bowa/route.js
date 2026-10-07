import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE : nouveau mot de passe pour Biselele Bowa, renvoyé une
// seule fois dans la réponse (protégée par un jeton).
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "6d3dbac51a3ee5687d94d196") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const { data: eleve } = await supabaseAdmin
    .from("eleves")
    .select("id, identifiant, prenom, nom")
    .eq("email", "jbbiselele@yahoo.com")
    .maybeSingle();
  if (!eleve) {
    return NextResponse.json({ error: "Élève introuvable." }, { status: 404 });
  }

  const motDePasse = generateCodeAcces();
  const { error } = await supabaseAdmin
    .from("eleves")
    .update({ code_acces_hash: hashCode(motDePasse) })
    .eq("id", eleve.id);
  if (error) {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    nom: `${eleve.prenom} ${eleve.nom}`,
    identifiant: eleve.identifiant.toLowerCase(),
    motDePasse,
  });
}
