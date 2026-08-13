import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GROUPES } from "@/lib/content";

const ATTENTES = ["Professionnelles", "Personnelles", "Loisirs", "Autres"];
const CONNU_VIA = ["Réseaux sociaux", "Site internet", "Evenement", "Bouche à oreille", "Autre"];

export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase n'est pas encore configuré côté serveur." },
        { status: 500 }
      );
    }

    const {
      prenom,
      nom,
      anneeNaissance,
      telephone,
      email,
      paysResidence,
      groupeId,
      attentes,
      connuVia,
    } = await request.json();

    if (
      !prenom?.trim() ||
      !nom?.trim() ||
      !anneeNaissance?.trim() ||
      !telephone?.trim() ||
      !email?.trim() ||
      !paysResidence?.trim()
    ) {
      return NextResponse.json({ error: "Merci de compléter tous les champs." }, { status: 400 });
    }
    if (!GROUPES.some((g) => g.id === groupeId)) {
      return NextResponse.json({ error: "Merci de choisir un cours." }, { status: 400 });
    }
    if (!ATTENTES.includes(attentes)) {
      return NextResponse.json({ error: "Merci d'indiquer tes attentes." }, { status: 400 });
    }
    if (!CONNU_VIA.includes(connuVia)) {
      return NextResponse.json(
        { error: "Merci d'indiquer comment tu as connu Sema." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("inscriptions").insert({
      prenom: prenom.trim(),
      nom: nom.trim(),
      annee_naissance: anneeNaissance.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      pays_residence: paysResidence.trim(),
      groupe_id: groupeId,
      attentes,
      connu_via: connuVia,
      statut: "en_attente",
    });

    if (error) {
      console.error("Erreur création inscription:", error);
      return NextResponse.json({ error: "Impossible d'enregistrer l'inscription." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
