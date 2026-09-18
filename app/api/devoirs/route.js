import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { assurerSeance } from "@/lib/seances";
import { groupeIdDepuisSeanceId } from "@/lib/fichiers";

// Le fichier a déjà été envoyé directement à Supabase Storage via une URL
// signée (voir POST /api/devoirs/upload-url) avant cet appel - on ne reçoit
// ici que les métadonnées.
export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const eleve = await getEleveConnecte();
  if (!eleve) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { seanceId, date, fichierNom, cheminStorage } = await request.json();

  if (!seanceId || !date || !fichierNom || !cheminStorage) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }

  const groupeId = groupeIdDepuisSeanceId(seanceId);
  if (eleve.groupe_id !== groupeId && eleve.groupe_id !== "admin-all") {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  await assurerSeance(groupeId, date);

  const { data, error } = await supabaseAdmin
    .from("devoirs_remis")
    .insert({
      seance_id: seanceId,
      eleve_identifiant: eleve.identifiant,
      fichier_nom: fichierNom,
      chemin_storage: cheminStorage,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, devoir: data });
}
