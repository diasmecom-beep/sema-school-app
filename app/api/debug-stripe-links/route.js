import { NextResponse } from "next/server";
import Stripe from "stripe";
import { FORMULES } from "@/lib/content";

// Route de diagnostic TEMPORAIRE - vérifie que le réglage "After payment"
// des liens de paiement Stripe pointe bien vers /merci?session_id=...
// Ne renvoie aucune donnée sensible (pas de clé, pas de données client).
// À supprimer une fois la vérification faite.
export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { data: liens } = await stripe.paymentLinks.list({ limit: 100 });

  const resultat = FORMULES.map((f) => {
    const lien = liens.find((l) => l.url === f.stripeLink);
    if (!lien) {
      return { formule: f.id, stripeLink: f.stripeLink, trouve: false };
    }
    return {
      formule: f.id,
      stripeLink: f.stripeLink,
      trouve: true,
      active: lien.active,
      after_completion_type: lien.after_completion?.type,
      redirect_url: lien.after_completion?.redirect?.url || null,
    };
  });

  return NextResponse.json(resultat);
}
