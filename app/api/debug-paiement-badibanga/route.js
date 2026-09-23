import { NextResponse } from "next/server";
import Stripe from "stripe";

// Diagnostic temporaire - vérifie si Jean Jacque Badibanga a payé, et avec
// quel moyen de paiement. À supprimer après vérification.
export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { data: sessions } = await stripe.checkout.sessions.list({
    limit: 100,
    expand: ["data.payment_intent.payment_method"],
  });

  const email = "jjbb01@hotmail.com";
  const match = sessions.find(
    (s) =>
      s.customer_details?.email?.toLowerCase() === email ||
      s.customer_email?.toLowerCase() === email
  );

  if (!match) {
    return NextResponse.json({ trouve: false });
  }

  const pm = match.payment_intent?.payment_method;

  return NextResponse.json({
    trouve: true,
    payment_status: match.payment_status,
    montant: match.amount_total ? match.amount_total / 100 : null,
    devise: match.currency,
    date: new Date(match.created * 1000).toISOString(),
    moyen_paiement_type: pm?.type || null,
    moyen_paiement_details: pm ? pm[pm.type] : null,
  });
}
