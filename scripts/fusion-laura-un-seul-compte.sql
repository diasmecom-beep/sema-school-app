-- Fusionne les deux comptes de Laura L. en un seul : LLOPONGO suit les deux
-- cours, LLOPONGO2 est désactivé. À exécuter dans Supabase (SQL Editor),
-- APRÈS migration-8-deuxieme-groupe-eleve.sql.

-- 0) Vérifier d'abord que ce sont bien les bons comptes (2 lignes attendues) :
select identifiant, prenom, nom, email, groupe_id, groupe_id_2, statut
from eleves where identifiant in ('LLOPONGO', 'LLOPONGO2');

-- 1) Le compte principal reprend le cours du 2e compte
update eleves
set groupe_id_2 = (select groupe_id from eleves where identifiant = 'LLOPONGO2')
where identifiant = 'LLOPONGO';

-- 2) Les devoirs déjà remis depuis le 2e compte passent sur le compte principal
update devoirs_remis set eleve_identifiant = 'LLOPONGO' where eleve_identifiant = 'LLOPONGO2';

-- 3) Le 2e compte est désactivé (plus de connexion possible)
update eleves set statut = 'inactif' where identifiant = 'LLOPONGO2';

-- 4) Contrôle
select identifiant, groupe_id, groupe_id_2, statut from eleves where identifiant in ('LLOPONGO', 'LLOPONGO2');
