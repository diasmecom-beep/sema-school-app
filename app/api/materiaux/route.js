import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProfConnecte } from "@/lib/profs";
import { assurerSeance } from "@/lib/seances";
import { BUCKET_FICHIERS, groupeIdDepuisSeanceId } from "@/lib/fichiers";

const TYPES_VALIDES = ["pdf", "image", "lien", "audio"];

// Le fichier lui-même a déjà été envoyé directement à Supabase Storage via
// une URL signée (voir POST /api/materiaux/upload-url) avant cet appel -
// on ne reçoit ici que les métadonnées, pas de flux binaire, pour ne pas
// dépendre de la limite de taille des requêtes de Vercel.
export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const prof = await getProfConnecte();
  if (!prof) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { seanceId, date, type, titre, url: lien, cheminStorage } = await request.json();
  const titreNormalise = titre?.trim();

  if (!seanceId || !date || !titreNormalise || !TYPES_VALIDES.includes(type)) {
    return NextResponse.json({ error: "Champs manquants ou invalides." }, { status: 400 });
  }

  const groupeId = groupeIdDepuisSeanceId(seanceId);
  if (!prof.groupes.includes(groupeId) && !prof.groupes.includes("admin-all")) {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  await assurerSeance(groupeId, date);

  let url = lien?.trim();

  if (type !== "lien") {
    if (!cheminStorage) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }
    url = `/api/fichier?chemin=${encodeURIComponent(cheminStorage)}`;
  } else if (!url) {
    return NextResponse.json({ error: "Lien manquant." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("materiaux")
    .insert({ seance_id: seanceId, type, titre: titreNormalise, url, chemin_storage: type !== "lien" ? cheminStorage : null })
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
