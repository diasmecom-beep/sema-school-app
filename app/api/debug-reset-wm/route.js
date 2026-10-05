import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateCodeAcces, hashCode } from "@/lib/accessCode";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE : nouveau mot de passe pour William Makanga, envoyé
// uniquement à semalangues@gmail.com (jamais renvoyé dans la réponse HTTP).
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "e3b9136ac73372a740f25eb5") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!supabaseAdmin || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Configuration manquante." }, { status: 500 });
  }

  const { data: eleve } = await supabaseAdmin
    .from("eleves")
    .select("id, identifiant, prenom, nom, email")
    .eq("email", "william.makanga@gmail.com")
    .maybeSingle();
  if (!eleve) {
    return NextResponse.json({ error: "Élève introuvable." }, { status: 404 });
  }

  const motDePasse = generateCodeAcces();
  const { error: erreurMaj } = await supabaseAdmin
    .from("eleves")
    .update({ code_acces_hash: hashCode(motDePasse) })
    .eq("id", eleve.id);
  if (erreurMaj) {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://sema-school-app.vercel.app";
  const { error: erreurMail } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Sema School <onboarding@resend.dev>",
    to: "semalangues@gmail.com",
    subject: "[À transmettre] Identifiants de William Makanga (Swahili intermédiaire)",
    html: `<div style="font-family: Arial, sans-serif; max-width: 480px; color:#1a1a1a;">
      <p>À transmettre à William Makanga (william.makanga@gmail.com), cours Swahili intermédiaire :</p>
      <table style="background:#f4f1ea; padding:16px; border-radius:8px; width:100%;">
        <tr><td><strong>Identifiant</strong></td><td>${eleve.identifiant.toLowerCase()}</td></tr>
        <tr><td><strong>Mot de passe provisoire</strong></td><td>${motDePasse}</td></tr>
      </table>
      <p>Connexion : <a href="${site}/connexion">${site}/connexion</a></p>
      <p style="color:#999; font-size:12px;">Il peut modifier son mot de passe dans « Mon profil ».</p>
    </div>`,
  });
  if (erreurMail) {
    return NextResponse.json({ error: "Envoi e-mail échoué.", detail: erreurMail.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, envoyeA: "semalangues@gmail.com" });
}
