import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";
import { listerMembresGroupe } from "@/lib/groupeMembres";

async function identifierAuteur(groupeId) {
  const [eleve, prof] = await Promise.all([getEleveConnecte(), getProfConnecte()]);

  if (prof && (prof.groupes.includes(groupeId) || prof.groupes.includes("admin-all"))) {
    return { type: "prof", identifiant: prof.identifiant, nom: prof.nom };
  }
  if (eleve && (eleve.groupe_id === groupeId || eleve.groupe_id === "admin-all")) {
    return { type: "eleve", identifiant: eleve.identifiant, nom: eleve.nom };
  }
  return null;
}

export async function GET(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const groupeId = new URL(request.url).searchParams.get("groupeId");
  if (!groupeId) return NextResponse.json({ error: "Groupe manquant." }, { status: 400 });

  const auteur = await identifierAuteur(groupeId);
  if (!auteur) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("id, auteur_type, auteur_identifiant, auteur_nom, contenu, created_at")
    .eq("groupe_id", groupeId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: "Échec du chargement." }, { status: 500 });

  // On enrichit avec le prénom et la photo actuels de chaque auteur (pas
  // ceux au moment de l'envoi) pour que les autres membres du groupe
  // reconnaissent qui parle.
  const { eleves, profs } = await listerMembresGroupe(groupeId);
  const parIdentifiant = new Map([...eleves, ...profs].map((m) => [m.identifiant, m]));
  const messages = (data || []).map((m) => {
    const membre = parIdentifiant.get(m.auteur_identifiant);
    return { ...m, prenom: membre?.prenom || null, photo_chemin: membre?.photo_chemin || null };
  });

  return NextResponse.json({ messages });
}

export async function POST(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
  }

  const { groupeId, contenu } = await request.json();
  if (!groupeId || !contenu?.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const auteur = await identifierAuteur(groupeId);
  if (!auteur) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({
      groupe_id: groupeId,
      auteur_type: auteur.type,
      auteur_identifiant: auteur.identifiant,
      auteur_nom: auteur.nom,
      contenu: contenu.trim().slice(0, 2000),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Échec de l'envoi." }, { status: 500 });

  return NextResponse.json({ ok: true, message: data });
}
