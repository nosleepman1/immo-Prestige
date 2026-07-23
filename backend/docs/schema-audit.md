# Lot 2 — Audit et redressement du schéma

Date : 2026-07-23. Portée : les 14 tables du schéma actuel (après lot 0+1) + les tables à créer pour les domaines abonnement / vérification / modération / messagerie. Ce document est le blueprint : les migrations correctives de l'existant sont dans ce lot ; les **nouvelles tables sont créées dans leur lot feature** (là où le code et les tests qui les utilisent existent), pas ici, pour ne pas livrer de schéma mort.

Sévérité : 🔴 intégrité/corruption possible · 🟠 incohérence fonctionnelle · 🟡 qualité/perf.

---

## 1. Tables existantes — état & correctifs

### `users`
- 🟡 `role` est un `enum` SQL contraint mais reste une string libre côté PHP → **cast enum `UserRole`** (fait au **lot 3**, avec la refonte des rôles).
- ✅ `is_deleted` (colonne morte) supprimée et `softDeletes()` ajouté au lot 0+1.
- Lot 3 ajoutera : `status` compte (invité de la logique agence), `password` nullable (compte agence `pending` sans mot de passe).

### `agencies`
- 🟠 `is_active` (booléen) est le seul état de compte → **incapable de porter `pending`/`accepted`/`refused`**. Remplacer par `status` enum `{pending, accepted, refused}` (**lot 3**).
- 🔴 Aucun document légal stocké : `id_card` est une simple string, pas un fichier. Pour qu'un admin instruise un dossier il faut une table **`agency_documents`** (blueprint §3) — **lot 3**.
- 🟠 Champs manquants pour la décision admin : identité du gérant (nom du représentant), zone d'activité (seule `city` existe). À ajouter **lot 3**.
- ✅ `user_id` rendu `unique` au lot 0+1 (cohérent avec `hasOne`).

