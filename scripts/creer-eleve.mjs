// Crée un compte élève (identifiant + code d'accès) et l'enregistre dans
// Supabase — à exécuter par l'équipe Sema après une inscription reçue par
// un autre canal (mail, formulaire externe...). Le code d'accès n'est
// affiché qu'une seule fois ici : à transmettre immédiatement à l'élève.
//
// Utilisation (Node 20.6+, avec .env.local déjà rempli) :
//
//   node --env-file=.env.local scripts/creer-eleve.mjs \
//     --nom "Jean Dupont" --email jean@example.com --groupe swahili-debutant
//
// Groupes valides : tshiluba-debutant, tshiluba-intermediaire,
// swahili-debutant, swahili-intermediaire, lingala-debutant,
// lingala-intermediaire, kikongo-debutant, kikongo-intermediaire
//
// Groupe spécial "admin-all" : compte de test/staff qui voit les 8 groupes
// et leurs 8 liens Zoom d'un coup — à réserver à l'équipe Sema.

import { createClient } from "@supabase/supabase-js";
import { generateIdentifiant, generateCodeAcces, hashCode } from "../lib/accessCode.js";
import { GROUPES } from "../lib/content.js";

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    out[args[i].replace(/^--/, "")] = args[i + 1];
  }
  return out;
}

async function main() {
  const { nom, email, groupe } = parseArgs();
  if (!nom || !email || !groupe) {
    throw new Error("Usage : --nom \"...\" --email ... --groupe <id-du-groupe>");
  }
  if (groupe !== "admin-all" && !GROUPES.some((g) => g.id === groupe)) {
    throw new Error(
      `Groupe inconnu "${groupe}". Groupes valides : ${GROUPES.map((g) => g.id).join(", ")}, admin-all`
    );
  }

  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Variables Supabase manquantes dans l'environnement.");
  }
  const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const identifiant = generateIdentifiant();
  const codeAcces = generateCodeAcces();
  const codeAccesHash = hashCode(codeAcces);

  const { error } = await supabase.from("eleves").insert({
    nom,
    email,
    groupe_id: groupe,
    identifiant,
    code_acces_hash: codeAccesHash,
    statut: "actif",
  });

  if (error) throw new Error(error.message);

  console.log("Compte créé — à transmettre à l'élève (ne sera plus jamais affiché) :\n");
  console.log(`Identifiant : ${identifiant}`);
  console.log(`Code d'accès : ${codeAcces}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
