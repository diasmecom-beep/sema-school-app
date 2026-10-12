import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE : nouveau code d'accès pour le prof de Tshiluba
// intermédiaire (PROF-YKXQVH), renvoyé une seule fois dans la réponse
// (protégée par un jeton).
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "59dc29da679a960a69a65f0c") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const { data: prof, error: erreurLecture } = await supabaseAdmin
    .from("profs")
    .select("identifiant, nom, groupes")
    .eq("identifiant", "PROF-YKXQVH")
    .maybeSingle();
  if (!prof) {
    return NextResponse.json({ error: "Prof introuvable.", detail: erreurLecture?.message || null }, { status: 404 });
  }

  const codeAcces = generateCodeAcces();
  const { error } = await supabaseAdmin
    .from("profs")
    .update({ code_acces_hash: hashCode(codeAcces) })
    .eq("identifiant", prof.identifiant);
  if (error) {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, identifiant: prof.identifiant, codeAcces, groupes: prof.groupes });
}
