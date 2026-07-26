# Plan d'implementation — Module Location (lots 10 a 16)

Document de reference a valider **avant** toute ecriture de code. Il fige le modele de
donnees, les regles de gestion, les workflows, les endpoints et le decoupage en lots.
Il complete [MCC_MCT_MCD_MLD_IMMO_PRESTIGE.md](MCC_MCT_MCD_MLD_IMMO_PRESTIGE.md) et
[DICTIONNAIRE_DE_DONNEES_IMMO_PRESTIGE.md](DICTIONNAIRE_DE_DONNEES_IMMO_PRESTIGE.md),
qui devront etre repris une fois ce plan valide.

---

## 1. Contexte et perimetre

L'application couvre aujourd'hui la **mise en relation** : une agence publie des biens,
un client les consulte, commente, et contacte l'agence par messagerie. La transaction
elle-meme se fait hors ligne. Les seuls paiements existants vont de l'agence vers la
plateforme (abonnement, badge verifie).

Le module Location introduit une **transaction recurrente entre le client et l'agence** :
demande de location, contrat, signature, encaissement mensuel, suivi d'incidents.
C'est un changement de nature, pas une simple fonctionnalite : la plateforme cesse
d'etre un catalogue pour devenir un outil de gestion locative.

**Perimetre couvert par ce plan** : lots 10 a 16 (voir section 13).
**Hors perimetre** : voir section 16.

---

## 2. Decisions d'architecture

### 2.1 Specialisation de `properties` (generalisation / specialisation)

**Decision.** `properties` reste l'entite mere et porte tout le commun. Deux
specialisations 1:1 portent le specifique :

- `property_sale_details` — prix de vente, negociabilite
- `property_rental_details` — loyer, charges, caution, avance, duree minimale, disponibilite

Un discriminant `transaction_type` (`sale` / `rent` / `both`) est porte par la mere.

**Justification.**

1. Aucune colonne locative nullable ne pollue les biens en vente, et inversement.
2. Le cas « a vendre **ou** a louer » est natif : le bien porte simplement ses deux
   specialisations. Une contrainte d'exclusion l'aurait interdit.
3. `properties` demeure **l'unique entite referencee** par `property_images`, `posts`,
   `conversations` et `leases`. Aucune cle etrangere existante n'est touchee.
4. En MERISE, c'est une specialisation avec **contrainte de totalite (T)** : tout bien
   possede au moins une specialisation. Pas de partition (XT), puisque le cumul est permis.

**Alternative ecartee.** Deux tables completes et independantes (heritage par tables
concretes) : elle aurait duplique la vingtaine de colonnes communes et casse toutes les
cles etrangeres existantes vers `properties`.

**Contrainte applicative.** Eloquent n'implemente pas l'heritage de tables. La
specialisation se traduit par deux relations `hasOne` (`saleDetails`, `rentalDetails`)
avec chargement anticipe obligatoire dans le fil, la recherche et les fiches. A inscrire
dans les conventions du projet.

### 2.2 Extension de `payments` plutot qu'une table dediee

**Decision.** Les loyers et la caution passent par la table `payments` existante,
etendue, et non par une nouvelle table `rent_payments`.

**Justification.** Toute la chaine PayDunya est deja construite et eprouvee : creation de
facture, webhook IPN, verification de signature, re-confirmation aupres du prestataire,
idempotence, journal `transactions`. La dupliquer pour les loyers creerait deux chemins
de paiement a maintenir et deux surfaces de bug comptable.

**Consequence a documenter.** Le sens de `agency_id` change selon `purpose` :

| `purpose` | Payeur | Beneficiaire |
|---|---|---|
| `subscription`, `verification_badge` | l'agence | la plateforme |
| `rent`, `deposit` | le client (`payer_user_id`) | l'agence (`agency_id`) |

C'est le point le plus subtil du lot. Il doit etre couvert par des tests explicites.

### 2.3 Ne pas surcharger `reports`

Le « signalement d'un probleme dans le logement » et le « signalement d'un contenu
abusif » portent le meme nom en francais mais n'ont aucun rapport. `reports` reste
reserve a la moderation de contenu. Les incidents locatifs vont dans
`maintenance_tickets`.

### 2.4 Notifications : brique manquante

Il n'existe aujourd'hui **aucun systeme de notification** (seulement la messagerie et un
courriel de definition de mot de passe). Le workflow locatif en depend a onze etapes.

**Decision.** Notifications Laravel sur **trois canaux simultanes** :

| Canal | Role | Portee |
|---|---|---|
| `database` | Historique consultable dans l'application, compteur de non-lus | **Tous** les evenements |
| `broadcast` (Reverb) | Mise a jour instantanee sans rechargement | **Tous** les evenements |
| `mail` | Atteindre l'utilisateur hors application | **Evenements actionnables uniquement** (voir section 9) |

Le courriel est volontairement **restreint**. Notifier par mail chaque changement de
statut de ticket ferait fuir l'utilisateur et ferait classer le domaine en spam. Seuls
les evenements qui demandent une action ou engagent de l'argent partent par mail.

Chaque notification implemente `ShouldQueue` : l'envoi passe par la file Redis deja en
place, jamais dans le cycle de la requete HTTP.

**Prerequis d'infrastructure.** `MAIL_MAILER` vaut actuellement `log` : les courriels ne
partent nulle part. Il faut un SMTP reel (ou Mailgun / Postmark) avant la recette. A
ajouter aux cles gerees par `dev.ps1`.

### 2.5 Representation des montants

Le sujet merite d'etre tranche precisement, car deux conventions coexistent aujourd'hui
dans le schema : `properties.price` en `decimal(12,2)` mais `plans.price` et
`payments.amount` en `unsignedBigInteger`.

**Distinction retenue : un montant affiche n'est pas un montant encaisse.**

