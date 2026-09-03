import { NextResponse } from "next/server";
import { Resend } from "resend";

// Test temporaire n°2 - vérifie si l'envoi fonctionne vers une AUTRE adresse
// que celle utilisée pour créer le compte Resend (important : sans domaine
// vérifié, Resend restreint parfois l'envoi à la seule adresse du compte).
export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY manquant." }, { status: 500 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const result = await resend.emails.send({
      from: "Sema School <onboarding@resend.dev>",
      to: "diasmecom@gmail.com",
      subject: "Test Resend #2 - Sema School",
      html: "<p>Second test, vers une autre adresse.</p>",
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), details: err?.message }, { status: 500 });
  }
}
