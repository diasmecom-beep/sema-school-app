import { NextResponse } from "next/server";
import Stripe from "stripe";

// Route de diagnostic TEMPORAIRE - recherche dans Stripe les sessions de
// paiement liées à une liste d'e-mails, pour vérifier qui a réellement payé.
// À supprimer une fois la vérification faite.
const EMAILS = ["william.makanga@gmail.com", "m.dikizeko@gmail.com", "jessicabeaufort@yahoo.com"];

export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { data: sessions } = await stripe.checkout.sessions.list({ limit: 100 });

  const resultat = EMAILS.map((email) => {
    const matches = sessions.filter(
      (s) =>
        s.customer_details?.email?.toLowerCase() === email.toLowerCase() ||
        s.customer_email?.toLowerCase() === email.toLowerCase()
    );
    return {
      email,
      trouve: matches.length > 0,
      paiements: matches.map((s) => ({
        payment_status: s.payment_status,
        montant: s.amount_total ? s.amount_total / 100 : null,
        devise: s.currency,
        date: new Date(s.created * 1000).toISOString(),
      })),
    };
  });

  return NextResponse.json({ totalSessions: sessions.length, resultat });
}