| Nature | Type | Devise | Justification |
|---|---|---|---|
| **Montant encaisse** (loyer, charges, caution, avance, echeance, paiement) | `unsignedBigInteger` | **XOF exclusivement** | PayDunya n'opere qu'en francs CFA, et le franc CFA n'a pas de subdivision en circulation. L'entier supprime toute erreur d'arrondi sur une chaine qui manipule de l'argent reel. |
| **Prix de vente affiche** | `decimal(12,2)` + `devise_id` | multi-devises | Purement informatif : aucun encaissement ne transite par l'application pour une vente. Les decimales restent necessaires pour l'euro ou le dollar. |

**Consequence.** `property_rental_details` ne porte **pas** de `devise_id` : tout loyer
est en XOF. C'est une contrainte assumee, alignee sur la realite du marche et du
prestataire de paiement. `property_sale_details` conserve la devise heritee de la mere.

**Regle de codage.** Aucun montant encaisse ne transite jamais par un flottant, ni en
PHP, ni en JSON, ni dans les frontends. Le formatage decimal se fait a l'affichage
uniquement.

### 2.6 A qui appartient le bien ? (point leve en revue)

Le modele actuel dit que le bien appartient a l'agence (`properties.agency_id`), ce qui
est faux dans la majorite des cas locatifs : une agence **gere** le bien d'un tiers.

**Decision : propriete optionnelle, deux cas couverts par un seul modele.**

| `proprietaire_id` | Signification | Cas d'usage |
|---|---|---|
| `NULL` | L'agence est proprietaire du bien | Promoteur, agence detenant son parc |
| renseigne | L'agence gere le bien pour un tiers (mandat) | Cas dominant en location |

Dans les deux cas, `agency_id` conserve le meme sens : **l'agence responsable de la
gestion et de la publication**. Aucune ambiguite introduite.

**Pourquoi creer la table maintenant meme sans portail proprietaire ?** Trois raisons :

1. **Juridique.** Le bailleur au contrat est le proprietaire, pas l'agence. Sans cette
   donnee, le contrat genere est faux des la premiere location pour compte de tiers.
2. **Cout de report.** Ajouter une cle etrangere sur une table portant des baux actifs
   et des encaissements est une migration risquee. Maintenant, c'est une colonne vide.
3. **Comptabilite future.** Le reversement au proprietaire moins commission suppose de
   savoir a qui reverser.

**Le proprietaire suit-il l'evolution ?** Question distincte, tranchee separement :

| Niveau | Contenu | Cout |
|---|---|---|
| **N1 — retenu pour ces 5 jours** | Le proprietaire est une **fiche** : identite, contact, piece d'identite. Saisi par l'agence, utilise dans le contrat. Pas de compte, pas d'acces. L'agence lui rend compte hors application. | 1 table, negligeable |
| **N2 — reporte** | Le proprietaire dispose d'un compte et d'un espace en **lecture seule** : ses biens, leur occupation, les baux en cours, les loyers encaissees, les impayes, les incidents ouverts, ce qui lui est du. | Nouveau role, policies dediees, ~12 endpoints, une surface frontend entiere, et le calcul de commission — sinon il n'y a rien a « suivre ». Soit **2 a 3 jours a part entiere.** |

Le niveau N2 n'a de sens qu'accompagne du mandat de gestion et de la commission : sans
eux, le proprietaire consulterait des loyers encaissees sans savoir ce qui lui revient.
C'est pourquoi les trois vont ensemble, hors perimetre des 5 jours (section 16).

`proprietaires.user_id` est prevu des maintenant en nullable : le passage au niveau N2
consistera a rattacher un compte, sans toucher au schema.

### 2.7 Convention de nommage : code en anglais, documentation en francais

Le schema existant est integralement en anglais (`company_name`, `manager_name`,
`refusal_reason`, `verified_until`). La documentation MERISE deja produite est
integralement en francais (`nom_entreprise`, `nom_gerant`, `motif_refus`,
`verifie_jusqu_au`).

**Cette dualite est conservee** : rompre avec l'anglais cote base creerait un schema
hybride illisible, et le francais reste obligatoire cote documentation academique.

Les definitions de tables de la section 3.2 sont donnees en **francais pour la lecture**.
Les colonnes reelles suivent la transposition anglaise systematique ci-dessous, et le
dictionnaire de donnees porte la correspondance complete.

| Francais (documentation) | Anglais (base) |
|---|---|
| loyer_mensuel | `rent_amount` |
| charges_mensuelles | `charges_amount` |
| caution | `deposit_amount` |
| mois_avance | `advance_months` |
| duree_minimale_mois | `min_lease_months` |
| disponible_a_partir_du | `available_from` |
| statut | `status` |
| date_debut / date_fin | `start_date` / `end_date` |
| duree_mois | `duration_months` |
| jour_echeance | `payment_day` |
| preavis_jours | `notice_period_days` |
| periode_debut / periode_fin | `period_start` / `period_end` |
| date_echeance | `due_date` |
| montant_total / montant_regle | `total_amount` / `paid_amount` |
| montant_impute | `applied_amount` |
| contrat_genere_chemin | `generated_contract_path` |
| contrat_signe_chemin | `signed_contract_path` |
| quittance_chemin | `receipt_path` |
| motif_refus / motif_resiliation | `rejection_reason` / `termination_reason` |
| categorie / priorite | `category` / `priority` |
| prix / negociable | `price` / `negotiable` |

---

## 3. Modele de donnees

### 3.1 Refactors sur l'existant

#### `properties`

| Action | Colonne | Type | Detail |
|---|---|---|---|
| Ajout | `transaction_type` | enum | `sale` / `rent` / `both`, indexe |
| Ajout | `availability` | enum | `available` / `reserved` / `sold` / `rented`, defaut `available`, indexe |
| Ajout | `proprietaire_id` | foreignId nullable | → `proprietaires`, `nullOnDelete` |
| Suppression | `price` | — | deplace vers `property_sale_details` |
| Suppression | `sold` | — | remplace par `availability` |