### `properties`
- 🔴 **`property_type_id` en `onDelete('cascade')`** : supprimer un type de bien détruit toutes les propriétés liées. Table de référence → **`restrictOnDelete()`** (ce lot).
- 🟠 **Trois booléens d'état** (`sold`, `is_active`, `is_posted`) qui autorisent des combinaisons absurdes. Remplacer `is_active`/`is_posted` par **`status` enum `{draft, published, archived}`** ; garder `sold` (orthogonal : un bien publié peut être vendu). Migration + logique de publication au **lot 6a**.
- 🟡 `longitude`/`latitude` en `string` → interdit toute requête géo. Passer en **`decimal(9,6)`** (ce lot).
- 🟡 `rooms`/`bedrooms` en `double` (un nombre de pièces flottant n'a pas de sens) → **`unsignedTinyInteger`** (ce lot).
- 🟡 Aucun index sur les colonnes de filtrage public (`city`, `region`, `country`, `price`, futur `status`). Ajouter des index (ce lot pour les colonnes stables ; l'index `status` au lot 6a).
- ✅ `softDeletes()` + casts ajoutés au lot 0+1.

### `posts`
- Table pivot `user_id` + `property_id` (le fil social ; décision produit : on la garde). 🟡 Pas de `softDeletes` alors que la règle transverse est « tout en soft delete ». Ajouter au **lot 7**.
- 🟡 Pas de compteurs dénormalisés (likes/commentaires recomptés à chaque lecture) → colonnes `likes_count`/`comments_count` ou cache Redis, tranché au **lot 7**.

### `likes`
- 🔴 **Pas de contrainte `unique(post_id, user_id)`** → un même utilisateur peut liker plusieurs fois. Idempotence en base au **lot 7** (avec l'endpoint).
- 🟡 `softDeletes` à ajouter (lot 7).

### `comments` / `comment_replies`
- 🟠 `comment_replies` n'impose pas la profondeur : le modèle actuel permettrait des réponses de réponses. Décision produit : **1 seul niveau** → à garantir en logique (lot 7). Pas de changement de schéma requis, mais ajouter `softDeletes` (lot 7) et un index sur `comment_id`/`post_id`.
- Pas de table de **signalement** : créer **`reports`** (blueprint §3) — **lot 7**.

### `property_images`
- 🟡 `is_cover` non contraint : rien n'empêche deux covers pour une même propriété. À gérer en logique (lot 6b) + `softDeletes`.
- Ordre des photos absent → ajouter `position` (lot 6b).

### `messages`
- 🔴 Table de messagerie orpheline : aucune notion de **conversation**. Le domaine est reconstruit au **lot 8** autour de `conversations` (blueprint §3) ; l'actuelle `messages` sera remaniée (FK `conversation_id`, `read_at`). ✅ a déjà `softDeletes`.

### `devises` / `property_types`
- ✅ Tables de référence saines (`code` unique sur devises). 🟡 Pas de flag `is_active` pour désactiver sans supprimer (utile puisqu'on passe les FK en `restrict`). Optionnel — à ajouter si besoin de désactivation.
- ✅ Ordre de migration corrigé (lot 0+1 fix) : créées avant `properties`.

---

## 2. Décisions transverses

### 2.1 Soft-delete vs `onDelete('cascade')` (soulevé par la revue du lot 0+1) 🔴
Toutes les suppressions sont des soft deletes (décision produit), or les FK `onDelete('cascade')` **ne se déclenchent qu'au hard delete**. Conséquences :
- Soft-delete d'un `user` → son `agency` reste active en pointant vers un user « supprimé ».
- Soft-delete d'une `agency` → ses `properties` restent visibles ; et `PropertyPolicy::owns` interroge `agency()` (scopé par `SoftDeletes`) → le propriétaire perd l'accès à ses propres biens.

**Stratégie retenue** : cascade **applicative** de soft-delete via les événements de modèle (`deleting`/`restoring`), le long de la chaîne de possession `user → agency → properties → images` et `property → posts → comments/likes`. Les FK DB `cascade` sont **conservées** comme filet pour une purge RGPD par hard delete (lot 9). Implémentée dans chaque lot où la suppression existe (agency : lot 3 ; property : lot 6 ; social : lot 7). Correctif immédiat ciblé : `PropertyPolicy::owns` ne doit pas verrouiller un propriétaire → traité au lot 3 avec la refonte agence.

### 2.2 Cloisonnement multi-agences 🟠
Seule `properties` porte un `agency_id`. `properties.index` renvoie aujourd'hui **toutes** les agences confondues. Cible :
- Les tables portant `agency_id` : `properties` (+ futures `subscriptions`, `payments`, `agency_documents`).
- **Global scope** `BelongsToAgency` sur ces modèles, filtrant sur l'agence de l'utilisateur connecté, **neutralisé pour le rôle `admin`** et **désactivé pour la consultation publique** (index/show des biens publiés). Implémenté au **lot 6a** (listing public + dashboard agence) et **lot 3** (bypass admin).

### 2.3 États métier = enums contraints
Chaque état passe d'une string/booléen libre à un enum PHP adossé à une colonne contrainte : `UserRole` (lot 3), `AgencyStatus` (lot 3), `PropertyStatus` (lot 6a), `SubscriptionStatus`/`PaymentStatus` (lot 4), `ReportStatus` (lot 7).

---

## 3. Blueprints des nouvelles tables (créées dans leur lot)

Devise de référence : **XOF**. Montants stockés en entier (centimes/unités XOF) via `unsignedBigInteger` pour éviter les flottants.

### `plans` (lot 4)
`id, name, slug(unique), price(unsignedBigInteger, XOF), billing_period_months(tinyint: 1|6|12), property_quota(unsignedInt, nullable=illimité), featured_quota(unsignedInt), is_active(bool), timestamps`. Seed : 15 000 / 1 mois, 80 000 / 6 mois, 130 000 / 12 mois.

### `subscriptions` (lot 4)
`id, agency_id(FK), plan_id(FK, nullable après suppression logique du plan), status(enum: trialing|active|expired|cancelled), price_snapshot(unsignedBigInteger), quota_snapshot(json — fige ce qui a été facturé), trial_ends_at(nullable), starts_at, ends_at, timestamps, softDeletes`. L'abonnement **fige** prix + quotas (changer un plan ne réécrit pas l'historique). Trial 30 j démarrant à la définition du mot de passe (lot 3).

### `payments` (lot 4) & `transactions` (lot 4)
`payments : id, agency_id(FK), subscription_id(FK, nullable), purpose(enum: subscription|verification_badge), amount(unsignedBigInteger, XOF), status(enum: pending|paid|failed), paydunya_invoice_token(unique, nullable), timestamps, softDeletes`.
`transactions : id, payment_id(FK), provider(paydunya), event(enum: created|ipn_received|confirmed|failed), external_ref, signature_valid(bool), payload(json), timestamps` — **journal immuable** des notifications IPN, source de vérité, idempotent sur `external_ref`.

### `agency_documents` (lot 3)
`id, agency_id(FK), type(enum: id_card|business_registry|proof_of_address|other), path, original_name, reviewed_at(nullable), timestamps, softDeletes`.

### `agency_verifications` / badge (lot 5)
Réutilise `payments.purpose = verification_badge`. Sur l'agence : `verified_until(timestamp, nullable)` ; le badge est actif si `verified_until > now()`. Montant configurable en base (une ligne `plans`-like ou une table `settings`), pas en dur.

### `reports` (lot 7)
`id, reporter_id(FK users, nullable=invité? → décision : signalement ouvert à tous, donc nullable + ip), reportable_type/reportable_id(morph: comment|post|property), reason(enum), status(enum: pending|reviewed|dismissed), timestamps`.

### `conversations` (lot 8)
`id, property_id(FK, nullable si discussion générale), client_id(FK users), agency_id(FK), last_message_at, timestamps, softDeletes` + **unique(property_id, client_id, agency_id)**. `messages` remanié : `conversation_id(FK), sender_id, content, read_at(nullable)`.

### `password_setup_tokens` (lot 3)
Lien de définition de mot de passe (24 h, usage unique) pour l'onboarding agence. Réutilise possiblement `password_reset_tokens` (déjà en base, inutilisée aujourd'hui) ou table dédiée `id, agency_id, token(hash, unique), expires_at, used_at(nullable)`.

---

## 4. Plan de migrations de CE lot (existant uniquement)

Édition **en place** des migrations (app non déployée) plutôt que migrations correctives séparées :

1. `properties` : `property_type_id` → `restrictOnDelete()` ; `rooms`/`bedrooms` → `unsignedTinyInteger` ; `longitude`/`latitude` → `decimal(9,6)` nullable ; index sur `city`, `region`, `country`, `price`.
2. Modèle `Property` + `PropertyFactory` alignés (casts, valeurs factory décimales/entières).
3. Régression : les 42 tests existants doivent rester verts.

Tout le reste (`status` enums, nouvelles tables, `unique` likes, cloisonnement, cascade soft-delete) est **explicitement porté** à son lot feature, listé ci-dessus.

---

## 5. À confirmer avant migrations

1. **Typage** : `longitude`/`latitude` en `decimal(9,6)` (≈ 11 cm de précision, suffisant pour de l'annonce) — OK, ou tu veux du PostGIS plus tard ?
2. **`rooms`/`bedrooms`** en entier non signé (max 255) — OK ?
3. **Split assumé** : lot 2 = doc + migrations de l'existant ; nouvelles tables créées dans leurs lots. Ou tu veux que je crée dès maintenant `plans`+`subscriptions` (elles n'auraient pas encore de code ni de tests) ?
