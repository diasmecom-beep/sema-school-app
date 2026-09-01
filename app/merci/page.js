import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import { confirmerPaiement } from "@/lib/confirmerPaiement";

export const metadata = {
  title: "Merci - Sema School",
};

// Reçoit ?session_id={CHECKOUT_SESSION_ID} - c'est la redirection "After
// payment" configurée sur chacun des 4 liens de paiement Stripe (voir
// STRIPE_SETUP.md). Si présent, on en profite pour créer le compte élève et
// envoyer ses identifiants automatiquement (voir lib/confirmerPaiement.js).
export default async function MerciPage({ searchParams }) {
  const sessionId = searchParams?.session_id;
  const resultat = sessionId ? await confirmerPaiement(sessionId) : null;

  if (resultat?.statut === "erreur") {
    console.error("Erreur confirmation paiement Stripe:", resultat.message);
  }

  return (
    <div>
      <AnnouncementBar />
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="font-display font-extrabold text-3xl text-ink mb-4">
          {resultat?.prenom ? `Merci ${resultat.prenom}, ton paiement a bien été reçu !` : "Merci, ton paiement a bien été reçu !"}
        </h1>

        {resultat?.statut === "ok" && resultat.emailEnvoye && (
          <p className="text-ink/70 mb-3">
            Un e-mail contenant tes identifiants de connexion à ton espace
            élève vient de t&rsquo;être envoyé, avec le lien Zoom et le groupe
            WhatsApp de ton cours.
          </p>
        )}

        {resultat?.statut === "ok" && !resultat.emailEnvoye && (
          <p className="text-ink/70 mb-3">
            Ton compte élève a été créé. L&rsquo;envoi automatique de l&rsquo;e-mail
            a rencontré un souci - notre équipe va te transmettre tes
            identifiants manuellement très vite.
          </p>
        )}

        {resultat?.statut === "deja_traite" && (
          <p className="text-ink/70 mb-3">
            Tes identifiants de connexion t&rsquo;ont déjà été envoyés par
            e-mail.
          </p>
        )}

        {(!resultat || resultat.statut === "erreur") && (
          <p className="text-ink/70 mb-3">
            Ton inscription est en cours de traitement par notre équipe. Tu
            recevras très prochainement un e-mail avec tes identifiants de
            connexion à ton espace élève, ainsi que le lien Zoom et le groupe
            WhatsApp de ton cours.
          </p>
        )}

        <p className="text-ink/50 text-sm mb-10">
          Si tu ne reçois rien sous 48h, écris-nous à{" "}
          <a href="mailto:semalangues@gmail.com" className="text-terracotta-600 underline">
            semalangues@gmail.com
          </a>
          .
        </p>
        <a
          href="/"
          className="inline-block bg-sage-800 text-cream font-semibold rounded-full px-8 py-3 hover:bg-sage-900 transition"
        >
          Retour à l&rsquo;accueil
        </a>
      </section>
      <Footer />
    </div>
  );
}
