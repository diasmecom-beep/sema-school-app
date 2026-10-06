import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE : nouveaux mots de passe pour 3 élèves, envoyés uniquement
// à semalangues@gmail.com (jamais renvoyés dans la réponse HTTP).
const EMAILS = ["dimitripinzi@gmail.com", "wmkinwani@gmail.com", "chdekeyser@hotmail.com"];

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "f619930cd8500b86001a5faa") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const { data: eleves } = await supabaseAdmin
    .from("eleves")
    .select("id, identifiant, prenom, nom, email, groupe_id")
    .in("email", EMAILS);
  if (!eleves || eleves.length !== EMAILS.length) {
    return NextResponse.json({ error: "Élèves introuvables ou en nombre inattendu." }, { status: 404 });
  }

  const blocs = [];
  for (const eleve of eleves) {
    const motDePasse = generateCodeAcces();
    const { error } = await supabaseAdmin
      .from("eleves")
      .update({ code_acces_hash: hashCode(motDePasse) })
      .eq("id", eleve.id);
    if (error) {
      return NextResponse.json({ error: "Mise à jour impossible.", pour: eleve.email }, { status: 500 });
    }
    blocs.push(`<div style="margin-bottom:20px;">
      <p><strong>${eleve.prenom} ${eleve.nom}</strong> - ${eleve.email} - ${eleve.groupe_id}</p>
      <table style="background:#f4f1ea; padding:12px; border-radius:8px; width:100%;">
        <tr><td><strong>Identifiant</strong></td><td>${eleve.identifiant.toLowerCase()}</td></tr>
        <tr><td><strong>Mot de passe provisoire</strong></td><td>${motDePasse}</td></tr>
      </table></div>`);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://sema-school-app.vercel.app";
  const { error: erreurMail } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Sema School <onboarding@resend.dev>",
    to: "semalangues@gmail.com",
    subject: "[À transmettre] Identifiants - Atou Pinzi, Winnie Kinwani, Charles-Henry Dekeyser",
    html: `<div style="font-family: Arial, sans-serif; max-width: 520px; color:#1a1a1a;">
      ${blocs.join("")}
      <p>Connexion : <a href="${site}/connexion">${site}/connexion</a></p>
    </div>`,
  });
  if (erreurMail) {
    return NextResponse.json({ error: "Envoi e-mail échoué.", detail: erreurMail.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, envoyeA: "semalangues@gmail.com", eleves: eleves.length });
}
