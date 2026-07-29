# Comprendre son propre système, puis le pitcher

Quatre parties :
1. **Les sept objets métier** — dont l'imputation, expliquée depuis ton code
2. **Le circuit de paiement** — webhook, signature, idempotence
3. **Comment exploiter chaque diagramme** à l'oral
4. **Le script des 10 minutes**, phrase par phrase

---

# PARTIE 1 — Les sept objets métier

Toute ta gestion locative tient dans sept objets. Si tu maîtrises leur enchaînement, tu réponds à n'importe quelle question du jury.

```
BIEN ──▶ DEMANDE DE LOCATION ──▶ BAIL ──▶ ÉCHÉANCES
                                              ▲
                                              │ IMPUTATION
                                              │
                          PAIEMENT ───────────┘
                              ▲
                              │ journalisé par
                          TRANSACTION
```

---

## 1.1 — Le BIEN (`properties`)

**Ce que c'est :** le logement lui-même. Il appartient à une agence et à un propriétaire.

**Le point à savoir :** ce n'est pas une entité unique, c'est un **tronc commun spécialisé**.

| | |
|---|---|
| `properties` | ce qui est vrai de tout bien : désignation, type, surface, pièces, ville, propriétaire, agence |
| `property_sale_details` | uniquement si vente : prix, négociable |
| `property_rental_details` | uniquement si location : loyer, charges, dépôt de garantie |

Le champ `transaction_type` sur `properties` est le **discriminant** : c'est lui qui dit laquelle des deux tables spécialisées est remplie.

**Phrase à dire :** « Un bien est un tronc commun, spécialisé en vente ou en location selon un discriminant. »

---

## 1.2 — La DEMANDE DE LOCATION (`rental_applications`)

**Ce que c'est :** un client dit « je veux louer ce bien ». Il joint ses pièces (`rental_application_documents`) : pièce d'identité, justificatif de revenus, attestation de travail.

**Son cycle de vie :** déposée → instruite par l'agence → **acceptée ou rejetée**.

**Le point à savoir :** la demande n'engage personne. C'est un **dossier de candidature**, pas un contrat. Plusieurs personnes peuvent candidater sur le même bien ; l'agence en retient une.

**Phrase à dire :** « La demande est un dossier de candidature. Seule son acceptation engage. »

---

## 1.3 — Le BAIL (`leases`)

**Ce que c'est :** le contrat. Il naît d'une demande acceptée, jamais d'autre chose.

**Comment il est produit :** pas rédigé à la main. Il est généré à partir d'un `contract_template` (le modèle de l'agence) et de ses `contract_clauses`. C'est ce qui garantit qu'aucune clause obligatoire ne manque.

**Le point à savoir — et c'est un point fort :** **le bail fige ses montants.**

Le loyer est écrit *dans le bail*, pas lu *depuis le bien*. Pourquoi ? Parce que si l'agence augmente le loyer du bien en juin, le locataire de janvier ne doit rien de plus. Un bail signé ne se réécrit pas.

**Phrase à dire :** « Le bail fige ses montants à la génération. Une hausse ultérieure du loyer ne réécrit jamais un bail déjà signé. »

---

## 1.4 — L'ÉCHÉANCE (`lease_installments`)

**Ce que c'est :** **une ligne par mois dû.** Un bail de 12 mois produit 12 échéances, automatiquement.

Chaque échéance porte :

| Colonne | Sens |
|---|---|
| `period_start` / `period_end` | le mois couvert |
| `due_date` | la date à laquelle c'est exigible |
| `rent_amount` + `charges_amount` | = `total_amount`, ce qui est dû |
| `paid_amount` | ce qui a été effectivement réglé |
| `status` | `pending` · `partially_paid` · `paid` · `late` |
| `reference` | la référence de quittance, préfixée `QUIT` |

**La méthode clé :** `remainingDue()` = `total_amount − paid_amount`, **jamais négatif**.

**Phrase à dire :** « Le bail génère son échéancier : une ligne par période due, avec ce qui est dû et ce qui est payé. »

---

## 1.5 — Le PAIEMENT (`payments`)

**Ce que c'est :** de l'argent qui arrive. Un seul objet pour **tous** les encaissements du système, distingués par son champ `purpose` :

| `purpose` | Ce que c'est |
|---|---|
| `Subscription` | l'agence paie son abonnement |
| `VerificationBadge` | l'agence paie son badge vérifié |
| `Deposit` | le locataire paie son entrée dans les lieux (caution + 1er loyer) |
| `Rent` | le locataire paie un ou plusieurs loyers |

