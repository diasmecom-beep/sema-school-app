import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { assurerSeance } from "@/lib/seances";
import { BUCKET_FICHIERS, TAILLE_MAX_OCTETS, cheminDevoir, groupeIdDepuisSeanceId } from "@/lib/fichiers";

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const eleve = await getEleveConnecte();
  if (!eleve) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const form = await request.formData();
  const seanceId = form.get("seanceId");
  const date = form.get("date");
  const fichier = form.get("fichier");

  if (!seanceId || !date || !fichier || typeof fichier === "string") {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }
  if (fichier.size > TAILLE_MAX_OCTETS) {
    return NextResponse.json(
      { error: `Le fichier dépasse la taille maximale autorisée (${TAILLE_MAX_OCTETS / (1024 * 1024)} Mo).` },
      { status: 400 }
    );
  }

  const groupeId = groupeIdDepuisSeanceId(seanceId);
  if (eleve.groupe_id !== groupeId && eleve.groupe_id !== "admin-all") {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  await assurerSeance(groupeId, date);

  const cheminStorage = cheminDevoir(seanceId, eleve.identifiant, fichier.name);
  const buffer = Buffer.from(await fichier.arrayBuffer());
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_FICHIERS)
    .upload(cheminStorage, buffer, { contentType: fichier.type || "application/octet-stream" });
  if (uploadError) {
    console.error("Échec envoi fichier devoir:", uploadError);
    return NextResponse.json({ error: `Échec de l'envoi du fichier : ${uploadError.message}` }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("devoirs_remis")
    .insert({
      seance_id: seanceId,
      eleve_identifiant: eleve.identifiant,
      fichier_nom: fichier.name,
      chemin_storage: cheminStorage,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, devoir: data });
}
