import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";
import { BUCKET_FICHIERS, TAILLE_MAX_OCTETS, cheminAvatar } from "@/lib/fichiers";

// Étape 1 de l'envoi d'une photo de profil : génère une URL signée pour que
// le navigateur envoie le fichier directement à Supabase Storage. Voir
// PATCH /api/profil pour l'étape 2 (enregistrement une fois le fichier envoyé).
export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const [eleve, prof] = await Promise.all([getEleveConnecte(), getProfConnecte()]);
  const identite = eleve || prof;
  if (!identite) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { nomFichier, tailleOctets } = await request.json();
  if (!nomFichier) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }
  if (tailleOctets && tailleOctets > TAILLE_MAX_OCTETS) {
    return NextResponse.json(
      { error: `La photo dépasse la taille maximale autorisée (${TAILLE_MAX_OCTETS / (1024 * 1024)} Mo).` },
      { status: 400 }
    );
  }

  const chemin = cheminAvatar(identite.identifiant, nomFichier);
  const { data, error } = await supabaseAdmin.storage.from(BUCKET_FICHIERS).createSignedUploadUrl(chemin);
  if (error) {
    console.error("Échec préparation upload avatar:", error);
    return NextResponse.json({ error: "Impossible de préparer l'envoi." }, { status: 500 });
  }

  return NextResponse.json({ chemin, token: data.token });
}