Il porte aussi : `amount`, `status` (`pending` / `paid`), `provider`, `method`, et `invoice_token` — la référence de la facture chez PayDunya, qui sert de clé de rapprochement.

**Le point à savoir :** un paiement ne dit **pas** ce qu'il solde. Il dit seulement « X francs sont arrivés ». Le lien entre l'argent et les mois, c'est l'imputation.

**Phrase à dire :** « Le paiement est un flux d'argent. Le même circuit sert aux abonnements et aux loyers, distingués par leur objet. »

---

## 1.6 — La TRANSACTION (`transactions`) — le journal

C'est celle sur laquelle tu m'as demandé d'insister, et c'est ta meilleure carte technique.

**Ce que c'est :** **le journal de tout ce que PayDunya t'envoie.** Ce n'est pas de l'argent, c'est une trace.

Quatre colonnes qui comptent :

| Colonne | Rôle |
|---|---|
| `payment_id` | le paiement concerné — **nullable**, et c'est volontaire |
| `event` | le type d'événement (`ipn_received`) |
| `external_ref` | le jeton de facture reçu |
| `signature_valid` | booléen : la signature était-elle valide ? |
| `payload` | **le message brut reçu, intégralement**, en JSON |

### Pourquoi `payment_id` est nullable — la question que le jury peut poser

Si quelqu'un envoie une fausse notification avec un jeton de facture inventé, aucun paiement ne correspond. Sans `nullable`, cette notification serait **impossible à enregistrer** — et donc invisible.

Or c'est précisément celle-là qu'il faut garder. Une tentative de fraude qui ne laisse aucune trace est une tentative de fraude réussie du point de vue de l'enquête.

### La règle d'or : la trace précède la décision

Dans ton code, la `Transaction` est créée **avant** toute vérification. L'ordre exact est :

```
1. lire le jeton de facture
2. chercher le paiement correspondant (peut être null)
3. vérifier la signature (peut être false)
4. ─── ÉCRIRE LA TRANSACTION ───  ← ici, quoi qu'il arrive
5. seulement maintenant : décider
```

**Phrase à dire, et elle fait mouche :** « Toute notification est journalisée avant d'être jugée, y compris les fausses. Une notification frauduleuse qui ne laisse aucune trace est une fraude réussie. »

### Ne confonds pas

| | Paiement | Transaction |
|---|---|---|
| Nature | de l'argent | une trace |
| Combien | 1 par facture | **N par paiement** (chaque notification reçue) |
| Peut être orpheline | non | **oui**, si le jeton est inconnu |
| Sert à | encaisser | prouver, auditer, enquêter |

---

## 1.7 — L'IMPUTATION (`installment_payment`) — le concept central

**C'est la table que tu ne connaissais pas, et c'est la plus intéressante de ton modèle.**

### Le problème qu'elle résout

Un locataire paie **1 200 000 F** d'un coup. Son loyer est de 550 000 F par mois.

Sans imputation, tu sais seulement : *« il a payé 1 200 000 F. »*
Tu ne peux répondre à **aucune** de ces questions :
- Janvier est-il soldé ?
- Combien reste-t-il sur mars ?
- Peut-on éditer la quittance de février ?

L'imputation répond à tout cela. C'est **la répartition de l'argent sur les mois**.

### Concrètement

Loyer 500 000 + charges 50 000 = **550 000 F / mois**. Le locataire verse 1 200 000 F (paiement n° 42).

Ton code impute **de la plus ancienne à la plus récente** :

| paiement | échéance | `applied_amount` | résultat |
|---|---|---|---|
| 42 | Janvier | 550 000 | **soldée** |
| 42 | Février | 550 000 | **soldée** |
| 42 | Mars | 100 000 | **partiellement payée**, reste 450 000 |

Puis en mars il verse le solde, 450 000 F (paiement n° 43) :

| paiement | échéance | `applied_amount` | résultat |
|---|---|---|---|
| 43 | Mars | 450 000 | Mars : 100 000 + 450 000 = 550 000 → **soldée** |

### Pourquoi une table à part : c'est une association porteuse

Regarde les deux sens de la relation :

- **un paiement → plusieurs échéances** (le versement de 1 200 000 touche 3 mois)
- **une échéance → plusieurs paiements** (mars a été réglé en deux fois)

C'est donc du **N–N**. Et un N–N devient une table de jointure — c'est exactement ta règle de passage au MLD.

