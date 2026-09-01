# Finaliser l'automatisation des paiements Stripe

Le code est prêt (création automatique du compte élève + envoi des
identifiants par e-mail après paiement). Il manque 3 réglages que seul un
accès aux comptes Stripe / Resend / Vercel permet de faire.

## 1. Clé secrète Stripe

Dashboard Stripe → **Développeurs** → **Clés API** → copier la **clé secrète**
(pas la clé publique). Ajouter dans Vercel (Project Settings → Environment
Variables) et dans `.env.local` en local :

```
STRIPE_SECRET_KEY=sk_live_...
```

## 2. Redirection "After payment" sur les 4 liens de paiement

Pour chacun des 4 liens (Annuel, Trimestriel, Mensuel, Étudiant·e) :

1. Dashboard Stripe → **Paiements** → **Liens de paiement** → ouvrir le lien
   → **Modifier**.
2. Section **"After payment"** → choisir **"Redirect customers to your
   website"**.
3. Coller exactement :
   ```
   https://sema-school-app.vercel.app/merci?session_id={CHECKOUT_SESSION_ID}
   ```
   (remplacer par `https://sema-school.com/merci?session_id={CHECKOUT_SESSION_ID}`
   une fois le domaine personnalisé branché).
4. Enregistrer.

Sans ce réglage, la page `/merci` s'affiche quand même après le paiement,
mais sans `session_id` elle ne peut pas créer le compte élève automatiquement
- il faudra alors le faire manuellement.

## 3. Resend (envoi des e-mails)

1. Créer un compte sur [resend.com](https://resend.com).
2. Vérifier un domaine qui vous appartient (ajout d'enregistrements DNS
   fournis par Resend - idéalement `sema-school.com`, une fois le blocage
   des serveurs de noms Wix résolu).
3. Créer une clé API, l'ajouter dans Vercel et `.env.local` :
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=Sema School <inscriptions@sema-school.com>
   ```

**Important** : tant qu'aucun domaine n'est vérifié dans Resend, les e-mails
ne peuvent être envoyés qu'à l'adresse du compte Resend lui-même (mode bac à
sable) - pas aux élèves. L'envoi automatique restera donc bloqué jusqu'à
cette vérification de domaine.

## Comportement si une clé manque

- Sans `STRIPE_SECRET_KEY` : la page `/merci` affiche le message générique
  sans planter, mais aucun compte n'est créé automatiquement.
- Sans `RESEND_API_KEY` (ou si l'envoi échoue) : le compte élève est quand
  même créé, et l'identifiant + le mot de passe provisoire sont journalisés
  dans les logs de la fonction Vercel (`/merci`) pour pouvoir être
  communiqués manuellement - le mot de passe n'est jamais stocké en clair
  dans Supabase (seul son hash l'est), donc les logs sont le seul endroit où
  le retrouver après coup.
