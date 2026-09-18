import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getProfConnecte } from "@/lib/profs";
import { BUCKET_FICHIERS, TAILLE_MAX_OCTETS, cheminMateriau, groupeIdDepuisSeanceId } from "@/lib/fichiers";

// Étape 1 de l'envoi d'un document de cours : génère une URL signée pour que
// le navigateur envoie le fichier directement à Supabase Storage, sans
// passer par le serveur du site - Vercel refuse les requêtes de plus de
// ~4,5 Mo sur ses fonctions serverless, bien en dessous de nos besoins
// (audio de cours, PDF illustrés). Voir POST /api/materiaux pour l'étape 2
// (enregistrement des métadonnées une fois le fichier envoyé).
export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const prof = await getProfConnecte();
  if (!prof) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { seanceId, nomFichier, tailleOctets } = await request.json();
  if (!seanceId || !nomFichier) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }
  if (tailleOctets && tailleOctets > TAILLE_MAX_OCTETS) {
    return NextResponse.json(
      { error: `Le fichier dépasse la taille maximale autorisée (${TAILLE_MAX_OCTETS / (1024 * 1024)} Mo).` },
      { status: 400 }
    );
  }

  const groupeId = groupeIdDepuisSeanceId(seanceId);
  if (!prof.groupes.includes(groupeId) && !prof.groupes.includes("admin-all")) {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  const chemin = cheminMateriau(seanceId, nomFichier);
  const { data, error } = await supabaseAdmin.storage.from(BUCKET_FICHIERS).createSignedUploadUrl(chemin);
  if (error) {
    console.error("Échec préparation upload matériau:", error);
    return NextResponse.json({ error: "Impossible de préparer l'envoi." }, { status: 500 });
  }

  return NextResponse.json({ chemin, token: data.token });
}