Mais surtout : la jointure **porte une donnée**, `applied_amount`. Savoir *qu'un* paiement a touché mars ne sert à rien ; il faut savoir **combien**. C'est ce qu'on appelle en Merise une **association porteuse** (ou porteuse de données).

**C'est le meilleur exemple d'association porteuse de tout ton modèle. Utilise-le si on t'interroge sur la notion.**

### Trois garde-fous dans ton code

**1. On ne peut pas imputer plus que ce qui est dû.**
Si le locataire verse 2 000 000 alors qu'il ne doit que 1 650 000, le système lève une exception (`ExcessiveImputationException`) — et surtout, **il vérifie le total avant d'écrire quoi que ce soit**. Sinon on découvrirait le dépassement sur la dernière ligne et on laisserait un paiement à moitié imputé.

**2. Une seule ligne par couple (paiement, échéance).**
Une contrainte d'unicité en base. Une deuxième imputation du même paiement sur le même mois compterait l'argent deux fois. Et si un même paiement complète un mois déjà partiellement réglé, les montants **s'additionnent** au lieu de se remplacer.

**3. L'imputation est la source de vérité.**
`lease_installments.paid_amount` et son `status` ne sont **pas** saisis : ils sont **recalculés** depuis la somme des imputations, après chaque écriture (`refreshSettlement()`). Le statut en découle :

```
somme des imputations ≥ total dû   →  payée
somme > 0                          →  partiellement payée
échéance dépassée                  →  en retard
sinon                              →  en attente
```

### Le cas particulier de la caution

Le dépôt de garantie n'est **jamais imputé** sur un mois. C'est de l'argent **détenu**, pas de l'argent **gagné** : il sera restitué en fin de bail. Il reste donc en part non imputée du paiement d'entrée.

**Phrase à dire :** « Le dépôt de garantie n'est jamais imputé sur un mois : c'est de l'argent détenu, pas de l'argent perçu. »

### Ce que l'imputation permet, en une phrase

> **C'est l'imputation qui transforme « il a payé » en « il a payé quoi ».**
> Sans elle, pas de quittance mensuelle, pas de reste à payer, pas d'arriéré opposable. C'est très exactement la traçabilité annoncée dans ma problématique.

---

# PARTIE 2 — Le circuit de paiement

## 2.1 — Le vocabulaire, dans l'ordre

### Le webhook (que ton mémoire appelle IPN)

Tu ne demandes pas à PayDunya si le client a payé. **C'est PayDunya qui vient frapper à ta porte** : il appelle une URL de ton API dès que le paiement aboutit.

- « Webhook » = le mécanisme : un service externe appelle ton serveur.
- « IPN » = *Instant Payment Notification*, le nom que PayDunya donne à son webhook.

**Pourquoi c'est un webhook et pas un retour de page :** le client peut fermer son navigateur juste après avoir payé. Si tu comptais sur son retour à ton site, tu perdrais l'encaissement. Le webhook arrive quoi qu'il fasse.

**Le problème que ça crée :** ton URL est publique. **N'importe qui peut l'appeler.** D'où tout ce qui suit.

### La signature

PayDunya joint à son message une **empreinte cryptographique** calculée avec une clé que lui et toi seuls connaissez.

Tu recalcules l'empreinte de ton côté. Si elle correspond, le message vient bien de PayDunya. Sinon, quelqu'un s'est fait passer pour lui.

**Analogie utilisable devant un jury :** c'est un sceau de cire. Le message n'est pas secret, mais on ne peut pas le contrefaire sans le cachet.

### L'idempotence

**Définition :** une opération est *idempotente* si l'exécuter dix fois donne le même résultat que l'exécuter une fois.

**Pourquoi c'est indispensable ici :** un service de paiement **renvoie** sa notification s'il n'obtient pas de réponse claire — réseau lent, serveur qui redémarre. C'est un comportement normal, pas une panne. Sans protection, la même notification créditerait dix fois le compte.

**Analogie :** appuyer dix fois sur le bouton d'ascenseur. L'ascenseur vient une fois.

---

## 2.2 — Le circuit complet, tel qu'il est dans ton code

