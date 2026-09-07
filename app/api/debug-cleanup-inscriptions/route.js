import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Route de diagnostic TEMPORAIRE - supprime les inscriptions de test
// identifiées avec l'utilisateur (Achaiso Ambali, xx yy, Ww Ww, et le test
// de la notification e-mail). À supprimer une fois le nettoyage fait.
const A_SUPPRIMER = [
  { prenom: "Achaiso", nom: "Ambali" },
  { prenom: "xx", nom: "yy" },
  { prenom: "Ww", nom: "Ww" },
  { prenom: "TestNotif", nom: "QA" },
];

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const resultats = [];
  for (const { prenom, nom } of A_SUPPRIMER) {
    const { data, error } = await supabaseAdmin
      .from("inscriptions")
      .delete()
      .eq("prenom", prenom)
      .eq("nom", nom)
      .select("id");
    resultats.push({ prenom, nom, supprimees: data?.length || 0, erreur: error?.message || null });
  }

  return NextResponse.json({ resultats });
}
