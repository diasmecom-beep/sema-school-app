import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProfConnecte } from "@/lib/profs";
import { assurerSeance } from "@/lib/seances";
import { BUCKET_FICHIERS, cheminMateriau, groupeIdDepuisSeanceId } from "@/lib/fichiers";

const TYPES_FICHIER = { pdf: "application/pdf", image: "image", audio: "audio/mpeg" };
const TYPES_VALIDES = ["pdf", "image", "lien", "audio"];

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const prof = await getProfConnecte();
  if (!prof) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const form = await request.formData();
  const seanceId = form.get("seanceId");
  const date = form.get("date");
  const type = form.get("type");
  const titre = form.get("titre")?.toString().trim();
  const lien = form.get("url")?.toString().trim();
  const fichier = form.get("fichier");

  if (!seanceId || !date || !titre || !TYPES_VALIDES.includes(type)) {
    return NextResponse.json({ error: "Champs manquants ou invalides." }, { status: 400 });
  }

  const groupeId = groupeIdDepuisSeanceId(seanceId);
  if (!prof.groupes.includes(groupeId) && !prof.groupes.includes("admin-all")) {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  await assurerSeance(groupeId, date);

  let url = lien;
  let cheminStorage = null;

  if (type !== "lien") {
    if (!fichier || typeof fichier === "string") {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }
    cheminStorage = cheminMateriau(seanceId, fichier.name);
    const buffer = Buffer.from(await fichier.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_FICHIERS)
      .upload(cheminStorage, buffer, { contentType: fichier.type || TYPES_FICHIER[type] });
    if (uploadError) {
      return NextResponse.json({ error: "Échec de l'envoi du fichier." }, { status: 500 });
    }
    url = `/api/fichier?chemin=${encodeURIComponent(cheminStorage)}`;
  } else if (!lien) {
    return NextResponse.json({ error: "Lien manquant." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("materiaux")
    .insert({ seance_id: seanceId, type, titre, url, chemin_storage: cheminStorage })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, materiau: data });
}

export async function DELETE(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const prof = await getProfConnecte();
  if (!prof) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Id manquant." }, { status: 400 });

  const { data: materiau } = await supabaseAdmin
    .from("materiaux")
    .select("id, seance_id, chemin_storage")
    .eq("id", id)
    .single();
  if (!materiau) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const groupeId = groupeIdDepuisSeanceId(materiau.seance_id);
  if (!prof.groupes.includes(groupeId) && !prof.groupes.includes("admin-all")) {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  if (materiau.chemin_storage) {
    await supabaseAdmin.storage.from(BUCKET_FICHIERS).remove([materiau.chemin_storage]);
  }
  await supabaseAdmin.from("materiaux").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
