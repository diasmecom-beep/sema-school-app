import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GROUPES, FORMULES } from "@/lib/content";
import { envoyerNotificationInscription } from "@/lib/email";

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
      groupeId2,
      attentes,
      connuVia,
      formuleId,
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
    if (groupeId2 && (groupeId2 === groupeId || !GROUPES.some((g) => g.id === groupeId2))) {
      return NextResponse.json(
        { error: "Merci de choisir une deuxième langue différente de la première." },
        { status: 400 }
      );
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

    const { data, error } = await supabaseAdmin
      .from("inscriptions")
      .insert({
        prenom: prenom.trim(),
        nom: nom.trim(),
        annee_naissance: anneeNaissance.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
        pays_residence: paysResidence.trim(),
        groupe_id: groupeId,
        attentes,
        connu_via: connuVia,
        formule_id: formuleId || null,
        statut: "en_attente",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erreur création inscription:", error);
      return NextResponse.json({ error: "Impossible d'enregistrer l'inscription." }, { status: 500 });
    }

    // Deuxième langue (optionnelle) : une deuxième ligne, mêmes infos
    // personnelles, reliée à la première via inscription_liee_id (voir
    // migration-7). Le paiement de ce 2e cours sera proposé sur /merci une
    // fois le premier payé (lib/confirmerPaiement.js).
    let idDeuxiemeLangue = null;
    if (groupeId2) {
      const { data: data2, error: erreur2 } = await supabaseAdmin
        .from("inscriptions")
        .insert({
          prenom: prenom.trim(),
          nom: nom.trim(),
          annee_naissance: anneeNaissance.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
          pays_residence: paysResidence.trim(),
          groupe_id: groupeId2,
          attentes,
          connu_via: connuVia,
          formule_id: formuleId || null,
          statut: "en_attente",
          inscription_liee_id: data.id,
        })
        .select("id")
        .single();

      if (erreur2) {
        console.error("Erreur création inscription (2e langue):", erreur2);
      } else {
        idDeuxiemeLangue = data2.id;
      }
    }

    // La notification ne doit jamais faire échouer l'inscription elle-même
    // si l'e-mail ne part pas - erreurs déjà interceptées dans la fonction.
    // On l'attend quand même (await) : sur Vercel, une fonction serverless
    // peut se terminer juste après la réponse, avant qu'une promesse "en
    // arrière-plan" non attendue n'ait eu le temps de s'exécuter.
    const groupe = GROUPES.find((g) => g.id === groupeId);
    const groupe2 = GROUPES.find((g) => g.id === groupeId2);
    const formule = FORMULES.find((f) => f.id === formuleId);
    await envoyerNotificationInscription({
      prenom: prenom.trim(),
      nom: nom.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
      coursLabel: groupe ? `${groupe.langue} - ${groupe.niveau}` : groupeId,
      deuxiemeCoursLabel: groupe2 ? `${groupe2.langue} - ${groupe2.niveau}` : null,
      formuleLabel: formule?.nom,
      attentes,
      connuVia,
    });

    return NextResponse.json({ ok: true, id: data.id, idDeuxiemeLangue });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
