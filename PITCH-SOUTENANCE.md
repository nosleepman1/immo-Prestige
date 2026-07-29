# Pitch de soutenance — Immo-Prestige

> Un jury note trois choses : ce que tu as fait, **pourquoi tu l'as fait comme ça**, et si tu tiens debout quand on te contredit.
> Le premier point est déjà dans le mémoire. La mention se joue sur les deux autres.

---

## 1. La thèse — une seule phrase à défendre

Apprends celle-ci par cœur. Tout le reste s'y rattache :

> **« Le problème n'était pas de publier plus d'annonces, mais de rendre fiable et traçable ce qui se faisait déjà à la main. »**

Chaque décision technique que tu présentes doit pouvoir se raccrocher à cette phrase :
la validation des agences → fiabilité · les soft deletes → traçabilité · l'idempotence des paiements → fiabilité · les 423 tests → les deux.

Un candidat qui a une thèse est jugé comme un ingénieur. Un candidat qui liste des fonctionnalités est jugé comme un exécutant.

---

## 2. Les 90 premières secondes — à dire mot pour mot

C'est le seul passage que tu apprends littéralement. Il fixe l'impression pour les vingt minutes qui suivent.

> « Monsieur le Président, Messieurs les membres du jury, bonjour.
>
> Je vais vous présenter Immo-Prestige, une plateforme digitale de gestion et de diffusion immobilière.
>
> Je voudrais commencer par ce que j'ai observé sur le terrain. Aujourd'hui, une agence immobilière publie ses biens sur WhatsApp et sur Facebook. Elle prend ses rendez-vous par téléphone. Elle tient ses locations sur un cahier, et elle remet des reçus de loyer écrits à la main.
>
> Le résultat, c'est qu'un client ne peut pas vérifier une annonce, qu'un loyer payé ne laisse aucune trace opposable, et que l'agence elle-même n'a pas de vue d'ensemble de son propre parc.
>
> J'insiste sur un point, parce qu'il commande tout mon travail : **le problème n'est pas un problème de volume de publication, c'est un problème de fiabilité et de traçabilité.**
>
> Mon travail a donc consisté à concevoir et à réaliser un système d'information unique qui couvre la chaîne complète : du catalogue de biens jusqu'à la quittance de loyer. Je vais vous présenter la démarche en cinq parties. »

**Pourquoi ça marche :** tu n'as pas dit « j'ai fait une application ». Tu as posé un diagnostic, puis annoncé une réponse à ce diagnostic. Le jury sait dès la 90ᵉ seconde qu'il a affaire à quelqu'un qui a réfléchi.

---

## 3. Le minutage — 20 minutes

