import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";

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
    .select("id, auteur_type, auteur_nom, contenu, created_at")
    .eq("groupe_id", groupeId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: "Échec du chargement." }, { status: 500 });

  return NextResponse.json({ messages: data });
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
