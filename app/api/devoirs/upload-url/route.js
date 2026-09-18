import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { BUCKET_FICHIERS, TAILLE_MAX_OCTETS, cheminDevoir, groupeIdDepuisSeanceId } from "@/lib/fichiers";

// Étape 1 de la remise d'un devoir : génère une URL signée pour que le
// navigateur envoie le fichier directement à Supabase Storage (utile
// notamment pour les devoirs oraux enregistrés, qui dépassent vite la
// limite de ~4,5 Mo des fonctions serverless Vercel). Voir POST /api/devoirs
// pour l'étape 2 (enregistrement une fois le fichier envoyé).
export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const eleve = await getEleveConnecte();
  if (!eleve) {
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
  if (eleve.groupe_id !== groupeId && eleve.groupe_id !== "admin-all") {
    return NextResponse.json({ error: "Ce n'est pas ton groupe." }, { status: 403 });
  }

  const chemin = cheminDevoir(seanceId, eleve.identifiant, nomFichier);
  const { data, error } = await supabaseAdmin.storage.from(BUCKET_FICHIERS).createSignedUploadUrl(chemin);
  if (error) {
    console.error("Échec préparation upload devoir:", error);
    return NextResponse.json({ error: "Impossible de préparer l'envoi." }, { status: 500 });
  }

  return NextResponse.json({ chemin, token: data.token });
}
