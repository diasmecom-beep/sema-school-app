import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProfConnecte } from "@/lib/profs";
import { groupeIdDepuisSeanceId } from "@/lib/fichiers";

export async function PATCH(request, { params }) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const prof = await getProfConnecte();
  if (!prof) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const seanceId = decodeURIComponent(params.id);
  const groupeId = groupeIdDepuisSeanceId(seanceId);
  if (!prof.groupes.includes(groupeId) && !prof.groupes.includes("admin-all")) {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  const body = await request.json();
  const date = body.date;
  const patch = {};
  if ("echeanceDevoir" in body) patch.echeance_devoir = body.echeanceDevoir || null;
  if ("notes" in body) patch.notes = body.notes ?? "";
  if ("replayLien" in body) patch.replay_lien = body.replayLien ?? "";

  const { error } = await supabaseAdmin
    .from("seances")
    .upsert({ id: seanceId, groupe_id: groupeId, date, ...patch }, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
