import { NextResponse } from "next/server";
import Stripe from "stripe";

// Diagnostic temporaire - liste toutes les sessions Stripe récentes (payées
// ou non) pour vérifier s'il y en a une liée à Charles-Henry Dekeyser,
// notamment via virement bancaire (qui reste "en attente" plusieurs jours).
// À supprimer après vérification.
export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { data: sessions } = await stripe.checkout.sessions.list({ limit: 100 });

  const toutes = sessions.map((s) => ({
    email: s.customer_details?.email || s.customer_email || null,
    nom: s.customer_details?.name || null,
    status: s.status,
    payment_status: s.payment_status,
    payment_method_types: s.payment_method_types,
    montant: s.amount_total ? s.amount_total / 100 : null,
    date: new Date(s.created * 1000).toISOString(),
  }));

  return NextResponse.json({ total: toutes.length, toutes });
}
