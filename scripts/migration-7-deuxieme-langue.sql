-- Permet de lier une inscription à une autre : quand une personne ajoute une
-- deuxième langue depuis le formulaire, on crée une deuxième ligne dans
-- `inscriptions` (mêmes infos personnelles, groupe_id différent) et on la
-- relie à la première via cette colonne, pour que l'admin les voie comme un
-- même dossier et que /merci puisse proposer le paiement du 2e cours.
alter table inscriptions add column if not exists inscription_liee_id uuid references inscriptions(id);