Sur le deck livré (`Immo-Prestige-Soutenance-v2.pptx`, 45 slides dont 6 d'annexe).

| Bloc | Slides | Temps | Rythme |
|---|---|---|---|
| Couverture + accroche | 1-2 | 1 min 30 | Lent, posé, aucune note |
| Sommaire | 3 | 20 s | Les cinq titres, rien de plus |
| Cadrage | 4-8 | 3 min 30 | La 6 (existant) et la 7 (problématique) portent tout |
| Analyse | 9-17 | 5 min | 40 s max par MCT — raconte, ne lis pas |
| Conception | 18-24 | 4 min 30 | 1 min sur la 23 (spécialisation) |
| Réalisation | 25-34 | 4 min 30 | Les écrans vont vite, la 33 est le sommet |
| Bilan | 35-38 | 1 min 30 | Court, net, pas de traîne |
| Annexes | 39-45 | — | Non présentées |

**Discipline de survie :** si tu es en retard arrivé à la slide 25, saute la 27 (technologies), la 30 et la 31. Ne sacrifie **jamais** les slides 2, 6, 7, 23, 33 et 34.

**Les slides d'annexe (39-45)** contiennent les cinq MCT non présentés, le tableau des 53 flux, le MOT, la liste des 34 entités et le MLD complet. Elles ne sont pas là pour être montrées : elles sont là pour qu'une question du jury trouve sa réponse en deux clics, sans que tu aies à ouvrir le mémoire.

---

## 4. Les quatre moments qui font la différence

Le reste de l'exposé est de l'information. Ces quatre passages sont de la démonstration de compétence. Ralentis dessus.

### Moment 1 — slide 6, la critique de l'existant
Ne récite pas les deux colonnes. Dis :
> « Regardez la colonne de droite. Aucune de ces limites n'est un problème d'outil. Ce sont toutes des conséquences d'une seule chose : rien de ce qui se passe ne laisse de trace. »

Tu viens de transformer une liste en analyse.

### Moment 2 — slide 23, la spécialisation vente / location
C'est ton meilleur argument de **conception**, et il est classiquement récompensé parce qu'il relève du vocabulaire Merise.
> « Un bien peut être en vente ou en location, mais les deux n'ont pas les mêmes caractéristiques. J'aurais pu tout mettre dans une seule table, avec des colonnes vides selon les cas. J'ai préféré une spécialisation : `propriété` est le tronc commun, et deux entités spécialisées portent les caractéristiques propres à la vente et à la location. Le type de transaction sert de discriminant. »

Ajoute la phrase qui tue :
> « Cette restructuration a été appliquée sur un modèle qui existait déjà, et la migration est réversible et transactionnelle : un échec laisse le schéma et les données exactement dans leur état initial. »

### Moment 3 — slides 15 et 33, l'encaissement
**C'est le point le plus solide de tout ton projet.** La slide 15 en montre le MCT, la 33 en résume les quatre garanties. Développe :
> « Un service de paiement externe peut renvoyer plusieurs fois la même notification, ou une notification falsifiée. J'ai traité les deux. Toute notification reçue est journalisée, y compris les fausses. Ensuite trois vérifications : la signature doit être valide ; la facture est **re-confirmée directement auprès du fournisseur**, parce que la notification n'est pas une source de vérité fiable, seul le fournisseur l'est ; et le montant confirmé doit correspondre au montant attendu, sinon c'est rejeté et journalisé comme tentative de falsification.
>
> Enfin, l'approvisionnement se fait sous verrou dans une transaction. Concrètement : si la même notification arrive dix fois, l'abonnement n'est activé qu'une seule fois. »

Si tu ne dis qu'une chose technique dans toute ta soutenance, dis celle-là.

### Moment 4 — slide 34, les tests
Le chiffre n'impressionne que si tu expliques à quoi il sert.
> « 423 tests, ce n'est pas une performance, c'est une méthode. Ils sont écrits **avant** le code, ce qui oblige à formuler le comportement attendu avant de savoir comment on va l'implémenter. Et regardez la répartition : 170 tests sur la gestion locative. Ce n'est pas un hasard, c'est là qu'il y a de l'argent qui circule, donc c'est là que je devais me protéger le plus. »

---

## 5. Les 30 dernières secondes — mot pour mot

> « Pour conclure. Au départ, le bien existait, l'agence existait, le client existait — mais le lien entre les trois n'existait pas.
>
> Ce lien est aujourd'hui un système d'information unique : trente-quatre tables métier, cent seize points d'entrée d'API, quatre cent vingt-trois tests automatisés, et trois applications qui partagent le même socle.
>
> Je vous remercie de votre attention, et je suis à votre disposition pour vos questions. »

Puis **tais-toi**. Ne comble pas le silence. Regarde le jury.

---

## 6. La séance de questions

C'est là que la mention se décide. Trois règles avant les réponses :

1. **Écoute la question jusqu'au bout.** Ne réponds jamais à une question que tu as devinée à mi-parcours.
2. **Reformule si elle est large** : « Si je comprends bien, vous me demandez pourquoi… » Tu gagnes trois secondes et tu évites de répondre à côté.
3. **« Je ne sais pas » est une bonne réponse** si elle est suivie de « voici comment je m'y prendrais pour le savoir ». Bluffer est la seule faute vraiment éliminatoire.

### Questions de conception

**« Pourquoi avoir gardé une table `publications` distincte de `propriétés` ? »**
> Ce sont deux objets différents. La propriété est ce que l'agence gère dans son tableau de bord : son propriétaire, ses images, son statut. La publication est ce que le client voit dans son fil. Les likes et les commentaires ciblent la publication, pas le bien — sinon un bien retiré de la vente emporterait avec lui toute la conversation qu'il avait suscitée.

**« Pourquoi deux tables de détails au lieu d'une seule table `propriétés` ? »**
> Voir le Moment 2. Ajoute : « L'alternative, une table unique avec des colonnes nulles selon le type, aurait rendu impossible toute contrainte d'intégrité : on ne peut pas exiger un loyer mensuel sur une ligne qui est en fait une vente. »

**« Votre modèle est-il normalisé ? »**
> Oui, jusqu'à la troisième forme normale. Aucun attribut ne dépend d'un autre attribut non clé. Les seules données répétées sont volontaires — par exemple le montant figé d'une échéance, qui ne doit pas suivre les évolutions ultérieures du bail.
> *(Vérifie ce point sur ton propre schéma avant de l'affirmer.)*

**« Pourquoi Merise et pas UML ? »**
> Merise sépare explicitement les données et les traitements, et le passage du conceptuel au logique est mécanique et vérifiable. Sur un système dont le cœur est un modèle relationnel de trente-quatre tables, c'est exactement ce dont j'avais besoin. UML aurait été plus adapté si le système avait été centré sur des comportements d'objets plutôt que sur des données.

**« Pourquoi MySQL et pas une base NoSQL ? »**
> Parce que mon métier est fondamentalement relationnel. Un bail, ses échéances et ses paiements doivent rester cohérents entre eux — c'est une garantie que je veux obtenir de la base, pas du code applicatif. Une base documentaire m'aurait obligé à reconstruire cette cohérence à la main.

### Questions techniques

**« Comment sécurisez-vous l'accès à l'API ? »**
> Une seule stratégie, un jeton porteur, la même pour le web et pour le mobile — pas un mélange de cookies et de jetons selon le client. Les permissions sont déclarées route par route. Et un compte agence ne peut rien faire tant qu'un administrateur ne l'a pas validé et tant que le mot de passe n'a pas été défini par son lien à usage unique.

**« Que se passe-t-il si le service de paiement est indisponible ? »**
> La demande de paiement échoue et rien n'est provisionné — c'est le comportement voulu, un abonnement ne s'active jamais sans confirmation. Et comme la source de vérité est la re-confirmation auprès du fournisseur, une notification perdue n'est pas un problème définitif : la facture peut être re-confirmée.

**« Pourquoi des suppressions réversibles partout ? »**
> Parce que la traçabilité est une exigence du sujet. Si une agence supprime un bail, le passé locatif du client disparaîtrait avec lui — et c'est précisément ce passé qui a une valeur juridique. La suppression marque, elle n'efface pas.

**« Le temps réel, comment ça fonctionne concrètement ? »**
> Une connexion WebSocket maintenue ouverte avec le serveur. Quand un message est envoyé, le serveur le diffuse sur un canal privé auquel seuls les participants de la conversation sont autorisés à s'abonner — l'autorisation passe par le même jeton que le reste de l'API. Le destinataire reçoit le message sans avoir rien à recharger.

**« Comment gérez-vous les échéances de loyer dans le temps ? »**
> Par des tâches planifiées : génération des échéances à venir, notification avant l'échéance, et marquage automatique en retard une fois la date dépassée. Ce n'est pas l'agence qui doit penser à surveiller, c'est le système qui la prévient.

**« Vous n'avez pas de couche service ni de dépôts de données. Pourquoi ? »**
> C'est un choix assumé. Un cas d'usage égale une classe d'action — soixante au total — chacune faisant une seule chose. Une couche service par entité aurait regroupé des opérations qui n'ont rien à voir entre elles. Quant aux dépôts, ils auraient dupliqué ce que l'ORM fait déjà ; les requêtes vraiment complexes sont isolées dans des objets requête dédiés. La seule abstraction que je me suis autorisée est celle du service de paiement, parce qu'elle est réellement remplacée par une implémentation factice dans les tests.

### Questions de valeur

**« Qu'est-ce qui distingue votre travail d'un site d'annonces existant ? »**
> Un site d'annonces s'arrête à la mise en relation. Mon système commence là où l'annonce s'arrête : la candidature, l'instruction du dossier, le bail, l'échéancier, l'encaissement, la quittance et les incidents de maintenance. C'est la gestion locative complète, et c'est justement la partie qui est aujourd'hui tenue sur cahier.

**« Qu'est-ce qui vient de vous, et qu'est-ce qui vient du framework ? »**
> Le framework me donne le routage, l'accès aux données et l'authentification de base. Ce qui vient de moi, c'est le modèle de données, les règles de gestion, les soixante cas d'usage métier, le circuit de paiement et la totalité des tests. Aucun framework ne sait qu'une candidature acceptée doit produire un bail.

**« Avez-vous testé la montée en charge ? »**
> **Non, et je ne vais pas prétendre le contraire.** Mes tests sont fonctionnels : ils vérifient que le comportement est correct, pas qu'il tient sous mille utilisateurs simultanés. Ce serait la première chose à faire avant une mise en production réelle : instrumenter, mesurer le temps de réponse sous charge sur la recherche de biens, et vérifier les index.

---

## 7. Ton auto-critique — prépare-la, ne la subis pas

Un jury cherche toujours à savoir si tu vois les limites de ton propre travail. Si **tu** les nommes le premier, tu passes de « défensif » à « lucide ». Deux sont déjà écrites dans le deck (slide 31 pour le paiement en environnement de test, slide 37 pour la mise en production) — dis-les à voix haute, ne compte pas sur le jury pour les lire. Garde la troisième en réserve :

1. **Pas de test de charge.** Fonctionnellement couvert, pas éprouvé en performance.
2. **Le paiement est en environnement de test.** Le circuit est complet et vérifié, mais il n'a pas encore tourné sur de l'argent réel.
3. **Le modèle est dense.** Trente-quatre tables, c'est beaucoup à faire tenir dans la tête d'un futur mainteneur ; c'est pour ça que j'ai découpé le MCD par domaines plutôt que de le présenter d'un bloc.

---

## 8. Mécanique orale

**À faire**
- Parle **au jury**, pas à l'écran. Un regard vers la slide, puis retour vers eux.
- Ralentis sur les chiffres. « Quatre cent… vingt-trois… tests. » Un chiffre lancé vite ne s'entend pas.
- Marque un silence d'une seconde entre deux parties. C'est ce qui donne l'impression de maîtrise.
- Garde les mains visibles et au-dessus de la taille.

**À ne pas faire**
- Lire les slides. Le jury sait lire ; s'il te lit, tu ne sers à rien.
- Dire « euh, voilà », « comme vous pouvez le voir », « je vais essayer d'expliquer ». Tu n'essaies pas, tu expliques.
- T'excuser de quoi que ce soit — ni du temps, ni du périmètre, ni d'une capture d'écran.
- Répondre à une objection par « oui mais ». Réponds par « c'est juste, et voici pourquoi j'ai quand même choisi ça ».

---

## 9. Le programme des trois derniers jours

| Quand | Quoi |
|---|---|
| **J-3** | Lis les 29 notes de l'orateur à voix haute, sans chrono. Note les phrases qui ne sortent pas naturellement et réécris-les avec tes mots. |
| **J-2** | Répétition complète chronométrée, debout, seul. Objectif : 20 min ± 1. Puis relis la section 6 de ce document. |
| **J-1** | Répétition devant une personne qui ne connaît rien au projet. Demande-lui trois questions. Si elle n'a pas compris le problème après ta slide 7, retravaille ton commentaire des slides 2 et 6. Apprends l'ouverture et la conclusion par cœur. |
| **Jour J** | Ouvre le fichier une heure avant sur la machine de la salle. Vérifie la police et les images. Aie un PDF de secours sur clé USB **et** dans ta boîte mail. |

---

## 10. La seule chose à retenir

Le jury ne cherche pas à savoir si ton application est parfaite. Il cherche à savoir si **tu sais pourquoi elle est comme elle est**.

Chaque fois qu'on te demande « pourquoi », tu as déjà la réponse : parce que le problème était la fiabilité et la traçabilité.
