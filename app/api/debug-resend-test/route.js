import { NextResponse } from "next/server";
import { Resend } from "resend";

// Route de diagnostic TEMPORAIRE - envoie un e-mail de test via Resend pour
// vérifier que la clé fonctionne. À supprimer une fois la vérification faite.
export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY manquant." }, { status: 500 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const result = await resend.emails.send({
      from: "Sema School <onboarding@resend.dev>",
      to: "semalangues@gmail.com",
      subject: "Test Resend - Sema School",
      html: "<p>Ceci est un test d'envoi automatique depuis le site Sema School.</p>",
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), details: err?.message }, { status: 500 });
  }
}
