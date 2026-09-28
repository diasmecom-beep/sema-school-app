import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Diagnostic temporaire - liste les coupons Stripe existants, pour vérifier
// qu'aucun n'a été créé en double suite à l'échec de build précédent.
export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { data: coupons } = await stripe.coupons.list({ limit: 20 });
  const { data: promoCodes } = await stripe.promotionCodes.list({ limit: 20 });

  return NextResponse.json({
    coupons: coupons.map((c) => ({ id: c.id, name: c.name, percent_off: c.percent_off })),
    promoCodes: promoCodes.map((p) => ({ id: p.id, code: p.code, coupon: p.coupon.id })),
  });
}
