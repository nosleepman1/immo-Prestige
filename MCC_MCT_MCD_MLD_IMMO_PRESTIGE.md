# ImmoPrestige — MCC, MCT, MCD, MLD

Document technique MERISE construit directement à partir du schéma réel du backend
(20 migrations Laravel, `backend/database/migrations/`) et des modèles Eloquent
(`backend/app/Models/`). Aucun schéma inventé : chaque attribut, association et
cardinalité ci-dessous correspond à une colonne, une clé étrangère ou une contrainte
qui existe réellement dans le code.

---

## 1. MCD — Modèle Conceptuel de Communication

### 1.1 Acteurs

| Acteur | Nature | Rôle |
|---|---|---|
| **Visiteur** | Externe, non authentifié | Consulte le feed public et les biens (`GET /posts`, `GET /properties`) |
| **Client** | Externe, authentifié (`role=user`) | Visiteur + interactions (like, commentaire, signalement, messagerie) |
| **Agence** | Externe, authentifiée (`role=agency`) | Gère son compte, ses biens, son abonnement, répond aux messages |
| **Administrateur** | Externe, authentifié (`role=admin`) | Valide/refuse les agences, modère les signalements, supervise la plateforme |
| **Système ImmoPrestige** | Interne | Backend Laravel : applique les règles de gestion, orchestre les flux |
| **PayDunya** | Externe, prestataire technique | Passerelle de paiement (abonnements, badge vérifié) |

### 1.2 Flux par processus

**Processus : Inscription et cycle de vie d'une agence**

| # | Émetteur | Récepteur | Flux |
|---|---|---|---|
| F1 | Agence | Système | Dossier d'inscription (identité, documents justificatifs) |
| F2 | Système | Administrateur | Dossier en attente de validation |
| F3 | Administrateur | Système | Décision (acceptation / refus + motif) |
| F4 | Système | Agence | Notification de décision + lien de création de mot de passe (si acceptée) |
| F5 | Agence | Système | Définition du mot de passe (token à usage unique, 24h) |
| F6 | Agence | Système | Dossier corrigé (si refusé, resoumission) |

**Processus : Abonnement et vérification (badge)**

| # | Émetteur | Récepteur | Flux |
|---|---|---|---|
| F7 | Agence | Système | Demande de souscription à un plan / demande de badge vérifié |
| F8 | Système | PayDunya | Création de facture (invoice) |
| F9 | PayDunya | Agence | Page de paiement (redirection) |
| F10 | Agence | PayDunya | Paiement |
| F11 | PayDunya | Système | Notification de paiement (IPN webhook) |
| F12 | Système | PayDunya | Confirmation / vérification de la transaction |
| F13 | Système | Agence | Activation de l'abonnement ou du badge vérifié |

**Processus : Publication et consultation d'un bien**

| # | Émetteur | Récepteur | Flux |
|---|---|---|---|
| F14 | Agence | Système | Création/mise à jour d'un bien + images |
| F15 | Système | Agence | Confirmation de publication (si abonnement actif) |
| F16 | Système | Visiteur/Client | Diffusion du bien publié (feed, recherche) |

**Processus : Interaction sociale et modération**

| # | Émetteur | Récepteur | Flux |
|---|---|---|---|
| F17 | Client | Système | Like / commentaire / réponse sur une publication |
| F18 | Système | Client | Mise à jour des compteurs (likes, commentaires) |
| F19 | Client | Système | Signalement d'un contenu (commentaire ou réponse) |
| F20 | Système | Administrateur | Signalement en attente de traitement |
| F21 | Administrateur | Système | Décision de modération (traité / classé sans suite) |

**Processus : Messagerie**

| # | Émetteur | Récepteur | Flux |
|---|---|---|---|
| F22 | Client | Système | Ouverture d'une conversation (depuis une fiche bien) |
| F23 | Client / Agence | Système | Envoi d'un message |
| F24 | Système | Agence / Client | Diffusion temps réel du message (canal Reverb) + accusé de lecture |

---

## 2. MCT — Modèle Conceptuel des Traitements

> Même logique de présentation que les tableaux de flux du MCC (section 1.2) :
> une ligne par traitement, dans l'ordre chronologique du processus. La dernière
> colonne indique si le résultat regénère un nouvel événement déclencheur (donc
> une nouvelle ligne du tableau, dans ce processus ou dans un autre).

### Processus 1 — Inscription et validation d'une agence

