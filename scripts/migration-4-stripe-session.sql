-- Ajoute une colonne pour mémoriser la session Stripe qui a confirmé le
-- paiement d'une inscription. Sert à rendre la création du compte élève
-- (déclenchée par la page /merci) idempotente : si la page est rechargée ou
-- visitée deux fois pour la même session, on ne crée pas deux comptes ni
-- n'envoie deux e-mails.
alter table inscriptions add column if not exists stripe_session_id text;