```
   Client paie chez PayDunya
            │
            ▼
   ① PayDunya appelle ton API  (webhook / IPN)
            │
            ▼
   ② Tu lis le jeton de facture, tu cherches le paiement
            │
            ▼
   ③ Tu vérifies la signature
            │
            ▼
   ④ ═══ TU ÉCRIS LA TRANSACTION ═══   ← quoi qu'il arrive
            │
            ▼
   ⑤ Signature invalide ? → journalisée, puis ignorée. Stop.
      Paiement déjà réglé ? → stop.            (1ᵉʳ garde-fou d'idempotence)
            │
            ▼
   ⑥ Tu rappelles PayDunya : « cette facture est-elle vraiment payée ? »
            │        (la notification n'est PAS la source de vérité)
            ▼
   ⑦ Le montant confirmé = le montant attendu ?
            │        sinon → journalisé comme falsification. Stop.
            ▼
   ⑧ ═══ VERROU + TRANSACTION BASE ═══
      On relit le paiement, verrouillé. Déjà payé ? → stop.
                                          (2ᵉ garde-fou, celui qui compte)
            │
            ▼
   ⑨ statut = payé, puis selon l'objet :
      Abonnement  → on active l'abonnement
      Badge       → on active le badge
      Entrée      → on active le bail
      Loyer       → ═══ IMPUTATION sur les échéances ═══
            │
            ▼
   ⑩ Quittance
```

## 2.3 — Les quatre défenses, et ce qu'elles arrêtent

| Défense | L'attaque ou l'accident qu'elle bloque |
|---|---|
| **Journalisation d'abord** | Une fraude sans trace. On garde même les faux messages. |
| **Signature vérifiée** | Un tiers qui se fait passer pour PayDunya et s'offre un abonnement. |
| **Re-confirmation à la source** | Un message parfaitement formé mais mensonger. On rappelle PayDunya : lui seul fait foi. |
| **Verrou + idempotence** | La même notification rejouée dix fois → un seul encaissement. |

## 2.4 — Pourquoi **deux** garde-fous d'idempotence

C'est le détail qui distingue un candidat qui a compris d'un candidat qui a copié.

**Le premier** (étape ⑤) est un simple `si déjà payé, on s'arrête`. Il est **rapide** : il évite un appel réseau inutile vers PayDunya pour une notification qu'on a déjà traitée. Mais il ne suffit pas — deux notifications arrivant **exactement en même temps** liraient toutes les deux « pas encore payé ».

**Le second** (étape ⑧) est le vrai. Il relit le paiement **verrouillé en base**, à l'intérieur d'une transaction. Le verrou force la deuxième notification à attendre que la première ait fini. Quand elle reprend la main, elle lit « déjà payé » et s'arrête.

**Phrase à dire :** « Il y a deux contrôles d'idempotence : un contrôle rapide pour éviter le travail inutile, et un contrôle sous verrou pour le cas où deux notifications arrivent en même temps. Seul le second est une garantie. »

## 2.5 — La question piège, et sa réponse

> **« Et si PayDunya ne vous envoie jamais la notification ? »**

« Rien n'est provisionné, ce qui est le comportement voulu — un abonnement ne s'active jamais sans confirmation. Mais ce n'est pas définitif : la source de vérité étant la re-confirmation auprès du prestataire, la facture peut être ré-interrogée. Une notification perdue n'est pas un encaissement perdu. »

---

# PARTIE 3 — Exploiter les diagrammes à l'oral

## La règle générale

**Un jury ne lit pas un schéma pendant que tu parles. Il te regarde, ou il lit — jamais les deux.**

Donc : **ne décris jamais un schéma, fais-le parcourir.** Choisis un acteur ou un objet, et suis-le du doigt.

Trois interdits :
- ❌ « Comme vous pouvez le voir sur ce schéma… »
- ❌ Lire les libellés des cases à voix haute
- ❌ Rester face à l'écran

Un réflexe : **annonce le trajet avant de le faire.** « Je vais suivre une demande de location, de son dépôt jusqu'à la quittance. » Le jury sait alors où regarder.

---

## MCC — slide 6 · 30 s

**Ne pas dire :** « il y a quatre acteurs et cinquante-trois flux ».

**Dire :**
> « Le cadre au centre, c'est mon système. Autour, ceux qui échangent avec lui. Un point de modélisation sur lequel je veux être clair : l'administrateur est **à l'intérieur** du cadre. Ce n'est pas un partenaire extérieur, il fait partie du système d'information étudié. PayDunya, lui, est bien à l'extérieur : c'est un service tiers. »

**Pourquoi ça marche :** tu ne récites pas le schéma, tu justifies un **choix de modélisation**. C'est précisément ce qu'un jury Merise cherche.

**Si on te demande les 53 flux :** « Ils sont numérotés sur le schéma et détaillés en annexe A1. » Tu affiches A1. Tu ne les lis pas.

---

