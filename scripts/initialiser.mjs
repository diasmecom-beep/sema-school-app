// Initialise tout ce qui doit exister en base après avoir exécuté
// scripts/migration.sql dans Supabase : le bucket de stockage et les 240
// séances de l'année scolaire. Sans danger à ré-exécuter.
//
// Utilisation (Node 20.6+, avec .env.local déjà rempli) :
//
//   node --env-file=.env.local scripts/initialiser.mjs

import { createClient } from "@supabase/supabase-js";
import { GROUPES } from "../lib/content.js";
import { genererDatesSeances } from "../lib/calendrier.js";

const BUCKET = "sema-fichiers";

async function main() {
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Variables Supabase manquantes dans l'environnement.");
  }
  const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1) Bucket de stockage
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(`Storage: ${listError.message}`);
  if (buckets.some((b) => b.name === BUCKET)) {
    console.log(`✓ Bucket "${BUCKET}" déjà présent.`);
  } else {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false, fileSizeLimit: "25MB" });
    if (error) throw new Error(`Storage: ${error.message}`);
    console.log(`✓ Bucket "${BUCKET}" créé.`);
  }

  // 2) Séances de l'année (30 dates x 8 groupes)
  const lignes = [];
  for (const groupe of GROUPES) {
    for (const date of genererDatesSeances(groupe.jour)) {
      lignes.push({ id: `${groupe.id}__${date}`, groupe_id: groupe.id, date });
    }
  }
  const TAILLE_LOT = 100;
  for (let i = 0; i < lignes.length; i += TAILLE_LOT) {
    const lot = lignes.slice(i, i + TAILLE_LOT);
    const { error } = await supabase.from("seances").upsert(lot, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw new Error(`Séances (table "seances" — as-tu bien exécuté migration.sql ?) : ${error.message}`);
  }
  console.log(`✓ ${lignes.length} séances prêtes (${GROUPES.length} groupes x ${lignes.length / GROUPES.length} dates).`);

  console.log("\nTerminé ! Tu peux maintenant créer ton accès admin :");
  console.log('  node --env-file=.env.local scripts/creer-eleve.mjs --nom "Ton nom" --email toi@example.com --groupe admin-all');
  console.log('  node --env-file=.env.local scripts/creer-prof.mjs --nom "Ton nom" --email toi@example.com --groupes all');
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
