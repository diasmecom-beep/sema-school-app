import { NextResponse } from "next/server";
import Stripe from "stripe";

// Empêche Next.js de tenter d'exécuter cette route pendant le build (elle a
// des effets de bord - création de ressources Stripe - qui ne doivent
// jamais se déclencher ailleurs qu'à la demande, une fois déployée).
export const dynamic = "force-dynamic";

// Route de diagnostic TEMPORAIRE - crée les coupons + codes promo Stripe
// pour la remise famille (5% Trimestriel, 10% Annuel), et active les codes
// promo sur les 2 liens de paiement concernés. À supprimer après exécution.
export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const LIENS = {
    trimestriel: "https://buy.stripe.com/aFacN4cl7bzC1pDbtt7g408",
    annuel: "https://buy.stripe.com/00wdR8bh30UYb0d8hh7g409",
  };

  const { data: paymentLinks } = await stripe.paymentLinks.list({ limit: 100 });
  const plTrimestriel = paymentLinks.find((p) => p.url === LIENS.trimestriel);
  const plAnnuel = paymentLinks.find((p) => p.url === LIENS.annuel);

  if (!plTrimestriel || !plAnnuel) {
    return NextResponse.json(
      { error: "Lien Trimestriel ou Annuel introuvable.", plTrimestriel: !!plTrimestriel, plAnnuel: !!plAnnuel },
      { status: 404 }
    );
  }

  const resultats = {};

  // Trimestriel - 5%
  const couponTrimestriel = await stripe.coupons.create({
    percent_off: 5,
    duration: "once",
    name: "Remise famille - 2e cours (Trimestriel)",
  });
  const promoTrimestriel = await stripe.promotionCodes.create({
    coupon: couponTrimestriel.id,
    code: "FAMILLE5",
  });
  await stripe.paymentLinks.update(plTrimestriel.id, { allow_promotion_codes: true });
  resultats.trimestriel = { coupon: couponTrimestriel.id, code: promoTrimestriel.code };

  // Annuel - 10%
  const couponAnnuel = await stripe.coupons.create({
    percent_off: 10,
    duration: "once",
    name: "Remise famille - 2e cours (Annuel)",
  });
  const promoAnnuel = await stripe.promotionCodes.create({
    coupon: couponAnnuel.id,
    code: "FAMILLE10",
  });
  await stripe.paymentLinks.update(plAnnuel.id, { allow_promotion_codes: true });
  resultats.annuel = { coupon: couponAnnuel.id, code: promoAnnuel.code };

  return NextResponse.json({ ok: true, resultats });
}
