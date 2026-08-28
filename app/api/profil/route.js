import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";
import { BUCKET_FICHIERS, cheminAvatar } from "@/lib/fichiers";

// Met à jour le profil (prénom, nom, photo) de la personne connectée —
// élève ou prof, peu importe, on détecte via la session active. Chacun ne
// peut modifier que son propre profil.
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

  const form = await request.formData();
  const prenom = form.get("prenom")?.toString().trim();
  const nom = form.get("nom")?.toString().trim();
  const photo = form.get("photo");

  const patch = {};
  if (prenom) patch.prenom = prenom;
  if (nom) patch.nom = nom;

  if (photo && typeof photo !== "string" && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return NextResponse.json({ error: "La photo doit être une image." }, { status: 400 });
    }
    const cheminStorage = cheminAvatar(identite.identifiant, photo.name);
    const buffer = Buffer.from(await photo.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_FICHIERS)
      .upload(cheminStorage, buffer, { contentType: photo.type });
    if (uploadError) {
      return NextResponse.json({ error: "Échec de l'envoi de la photo." }, { status: 500 });
    }
    patch.photo_chemin = cheminStorage;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Rien à enregistrer." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from(table).update(patch).eq("identifiant", identite.identifiant);
  if (error) {
    return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...patch });
}
