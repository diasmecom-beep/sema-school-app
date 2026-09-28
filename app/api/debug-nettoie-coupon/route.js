import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Diagnostic temporaire - supprime le coupon orphelin créé lors du build
// raté (avant l'ajout de force-dynamic), pour éviter un doublon.
export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY manquant." }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const ids = ["xjh4swod"];
  const deleted = [];
  for (const id of ids) {
    deleted.push(await stripe.coupons.del(id));
  }
  return NextResponse.json({ deleted });
}
