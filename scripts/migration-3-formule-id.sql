-- Ajoute la colonne formule_id à la table inscriptions, pour tracer quelle
-- formule d'abonnement (annuel / trimestriel / mensuel / etudiant) a été
-- choisie avant la redirection vers le lien de paiement Stripe correspondant.
alter table inscriptions add column if not exists formule_id text;