`devise_id` reste sur la mere : un bien n'a qu'une devise, quelle que soit la transaction.

#### `payments`

| Action | Colonne | Type | Detail |
|---|---|---|---|
| Modif enum | `purpose` | enum | + `rent`, + `deposit` |
| Ajout | `lease_id` | foreignId nullable | → `leases`, `nullOnDelete` |
| Ajout | `payer_user_id` | foreignId nullable | → `users`, `nullOnDelete` |
| Ajout | `method` | enum | `paydunya` / `cash`, defaut `paydunya` |
| Ajout | `validated_by` | foreignId nullable | → `users`, encaissement especes |
| Ajout | `validated_at` | timestamp nullable | horodatage de validation |
| Modif | `provider` | string nullable | un paiement especes n'a pas de prestataire |

#### `plans`

Aucun changement obligatoire. Un `lease_quota` pourra etre ajoute ulterieurement pour
plafonner le nombre de baux actifs par formule.

#### `users`

Aucun changement. Le proprietaire n'est pas un role : c'est une entite rattachable
optionnellement a un compte.

### 3.2 Nouvelles tables

#### `proprietaires`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| agency_id | foreignId | → `agencies`, cascade |
| user_id | foreignId nullable | → `users`, nullOnDelete (compte optionnel) |
| nom | string(255) | |
| prenom | string(255) nullable | |
| telephone | string(255) | |
| email | string(255) nullable | |
| adresse | string(255) nullable | |
| numero_piece_identite | string(255) nullable | |
| notes | text nullable | |
| timestamps, softDeletes | | |

#### `property_sale_details`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| property_id | foreignId | → `properties`, cascade, **unique** |
| prix | decimal(12,2) | > 0 |
| negociable | boolean | defaut `false` |
| timestamps | | |

#### `property_rental_details`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| property_id | foreignId | → `properties`, cascade, **unique** |
| loyer_mensuel | unsignedBigInteger | > 0 |
| charges_mensuelles | unsignedBigInteger | defaut 0 |
| caution | unsignedBigInteger | defaut 0 |
| mois_avance | unsignedTinyInteger | defaut 1 |
| duree_minimale_mois | unsignedSmallInteger | defaut 12 |
| disponible_a_partir_du | date nullable | |
| timestamps | | |

#### `rental_applications`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| property_id | foreignId | → `properties`, cascade |
| agency_id | foreignId | → `agencies`, cascade |
| applicant_user_id | foreignId | → `users`, cascade |
| statut | enum | `submitted` / `under_review` / `documents_requested` / `accepted` / `rejected` / `cancelled`, defaut `submitted`, indexe |
| date_debut_souhaitee | date | |
| duree_souhaitee_mois | unsignedSmallInteger | |
| message | text nullable | |
| motif_refus | text nullable | |
| reviewed_by | foreignId nullable | → `users` |
| reviewed_at | timestamp nullable | |
| timestamps, softDeletes | | |

Index composite `(agency_id, statut)`. Contrainte metier : une seule demande active par
couple `(property_id, applicant_user_id)`.

#### `rental_application_documents`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| rental_application_id | foreignId | → cascade |
| type | enum | `piece_identite` / `justificatif_revenus` / `attestation_travail` / `autre` |
| chemin_fichier | string(255) | |
| nom_original | string(255) | |
| timestamps, softDeletes | | |

#### `contract_templates`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| agency_id | foreignId | → `agencies`, cascade |
| nom | string(255) | |
| est_defaut | boolean | defaut `false` |
| timestamps, softDeletes | | |

Une seule ligne `est_defaut = true` par agence.

#### `contract_clauses`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| contract_template_id | foreignId | → cascade |
| position | unsignedInteger | defaut 0 |
| titre | string(255) | |
| corps | text | texte a variables, voir section 8 |
| est_obligatoire | boolean | defaut `false` |
| timestamps, softDeletes | | |

#### `leases`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| reference | string(50) | **unique**, format `BAIL-AAAA-NNNNN` |
| property_id | foreignId | → `properties`, restrictOnDelete |
| agency_id | foreignId | → `agencies`, cascade |
| tenant_user_id | foreignId | → `users`, restrictOnDelete |
| proprietaire_id | foreignId nullable | → `proprietaires`, nullOnDelete |
| rental_application_id | foreignId nullable | → nullOnDelete |
| contract_template_id | foreignId nullable | → nullOnDelete |
| date_debut | date | |
| date_fin | date | |
| duree_mois | unsignedSmallInteger | |
| loyer_mensuel | unsignedBigInteger | fige a la signature |
| charges_mensuelles | unsignedBigInteger | fige a la signature |
| caution | unsignedBigInteger | fige a la signature |
| mois_avance | unsignedTinyInteger | fige a la signature |
| periodicite | enum | `monthly` / `quarterly` / `biannual` / `annual`, defaut `monthly` |
| jour_echeance | unsignedTinyInteger | 1 a 28, defaut 5 |
| preavis_jours | unsignedSmallInteger | defaut 30 |
| statut | enum | `draft` / `pending_validation` / `pending_signature` / `pending_payment` / `active` / `terminated` / `expired` / `cancelled`, indexe |
| contrat_genere_chemin | string(255) nullable | PDF produit par la plateforme |
| contrat_signe_chemin | string(255) nullable | scan televerse par le client |
| signe_le | timestamp nullable | |
| validated_by | foreignId nullable | → `users` |
| validated_at | timestamp nullable | |
| date_resiliation | date nullable | |
| motif_resiliation | text nullable | |
| timestamps, softDeletes | | |

Index composite `(agency_id, statut)`. Les montants sont **figes** a la generation du
contrat : une revalorisation ulterieure du bien ne modifie pas les baux en cours.

