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
