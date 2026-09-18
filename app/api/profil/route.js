import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";

// Met à jour le profil (prénom, nom, photo) de la personne connectée —
// élève ou prof, peu importe, on détecte via la session active. Chacun ne
// peut modifier que son propre profil. La photo a déjà été envoyée
// directement à Supabase Storage via une URL signée (voir
// POST /api/profil/upload-url) avant cet appel.
export async function PATCH(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const [eleve, prof] = await Promise.all([getEleveConnecte(), getProfConnecte()]);
  const identite = eleve || prof;
  if (!identite) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const table = eleve ? "eleves" : "profs";

  const { prenom, nom, cheminStorage } = await request.json();

  const patch = {};
  if (prenom?.trim()) patch.prenom = prenom.trim();
  if (nom?.trim()) patch.nom = nom.trim();
  if (cheminStorage) patch.photo_chemin = cheminStorage;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Rien à enregistrer." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from(table).update(patch).eq("identifiant", identite.identifiant);
  if (error) {
    return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...patch });
}