#### `lease_installments`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| lease_id | foreignId | → cascade |
| reference | string(50) | **unique**, format `QUIT-AAAA-NNNNN` |
| periode_debut | date | |
| periode_fin | date | |
| date_echeance | date | indexe |
| montant_loyer | unsignedBigInteger | |
| montant_charges | unsignedBigInteger | |
| montant_total | unsignedBigInteger | |
| montant_regle | unsignedBigInteger | defaut 0 |
| statut | enum | `pending` / `partially_paid` / `paid` / `late` / `cancelled`, indexe |
| paye_le | timestamp nullable | |
| quittance_chemin | string(255) nullable | |
| timestamps | | |

Contrainte d'unicite `(lease_id, periode_debut)` : pas de doublon d'echeance.

#### `installment_payment` (association porteuse)
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| payment_id | foreignId | → cascade |
| lease_installment_id | foreignId | → cascade |
| montant_impute | unsignedBigInteger | |
| timestamps | | |

Unicite `(payment_id, lease_installment_id)`. **C'est la piece qui permet de regler
plusieurs mois en une fois** : un `payment` relie a N echeances, chacune recevant son
montant impute.

#### `maintenance_tickets`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| reference | string(50) | **unique**, format `TIC-AAAA-NNNNN` |
| lease_id | foreignId | → cascade |
| property_id | foreignId | → cascade |
| reported_by_user_id | foreignId | → `users`, cascade |
| categorie | enum | `plomberie` / `electricite` / `structure` / `equipement` / `securite` / `autre` |
| priorite | enum | `basse` / `normale` / `haute` / `urgente`, defaut `normale` |
| titre | string(255) | |
| description | text | |
| statut | enum | `open` / `acknowledged` / `in_progress` / `resolved` / `closed` / `rejected`, indexe |
| resolu_le | timestamp nullable | |
| note_resolution | text nullable | |
| timestamps, softDeletes | | |

#### `maintenance_ticket_images`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| maintenance_ticket_id | foreignId | → cascade |
| chemin_image | string(255) | |
| position | unsignedInteger | defaut 0 |
| timestamps, softDeletes | | |

#### `maintenance_ticket_messages`
| Colonne | Type | Contraintes |
|---|---|---|
| id | bigIncrements | PK |
| maintenance_ticket_id | foreignId | → cascade |
| user_id | foreignId | → `users`, cascade |
| contenu | text | |
| timestamps, softDeletes | | |

#### `notifications` (table standard Laravel)
`id` (uuid PK), `type`, `notifiable_type`, `notifiable_id`, `data` (json), `read_at`,
timestamps.

### 3.3 Enums

**Nouveaux** — `TransactionType`, `PropertyAvailability`, `RentalApplicationStatus`,
`ApplicationDocumentType`, `LeaseStatus`, `LeasePeriodicity`, `InstallmentStatus`,
`PaymentMethod`, `MaintenanceCategory`, `MaintenancePriority`, `MaintenanceStatus`.

**Modifie** — `PaymentPurpose` : ajout de `Rent` et `Deposit`.

### 3.4 Migration des donnees existantes

Ordre imperatif, dans une transaction :

1. Creer `property_sale_details` et `property_rental_details`.
2. Pour chaque `property` existante : creer une ligne `property_sale_details` avec
   `prix = properties.price`.