| # | Événement déclencheur | Opération | Règles d'émission | Résultat | Nouvel événement déclencheur ? |
|---|---|---|---|---|---|
| T1 | `E1` Dossier d'inscription soumis (F1) | Instruire le dossier | R1 : nom d'entreprise et numéro de pièce d'identité uniques<br>R2 : compte créé avec `status = pending`, sans mot de passe | Dossier en attente de validation (F2 vers Administrateur) | **Oui** → `E2`, dès la décision de l'administrateur |
| T2 | `E2` Décision administrateur reçue (F3) | Statuer sur le dossier | R3 : si acceptée → `status = accepted`, `activated_at` renseigné, génération d'un token de mot de passe (24h), démarrage automatique d'un essai gratuit (`trialing`, 30 jours)<br>R4 : si refusée → `status = refused`, motif obligatoire (`refusal_reason`) | Agence activée **(OU)** Agence refusée | **Oui, si acceptée** → `E3` du Processus 2 (essai gratuit démarré, l'agence peut ensuite souscrire) ; **Non si refusée** (fin de chaîne, sauf resoumission = nouveau `E1`) |

### Processus 2 — Abonnement et paiement (PayDunya)

| # | Événement déclencheur | Opération | Règles d'émission | Résultat | Nouvel événement déclencheur ? |
|---|---|---|---|---|---|
| T3 | `E3` Demande de souscription à un plan ou de badge vérifié (F7) | Créer la facture | R5 : montant dépendant du plan (`plans.price`) ou fixe pour le badge<br>R6 : `Payment` créé en `status = pending`, `provider = paydunya` | Facture créée, redirection vers PayDunya (F8, F9) | **Oui** → `E4`, dès réception de la notification IPN |
| T4 | `E4` Notification IPN reçue de PayDunya (F11) | Vérifier et confirmer le paiement | R7 : signature du webhook valide (`hash = sha512(clé secrète)`) sinon rejet + simple journalisation<br>R8 : re-confirmation obligatoire auprès de PayDunya (le webhook seul n'est jamais suffisant)<br>R9 : si `purpose = subscription` → activation/prolongation de l'abonnement ; si `purpose = verification_badge` → `agencies.verified_until` mis à jour | Paiement confirmé + avantage activé **(OU)** Paiement rejeté/invalide | **Non** — fin de chaîne ; chaque notification (valide ou non) produit une trace `Transaction`, mais n'engendre pas d'autre traitement métier |

### Processus 3 — Publication d'un bien

| # | Événement déclencheur | Opération | Règles d'émission | Résultat | Nouvel événement déclencheur ? |
|---|---|---|---|---|---|
| T5 | `E5` Demande de publication d'un bien (F14) | Contrôler puis publier | R10 : l'agence doit avoir un abonnement actif (`Subscription.isActive()`)<br>R11 : le quota de biens du plan ne doit pas être dépassé (`property_quota`)<br>R12 : passage de `status = draft` à `status = published` | Bien publié et diffusé publiquement (F16) **(OU)** Refus (abonnement inactif ou quota dépassé) | **Oui, si publié** → `E6` du Processus 4, dès qu'un client interagit avec la publication générée ; **Non si refusé** |

### Processus 4 — Interaction sociale (like / commentaire / signalement)

| # | Événement déclencheur | Opération | Règles d'émission | Résultat | Nouvel événement déclencheur ? |
|---|---|---|---|---|---|
| T6 | `E6` Action d'un client sur une publication : like, commentaire ou réponse (F17) | Enregistrer l'interaction | R13 : un like est un couple unique `(post_id, user_id)` — une seconde action bascule en suppression (toggle)<br>R14 : un commentaire/réponse nécessite un compte authentifié | Compteur mis à jour, `likes_count`/`comments_count` (F18) | **Non** — traitement terminal, sauf signalement ultérieur du contenu créé |
| T7 | `E7` Signalement d'un commentaire ou d'une réponse (F19) | Enregistrer le signalement | R15 : `status = pending` par défaut, motif parmi `spam/abusive/inappropriate/other` | Signalement mis en file de modération (F20) | **Oui** → `E8`, dès la décision de modération de l'administrateur |
| T8 | `E8` Décision de modération de l'administrateur (F21) | Traiter le signalement | R16 : passage à `reviewed` (contenu supprimé le cas échéant) ou `dismissed` | Signalement clos | **Non** — fin de chaîne |

### Processus 5 — Messagerie temps réel

| # | Événement déclencheur | Opération | Règles d'émission | Résultat | Nouvel événement déclencheur ? |
|---|---|---|---|---|---|
| T9 | `E9` Premier contact d'un client avec une agence, depuis une fiche bien (F22) | Ouvrir la conversation | R17 : unicité du triplet `(property_id, client_id, agency_id)` — pas de doublon de conversation | Conversation créée ou réutilisée | **Oui** → `E10`, dès l'envoi du premier message |
| T10 | `E10` Envoi d'un message (F23) | Diffuser le message | R18 : mise à jour de `conversations.last_message_at`<br>R19 : diffusion instantanée sur le canal Reverb `conversation.{id}` au destinataire connecté | Message reçu en temps réel + compteur de non-lus mis à jour (F24) | **Oui, cyclique** → réémet `E10` à chaque nouveau message dans la même conversation |

---

## 3. MCD — Objets, attributs et associations (texte)

> Notation : identifiant souligné en **gras-italique**. Les clés étrangères ne sont
> **pas** listées comme attributs des entités (niveau conceptuel) : elles sont
> portées par les associations ci-après (3.2). Les types/contraintes physiques
> détaillés se trouvent dans le MLD (section 4).

### 3.1 Entités et attributs

1. **UTILISATEUR**
   *__id__*, nom, email, mot_de_passe, rôle (admin / agence / utilisateur), email_vérifié_le

2. **AGENCE**
   *__id__*, nom_entreprise, nom_gérant, description, adresse, ville, zone_activité, téléphone,
   numéro_pièce_identité, statut (en_attente / acceptée / refusée), motif_refus, examinée_le,
   activée_le, vérifiée_jusqu_au

3. **DOCUMENT_AGENCE**
   *__id__*, type (pièce_identité / registre_commerce / justificatif_domicile / autre),
   chemin_fichier, nom_original, examiné_le

4. **TOKEN_MOT_DE_PASSE**
   *__id__*, jeton, expire_le, utilisé_le

5. **TYPE_BIEN**
   *__id__*, nom

6. **DEVISE**
   *__id__*, nom, code

7. **BIEN**
   *__id__*, nom, description, surface, nb_pièces, nb_chambres, étage, meublé,
   prix, pays, région, ville, longitude, latitude, vendu, statut (brouillon / publié / archivé)

8. **IMAGE_BIEN**
   *__id__*, chemin_image, est_couverture, position

9. **PUBLICATION** *(post)*
   *__id__*

10. **COMMENTAIRE**
    *__id__*, contenu

11. **RÉPONSE_COMMENTAIRE**
    *__id__*, contenu

12. **J'AIME** *(like)*
    *__id__*

13. **SIGNALEMENT**
    *__id__*, motif (spam / abusif / inapproprié / autre), détails,
    statut (en_attente / traité / classé_sans_suite)

14. **PLAN**
    *__id__*, nom, slug, prix, durée_facturation_mois, quota_biens, quota_biens_vedette, actif

15. **ABONNEMENT**
    *__id__*, statut (essai / actif / expiré / annulé), prix_figé, quota_figé,
    essai_expire_le, débute_le, se_termine_le

16. **PAIEMENT**
    *__id__*, objet (abonnement / badge_vérifié), montant, statut (en_attente / payé / échoué),
    fournisseur, jeton_facture

17. **TRANSACTION**
    *__id__*, événement, référence_externe, signature_valide, charge_utile

18. **PARAMÈTRE** *(settings)*
    *__clé__*, valeur

19. **CONVERSATION**
    *__id__*, dernier_message_le

20. **MESSAGE**
    *__id__*, contenu, lu_le

### 3.2 Associations et cardinalités

| Association | Entité A | Card. A | Entité B | Card. B | Notes |
|---|---|---|---|---|---|
| POSSÈDE | UTILISATEUR | (0,1) | AGENCE | (1,1) | un utilisateur possède au plus une agence ; une agence appartient à exactement un utilisateur |
| EXAMINE | UTILISATEUR (admin) | (0,N) | AGENCE | (0,1) | un admin examine 0..N agences ; une agence est examinée par 0 ou 1 admin |
| FOURNIT | AGENCE | (1,1) | DOCUMENT_AGENCE | (0,N) | |
| DEMANDE | UTILISATEUR | (1,1) | TOKEN_MOT_DE_PASSE | (0,N) | jetons de définition de mot de passe |
| CLASSE | TYPE_BIEN | (1,1) | BIEN | (0,N) | |
| LIBELLE | DEVISE | (1,1) | BIEN | (0,N) | |
| PROPOSE | AGENCE | (1,1) | BIEN | (0,N) | |
| ILLUSTRE | BIEN | (1,1) | IMAGE_BIEN | (0,N) | |
| GÉNÈRE | BIEN | (0,1) | PUBLICATION | (1,1) | une publication porte sur exactement un bien ; un bien génère au plus une publication |
| PUBLIE | UTILISATEUR | (1,1) | PUBLICATION | (0,N) | auteur de la publication (compte de l'agence) |
| AIME | UTILISATEUR | (0,N) | J'AIME | (1,1) | |
| CONCERNE | PUBLICATION | (0,N) | J'AIME | (1,1) | contrainte d'unicité : un couple (utilisateur, publication) au plus une fois |
| RÉDIGE | UTILISATEUR | (0,N) | COMMENTAIRE | (1,1) | |
| PORTE_SUR | PUBLICATION | (0,N) | COMMENTAIRE | (1,1) | |
| RÉPOND | UTILISATEUR | (0,N) | RÉPONSE_COMMENTAIRE | (1,1) | |
| PROLONGE | COMMENTAIRE | (0,N) | RÉPONSE_COMMENTAIRE | (1,1) | |
| SIGNALE | UTILISATEUR | (0,N) | SIGNALEMENT | (1,1) | l'auteur du signalement |
| CIBLE | SIGNALEMENT | (1,1) | COMMENTAIRE **ou** RÉPONSE_COMMENTAIRE | (0,N) | association polymorphe (`reportable`) ; un signalement cible exactement un contenu, un contenu peut recevoir 0..N signalements |
| DÉCLINE | PLAN | (1,1) | ABONNEMENT | (0,N) | `plan_id` nullable → un abonnement peut exister sans plan figé |
| SOUSCRIT | AGENCE | (1,1) | ABONNEMENT | (0,N) | historique des abonnements successifs |
| RÈGLE | AGENCE | (1,1) | PAIEMENT | (0,N) | |
| FINANCE | ABONNEMENT | (0,1) | PAIEMENT | (0,N) | |
| TARIFE | PLAN | (0,1) | PAIEMENT | (0,N) | |
| JOURNALISE | PAIEMENT | (0,1) | TRANSACTION | (0,N) | une transaction peut être orpheline (IPN sur jeton inconnu) |
| ÉCHANGE_AUTOUR | BIEN | (0,1) | CONVERSATION | (0,N) | conversation générale possible sans bien précis |
| INITIE | UTILISATEUR (client) | (1,1) | CONVERSATION | (0,N) | |
| PARTICIPE | AGENCE | (1,1) | CONVERSATION | (0,N) | contrainte d'unicité : (bien, client, agence) |
| CONTIENT | CONVERSATION | (1,1) | MESSAGE | (0,N) | |
| ENVOIE | UTILISATEUR (expéditeur) | (0,N) | MESSAGE | (1,1) | expéditeur = client ou agence selon le sens |

### 3.3 Contraintes particulières

- **Association polymorphe CIBLE** : `SIGNALEMENT` pointe vers `COMMENTAIRE` ou
  `RÉPONSE_COMMENTAIRE` (implémentation `morphTo` côté code). La publication (`PUBLICATION`)
  est mentionnée comme cible possible dans le commentaire de migration mais n'est
  **pas** implémentée côté modèle à ce jour (écart connu entre intention et code).
- **Unicité AIME/CONCERNE** : une même personne ne peut aimer deux fois la même
  publication (contrainte composite `(post_id, user_id)`), sans suppression logique
  (l'annulation d'un like est une suppression physique).
- **Unicité PARTICIPE** : une conversation est unique pour un triplet
  (bien, client, agence) — retirer une nouvelle demande de contact rouvre la même
  conversation plutôt que d'en créer une autre.
- **Auto-association sur AGENCE via UTILISATEUR** : deux rôles distincts du même
  type d'entité UTILISATEUR interviennent sur AGENCE (le propriétaire via POSSÈDE,
  l'administrateur examinateur via EXAMINE).
- **Suppression logique en cascade applicative** : la suppression d'un UTILISATEUR
  entraîne la suppression logique de son AGENCE ; la suppression d'une AGENCE
  entraîne celle de ses BIENS et DOCUMENTS_AGENCE (logique portée par le code, pas
  par la base).

---

## 4. MLD — Modèle Logique de Données

Notation : soulignement = clé primaire, `#` = clé étrangère.

```
UTILISATEURS (id, nom, email, mot_de_passe, rôle, email_vérifié_le, deleted_at, created_at, updated_at)

AGENCES (id, nom_entreprise, nom_gérant, description, adresse, ville, zone_activité,
         téléphone, numéro_pièce_identité, statut, motif_refus,
         #examiné_par → UTILISATEURS.id, examiné_le, activé_le, vérifié_jusqu_au,
         #utilisateur_id → UTILISATEURS.id, deleted_at, created_at, updated_at)

DOCUMENTS_AGENCE (id, #agence_id → AGENCES.id, type, chemin_fichier, nom_original,
                  examiné_le, deleted_at, created_at, updated_at)

TOKENS_MOT_DE_PASSE (id, #utilisateur_id → UTILISATEURS.id, jeton, expire_le,
                     utilisé_le, created_at, updated_at)

TYPES_BIEN (id, nom, created_at, updated_at)

DEVISES (id, nom, code, created_at, updated_at)

BIENS (id, #type_bien_id → TYPES_BIEN.id, #agence_id → AGENCES.id, #devise_id → DEVISES.id,
       nom, description, surface, nb_pièces, nb_chambres, étage, meublé, prix,
       pays, région, ville, longitude, latitude, vendu, statut,
       deleted_at, created_at, updated_at)

IMAGES_BIEN (id, #bien_id → BIENS.id, chemin_image, est_couverture, position,
             deleted_at, created_at, updated_at)

PUBLICATIONS (id, #utilisateur_id → UTILISATEURS.id, #bien_id → BIENS.id [unique],
              deleted_at, created_at, updated_at)

COMMENTAIRES (id, #publication_id → PUBLICATIONS.id, #utilisateur_id → UTILISATEURS.id,
              contenu, deleted_at, created_at, updated_at)

RÉPONSES_COMMENTAIRE (id, #commentaire_id → COMMENTAIRES.id, #utilisateur_id → UTILISATEURS.id,
                      contenu, deleted_at, created_at, updated_at)

JAIME (id, #publication_id → PUBLICATIONS.id, #utilisateur_id → UTILISATEURS.id [unique (publication_id, utilisateur_id)],
       created_at, updated_at)

SIGNALEMENTS (id, #signaleur_id → UTILISATEURS.id, cible_type, #cible_id,
              motif, détails, statut, created_at, updated_at)

PLANS (id, nom, slug [unique], prix, durée_facturation_mois, quota_biens,
       quota_biens_vedette, actif, created_at, updated_at)

ABONNEMENTS (id, #agence_id → AGENCES.id, #plan_id → PLANS.id,
             statut, prix_figé, quota_figé, essai_expire_le, débute_le, se_termine_le,
             deleted_at, created_at, updated_at)

PAIEMENTS (id, #agence_id → AGENCES.id, #abonnement_id → ABONNEMENTS.id,
           #plan_id → PLANS.id, objet, montant, statut, fournisseur,
           jeton_facture [unique], deleted_at, created_at, updated_at)

TRANSACTIONS (id, #paiement_id → PAIEMENTS.id, événement, référence_externe,
              signature_valide, charge_utile, created_at, updated_at)

PARAMÈTRES (clé, valeur, created_at, updated_at)

CONVERSATIONS (id, #bien_id → BIENS.id, #client_id → UTILISATEURS.id,
               #agence_id → AGENCES.id [unique (bien_id, client_id, agence_id)],
               dernier_message_le, deleted_at, created_at, updated_at)

MESSAGES (id, #conversation_id → CONVERSATIONS.id, #expéditeur_id → UTILISATEURS.id,
          contenu, lu_le, deleted_at, created_at, updated_at)
```

### Notes de passage au MLD

- Les FK nullables (`ABONNEMENTS.plan_id`, `PAIEMENTS.abonnement_id`,
  `PAIEMENTS.plan_id`, `TRANSACTIONS.paiement_id`, `CONVERSATIONS.bien_id`) traduisent
  les cardinalités (0,1) côté association identifiées en MCD.
- `SIGNALEMENTS.cible_type / cible_id` est la traduction relationnelle classique
  d'une association polymorphe (`morphs()` Laravel) : pas de FK SQL réelle, la
  cohérence est garantie applicativement.
- Tables techniques exclues volontairement du MCD/MLD car hors du domaine métier :
  `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `sessions`,
  `password_reset_tokens`, `personal_access_tokens` (Sanctum). Ce sont des tables
  d'infrastructure Laravel, pas des objets du domaine immobilier.