## MCT — slides 8 et 9 · 20 s chacune

Les deux diagrammes sont côte à côte, avec trois phrases à droite. **Ces trois phrases sont ton texte.** Le diagramme est là pour être vu, pas lu.

**Slide 8 :**
> « Un dossier est déposé, il est instruit, un administrateur tranche. S'il accepte : un jeton de 24 h et l'essai démarre. S'il refuse : le motif est obligatoire. Et sans abonnement actif, aucune publication. »

**Slide 9 :**
> « Le bail fige ses montants. Il génère son échéancier. Chaque règlement est imputé, puis la quittance est émise. »

**Ce qu'il faut montrer du doigt, une fois seulement :** le **triangle inversé**. Dis : « Ce triangle est la synchronisation : c'est la condition qui doit être vraie pour que l'opération démarre. » Une seule fois, sur la slide 8. Tu prouves que tu maîtrises le formalisme sans le réciter.

**Si on te demande le détail des OP :** « Ils sont en annexe A2. » Tu affiches A2.

---

## MCD — slides 10 et 11 · 70 s au total

**Slide 10 :** justifie le découpage avant de montrer.
> « Trente-quatre entités d'un seul tenant seraient illisibles sur un écran. Je l'ai découpé en trois vues cohérentes. Je vous montre la troisième, la gestion locative, parce que c'est celle qui porte ma problématique. »

**Slide 11 : le parcours.** Suis une seule ligne, du doigt :
> « Je pars de la propriété. Un client dépose une **demande** avec ses pièces. Si elle est acceptée, elle donne un **bail**, produit depuis un modèle de contrat. Le bail génère ses **échéances**. Chaque échéance reçoit des **paiements** — et notez que la relation passe par une association porteuse, parce qu'il faut savoir combien de chaque paiement va sur chaque mois. De là sort la **quittance**. »

**Pourquoi ça marche :** tu viens de raconter exactement le MCT en langage données. Le jury voit que le MCD **découle** du MCT au lieu d'avoir été inventé à côté. C'est le point que les jurys Merise notent le plus.

---

## Spécialisation — slide 12 · 30 s

C'est la slide la plus rentable de ta présentation. Elle est en deux colonnes : **écarté / retenu**.

> « J'aurais pu mettre vente et location dans une seule entité, avec des attributs vides selon les cas. Je l'ai écartée pour une raison précise : elle interdit toute contrainte d'intégrité. On ne peut pas rendre un loyer obligatoire sur une ligne qui est en fait une vente. J'ai donc spécialisé : un tronc commun, deux spécialisations, un discriminant. »

Puis la phrase du bas, sans la lire mot à mot :
> « Et j'ai appliqué cette restructuration à un modèle qui existait déjà — la migration est réversible et transactionnelle. »

**Pourquoi ça marche :** montrer ce qu'on a **écarté** et **pourquoi** est le signe le plus fiable d'un vrai travail de conception.

---

## MLD — slide 13 · 20 s

Ne lis pas les trois règles, elles sont écrites.

> « Trois règles mécaniques : entité → table, un-à-plusieurs → clé étrangère, plusieurs-à-plusieurs → table de jointure. Le point important est le dernier : ce schéma a été implémenté **tel quel** dans PostgreSQL. Il n'y a aucun écart entre ce que je viens de vous montrer et ce qui tourne. »

**Si on te demande un exemple de table de jointure :** `installment_payment`. « Elle est porteuse : elle transporte le montant imputé. » Tu viens de relier MLD, MCD et métier en dix secondes.

---

## Les captures — slides 15 à 17 · 110 s

**Ne commente jamais une capture pour elle-même.** Suis le dossier.

- **15 :** « Le client cherche. Il ouvre la fiche : loyer, charges, dépôt, total à prévoir — une information qu'il fallait auparavant demander par téléphone. Il dépose sa demande avec ses pièces. Aucun appel, aucun déplacement. »
- **16 :** « La demande arrive ici. Ce tableau de bord, c'est ce qui remplace le cahier. L'agence accepte : le bail est généré depuis son modèle de contrat, aucune clause obligatoire ne peut manquer. »
- **17 :** **ralentis.** « Le locataire règle. La notification est vérifiée puis re-confirmée à la source. Le règlement est imputé, mois par mois. La quittance sort. Et rien ne s'efface. » Puis, en désignant le bas de la slide : « J'ai commencé en disant qu'un loyer payé ne laissait aucune trace. Ce n'est plus vrai. » **Silence d'une seconde.**

---

