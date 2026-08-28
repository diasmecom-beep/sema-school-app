import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";
import { BUCKET_FICHIERS, groupeIdDepuisSeanceId, seanceIdDepuisChemin } from "@/lib/fichiers";

// Point de passage OBLIGÉ pour tout téléchargement (matériau de cours ou
// devoir remis) : vérifie que la personne connectée a le droit de voir ce
// fichier précis, puis redirige vers une URL signée à durée de vie courte.
// Aucun chemin de stockage n'est jamais exposé directement au navigateur.
export async function GET(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const chemin = new URL(request.url).searchParams.get("chemin");
  if (!chemin) {
    return NextResponse.json({ error: "Chemin manquant." }, { status: 400 });
  }

  const seanceId = seanceIdDepuisChemin(chemin);
  const groupeId = groupeIdDepuisSeanceId(seanceId);
  if (!groupeId) {
    return NextResponse.json({ error: "Chemin invalide." }, { status: 400 });
  }

  const [eleve, prof] = await Promise.all([getEleveConnecte(), getProfConnecte()]);

  let autorise = false;
  if (prof && (prof.groupes.includes(groupeId) || prof.groupes.includes("admin-all"))) {
    autorise = true;
  } else if (eleve && (eleve.groupe_id === groupeId || eleve.groupe_id === "admin-all")) {
    // Un devoir n'est visible par un élève que si c'est le sien.
    const estDevoir = chemin.startsWith("devoirs/");
    if (!estDevoir || chemin.includes(`/${eleve.identifiant}/`)) {
      autorise = true;
    }
  }

  if (!autorise) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.storage.from(BUCKET_FICHIERS).createSignedUrl(chemin, 60);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
