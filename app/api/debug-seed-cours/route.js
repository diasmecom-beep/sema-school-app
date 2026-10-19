import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GROUPES } from "@/lib/content";
import { BUCKET_FICHIERS, cheminMateriau } from "@/lib/fichiers";
import { idDossierCours } from "@/lib/ressourcesCours";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE (jeton) : dépose des PDF dans le dossier "Cours" de
// groupes, annonce chaque document dans le forum du groupe (message de
// l'équipe) et renvoie la liste des destinataires du groupe.
// POST { t, items: [{ groupeId, titre, nomFichier, base64 }] }
const ADMIN = { identifiant: "PROF-QFUZDB", nom: "Équipe Sema" };

export async function POST(request) {
  const { t, items } = await request.json();
  if (t !== "6fd9754353402dd342eb0930") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const resultats = [];
  for (const it of items) {
    if (!GROUPES.some((g) => g.id === it.groupeId)) {
      return NextResponse.json({ error: `Groupe inconnu : ${it.groupeId}`, resultats }, { status: 400 });
    }

    const { data: existant } = await supabaseAdmin
      .from("ressources_cours")
      .select("id")
      .eq("groupe_id", it.groupeId)
      .eq("titre", it.titre)
      .maybeSingle();
    if (existant) {
      resultats.push({ groupeId: it.groupeId, titre: it.titre, statut: "déjà présent" });
      continue;
    }

    const buffer = Buffer.from(it.base64, "base64");
    const chemin = cheminMateriau(idDossierCours(it.groupeId), it.nomFichier);
    const { error: erreurUpload } = await supabaseAdmin.storage
      .from(BUCKET_FICHIERS)
      .upload(chemin, buffer, { contentType: "application/pdf", upsert: false });
    if (erreurUpload) {
      return NextResponse.json({ error: "Upload impossible.", detail: erreurUpload.message, resultats }, { status: 500 });
    }

    // Vérifie que le fichier est bien relisible et complet.
    const { data: signe } = await supabaseAdmin.storage.from(BUCKET_FICHIERS).createSignedUrl(chemin, 60);
    let tailleRelue = null;
    if (signe?.signedUrl) {
      const rep = await fetch(signe.signedUrl);
      tailleRelue = (await rep.arrayBuffer()).byteLength;
    }
    if (tailleRelue !== buffer.length) {
      return NextResponse.json(
        { error: "Fichier relu incohérent.", attendu: buffer.length, relu: tailleRelue, resultats },
        { status: 500 }
      );
    }

    const { error: erreurLigne } = await supabaseAdmin.from("ressources_cours").insert({
      groupe_id: it.groupeId,
      type: "pdf",
      titre: it.titre,
      url: `/api/fichier?chemin=${encodeURIComponent(chemin)}`,
      chemin_storage: chemin,
    });
    if (erreurLigne) {
      return NextResponse.json({ error: "Enregistrement impossible.", detail: erreurLigne.message, resultats }, { status: 500 });
    }

    // Notification dans l'application : message de l'équipe dans le forum du groupe.
    const { error: erreurMessage } = await supabaseAdmin.from("messages").insert({
      groupe_id: it.groupeId,
      auteur_type: "prof",
      auteur_identifiant: ADMIN.identifiant,
      auteur_nom: ADMIN.nom,
      contenu: `📚 Nouveau document dans le dossier « Cours » : ${it.titre}. Tu le trouves dans la colonne de droite, au-dessus des membres du groupe. Bonne lecture !`,
    });

    // Destinataires du groupe (élèves actifs sur l'un de leurs deux cours).
    const { data: eleves } = await supabaseAdmin
      .from("eleves")
      .select("identifiant, prenom, nom, email")
      .or(`groupe_id.eq.${it.groupeId},groupe_id_2.eq.${it.groupeId}`)
      .eq("statut", "actif");

    resultats.push({
      groupeId: it.groupeId,
      titre: it.titre,
      statut: "ajouté",
      tailleOctets: buffer.length,
      messageForum: erreurMessage ? `échec : ${erreurMessage.message}` : "publié",
      destinataires: (eleves || []).map((e) => ({ prenom: e.prenom, nom: e.nom, email: e.email })),
    });
  }

  return NextResponse.json({ ok: true, resultats });
}
