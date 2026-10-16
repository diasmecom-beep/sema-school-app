import Stripe from "stripe";
import { supabaseAdmin } from "./supabaseAdmin";
import { genererIdentifiantUnique } from "./identifiantEleve";
import { generateCodeAcces, hashCode } from "./accessCode";
import { envoyerIdentifiants, envoyerDeuxiemeCours } from "./email";
import { GROUPES, FORMULES } from "./content";

// Un code promo n'existe que sur les liens Trimestriel/Annuel (voir la mise
// en place de la remise famille) - inutile de le mentionner pour les autres.
const CODES_PROMO_FAMILLE = { trimestriel: "FAMILLE5", annuel: "FAMILLE10" };

async function chercherDeuxiemeLangueEnAttente(inscriptionId, email) {
  const { data } = await supabaseAdmin
    .from("inscriptions")
    .select("id, groupe_id, formule_id")
    .eq("inscription_liee_id", inscriptionId)
    .eq("statut", "en_attente")
    .maybeSingle();

  if (!data) return null;

  const groupe = GROUPES.find((g) => g.id === data.groupe_id);
  const formule = FORMULES.find((f) => f.id === data.formule_id);
  if (!formule?.stripeLink) return null;

  return {
    id: data.id,
    coursLabel: groupe ? `${groupe.langue} - ${groupe.niveau}` : data.groupe_id,
    formuleNom: formule.nom,
    stripeLink: formule.stripeLink,
    codePromo: CODES_PROMO_FAMILLE[formule.id] || null,
    email,
  };
}

function normaliser(texte) {
  return (texte || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Retourne le compte élève actif de la même personne (même e-mail ET mêmes
// prénom/nom, pour ne pas fusionner deux personnes d'une même famille qui
// partagent une adresse), ou null.
async function chercherCompteExistant(inscription) {
  const email = (inscription.email || "").trim().toLowerCase();
  if (!email) return null;

  const { data } = await supabaseAdmin
    .from("eleves")
    .select("identifiant, prenom, nom, email, groupe_id, groupe_id_2, statut")
    .ilike("email", email.replace(/[\\%_]/g, "\\$&"))
    .eq("statut", "actif");

  return (
    (data || []).find(
      (e) =>
        e.groupe_id !== "admin-all" &&
        (e.email || "").trim().toLowerCase() === email &&
        normaliser(e.prenom) === normaliser(inscription.prenom) &&
        normaliser(e.nom) === normaliser(inscription.nom)
    ) || null
  );
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Appelée par la page /merci?session_id=... (voir la redirection "After
// payment" configurée sur chacun des 4 liens Stripe). Récupère la session
// Stripe, retrouve l'inscription correspondante via client_reference_id,
// crée le compte élève (identifiant + mot de passe provisoire) et envoie
// l'e-mail avec les accès. Idempotent : si l'inscription porte déjà un
// stripe_session_id, on ne recrée rien (évite les doublons si la page /merci
// est rechargée).
export async function confirmerPaiement(sessionId) {
  if (!stripe) {
    return { statut: "erreur", message: "STRIPE_SECRET_KEY n'est pas configuré côté serveur." };
  }
  if (!supabaseAdmin) {
    return { statut: "erreur", message: "Supabase n'est pas configuré côté serveur." };
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("Erreur récupération session Stripe:", err);
    return { statut: "erreur", message: "Paiement introuvable." };
  }

  if (session.payment_status !== "paid") {
    return { statut: "erreur", message: "Ce paiement n'est pas encore confirmé." };
  }

  const inscriptionId = session.client_reference_id;
  if (!inscriptionId) {
    return { statut: "erreur", message: "Ce paiement n'est rattaché à aucune inscription." };
  }

  const { data: inscription } = await supabaseAdmin
    .from("inscriptions")
    .select("*")
    .eq("id", inscriptionId)
    .maybeSingle();

  if (!inscription) {
    return { statut: "erreur", message: "Inscription introuvable." };
  }

  if (inscription.stripe_session_id) {
    // Déjà traité lors d'un précédent chargement de cette page.
    return {
      statut: "deja_traite",
      prenom: inscription.prenom,
      deuxiemeLangue: await chercherDeuxiemeLangueEnAttente(inscriptionId, inscription.email),
    };
  }

  // Même personne que celle d'un compte déjà actif (même e-mail + mêmes
  // prénom et nom) ? Alors ce paiement est son 2e cours : on l'ajoute à son
  // compte (groupe_id_2) au lieu de créer un deuxième compte.
  const compteExistant = await chercherCompteExistant(inscription);
  if (compteExistant) {
    const dejaInscrit = [compteExistant.groupe_id, compteExistant.groupe_id_2].includes(inscription.groupe_id);
    if (dejaInscrit || !compteExistant.groupe_id_2) {
      if (!dejaInscrit) {
        const { error: erreurMaj } = await supabaseAdmin
          .from("eleves")
          .update({ groupe_id_2: inscription.groupe_id })
          .eq("identifiant", compteExistant.identifiant)
          .is("groupe_id_2", null);
        if (erreurMaj) {
          console.error("Erreur ajout du 2e cours au compte:", erreurMaj);
          return { statut: "erreur", message: "Impossible d'ajouter le cours au compte existant." };
        }
      }

      await supabaseAdmin
        .from("inscriptions")
        .update({ statut: "payee", stripe_session_id: sessionId })
        .eq("id", inscriptionId);

      const groupe = GROUPES.find((g) => g.id === inscription.groupe_id);
      const coursLabel = groupe ? `${groupe.langue} - ${groupe.niveau}` : inscription.groupe_id;
      const identifiantAffiche = compteExistant.identifiant.toLowerCase();
      const { envoye } = dejaInscrit
        ? { envoye: false }
        : await envoyerDeuxiemeCours({
            prenom: inscription.prenom,
            nom: inscription.nom,
            email: inscription.email,
            identifiant: identifiantAffiche,
            coursLabel,
          });

      return {
        statut: "ok_deuxieme_cours",
        prenom: inscription.prenom,
        identifiant: identifiantAffiche,
        coursLabel,
        emailEnvoye: envoye,
      };
    }
    // Compte déjà complet (2 cours) : on retombe sur la création d'un compte
    // séparé ci-dessous.
  }

  const identifiant = await genererIdentifiantUnique(inscription.prenom, inscription.nom);
  const motDePasse = generateCodeAcces();
  const hash = hashCode(motDePasse);

  const { error: erreurEleve } = await supabaseAdmin.from("eleves").insert({
    identifiant,
    code_acces_hash: hash,
    nom: inscription.nom,
    prenom: inscription.prenom,
    email: inscription.email,
    groupe_id: inscription.groupe_id,
    statut: "actif",
  });

  if (erreurEleve) {
    console.error("Erreur création élève:", erreurEleve);
    return { statut: "erreur", message: "Impossible de créer le compte élève." };
  }

  await supabaseAdmin
    .from("inscriptions")
    .update({ statut: "payee", stripe_session_id: sessionId })
    .eq("id", inscriptionId);

  const { envoye } = await envoyerIdentifiants({
    to: inscription.email,
    prenom: inscription.prenom,
    identifiant,
    motDePasse,
  });

  return {
    statut: "ok",
    prenom: inscription.prenom,
    emailEnvoye: envoye,
    deuxiemeLangue: await chercherDeuxiemeLangueEnAttente(inscriptionId, inscription.email),
  };
}
