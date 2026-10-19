import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProfConnecte } from "@/lib/profs";
import { GROUPES } from "@/lib/content";
import { BUCKET_FICHIERS } from "@/lib/fichiers";
import { idDossierCours } from "@/lib/ressourcesCours";

const TYPES_VALIDES = ["pdf", "image", "lien", "audio"];

function profAGroupe(prof, groupeId) {
  return prof.groupes.includes(groupeId) || prof.groupes.includes("admin-all");
}

// Ajout d'un document au dossier "Cours" d'un groupe. Le fichier a déjà été
// envoyé directement à Supabase Storage via /api/materiaux/upload-url (avec
// seanceId = "<groupe>__cours") - on n'enregistre ici que les métadonnées.
export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }
  const prof = await getProfConnecte();
  if (!prof) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { groupeId, type, titre, url: lien, cheminStorage } = await request.json();
  const titreNormalise = titre?.trim();
  if (!GROUPES.some((g) => g.id === groupeId) || !titreNormalise || !TYPES_VALIDES.includes(type)) {
    return NextResponse.json({ error: "Champs manquants ou invalides." }, { status: 400 });
  }
  if (!profAGroupe(prof, groupeId)) {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  let url = lien?.trim();
  if (type !== "lien") {
    // Le chemin doit bien appartenir au dossier Cours de CE groupe.
    if (!cheminStorage || !cheminStorage.startsWith(`materiaux/${idDossierCours(groupeId)}/`)) {
      return NextResponse.json({ error: "Fichier manquant ou invalide." }, { status: 400 });
    }
    url = `/api/fichier?chemin=${encodeURIComponent(cheminStorage)}`;
  } else if (!url) {
    return NextResponse.json({ error: "Lien manquant." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("ressources_cours")
    .insert({
      groupe_id: groupeId,
      type,
      titre: titreNormalise,
      url,
      chemin_storage: type !== "lien" ? cheminStorage : null,
    })
    .select("id, type, titre, url, created_at")
    .single();

  if (error) return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  return NextResponse.json({ ok: true, ressource: data });
}

export async function DELETE(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }
  const prof = await getProfConnecte();
  if (!prof) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Id manquant." }, { status: 400 });

  const { data: ressource } = await supabaseAdmin
    .from("ressources_cours")
    .select("id, groupe_id, chemin_storage")
    .eq("id", id)
    .single();
  if (!ressource) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  if (!profAGroupe(prof, ressource.groupe_id)) {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  if (ressource.chemin_storage) {
    await supabaseAdmin.storage.from(BUCKET_FICHIERS).remove([ressource.chemin_storage]);
  }
  await supabaseAdmin.from("ressources_cours").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