# PARTIE 4 — Le script des 10 minutes

Ce qui est entre guillemets se dit. Ce qui est entre crochets se fait.

---

### Slide 1 — Couverture · 15 s
> « Monsieur le Président, Messieurs les membres du jury, bonjour. Je vais vous présenter Immo-Prestige, une plateforme de gestion immobilière destinée aux agences, qui couvre la chaîne complète : de la publication d'un bien jusqu'à la quittance de loyer. »

### Slide 2 — Le problème · 25 s
> « Avant de vous montrer la solution, je voudrais poser le problème en une phrase.
> Aujourd'hui à Dakar, **un loyer payé ne laisse aucune trace opposable.** Ni pour le locataire qui l'a versé, ni pour le propriétaire qui l'attend, ni pour l'agence qui l'a encaissé.
> Le bien existe. L'agence existe. Le client existe. C'est le lien entre les trois qui manque. Retenez cette phrase, j'y reviendrai. »

[Ne te presse pas. C'est ta slide la plus importante.]

### Slide 3 — Contexte et existant · 30 s
> « D'où vient ce problème. À gauche, les pratiques que j'ai relevées : publication sur les réseaux, contact par téléphone, suivi sur cahier, reçus à la main. À droite, ce que cela coûte.
> Regardez cette colonne : aucune de ces limites n'est un problème d'outil. Ce sont toutes des conséquences d'une même cause — rien ne laisse de trace.
> Et l'existant logiciel ne répond pas : les portails d'annonces s'arrêtent à la mise en relation. Aucun ne traite le bail, l'échéance et la quittance. »

### Slide 4 — Problématique et objectifs · 30 s
> « De ce constat découle ma problématique : comment doter les agences d'un outil unique pour publier, louer et suivre leurs biens, tout en offrant aux clients un espace fiable pour les trouver ?
> Deux moitiés : un outil unique côté agence, un espace fiable côté client. J'en ai tiré cinq objectifs. »

[Ne lis pas les cinq. Dis : « les voici ». Deux secondes de silence.]

### Slide 5 — Démarche et règles · 30 s
> « Pour y répondre, j'ai suivi Merise en quatre temps : qui échange quoi, dans quel ordre, quelles entités, quelles tables.
> De l'étude du métier j'ai tiré des règles de gestion. En voici les quatre principales — et vous allez les retrouver telles quelles dans tout ce qui suit. »

### Slide 6 — MCC · 30 s
> « Premier livrable, le modèle de communication. Le cadre au centre, c'est mon système. Autour, ceux qui échangent avec lui.
> Un point de modélisation : l'administrateur est **à l'intérieur** du cadre, il fait partie du système. PayDunya est à l'extérieur, c'est un service tiers. »

### Slide 7 — Les 9 processus · 20 s
> « Ces échanges s'organisent en neuf processus. Je ne vais pas tous vous les dérouler : j'en ai retenu deux, ceux qui portent le métier et le risque financier. Les autres sont en annexe et je peux y revenir. »

### Slide 8 — MCT, entrée d'une agence · 20 s
> « Le premier : comment une agence entre. Un dossier est déposé et instruit. Un administrateur tranche : s'il accepte, un jeton de 24 h et l'essai démarre ; s'il refuse, le motif est obligatoire. Et sans abonnement actif, aucune publication.
> [en désignant le triangle] Ce triangle est la synchronisation : la condition qui doit être vraie pour que l'opération démarre.
> Ce que cela signifie concrètement : quand un client voit une agence dans l'application, un être humain a examiné ses documents. »

### Slide 9 — MCT, cycle locatif · 20 s
> « Le second, le cœur du métier. Le bail fige ses montants — si le loyer augmente en juin, le bail de janvier ne bouge pas. Le bail génère son échéancier. Et chaque règlement est **imputé** échéance par échéance, avant que la quittance ne soit émise.
> C'est cette imputation qui fait qu'un loyer payé laisse enfin une trace. »

### Slide 10 — MCD vue d'ensemble · 40 s
> « Ces traitements manipulent des données. Trente-quatre entités — d'un seul tenant, ce serait illisible, je l'ai donc découpé en trois vues. Je vous montre la troisième, la gestion locative, parce que c'est elle qui porte ma problématique. »

### Slide 11 — MCD gestion locative · 30 s
> « Je pars de la propriété. Un client dépose une demande avec ses pièces. Acceptée, elle donne un bail, produit depuis un modèle de contrat. Le bail génère ses échéances. Chaque échéance reçoit des paiements — par une association porteuse, parce qu'il faut savoir combien de chaque paiement va sur chaque mois. De là sort la quittance.
> Vous reconnaissez le processus que je viens de vous présenter : le modèle de données découle du modèle de traitement. »

### Slide 12 — Spécialisation · 30 s
> « Une entité m'a demandé un vrai choix : le bien.
> J'aurais pu mettre vente et location dans une seule entité, avec des attributs vides selon les cas. Je l'ai écartée pour une raison précise : elle interdit toute contrainte d'intégrité — on ne peut pas rendre un loyer obligatoire sur une ligne qui est une vente.
> J'ai donc spécialisé : un tronc commun, deux spécialisations, un discriminant. Et je l'ai appliqué à un modèle existant : la migration est réversible et transactionnelle. »

### Slide 13 — MLD · 20 s
> « Trois règles mécaniques de passage au relationnel. Le point important est le dernier : ce schéma a été implémenté **tel quel** dans PostgreSQL. Aucun écart entre le modèle et la base. »

### Slide 14 — Architecture · 25 s
> « Parlons de ce qui tourne. Au centre, une seule API. Au-dessus, trois applications qui la consomment : le mobile pour les clients, l'espace agence, le back-office. En dessous, PostgreSQL, le temps réel et le paiement.
> L'intérêt tient en une phrase : une règle de gestion n'est écrite qu'une fois, elle vaut pour les trois clients, et aucun ne peut la contourner. »

### Slide 15 — Parcours 1 · 35 s
> « Je vais vous montrer le système en suivant une location du début à la fin.
> Le client cherche par ville et par budget. Il ouvre la fiche : loyer, charges, dépôt de garantie, total à prévoir pour entrer — une information qu'il fallait auparavant demander par téléphone. Il dépose sa demande avec ses pièces justificatives et il en suit le statut.
> À ce stade : aucun appel, aucun déplacement. »

### Slide 16 — Parcours 2 · 35 s
> « La demande arrive chez l'agence. Ce tableau de bord donne la vue d'ensemble qu'elle n'avait pas : demandes reçues, baux actifs, échéances, revenus. C'est cet écran qui remplace le cahier.
> Quand l'agence accepte, le bail n'est pas rédigé à la main : il est généré depuis son modèle de contrat — aucune clause obligatoire ne peut manquer. »

### Slide 17 — Parcours 3 · 40 s ⚠️ **ralentis**
> « Le bail existe. Reste le loyer.
> Le locataire règle en ligne. La notification n'est pas crue sur parole : la signature est vérifiée, et la facture est re-confirmée directement auprès du prestataire.
> Le règlement est ensuite **imputé** : ligne par ligne sur les échéances dues, en commençant par la plus ancienne, sans jamais dépasser le reste à payer. La quittance est émise et rattachée au bail. Et l'historique est conservé : une suppression n'efface rien, elle marque.
> [temps] J'ai commencé en disant qu'un loyer payé ne laissait aucune trace. **Ce n'est plus vrai.** »

[Silence d'une seconde. Regarde le jury.]

### Slide 18 — Garanties · 25 s
> « Derrière ce parcours, trois garanties. La sécurité : un seul jeton, un accès contrôlé route par route, une agence inactive tant qu'elle n'est pas validée.
> L'encaissement, au centre, est le point que j'ai le plus travaillé : toute notification est journalisée y compris si elle est fausse, la signature et le montant sont vérifiés, et un rejeu ne produit jamais un double encaissement.
> Et le temps réel, avec la messagerie et les relances automatiques. »

### Slide 19 — Tests · 20 s
> « Comment je sais que cela fonctionne : quatre cent vingt-trois tests automatisés, écrits avant le code.
> Plus important que le nombre, ce qu'ils vérifient. Qu'un bail génère bien son échéancier. Qu'un paiement rejoué n'encaisse qu'une seule fois. Qu'une agence sans abonnement ne publie rien. Et qu'une agence ne voit jamais les données d'une autre. »

### Slide 20 — Valeur métier · 35 s
> « Voilà pour la technique. Reste la question la plus importante : qu'est-ce que ça change pour une agence ?
> Elle gagne du temps : publication, bail et quittance ne sont plus saisis à la main. Ses paiements deviennent traçables, chaque règlement étant imputé à une échéance identifiée. Ses quittances sont automatiques. Son historique est conservé. Ses litiges diminuent, parce que le montant dû et le montant payé sont désormais opposables. Et toute son information est au même endroit. »

### Slide 21 — Difficultés et perspectives · 25 s
> « Un mot sur ce qui a résisté. Modéliser vente et location sans dupliquer le bien. Fiabiliser l'encaissement malgré les notifications rejouées. Faire tenir le temps réel sur mobile. Et garder lisible un modèle de trente-quatre entités.
> Côté perspectives, je suis honnête : **la mise en production n'est pas couverte.** Elle suppose de passer le paiement en réel et de mener des tests de charge que je n'ai pas faits. Viendraient ensuite la signature électronique et l'espace propriétaire. »

### Slide 22 — Conclusion · 20 s
> « Je conclus.
> Je suis parti d'une phrase : à Dakar, un loyer payé ne laisse aucune trace opposable. Aujourd'hui, ce loyer laisse une échéance, une imputation et une quittance.
> Le lien qui manquait entre le bien, l'agence et le client est devenu un système d'information unique.
> Je vous remercie de votre attention et je suis à votre disposition pour vos questions. »

[Tais-toi. Ne comble pas le silence.]

---

# Les questions qui vont tomber sur ces sujets

**« Qu'est-ce que l'imputation ? »**
> « C'est la répartition d'un règlement sur les échéances qu'il solde. Un locataire peut payer trois mois d'un coup, et un mois peut être réglé en deux fois : la relation est donc plusieurs-à-plusieurs, et elle est porteuse — elle transporte le montant appliqué à chaque mois. Sans elle, je saurais qu'il a payé, mais pas ce qu'il a payé. »

**« Pourquoi une table à part et pas une colonne ? »**
> « Parce qu'une colonne ne peut porter qu'une valeur. Ici un paiement touche plusieurs mois et un mois reçoit plusieurs paiements : aucune colonne ne peut représenter cela. C'est une association plusieurs-à-plusieurs, donc une table de jointure — et elle est porteuse du montant imputé. »

**« Que se passe-t-il si le locataire paie trop ? »**
> « Le système refuse l'imputation et lève une exception. Et le contrôle porte sur le total **avant** toute écriture : si on répartissait d'abord et qu'on découvrait le dépassement sur la dernière ligne, on laisserait un paiement à moitié imputé en base. »

**« Comment savez-vous qu'une échéance est payée ? »**
> « Je ne le stocke pas comme une saisie : je le recalcule depuis la somme des imputations après chaque écriture. Les imputations sont la source de vérité ; le montant payé et le statut n'en sont que le reflet. »

**« Qu'est-ce qu'un webhook ? »**
> « C'est l'inverse d'une requête classique : ce n'est pas moi qui interroge le prestataire, c'est lui qui appelle mon API quand le paiement aboutit. C'est nécessaire parce que le client peut fermer son navigateur juste après avoir payé — si je comptais sur son retour, je perdrais l'encaissement. »

**« Qu'est-ce que l'idempotence, et pourquoi ici ? »**
> « Une opération est idempotente si l'exécuter dix fois donne le même résultat qu'une fois. C'est indispensable parce qu'un service de paiement renvoie sa notification s'il n'obtient pas de réponse claire — c'est un comportement normal. Sans protection, la même notification créditerait dix fois. »

**« Comment garantissez-vous cette idempotence ? »**
> « Par un verrou. Avant de provisionner, je relis le paiement verrouillé en base à l'intérieur d'une transaction. Une deuxième notification arrivant en parallèle attend, puis lit "déjà payé" et s'arrête. J'ai aussi un contrôle rapide en amont, mais lui n'est qu'une optimisation : seul le verrou est une garantie. »

**« Pourquoi rappeler PayDunya alors qu'il vient de vous écrire ? »**
> « Parce que mon URL est publique et que n'importe qui peut l'appeler. La signature écarte les messages contrefaits, mais je vais plus loin : je considère que la notification n'est qu'un signal, pas une preuve. La preuve, je vais la chercher à la source. »

**« À quoi sert la table Transaction ? »**
> « C'est le journal de tout ce que le prestataire m'envoie. Chaque notification y est écrite **avant** d'être jugée, avec son message brut et le résultat de la vérification de signature. Le lien vers le paiement est volontairement facultatif : une notification frauduleuse portant un jeton inventé n'a pas de paiement correspondant, et c'est justement celle-là qu'il faut conserver. »

**« Différence entre paiement et transaction ? »**
> « Le paiement est de l'argent, la transaction est une trace. Un paiement peut donner lieu à plusieurs transactions, une par notification reçue. Et une transaction peut exister sans paiement, si le message était frauduleux. »
