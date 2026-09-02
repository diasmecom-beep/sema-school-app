import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProfConnecte } from "@/lib/profs";
import { groupeIdDepuisSeanceId } from "@/lib/fichiers";

// Permet au prof de laisser un commentaire (et une note libre) sur un
// devoir remis par un élève de son groupe - visible ensuite par l'élève
// dans son espace (voir SeanceEleve.js).
export async function PATCH(request, { params }) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const prof = await getProfConnecte();
  if (!prof) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { data: devoir } = await supabaseAdmin
    .from("devoirs_remis")
    .select("id, seance_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!devoir) {
    return NextResponse.json({ error: "Devoir introuvable." }, { status: 404 });
  }

  const groupeId = groupeIdDepuisSeanceId(devoir.seance_id);
  if (!prof.groupes.includes(groupeId) && !prof.groupes.includes("admin-all")) {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  const { note, commentaire } = await request.json();

  const { error } = await supabaseAdmin
    .from("devoirs_remis")
    .update({
      note: note?.trim() || null,
      commentaire_prof: commentaire?.trim() || null,
      commente_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
