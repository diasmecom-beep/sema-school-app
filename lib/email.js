import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// L'adresse d'expédition doit appartenir à un domaine vérifié dans Resend -
// voir RESEND_FROM_EMAIL dans .env.local. En attendant la vérification d'un
// domaine, resend.dev ne permet d'envoyer qu'à l'adresse du compte Resend
// lui-même (mode bac à sable), pas à de vrais élèves.
const FROM = process.env.RESEND_FROM_EMAIL || "Sema School <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sema-school-app.vercel.app";

const ADMIN_EMAIL = "semalangues@gmail.com";

// Notifie l'équipe Sema à chaque nouvelle inscription reçue sur le site.
// Contrairement à envoyerIdentifiants (destinée aux élèves), celle-ci
// fonctionne déjà sans domaine vérifié : Resend autorise l'envoi vers
// l'adresse du compte lui-même (semalangues@gmail.com) en mode bac à sable.
export async function envoyerNotificationInscription({
  prenom,
  nom,
  email,
  telephone,
  coursLabel,
  formuleLabel,
  attentes,
  connuVia,
}) {
  if (!resend) {
    console.error(`RESEND_API_KEY manquant - notification d'inscription non envoyée (${prenom} ${nom})`);
    return { envoye: false };
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Nouvelle inscription : ${prenom} ${nom} - ${coursLabel}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="color:#2f3e2f; font-size: 20px;">Nouvelle inscription reçue 🎉</h1>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding:4px 0;"><strong>Nom</strong></td><td style="padding:4px 0;">${prenom} ${nom}</td></tr>
            <tr><td style="padding:4px 0;"><strong>E-mail</strong></td><td style="padding:4px 0;">${email}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Téléphone</strong></td><td style="padding:4px 0;">${telephone}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Cours</strong></td><td style="padding:4px 0;">${coursLabel}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Formule</strong></td><td style="padding:4px 0;">${formuleLabel || "-"}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Attentes</strong></td><td style="padding:4px 0;">${attentes}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Connu via</strong></td><td style="padding:4px 0;">${connuVia}</td></tr>
          </table>
          <p style="margin-top:16px;">
            <a href="${SITE_URL}/admin/inscriptions" style="background:#c1552c;color:#fff;padding:10px 20px;border-radius:24px;text-decoration:none;display:inline-block; font-size:14px;">
              Voir toutes les inscriptions
            </a>
          </p>
        </div>
      `,
    });
    return { envoye: true };
  } catch (err) {
    console.error(`Erreur envoi notification d'inscription (${prenom} ${nom}):`, err);
    return { envoye: false, erreur: err };
  }
}

// Rappel automatique envoyé 7 jours ouvrables après une inscription restée
// sans paiement (voir /api/cron/relances-paiement). Comme pour
// envoyerIdentifiants, l'envoi direct à la personne ne fonctionnera
// réellement qu'une fois un domaine vérifié dans Resend - en attendant, une
// copie part systématiquement vers semalangues@gmail.com pour que l'équipe
// puisse relayer manuellement.
export async function envoyerRelancePaiement({ prenom, nom, email, coursLabel, formuleNom, formulePrix, stripeLink }) {
  if (!resend) {
    console.error(`RESEND_API_KEY manquant - relance de paiement non envoyée (${prenom} ${nom})`);
    return { envoye: false, envoyeAdmin: false };
  }

  const corpsHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p>Bonjour ${prenom},</p>
      <p>
        Il y a quelques jours, tu as commencé ton inscription au cours de <strong>${coursLabel}</strong>
        chez Sema School - mais le paiement de ta formule <strong>${formuleNom} (${formulePrix}€)</strong>
        n'a pas encore été finalisé.
      </p>
      <p>Pour rejoindre le cours, il te suffit de régler via ce lien sécurisé :</p>
      <p>
        <a href="${stripeLink}" style="background:#c1552c;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;display:inline-block;">
          Finaliser mon paiement
        </a>
      </p>
      <p>Dès réception de ton paiement, tu recevras tes identifiants de connexion à ton espace élève.</p>
      <p><strong>Si tu as déjà réglé entre-temps, ignore simplement ce message - merci !</strong></p>
      <p>
        À bientôt,<br />
        L'équipe Sema School<br />
        semalangues@gmail.com
      </p>
    </div>
  `;

  let envoye = false;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Rappel - finalise ton inscription chez Sema School",
      html: corpsHtml,
    });
    envoye = true;
  } catch (err) {
    // Attendu tant que le domaine n'est pas vérifié (voir STRIPE_SETUP.md) -
    // la copie admin ci-dessous prend le relais en attendant.
    console.error(`Envoi direct de la relance échoué pour ${email} (${prenom} ${nom}):`, err?.message || err);
  }

  let envoyeAdmin = false;
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `[Copie relance] ${prenom} ${nom} - ${formuleNom} (${formulePrix}€)`,
      html: `
        <p style="color:#999; font-size:12px;">
          Copie du rappel de paiement ${envoye ? "envoyé avec succès" : "PAS envoyé (domaine non vérifié)"}
          à ${email} - à relayer manuellement si besoin.
        </p>
        ${corpsHtml}
      `,
    });
    envoyeAdmin = true;
  } catch (err) {
    console.error(`Erreur envoi copie admin de la relance (${prenom} ${nom}):`, err);
  }

  return { envoye, envoyeAdmin };
}

export async function envoyerIdentifiants({ to, prenom, identifiant, motDePasse }) {
  if (!resend) {
    // Le compte est quand même créé côté base - on journalise les
    // identifiants ici pour pouvoir les communiquer manuellement en
    // attendant que RESEND_API_KEY soit configuré (voir STRIPE_SETUP.md).
    console.error(
      `RESEND_API_KEY manquant - identifiants non envoyés à ${to} : identifiant=${identifiant} motDePasse=${motDePasse}`
    );
    return { envoye: false };
  }

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Tes identifiants pour ton espace élève Sema",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="color:#2f3e2f; font-size: 22px;">Bienvenue chez Sema, ${prenom} 👋</h1>
          <p>Ton paiement a bien été reçu - merci ! Voici tes identifiants pour te connecter à ton espace élève :</p>
          <table style="background:#f4f1ea; padding:16px; border-radius:8px; width:100%; border-collapse: collapse;">
            <tr>
              <td style="padding:4px 0;"><strong>Identifiant</strong></td>
              <td style="padding:4px 0;">${identifiant.toLowerCase()}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><strong>Mot de passe provisoire</strong></td>
              <td style="padding:4px 0;">${motDePasse}</td>
            </tr>
          </table>
          <p style="margin-top:16px;">
            Par sécurité, pense à le modifier dès ta première connexion, dans la
            rubrique « Mon profil » de ton espace élève.
          </p>
          <p>
            <a href="${SITE_URL}/connexion" style="background:#c1552c;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;display:inline-block;">
              Se connecter à mon espace
            </a>
          </p>
          <p style="color:#999; font-size:12px; margin-top:24px;">
            Une question ? Écris-nous à semalangues@gmail.com
          </p>
        </div>
      `,
    });
    return { envoye: true };
  } catch (err) {
    console.error(
      `Erreur envoi e-mail identifiants à ${to} (identifiant=${identifiant} motDePasse=${motDePasse}):`,
      err
    );
    return { envoye: false, erreur: err };
  }
}