3. Renseigner `transaction_type = 'sale'` sur toutes les lignes existantes.
4. Renseigner `availability` : `sold = true` → `sold`, sinon → `available`.
5. Supprimer les colonnes `price` et `sold` de `properties`.
6. Sur `payments` existants : `method = 'paydunya'`, `payer_user_id = null`
   (le payeur reste l'agence pour les motifs historiques).

La migration doit etre **reversible** (`down()` complet) et testee sur une copie de la
base avant execution.

### 3.5 Plan d'indexation

**Precision de methode.** L'objectif n'est pas « le maximum d'index » : chaque index
ralentit les ecritures, occupe de l'espace et doit etre maintenu. Un index jamais
emprunte par le planificateur est un cout pur. Le plan ci-dessous est **derive des
requetes reellement emises** par les ecrans et les traitements planifies decrits dans ce
document. Tout index supplementaire devra etre justifie par un `EXPLAIN ANALYZE`.

La base etant PostgreSQL, on exploite deux mecanismes que MySQL n'offre pas : les
**index partiels** (indexer uniquement les lignes utiles) et la **recherche plein texte
GIN**.

#### Index sur les tables modifiees

| Table | Index | Motif |
|---|---|---|
| `properties` | `(status, transaction_type, availability)` | Filtre principal du catalogue et du fil : quasiment toute requete publique le traverse |
| `properties` | `(transaction_type, city)` | Recherche par ville, deuxieme filtre le plus utilise |
| `properties` | `(agency_id, status)` | Liste « mes biens » cote agence |
| `properties` | `proprietaire_id` | Biens d'un proprietaire (prepare le niveau N2) |
| `properties` | GIN sur `to_tsvector(name, description)` | Recherche plein texte ; remplace un `LIKE '%...%'` non indexable |
| `properties` | **Supprimer** l'index sur `price` | La colonne disparait au profit de la specialisation |
| `payments` | `(agency_id, purpose, status)` | Tableau de bord des encaissements de l'agence |
| `payments` | `(payer_user_id, status)` | Historique de paiement du locataire |
| `payments` | `lease_id` | Paiements rattaches a un bail |

#### Index sur les nouvelles tables

| Table | Index | Motif |
|---|---|---|
| `property_rental_details` | `property_id` **unique** | Cardinalite 1:1 garantie par la base |
| `property_rental_details` | `rent_amount` | Filtre par fourchette de loyer |
| `property_sale_details` | `property_id` **unique** | Cardinalite 1:1 |
| `property_sale_details` | `price` | Filtre par fourchette de prix |
| `proprietaires` | `agency_id` | Liste des proprietaires d'une agence |
| `rental_applications` | `(agency_id, status)` | File d'instruction de l'agence |
| `rental_applications` | `(applicant_user_id, status)` | « Mes demandes » cote client |
| `rental_applications` | **partiel unique** `(property_id, applicant_user_id)` `WHERE status IN ('submitted','under_review','documents_requested','accepted')` | Applique RG-L05 **au niveau base** : une seule demande active par couple, sans bloquer une nouvelle demande apres un refus |
| `leases` | `reference` **unique** | Recherche directe par reference |
| `leases` | `(agency_id, status)` | Portefeuille de baux de l'agence |
| `leases` | `(tenant_user_id, status)` | « Mes baux » cote locataire |
| `leases` | **partiel** `end_date` `WHERE status = 'active'` | Traitement planifie d'expiration : ne parcourt que les baux actifs |
| `leases` | `property_id` | Historique locatif d'un bien |
| `lease_installments` | `(lease_id, period_start)` **unique** | Interdit tout doublon d'echeance, y compris en cas de double execution du job |
| `lease_installments` | `reference` **unique** | Numero de quittance |
| `lease_installments` | **partiel** `(due_date)` `WHERE status IN ('pending','partially_paid')` | Job de marquage des retards : n'indexe que les echeances non soldees, soit une fraction de la table qui croit indefiniment |
| `lease_installments` | `(lease_id, status)` | Echeancier d'un bail |
| `installment_payment` | `(payment_id, lease_installment_id)` **unique** | Interdit la double imputation d'un paiement sur une meme echeance |
| `installment_payment` | `lease_installment_id` | Remontee des paiements d'une echeance |
| `maintenance_tickets` | `reference` **unique** | Recherche directe |
| `maintenance_tickets` | `(lease_id, status)` | Tickets d'un bail |
| `maintenance_tickets` | **partiel** `(status, priority)` `WHERE status IN ('open','acknowledged','in_progress')` | Triage agence : seuls les tickets non clos sont consultes en liste de travail |
| `maintenance_ticket_messages` | `(maintenance_ticket_id, created_at)` | Chargement chronologique du fil |
| `notifications` | **partiel** `(notifiable_type, notifiable_id)` `WHERE read_at IS NULL` | Compteur de non-lus, requete emise a chaque chargement d'ecran |

#### Regles de performance applicatives

Les index ne suffisent pas ; trois regles evitent les pathologies les plus couteuses :

1. **Chargement anticipe obligatoire.** La specialisation introduit un risque de N+1 sur
   chaque liste de biens. Toute requete de liste charge explicitement
   `saleDetails`, `rentalDetails`, `images`, `agency`. Un test de comptage de requetes
   verrouille ce point sur le fil et la recherche.
2. **Compteurs denormalises.** Les compteurs de likes et commentaires existent deja ;
   on applique le meme principe aux echeances impayees et aux tickets ouverts du tableau
   de bord plutot que de recompter a chaque affichage.
3. **Pagination obligatoire.** Aucune liste (biens, demandes, baux, echeances, tickets,
   notifications) n'est exposee sans pagination, y compris cote agence.

---

## 4. Regles de gestion

| Code | Regle |
|---|---|
| RG-L01 | Un bien possede au moins une specialisation coherente avec son `transaction_type` (contrainte de totalite). |
| RG-L02 | `transaction_type = sale` exige `property_sale_details` ; `rent` exige `property_rental_details` ; `both` exige les deux. |
| RG-L03 | Publier un bien exige un abonnement actif et un quota disponible (regle existante, inchangee). |
| RG-L04 | Seul un bien `published` et `available` accepte une demande de location. |
| RG-L05 | Un client ne peut avoir qu'une demande active par bien. |
| RG-L06 | Seule l'agence proprietaire du bien instruit la demande. |
| RG-L07 | Un refus exige un motif. |
| RG-L08 | La generation du contrat exige une demande `accepted`. |
| RG-L09 | Les montants du bail sont figes a la generation et ne suivent plus le bien. |
| RG-L10 | La duree du bail ne peut etre inferieure a `duree_minimale_mois` du bien. |
| RG-L11 | Le televersement du contrat signe exige un bail `pending_signature`. |
| RG-L12 | Seule l'agence valide la signature ; un refus renvoie le bail en `pending_signature`. |
| RG-L13 | Le paiement initial vaut `caution + (mois_avance x (loyer + charges))`. |
| RG-L14 | Le bail ne passe `active` qu'apres encaissement confirme du paiement initial. |
| RG-L15 | A l'activation, le bien passe `availability = rented`. |
| RG-L16 | Les echeances sont generees au mois, quelle que soit la periodicite de reglement. |
| RG-L17 | Un paiement peut solder plusieurs echeances ; l'imputation est tracee ligne a ligne. |
| RG-L18 | Une echeance non reglee apres sa date d'echeance passe `late`. |
| RG-L19 | Un encaissement especes exige une validation nominative horodatee, non modifiable ensuite. |
| RG-L20 | Un paiement ne peut jamais depasser le reste du du sur les echeances visees. |
| RG-L21 | Seul le locataire du bail ouvre un ticket sur ce bail. |
| RG-L22 | La resiliation respecte le preavis, sauf accord explicite trace. |
| RG-L23 | A la fin du bail, le bien repasse `available`. |
| RG-L24 | Toute transition de statut interdite leve une erreur metier explicite, jamais un echec silencieux. |

---

## 5. Workflows

### 5.1 Achat — ce qui change

Le parcours reste de la mise en relation : consultation, contact par messagerie,
transaction hors ligne, marquage par l'agence. Trois changements seulement :

- `sold` devient `availability` (quatre etats au lieu de deux) ;
- le prix vit desormais dans `property_sale_details` ;
- la recherche filtre sur `transaction_type`.

### 5.2 Messagerie — ce qui change

La conversation reste rattachee au bien. Ajouts :

- une conversation peut etre ouverte depuis une demande de location ;
- chaque ticket de maintenance possede **son propre fil**, distinct de la conversation
  commerciale, pour ne pas noyer le suivi technique dans la negociation.

### 5.3 Location — parcours complet

| # | Etape | Acteur | Etat resultant |
|---|---|---|---|
| 1 | Publication du bien avec conditions locatives | Agence | bien `published` / `available` |
| 2 | Recherche et consultation | Client / Visiteur | — |
| 3 | Depot de la demande + dossier | Client | demande `submitted` |
| 4 | Instruction : acceptation, refus motive, ou demande de pieces | Agence | `accepted` / `rejected` / `documents_requested` |
| 5 | Generation du contrat (structure plateforme + articles agence) | Systeme | bail `pending_validation` |
| 6 | Lecture et validation des conditions ; emission de la facture initiale | Client | bail `pending_signature` |
| 7 | Impression, signature, numerisation, televersement | Client | scan enregistre, agence notifiee |
| 8 | Controle du document signe | Agence | `pending_payment` ou retour en `pending_signature` |
| 9 | Paiement caution + avance (PayDunya ou especes validees) | Client / Agence | bail `active`, bien `rented` |
| 10 | Generation des echeances mensuelles | Systeme (planifie) | echeances `pending` |
| 11 | Reglement d'une ou plusieurs echeances ; quittance produite | Client / Agence | echeances `paid` |
| 12 | Signalement d'un incident avec photos et fil de discussion | Client / Agence | ticket `open` → `resolved` |
| 13 | Suivi : biens loues/vacants, echeances, retards, encaissements | Agence | — |
| 14 | Preavis, resiliation ou expiration | Client / Agence | bail `terminated`/`expired`, bien `available` |

---

## 6. API

Toutes les routes sont versionnees sous `/api/v1`, dans deux nouveaux fichiers
`routes/api/v1/rentals.php` et `routes/api/v1/maintenance.php`.

### Public
- `GET /properties` — filtres etendus : `transaction_type`, `loyer_min`, `loyer_max`, `meuble`
- `GET /properties/{id}` — expose la specialisation correspondante

### Client authentifie
- `POST /rental-applications` — deposer une demande
- `GET /rental-applications/mine` · `GET /rental-applications/{id}`
- `POST /rental-applications/{id}/documents` · `DELETE /rental-application-documents/{id}`
- `DELETE /rental-applications/{id}` — annuler
- `GET /leases/mine` · `GET /leases/{id}`
- `GET /leases/{id}/contract` — telecharger le PDF genere
- `POST /leases/{id}/validate` — accepter les conditions
- `POST /leases/{id}/signed-contract` — televerser le scan signe
- `GET /leases/{id}/installments`
- `POST /leases/{id}/installments/checkout` — regler une selection d'echeances
- `GET /installments/{id}/receipt` — quittance PDF
- `POST /leases/{id}/tickets` · `GET /leases/{id}/tickets`
- `GET /tickets/{id}` · `POST /tickets/{id}/messages` · `POST /tickets/{id}/images`
- `GET /notifications` · `POST /notifications/{id}/read`

### Agence authentifiee
- `GET /agency/rental-applications` (filtres statut, bien)
- `POST /agency/rental-applications/{id}/accept` · `/reject` · `/request-documents`
- `GET|POST /agency/contract-templates` · `PUT|DELETE /agency/contract-templates/{id}`
- `POST /agency/contract-templates/{id}/clauses` · `PUT|DELETE /agency/clauses/{id}`
- `PUT /agency/contract-templates/{id}/clauses/order`
- `POST /agency/rental-applications/{id}/generate-lease`
- `GET /agency/leases` · `GET /agency/leases/{id}`
- `POST /agency/leases/{id}/validate-signature` · `/reject-signature`
- `POST /agency/leases/{id}/terminate`
- `GET /agency/installments` (filtres mois, statut, retard)
- `POST /agency/installments/{id}/record-cash-payment`
- `GET /agency/tickets` · `PATCH /agency/tickets/{id}/status` · `POST /agency/tickets/{id}/messages`
- `GET /agency/dashboard/rental`
- `GET|POST /agency/proprietaires` · `PUT|DELETE /agency/proprietaires/{id}`

### Webhook
- `POST /webhooks/paydunya` — existant, etendu aux motifs `rent` et `deposit`

---

## 7. Traitements planifies

| Commande | Frequence | Role |
|---|---|---|
| `rentals:generate-installments` | quotidienne | Cree les echeances a venir des baux actifs (horizon 2 mois) |
| `rentals:mark-late` | quotidienne | Bascule en `late` les echeances depassees non soldees |
| `rentals:expire-leases` | quotidienne | Passe en `expired` les baux dont la date de fin est atteinte |

Toutes idempotentes : une double execution ne cree ni doublon ni double imputation.

---

## 8. Generation documentaire (PDF)

**Dependance** : `barryvdh/laravel-dompdf`.

**Deux gabarits** : contrat de bail, quittance de loyer.

**Structure du contrat** — maitrisee par la plateforme : identification des parties,
designation du bien, duree, loyer et charges, caution et avance, modalites de paiement,
puis **les articles rediges par l'agence**, enfin les emplacements de signature.

**Variables disponibles dans les articles** (substitution a la generation) :
`{{agence.nom}}`, `{{agence.adresse}}`, `{{proprietaire.nom}}`, `{{locataire.nom}}`,
`{{locataire.piece_identite}}`, `{{bien.designation}}`, `{{bien.adresse}}`,
`{{bien.surface}}`, `{{bail.reference}}`, `{{bail.date_debut}}`, `{{bail.date_fin}}`,
`{{bail.duree_mois}}`, `{{bail.loyer}}`, `{{bail.charges}}`, `{{bail.caution}}`,
`{{bail.mois_avance}}`, `{{bail.preavis_jours}}`, `{{bail.jour_echeance}}`.

Toute variable inconnue leve une erreur a la generation plutot que d'etre rendue vide.

**Reserve juridique.** La plateforme assemble un document a partir de clauses redigees
par l'agence : elle ne fournit pas de conseil juridique. Un jeu de clauses par defaut
est propose comme point de depart, modifiable, et l'agence relit avant envoi. Cette
mention doit figurer dans l'interface de configuration.

---

## 9. Notifications

Chaque ligne part sur `database` **et** `broadcast` (Reverb). La colonne « Mail »
indique les seuls evenements qui declenchent en plus un courriel.

| Evenement | Destinataire | Mail | Justification du mail |
|---|---|---|---|
| Demande de location deposee | Agence | **oui** | Un dossier non traite fait perdre un client |
| Pieces reclamees | Client | **oui** | Action attendue de sa part, il n'est pas dans l'app |
| Demande acceptee | Client | **oui** | Etape decisive du parcours |
| Demande refusee | Client | **oui** | Information due, avec le motif |
| Contrat disponible | Client | **oui** | Document a lire et valider |
| Contrat signe televerse | Agence | **oui** | Debloque la suite du parcours |
| Signature validee | Client | **oui** | Ouvre le paiement |
| Signature refusee | Client | **oui** | Action corrective attendue |
| Paiement recu | Agence et Client | **oui** | Engage de l'argent, vaut preuve |
| Echeance a venir (J-5) | Client | **oui** | Prevention de l'impaye |
| Echeance en retard | Client | **oui** | Engage de l'argent |
| Bail resilie ou expire | Les deux | **oui** | Fin de relation contractuelle |
| Ticket ouvert | Agence | non | Consulte dans la liste de travail |
| Ticket mis a jour | Client | non | Suivi courant, notifier par mail serait intrusif |
| Nouveau message sur un ticket | L'autre partie | non | Deja couvert par le temps reel |

Les trois canaux sont livres ensemble au **lot 11** : les brancher des la premiere
notification evite d'avoir a repasser sur chaque evenement au lot 15.

---

## 10. Securite et policies

- `RentalApplicationPolicy` — le client voit et annule les siennes ; l'agence instruit les demandes portant sur ses biens.
- `LeasePolicy` — acces reserve au locataire et a l'agence du bail ; la validation de signature et la resiliation sont reservees a l'agence.
- `LeaseInstallmentPolicy` — le locataire consulte et regle ; l'agence consulte et enregistre les especes.
- `MaintenanceTicketPolicy` — le locataire ouvre et commente ; l'agence change le statut et commente.
- `ProprietairePolicy` — strictement limite a l'agence detentrice.
- `ContractTemplatePolicy` — strictement limite a l'agence detentrice.

Points de vigilance : les fichiers televerses (dossier, contrat signe, photos de tickets)
ne sont **jamais servis publiquement** — acces par route authentifiee et controlee.
Types MIME et taille valides a l'entree.

---

## 11. Frontends

### Agence (`agency/`)
- Formulaire de bien : type de transaction, blocs conditionnels vente / location
- Demandes de location : liste filtrable, detail avec dossier, accepter / refuser / reclamer
- Modeles de contrat : liste, editeur d'articles avec reordonnancement, aide aux variables
- Baux : liste, detail, generation, controle du scan signe, resiliation
- Encaissements : echeances du mois, retards, enregistrement d'un paiement especes
- Tickets : liste, detail, changement de statut, fil de discussion
- Tableau de bord : loues / vacants, encaisse du mois, attendu, retards, demandes en attente, tickets ouverts
- Proprietaires : CRUD

### Mobile (`mobile/`)
- Recherche : bascule vente / location, filtre sur le loyer
- Fiche bien : conditions locatives detaillees
- Demande de location + televersement du dossier
- Mes demandes : suivi de statut
- Mes baux : contrat, validation des conditions, televersement du scan signe
- Echeances : selection multiple et paiement, quittances telechargeables
- Signalement d'incident : categorie, priorite, photos, fil de discussion
- Notifications

### Admin (`admin/`)
- Indicateurs consolides : baux actifs, volume encaisse, tickets ouverts par agence

---

## 12. Tests

Conformement a la convention du projet, **les tests precedent le code** de chaque lot.

- **Fonctionnels** : un fichier par domaine (demandes, contrat, baux, echeances, paiements, tickets), couvrant le chemin nominal, les refus de policy, et chaque regle de gestion de la section 4.
- **Migration** : test dedie verifiant la reprise `sold` → `availability` et le deplacement du prix, sur un jeu de donnees representatif.
- **Paiement** : simulation IPN pour `rent` et `deposit`, imputation multi-echeances, idempotence d'un double webhook, refus d'un montant excedentaire (RG-L20).
- **Especes** : tracabilite du validateur, impossibilite de modification apres coup.
- **Planifie** : double execution des trois commandes sans effet de bord.

---

## 13. Decoupage en lots

| Lot | Contenu | Depend de |
|---|---|---|
| **10** | Socle : specialisation `properties`, `availability`, proprietaires, enums, migration de donnees | — |
| **11** | Demandes de location, dossier, **notifications sur les trois canaux** (base, Reverb, mail) | 10 |
| **12** | Modeles de contrat, articles, generation PDF, validation client, signature, controle agence | 11 |
| **13** | Echeances, paiements multi-mois, especes tracees, quittances, extension du webhook | 12 |
| **14** | Tickets de maintenance, photos, fil de discussion | 11 |
| **15** | Tableau de bord agence, diffusion Reverb des notifications | 13, 14 |
| **16** | Frontends agence et mobile | 15 |

Chaque lot suit la convention etablie : branche dediee, tests d'abord, actions plutot que
services, commits par domaine, pas de merge dans `main`.

---

## 14. Planning sur 5 jours

| Jour | Objectif | Livrable verifiable |
|---|---|---|
| **1** | Lot 10 + Lot 11 | Migration passee et reversible, demandes de location fonctionnelles avec tests verts |
| **2** | Lot 12 | Contrat genere en PDF, valide par le client, scan televerse et controle par l'agence |
| **3** | Lot 13 | Echeances generees, reglement d'un et de trois mois, encaissement especes trace, quittance produite |
| **4** | Lot 14 + Lot 15 + debut frontend agence | Tickets operationnels, tableau de bord alimente |
| **5** | Lot 16 | Parcours complet verifie de bout en bout sur agence et mobile |

**Jalon bloquant** : si le jour 1 deborde, c'est la migration de `properties` qui est en
cause — c'est le seul point ou un retard se propage a tout le reste. A traiter en
priorite absolue le matin du jour 1.

---

## 15. Risques

| Risque | Impact | Traitement |
|---|---|---|
| Migration `sold` → `availability` sur donnees existantes | Eleve | Faite en premier, transactionnelle, reversible, testee sur copie |
| Double sens de `payments.agency_id` selon le motif | Eleve | Documente, teste explicitement, nomme sans ambiguite dans le code |
| Imputation multi-echeances erronee | Eleve | RG-L20 testee, imputation ligne a ligne, jamais de solde negatif |
| Webhook PayDunya injoignable en local | Moyen | Tunnel ngrok deja integre a `dev.ps1` ; simulation IPN possible en test |
| Valeur juridique du contrat genere | Moyen | Clauses redigees et relues par l'agence, mention explicite en interface |
| Incompatibilite de dependance cote mobile | Moyen | Precedent avere dans ce projet ; prevoir une marge le jour 5 |
| Volume de documentation MERISE a reprendre | Moyen | Planifie apres validation de ce plan, avant le developpement |

---

## 16. Hors perimetre

Explicitement exclus de ces 5 jours, a traiter ulterieurement :

- **Portail proprietaire (niveau N2)** : compte, espace de suivi en lecture seule, mandat de gestion, calcul de commission, reversement. Les trois sont indissociables (section 2.6) et representent 2 a 3 jours a part entiere. La table `proprietaires` et sa colonne `user_id` sont neanmoins creees des maintenant pour eviter une migration risquee plus tard.
- Etat des lieux d'entree et de sortie avec constat photo
- Restitution de caution et retenues
- Relances automatiques d'impayes (la notification d'echeance en retard est livree, la relance repetee ne l'est pas)
- Export comptable
- Signature electronique (le circuit reste impression / signature / numerisation)
- Colocation et baux multi-locataires
- Revalorisation annuelle du loyer
- Deploiement et mise en production

---

## 17. Impact sur la documentation MERISE

A reprendre **apres validation de ce plan et avant le developpement**. Tous ces modeles
sont rediges **en francais** (entites, attributs, operations, acteurs) et integres
**directement dans le document Word**, avec les formes et tableaux natifs deja utilises.

- **MCC** — environ 16 flux supplementaires (depot de demande, instruction, reclamation de pieces, envoi du contrat, validation, televersement, controle, facturation, encaissement, quittance, incident, resolution). Ajout de l'acteur externe **Proprietaire**.
- **MCT** — trois processus nouveaux : mise en location, encaissement du loyer, traitement d'un incident. Soit environ 10 operations, 12 evenements et 18 resultats de plus.
- **MOT — Modele Organisationnel des Traitements** *(nouveau, absent du document actuel)*. Il reprend chaque operation du MCT en lui ajoutant les trois dimensions organisationnelles :
  - **la periode** (quand : a la demande, quotidien, mensuel, a echeance) ;
  - **le poste de travail** (qui : client, agent d'agence, gestionnaire locatif, administrateur, systeme) ;
  - **la nature du traitement** (comment : manuel, semi-automatique, automatique ; temps reel ou differe).
  C'est ce modele qui fera apparaitre explicitement que la generation des echeances est un traitement **automatique differe quotidien** sans poste de travail humain, alors que la validation de la signature est un traitement **manuel temps reel** au poste gestionnaire locatif.
- **MCD** — 13 entites nouvelles et une association porteuse, portant l'ensemble a 33 entites. Introduction de la **generalisation/specialisation** avec contrainte de **totalite (T)** sur `properties`.
- **MLD** — traduction des specialisations en tables 1:1 dont la cle primaire est aussi cle etrangere.
- **Dictionnaire de donnees** — environ 95 proprietes supplementaires, en respectant les regles deja appliquees : pas d'accents, pas de synonymie, pas d'homonymie, suffixation par l'entite. La correspondance francais/anglais de la section 2.7 y figure.

---

## 18. Validation

| Point | Section | Statut |
|---|---|---|
| Specialisation de `properties` sur le type de transaction | 2.1 | **valide** |
| Notifications sur trois canaux, mail restreint aux evenements actionnables | 2.4 | **valide** |
| Montants encaisses en entier XOF, prix de vente en decimal multi-devises | 2.5 | **valide** |
| Propriete optionnelle, proprietaire en fiche (N1), portail reporte (N2) | 2.6 | **a confirmer** |
| Code en anglais, documentation MERISE en francais | 2.7 | **a confirmer** |
| Extension de `payments` plutot qu'une table dediee | 2.2 | **valide** |
| Plan d'indexation derive des requetes reelles | 3.5 | **valide** |
| Les 24 regles de gestion | 4 | a relire |
| Le parcours locatif en 14 etapes | 5.3 | a relire |
| Le perimetre exclu, dont le portail proprietaire | 16 | **a confirmer** |
| Le planning en 5 jours et son jalon bloquant | 14 | a relire |

### Sequence de travail retenue

1. Validation du present document.
2. Reprise integrale des modeles **en francais**, ecrits **directement dans le document Word** : MCC, MCT, **MOT**, MCD, MLD, dictionnaire de donnees.
3. Redaction integrale du memoire.
4. Developpement (5 jours, lots 10 a 16).
