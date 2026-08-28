-- Migration Sema — espace prof, séances, matériaux, devoirs, chat.
--
-- À exécuter UNE FOIS dans Supabase : dashboard du projet → SQL Editor →
-- New query → coller tout ce fichier → Run.
--
-- Sans danger à ré-exécuter (tout est en "if not exists").

create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- Comptes enseignants (espace prof)
-- --------------------------------------------------------------------------
create table if not exists profs (
  identifiant text primary key,
  nom text not null,
  email text,
  code_acces_hash text not null,
  groupes text[] not null default '{}',
  statut text not null default 'actif',
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Séances de cours : une ligne par groupe x date, préremplie pour toute
-- l'année scolaire (voir scripts/seed-seances.mjs).
-- --------------------------------------------------------------------------
create table if not exists seances (
  id text primary key, -- "<groupe_id>__<date ISO>"
  groupe_id text not null,
  date date not null,
  echeance_devoir timestamptz,
  notes text,
  replay_lien text,
  created_at timestamptz not null default now(),
  unique (groupe_id, date)
);

create index if not exists idx_seances_groupe on seances (groupe_id);

-- --------------------------------------------------------------------------
-- Matériaux de cours déposés par le prof pour une séance (PDF, image, lien)
-- --------------------------------------------------------------------------
create table if not exists materiaux (
  id uuid primary key default gen_random_uuid(),
  seance_id text not null references seances (id) on delete cascade,
  type text not null check (type in ('pdf', 'image', 'lien')),
  titre text not null,
  url text not null,
  chemin_storage text, -- chemin dans le bucket Supabase Storage (null si type = lien)
  created_at timestamptz not null default now()
);

create index if not exists idx_materiaux_seance on materiaux (seance_id);

-- --------------------------------------------------------------------------
-- Devoirs remis par les élèves pour une séance
-- --------------------------------------------------------------------------
create table if not exists devoirs_remis (
  id uuid primary key default gen_random_uuid(),
  seance_id text not null references seances (id) on delete cascade,
  eleve_identifiant text not null references eleves (identifiant),
  fichier_nom text not null,
  chemin_storage text not null,
  soumis_at timestamptz not null default now()
);

create index if not exists idx_devoirs_seance on devoirs_remis (seance_id);
create index if not exists idx_devoirs_eleve on devoirs_remis (eleve_identifiant);

-- --------------------------------------------------------------------------
-- Messages du chat — un fil de discussion par groupe, entre élèves et prof
-- --------------------------------------------------------------------------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  groupe_id text not null,
  auteur_type text not null check (auteur_type in ('eleve', 'prof')),
  auteur_identifiant text not null,
  auteur_nom text not null,
  contenu text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_groupe on messages (groupe_id, created_at);
