-- Dossier "Cours" d'un groupe : documents de référence qui ne sont liés à
-- aucune date de séance (ex. manuel de swahili), affichés dans la barre
-- latérale de l'espace élève/prof, au-dessus du forum.
--
-- À exécuter UNE FOIS dans Supabase (SQL Editor). Sans danger à ré-exécuter.
-- Le fichier lui-même est stocké dans le bucket sema-fichiers, sous
-- materiaux/<groupe_id>__cours/... : /api/fichier en déduit le groupe pour
-- l'autorisation, comme pour les documents de séance.
create table if not exists ressources_cours (
  id uuid primary key default gen_random_uuid(),
  groupe_id text not null,
  type text not null check (type in ('pdf', 'image', 'lien', 'audio')),
  titre text not null,
  url text not null,
  chemin_storage text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ressources_cours_groupe on ressources_cours (groupe_id);

-- Comme toutes les autres tables : RLS activé sans policy (accès uniquement
-- via la clé service_role côté serveur).
alter table ressources_cours enable row level security;
