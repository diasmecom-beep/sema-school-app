import { NextResponse } from "next/server";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";
import { listerMembresGroupe } from "@/lib/groupeMembres";

// Liste des personnes taguables (@) dans le forum d'un groupe — réservé aux
// personnes qui ont accès à ce groupe (élève du groupe, prof qui l'enseigne,
// ou admin).
export async function GET(request) {
  const groupeId = new URL(request.url).searchParams.get("groupeId");
  if (!groupeId) return NextResponse.json({ error: "Groupe manquant." }, { status: 400 });

  const [eleve, prof] = await Promise.all([getEleveConnecte(), getProfConnecte()]);

  const autorise =
    (prof && (prof.groupes.includes(groupeId) || prof.groupes.includes("admin-all"))) ||
    (eleve && (eleve.groupe_id === groupeId || eleve.groupe_id === "admin-all"));

  if (!autorise) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const membres = await listerMembresGroupe(groupeId);
  return NextResponse.json(membres);
}
