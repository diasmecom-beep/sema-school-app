import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEleveConnecte } from "@/lib/eleves";
import { getProfConnecte } from "@/lib/profs";
import { verifyCode, hashCode } from "@/lib/accessCode";

// Permet à un élève ou un prof connecté de changer son propre mot de passe -
// utile notamment pour remplacer le mot de passe provisoire reçu par e-mail
// après un paiement Stripe (voir lib/confirmerPaiement.js).
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

  const { motDePasseActuel, nouveauMotDePasse } = await request.json();
  if (!motDePasseActuel?.trim() || !nouveauMotDePasse?.trim()) {
    return NextResponse.json({ error: "Merci de compléter les deux champs." }, { status: 400 });
  }
  if (nouveauMotDePasse.trim().length < 6) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit faire au moins 6 caractères." },
      { status: 400 }
    );
  }

  const { data: row } = await supabaseAdmin
    .from(table)
    .select("code_acces_hash")
    .eq("identifiant", identite.identifiant)
    .single();

  // Comme à la connexion, la saisie est normalisée en majuscules avant
  // vérification/hachage - le mot de passe n'est donc pas sensible à la casse.
  if (!row || !verifyCode(motDePasseActuel.trim().toUpperCase(), row.code_acces_hash)) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
  }

  const nouveauHash = hashCode(nouveauMotDePasse.trim().toUpperCase());
  const { error } = await supabaseAdmin
    .from(table)
    .update({ code_acces_hash: nouveauHash })
    .eq("identifiant", identite.identifiant);

  if (error) {
    return NextResponse.json({ error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
