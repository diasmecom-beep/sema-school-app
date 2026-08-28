-- Migration 2 — Profils personnalisables (prénom, photo) + support audio (MP3)
-- pour les matériaux de cours.
--
-- Déjà exécutée en production via le SQL Editor Supabase. Conservée ici pour
-- garder une trace et pouvoir la rejouer sur un autre environnement.
--
-- Sans danger à ré-exécuter.

alter table eleves add column if not exists prenom text;
alter table eleves add column if not exists photo_chemin text;

alter table profs add column if not exists prenom text;
alter table profs add column if not exists photo_chemin text;

alter table materiaux drop constraint if exists materiaux_type_check;
alter table materiaux add constraint materiaux_type_check check (type in ('pdf', 'image', 'lien', 'audio'));
