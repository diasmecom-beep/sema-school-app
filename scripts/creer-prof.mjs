// Crée un compte prof (identifiant + code d'accès) pour l'espace prof.
// Le code d'accès n'est affiché qu'une seule fois ici : à transmettre
// immédiatement à la personne concernée.
//
// Utilisation (Node 20.6+, avec .env.local déjà rempli) :
//
//   node --env-file=.env.local scripts/creer-prof.mjs \
//     --nom "Jean Dupont" --email jean@example.com --groupes swahili-debutant,swahili-intermediaire
//
// --groupes accepte une liste séparée par des virgules, ou "all" pour donner
// accès à tous les groupes (réservé à l'équipe Sema).

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
  const { nom, email, groupes } = parseArgs();
  if (!nom || !email || !groupes) {
    throw new Error('Usage : --nom "..." --email ... --groupes <id1,id2,...|all>');
  }

  const groupesListe = groupes === "all" ? ["admin-all"] : groupes.split(",").map((g) => g.trim());
  if (groupes !== "all") {
    for (const g of groupesListe) {
      if (!GROUPES.some((gr) => gr.id === g)) {
        throw new Error(`Groupe inconnu "${g}". Groupes valides : ${GROUPES.map((gr) => gr.id).join(", ")}, ou --groupes all`);
      }
    }
  }

  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Variables Supabase manquantes dans l'environnement.");
  }
  const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const identifiant = generateIdentifiant("PROF");
  const codeAcces = generateCodeAcces();
  const codeAccesHash = hashCode(codeAcces);

  const { error } = await supabase.from("profs").insert({
    nom,
    email,
    groupes: groupesListe,
    identifiant,
    code_acces_hash: codeAccesHash,
    statut: "actif",
  });

  if (error) throw new Error(error.message);

  console.log("Compte prof créé — à transmettre (ne sera plus jamais affiché) :\n");
  console.log(`Identifiant : ${identifiant}`);
  console.log(`Code d'accès : ${codeAcces}`);
  console.log(`Groupes : ${groupesListe.join(", ")}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
