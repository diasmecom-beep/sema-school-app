import { NextResponse } from "next/server";

// Route de diagnostic TEMPORAIRE — à supprimer une fois le problème résolu.
// N'expose jamais la valeur complète du secret, seulement sa longueur et les
// codes de caractères autour de l'endroit où l'erreur se produit.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const charCodes = Array.from(key.slice(0, 20)).map((c) => c.charCodeAt(0));

  return NextResponse.json({
    url,
    urlLength: url.length,
    keyLength: key.length,
    keyStart: key.slice(0, 10),
    keyEnd: key.slice(-6),
    charCodesFirst20: charCodes,
  });
}
