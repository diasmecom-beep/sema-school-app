import { NextResponse } from "next/server";

// Route de diagnostic TEMPORAIRE - vérifie que les variables d'environnement
// WHATSAPP_LINK_* déployées sur Vercel correspondent bien aux nouveaux liens,
// sans jamais exposer les liens eux-mêmes (juste un booléen de correspondance).
// À supprimer une fois la vérification faite.
const ATTENDUS = {
  WHATSAPP_LINK_TSHILUBA_DEBUTANT: "https://chat.whatsapp.com/Is9eczOIv5X0AvmbI2pATy?mode=gi_t",
  WHATSAPP_LINK_TSHILUBA_INTERMEDIAIRE: "https://chat.whatsapp.com/H699RqEEip9AZzvWg1tc4v?mode=gi_t",
  WHATSAPP_LINK_SWAHILI_DEBUTANT: "https://chat.whatsapp.com/FB79mXGqBe07iRxCuarkb3?mode=gi_t",
  WHATSAPP_LINK_SWAHILI_INTERMEDIAIRE: "https://chat.whatsapp.com/Hg9ghBhauJdCosoq6BiUQr?mode=gi_t",
  WHATSAPP_LINK_LINGALA_DEBUTANT: "https://chat.whatsapp.com/EE7fi6jdqaL6GBLlz3QVEP?mode=gi_t",
  WHATSAPP_LINK_LINGALA_INTERMEDIAIRE: "https://chat.whatsapp.com/EkrSDHoONla8zmSQf4hScX?mode=gi_t",
  WHATSAPP_LINK_KIKONGO_DEBUTANT: "https://chat.whatsapp.com/FgtkZtLEWYnGmbbQxS8O3L?mode=gi_t",
  WHATSAPP_LINK_KIKONGO_INTERMEDIAIRE: "https://chat.whatsapp.com/LqHwv1RPpoM5jJHjIhE7UD?mode=gi_t",
};

export async function GET() {
  const resultat = Object.fromEntries(
    Object.entries(ATTENDUS).map(([nom, valeurAttendue]) => [
      nom,
      process.env[nom] === valeurAttendue,
    ])
  );
  return NextResponse.json(resultat);
}
