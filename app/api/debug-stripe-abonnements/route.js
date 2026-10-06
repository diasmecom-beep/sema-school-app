import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Route TEMPORAIRE en lecture seule : type de prix des 4 liens de paiement
// et état des abonnements Stripe existants.
export async function GET(request) {
  const token = new URL(request.url).searchParams.get("t");
  if (token !== "8fe10b0a8e32520a2dcf20d7") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { data: liens } = await stripe.paymentLinks.list({ limit: 100 });
  const cibles = liens.filter((l) => l.active);
  const prix = [];
  for (const l of cibles) {
    const { data: items } = await stripe.paymentLinks.listLineItems(l.id, { limit: 5 });
    prix.push({
      url: l.url,
      actif: l.active,
      promo: l.allow_promotion_codes,
      lignes: items.map((i) => ({
        montant: i.price?.unit_amount,
        type: i.price?.type,
        recurrence: i.price?.recurring ? `${i.price.recurring.interval_count} ${i.price.recurring.interval}` : null,
      })),
    });
  }

  const { data: abos } = await stripe.subscriptions.list({ status: "all", limit: 100, expand: ["data.customer"] });
  const abonnements = abos.map((s) => ({
    email: s.customer?.email,
    statut: s.status,
    montant: s.items.data[0]?.price?.unit_amount,
    recurrence: s.items.data[0]?.price?.recurring?.interval,
    cree: new Date(s.created * 1000).toISOString().slice(0, 10),
    annuleLe: s.cancel_at ? new Date(s.cancel_at * 1000).toISOString().slice(0, 10) : null,
  }));

  return NextResponse.json({ prix, abonnements });
}
