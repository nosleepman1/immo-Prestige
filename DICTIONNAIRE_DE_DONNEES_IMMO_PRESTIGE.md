# ImmoPrestige — Dictionnaire de données

Document construit à partir du schéma réel du backend (20 migrations Laravel,
`backend/database/migrations/`) et des modèles Eloquent (`backend/app/Models/`).
Complète le [MCC_MCT_MCD_MLD_IMMO_PRESTIGE.md](MCC_MCT_MCD_MLD_IMMO_PRESTIGE.md).

## Conventions utilisées

| Colonne | Signification |
|---|---|
| **Entité** | Entité (table) à laquelle appartient la propriété |
| **Propriété** | Nom de la donnée. Tout identifiant est nommé `id_<entité>` (clé primaire) ou `id_<entité référencée>` (clé étrangère) pour rester lisible dans un tableau unique |
| **Signification** | Description métier de la donnée |
| **Type** | `A` alphabétique, `N` numérique, `AN` alphanumérique, `D` date/heure, `B` booléen |
| **Taille** | Longueur maximale (caractères) ou précision numérique (`p,d`) |
| **Nature** | `E` élémentaire (saisie/générée directement), `CA` calculée (dérivée d'autres données), `CO` concaténée (composée de plusieurs propriétés) |
| **SIG/SIT/MVT** | `SIG` signalétique (identifie l'objet, stable), `SIT` situation (état courant, évolue), `MVT` mouvement (résulte d'un événement/action daté) |
| **Réf.** | Entité référencée quand la propriété est une clé étrangère |
| **Clé** | `CP` clé primaire, `CE` clé étrangère, `CS` clé secondaire (unique) |

---

## Tableau général

| Entité | Propriété | Signification | Type | Taille | Nature | SIG/SIT/MVT | Réf. | Clé |
|---|---|---|---|---|---|---|---|---|
| UTILISATEUR | id_utilisateur | Identifiant unique de l'utilisateur | N | 20 | E | SIG | | CP |
| UTILISATEUR | nom | Nom complet affiché | AN | 255 | E | SIG | | |
| UTILISATEUR | email | Adresse email, identifiant de connexion | AN | 255 | E | SIG | | CS |
| UTILISATEUR | email_vérifié_le | Date de vérification de l'adresse email | D | 19 | E | MVT | | |
| UTILISATEUR | mot_de_passe | Mot de passe haché (nullable tant que le compte agence n'est pas activé) | AN | 255 | E | SIT | | |
| UTILISATEUR | rôle | Rôle applicatif : `admin` / `agency` / `user` | AN | 6 | E | SIT | | |
| UTILISATEUR | jeton_souvenir | Jeton de session persistante (`remember_token`) | AN | 100 | E | SIT | | |
| UTILISATEUR | créé_le | Date de création du compte | D | 19 | E | MVT | | |
| UTILISATEUR | modifié_le | Date de dernière modification du compte | D | 19 | E | MVT | | |
| UTILISATEUR | supprimé_le | Date de suppression logique (`null` = actif) | D | 19 | E | SIT | | |
| AGENCE | id_agence | Identifiant unique de l'agence | N | 20 | E | SIG | | CP |
| AGENCE | nom_entreprise | Raison sociale de l'agence | AN | 255 | E | SIG | | CS |
| AGENCE | nom_gérant | Nom du gérant/responsable | AN | 255 | E | SIG | | |
| AGENCE | description | Présentation de l'agence | AN | illimité (TEXT) | E | SIG | | |
| AGENCE | adresse | Adresse postale | AN | 255 | E | SIG | | |
| AGENCE | ville | Ville d'implantation | AN | 255 | E | SIG | | |
| AGENCE | zone_activité | Zone géographique d'activité | AN | 255 | E | SIG | | |
| AGENCE | téléphone | Numéro de téléphone de contact | AN | 255 | E | SIG | | |
| AGENCE | numéro_pièce_identité | Numéro de la pièce d'identité du gérant | AN | 255 | E | SIG | | CS |
| AGENCE | statut | État du dossier : `pending` / `accepted` / `refused` | AN | 8 | E | SIT | | |
| AGENCE | motif_refus | Motif de refus renseigné par l'administrateur | AN | illimité (TEXT) | E | SIT | | |
| AGENCE | id_utilisateur_examinateur | Administrateur ayant traité le dossier | N | 20 | E | SIG | UTILISATEUR | CE |
| AGENCE | examiné_le | Date d'examen du dossier | D | 19 | E | MVT | | |
| AGENCE | activé_le | Date d'activation du compte agence | D | 19 | E | MVT | | |
| AGENCE | vérifié_jusqu_au | Date d'expiration du badge vérifié en cours | D | 19 | E | SIT | | |
| AGENCE | id_utilisateur | Compte utilisateur propriétaire de l'agence | N | 20 | E | SIG | UTILISATEUR | CE, CS |
| AGENCE | est_vérifiée | Agence titulaire d'un badge vérifié en cours de validité (dérivé : `vérifié_jusqu_au` future) | B | 1 | CA | SIT | | |
| AGENCE | créé_le | Date de création de l'agence | D | 19 | E | MVT | | |
| AGENCE | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| AGENCE | supprimé_le | Date de suppression logique (`null` = active) | D | 19 | E | SIT | | |
| DOCUMENT_AGENCE | id_document_agence | Identifiant unique du document | N | 20 | E | SIG | | CP |
| DOCUMENT_AGENCE | id_agence | Agence propriétaire du document | N | 20 | E | SIG | AGENCE | CE |
| DOCUMENT_AGENCE | type | Nature du document : `id_card` / `business_registry` / `proof_of_address` / `other` | AN | 20 | E | SIG | | |
| DOCUMENT_AGENCE | chemin_fichier | Chemin de stockage du fichier | AN | 255 | E | SIG | | |
| DOCUMENT_AGENCE | nom_original | Nom du fichier tel qu'envoyé par l'agence | AN | 255 | E | SIG | | |
| DOCUMENT_AGENCE | examiné_le | Date d'examen du document | D | 19 | E | MVT | | |
| DOCUMENT_AGENCE | créé_le | Date de dépôt du document | D | 19 | E | MVT | | |
| DOCUMENT_AGENCE | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| DOCUMENT_AGENCE | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| TOKEN_MOT_DE_PASSE | id_token_mot_de_passe | Identifiant unique du jeton | N | 20 | E | SIG | | CP |
| TOKEN_MOT_DE_PASSE | id_utilisateur | Utilisateur concerné par le jeton | N | 20 | E | SIG | UTILISATEUR | CE |
| TOKEN_MOT_DE_PASSE | jeton | Valeur hachée (SHA-256) du jeton envoyé par email | AN | 64 | E | SIG | | |
| TOKEN_MOT_DE_PASSE | expire_le | Date limite de validité (24h après émission) | D | 19 | E | SIT | | |
| TOKEN_MOT_DE_PASSE | utilisé_le | Date d'utilisation effective du jeton | D | 19 | E | MVT | | |
| TOKEN_MOT_DE_PASSE | est_expiré | Jeton périmé (dérivé : date courante postérieure à `expire_le`) | B | 1 | CA | SIT | | |
| TOKEN_MOT_DE_PASSE | est_utilisé | Jeton déjà consommé (dérivé : `utilisé_le` renseigné) | B | 1 | CA | SIT | | |
| TOKEN_MOT_DE_PASSE | créé_le | Date de génération du jeton | D | 19 | E | MVT | | |
| TOKEN_MOT_DE_PASSE | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| TYPE_BIEN | id_type_bien | Identifiant unique du type de bien | N | 20 | E | SIG | | CP |
| TYPE_BIEN | nom | Libellé du type (appartement, villa, terrain...) | AN | 255 | E | SIG | | |
| TYPE_BIEN | créé_le | Date de création | D | 19 | E | MVT | | |
| TYPE_BIEN | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| DEVISE | id_devise | Identifiant unique de la devise | N | 20 | E | SIG | | CP |
| DEVISE | nom | Nom complet de la devise (Franc CFA, Dollar...) | AN | 255 | E | SIG | | |
| DEVISE | code | Code devise (XOF, USD, EUR...) | AN | 10 | E | SIG | | CS |
| DEVISE | créé_le | Date de création | D | 19 | E | MVT | | |
| DEVISE | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| BIEN | id_bien | Identifiant unique du bien | N | 20 | E | SIG | | CP |
| BIEN | id_type_bien | Type du bien | N | 20 | E | SIG | TYPE_BIEN | CE |
| BIEN | id_agence | Agence propriétaire du bien | N | 20 | E | SIG | AGENCE | CE |
| BIEN | id_devise | Devise d'affichage du prix | N | 20 | E | SIG | DEVISE | CE |
| BIEN | nom | Titre de l'annonce | AN | 255 | E | SIG | | |
| BIEN | description | Description détaillée du bien | AN | illimité (TEXT) | E | SIG | | |
| BIEN | surface | Surface habitable en m² | N | double | E | SIG | | |
| BIEN | nb_pièces | Nombre de pièces | N | 3 | E | SIG | | |
| BIEN | nb_chambres | Nombre de chambres | N | 3 | E | SIG | | |
| BIEN | étage | Étage du bien | N | 11 | E | SIG | | |
| BIEN | meublé | Bien meublé ou non | B | 1 | E | SIG | | |
| BIEN | prix | Prix de vente ou de location | N | 12,2 | E | SIT | | |
| BIEN | pays | Pays de localisation | AN | 255 | E | SIG | | |
| BIEN | région | Région de localisation | AN | 255 | E | SIG | | |
| BIEN | ville | Ville de localisation | AN | 255 | E | SIG | | |
| BIEN | longitude | Coordonnée GPS longitude | N | 9,6 | E | SIG | | |
| BIEN | latitude | Coordonnée GPS latitude | N | 9,6 | E | SIG | | |
| BIEN | vendu | Bien marqué comme vendu | B | 1 | E | SIT | | |
| BIEN | statut | État de publication : `draft` / `published` / `archived` | AN | 9 | E | SIT | | |
| BIEN | est_publié | Bien visible publiquement (dérivé : `statut = published`) | B | 1 | CA | SIT | | |
| BIEN | créé_le | Date de création de l'annonce | D | 19 | E | MVT | | |
| BIEN | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| BIEN | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| IMAGE_BIEN | id_image_bien | Identifiant unique de l'image | N | 20 | E | SIG | | CP |
| IMAGE_BIEN | id_bien | Bien illustré par l'image | N | 20 | E | SIG | BIEN | CE |
| IMAGE_BIEN | chemin_image | Chemin de stockage de l'image | AN | 255 | E | SIG | | |
| IMAGE_BIEN | est_couverture | Image utilisée comme couverture de l'annonce | B | 1 | E | SIT | | |
| IMAGE_BIEN | position | Ordre d'affichage dans la galerie | N | 10 | E | SIT | | |
| IMAGE_BIEN | créé_le | Date d'ajout de l'image | D | 19 | E | MVT | | |
| IMAGE_BIEN | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| IMAGE_BIEN | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| PUBLICATION | id_publication | Identifiant unique de la publication | N | 20 | E | SIG | | CP |
| PUBLICATION | id_utilisateur | Compte auteur de la publication (agence) | N | 20 | E | SIG | UTILISATEUR | CE |
| PUBLICATION | id_bien | Bien publié | N | 20 | E | SIG | BIEN | CE, CS |
| PUBLICATION | créé_le | Date de publication | D | 19 | E | MVT | | |
| PUBLICATION | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| PUBLICATION | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| COMMENTAIRE | id_commentaire | Identifiant unique du commentaire | N | 20 | E | SIG | | CP |
| COMMENTAIRE | id_publication | Publication commentée | N | 20 | E | SIG | PUBLICATION | CE |
| COMMENTAIRE | id_utilisateur | Auteur du commentaire | N | 20 | E | SIG | UTILISATEUR | CE |
| COMMENTAIRE | contenu | Texte du commentaire | AN | illimité (TEXT) | E | MVT | | |
| COMMENTAIRE | créé_le | Date de publication du commentaire | D | 19 | E | MVT | | |
| COMMENTAIRE | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| COMMENTAIRE | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| RÉPONSE_COMMENTAIRE | id_réponse_commentaire | Identifiant unique de la réponse | N | 20 | E | SIG | | CP |
| RÉPONSE_COMMENTAIRE | id_commentaire | Commentaire auquel la réponse se rattache | N | 20 | E | SIG | COMMENTAIRE | CE |
| RÉPONSE_COMMENTAIRE | id_utilisateur | Auteur de la réponse | N | 20 | E | SIG | UTILISATEUR | CE |
| RÉPONSE_COMMENTAIRE | contenu | Texte de la réponse | AN | illimité (TEXT) | E | MVT | | |
| RÉPONSE_COMMENTAIRE | créé_le | Date de publication de la réponse | D | 19 | E | MVT | | |
| RÉPONSE_COMMENTAIRE | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| RÉPONSE_COMMENTAIRE | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| J'AIME | id_jaime | Identifiant unique du like | N | 20 | E | SIG | | CP |
| J'AIME | id_publication | Publication aimée | N | 20 | E | SIG | PUBLICATION | CE, CS |
| J'AIME | id_utilisateur | Utilisateur ayant aimé | N | 20 | E | SIG | UTILISATEUR | CE, CS |
| J'AIME | créé_le | Date du like | D | 19 | E | MVT | | |
| J'AIME | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| SIGNALEMENT | id_signalement | Identifiant unique du signalement | N | 20 | E | SIG | | CP |
| SIGNALEMENT | id_utilisateur_signaleur | Utilisateur à l'origine du signalement | N | 20 | E | SIG | UTILISATEUR | CE |
| SIGNALEMENT | cible_type | Type de contenu ciblé (`comment` / `comment_reply`) | AN | 30 | E | SIG | COMMENTAIRE **ou** RÉPONSE_COMMENTAIRE | |
| SIGNALEMENT | id_cible | Identifiant du contenu ciblé | N | 20 | E | SIG | COMMENTAIRE **ou** RÉPONSE_COMMENTAIRE | CE (polymorphe) |
| SIGNALEMENT | motif | Motif du signalement : `spam` / `abusive` / `inappropriate` / `other` | AN | 12 | E | SIG | | |
| SIGNALEMENT | détails | Détails libres apportés par le signaleur | AN | illimité (TEXT) | E | MVT | | |
| SIGNALEMENT | statut | État de traitement : `pending` / `reviewed` / `dismissed` | AN | 9 | E | SIT | | |
| SIGNALEMENT | créé_le | Date du signalement | D | 19 | E | MVT | | |
| SIGNALEMENT | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| PLAN | id_plan | Identifiant unique du plan | N | 20 | E | SIG | | CP |
| PLAN | nom | Nom commercial du plan | AN | 255 | E | SIG | | |
| PLAN | slug | Code unique du plan (URL/API) | AN | 255 | E | SIG | | CS |
| PLAN | prix | Prix du plan (unités XOF entières) | N | 20 | E | SIT | | |
| PLAN | durée_facturation_mois | Périodicité de facturation en mois | N | 3 | E | SIT | | |
| PLAN | quota_biens | Nombre maximal de biens publiables (`null` = illimité) | N | 10 | E | SIT | | |
| PLAN | quota_biens_vedette | Nombre maximal de biens mis en avant | N | 10 | E | SIT | | |
| PLAN | actif | Plan proposé actuellement à la souscription | B | 1 | E | SIT | | |
| PLAN | créé_le | Date de création du plan | D | 19 | E | MVT | | |
| PLAN | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| ABONNEMENT | id_abonnement | Identifiant unique de l'abonnement | N | 20 | E | SIG | | CP |
| ABONNEMENT | id_agence | Agence souscriptrice | N | 20 | E | SIG | AGENCE | CE |
| ABONNEMENT | id_plan | Plan souscrit (`null` possible) | N | 20 | E | SIG | PLAN | CE |
| ABONNEMENT | statut | État : `trialing` / `active` / `expired` / `cancelled` | AN | 9 | E | SIT | | |
| ABONNEMENT | prix_figé | Prix du plan figé au moment de la souscription | N | 20 | E | MVT | | |
| ABONNEMENT | quota_figé | Quotas du plan figés au moment de la souscription (JSON) | AN | illimité (JSON) | E | MVT | | |
| ABONNEMENT | essai_expire_le | Date de fin de la période d'essai gratuite | D | 19 | E | SIT | | |
| ABONNEMENT | débute_le | Date de début de l'abonnement payant | D | 19 | E | SIT | | |
| ABONNEMENT | se_termine_le | Date de fin de l'abonnement payant | D | 19 | E | SIT | | |
| ABONNEMENT | est_actif | Abonnement actuellement exploitable (dérivé du statut et des échéances) | B | 1 | CA | SIT | | |
| ABONNEMENT | créé_le | Date de création de l'abonnement | D | 19 | E | MVT | | |
| ABONNEMENT | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| ABONNEMENT | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| PAIEMENT | id_paiement | Identifiant unique du paiement | N | 20 | E | SIG | | CP |
| PAIEMENT | id_agence | Agence à l'origine du paiement | N | 20 | E | SIG | AGENCE | CE |
| PAIEMENT | id_abonnement | Abonnement concerné (`null` possible, ex. badge) | N | 20 | E | SIG | ABONNEMENT | CE |
| PAIEMENT | id_plan | Plan concerné (`null` possible) | N | 20 | E | SIG | PLAN | CE |
| PAIEMENT | objet | Motif du paiement : `subscription` / `verification_badge` | AN | 18 | E | SIG | | |
| PAIEMENT | montant | Montant payé (unités XOF entières) | N | 20 | E | MVT | | |
| PAIEMENT | statut | État : `pending` / `paid` / `failed` | AN | 7 | E | SIT | | |
| PAIEMENT | fournisseur | Prestataire de paiement (`paydunya`) | AN | 255 | E | SIG | | |
| PAIEMENT | jeton_facture | Jeton unique de la facture PayDunya | AN | 255 | E | SIG | | CS |
| PAIEMENT | est_payé | Paiement effectivement réglé (dérivé : `statut = paid`) | B | 1 | CA | SIT | | |
| PAIEMENT | créé_le | Date de création du paiement | D | 19 | E | MVT | | |
| PAIEMENT | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| PAIEMENT | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| TRANSACTION | id_transaction | Identifiant unique de la transaction (journal) | N | 20 | E | SIG | | CP |
| TRANSACTION | id_paiement | Paiement associé (`null` si jeton inconnu) | N | 20 | E | SIG | PAIEMENT | CE |
| TRANSACTION | événement | Type d'événement reçu (ex. IPN PayDunya) | AN | 255 | E | SIG | | |
| TRANSACTION | référence_externe | Référence chez le prestataire externe | AN | 255 | E | SIG | | |
| TRANSACTION | signature_valide | Résultat de la vérification de signature du webhook | B | 1 | CA | MVT | | |
| TRANSACTION | charge_utile | Contenu brut de la notification reçue (JSON) | AN | illimité (JSON) | E | MVT | | |
| TRANSACTION | créé_le | Date de réception de la notification | D | 19 | E | MVT | | |
| TRANSACTION | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| PARAMÈTRE | clé | Nom du paramètre de configuration | AN | 255 | E | SIG | | CP |
| PARAMÈTRE | valeur | Valeur courante du paramètre | AN | 255 | E | SIT | | |
| PARAMÈTRE | créé_le | Date de création du paramètre | D | 19 | E | MVT | | |
| PARAMÈTRE | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| CONVERSATION | id_conversation | Identifiant unique de la conversation | N | 20 | E | SIG | | CP |
| CONVERSATION | id_bien | Bien à l'origine du contact (`null` possible) | N | 20 | E | SIG | BIEN | CE, CS |
| CONVERSATION | id_utilisateur_client | Client participant à la conversation | N | 20 | E | SIG | UTILISATEUR | CE, CS |
| CONVERSATION | id_agence | Agence participante à la conversation | N | 20 | E | SIG | AGENCE | CE, CS |
| CONVERSATION | dernier_message_le | Date du dernier message échangé (dérivé, recopié depuis MESSAGE) | D | 19 | CA | MVT | | |
| CONVERSATION | créé_le | Date de création de la conversation | D | 19 | E | MVT | | |
| CONVERSATION | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| CONVERSATION | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |
| MESSAGE | id_message | Identifiant unique du message | N | 20 | E | SIG | | CP |
| MESSAGE | id_conversation | Conversation à laquelle le message appartient | N | 20 | E | SIG | CONVERSATION | CE |
| MESSAGE | id_utilisateur_expéditeur | Utilisateur émetteur du message | N | 20 | E | SIG | UTILISATEUR | CE |
| MESSAGE | contenu | Texte du message | AN | illimité (TEXT) | E | MVT | | |
| MESSAGE | lu_le | Date de lecture par le destinataire (`null` si non lu) | D | 19 | E | MVT | | |
| MESSAGE | créé_le | Date d'envoi du message | D | 19 | E | MVT | | |
| MESSAGE | modifié_le | Date de dernière modification | D | 19 | E | MVT | | |
| MESSAGE | supprimé_le | Date de suppression logique | D | 19 | E | SIT | | |

---

## Notes

- **Clés secondaires composites** (non représentables sur une seule ligne) :
  J'AIME : (id_publication, id_utilisateur) — un utilisateur ne peut aimer qu'une
  fois la même publication. CONVERSATION : (id_bien, id_utilisateur_client,
  id_agence) — une seule conversation par triplet.
- **Propriétés calculées (CA)** : aucune colonne physique du schéma n'est
  réellement calculée ou concaténée en base ; les lignes marquées `CA`
  (`est_vérifiée`, `est_actif`, `est_publié`, `est_payé`, `est_expiré`,
  `est_utilisé`, `signature_valide`, `dernier_message_le`) sont des valeurs
  dérivées par le code applicatif (accesseurs des modèles Eloquent) à chaque
  lecture, incluses ici pour l'exhaustivité.
- **Correspondance types physiques → dictionnaire** : `bigIncrements`/`foreignId`
  → N(20) ; `string()` → AN(255) ; `text()` → AN(illimité) ; `boolean()` → B(1) ;
  `decimal(p,d)` → N(p,d) ; `timestamp()` → D(19) ; `json()` → AN(illimité,
  structuré) ; `enum(...)` → AN(longueur de la plus longue valeur).
