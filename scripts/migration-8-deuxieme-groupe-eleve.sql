-- Permet à un même compte élève de suivre deux cours (ex. Laura L. : un
-- compte unique au lieu de deux). `groupe_id` reste le 1er cours, la nouvelle
-- colonne porte le 2e.
--
-- À exécuter UNE FOIS dans Supabase (SQL Editor) AVANT de déployer le code
-- correspondant : sans cette colonne, la connexion des élèves échouerait.
-- Sans danger à ré-exécuter.
alter table eleves add column if not exists groupe_id_2 text;
