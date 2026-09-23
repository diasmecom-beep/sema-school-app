-- Trace la date d'envoi du rappel de paiement automatique, pour ne jamais
-- relancer deux fois la même personne (voir /api/cron/relances-paiement).
alter table inscriptions add column if not exists relance_envoyee_at timestamptz;
