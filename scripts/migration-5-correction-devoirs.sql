-- Permet au prof de laisser un commentaire (et une note libre, ex. "8/10"
-- ou "Très bien") sur un devoir remis par un élève, visible ensuite par
-- l'élève dans son espace.
alter table devoirs_remis add column if not exists commentaire_prof text;
alter table devoirs_remis add column if not exists note text;
alter table devoirs_remis add column if not exists commente_at timestamptz;
