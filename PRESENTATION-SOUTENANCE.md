# Soutenance Immo-Prestige — le support

Fichier livré : **`Immo-Prestige-Soutenance-v2.pptx`** — 45 slides, 41 images intégrées, notes de l'orateur sur chaque slide.

> ⚠️ L'ancien fichier `Immo-Prestige-Soutenance.pptx` était **ouvert dans PowerPoint** au moment de la génération, donc impossible à écraser. Ferme PowerPoint, supprime l'ancien, et renomme le `-v2` si tu veux garder le nom d'origine.

---

## 1. Ce qui a été intégré

Tout vient de tes fichiers, rien n'est un placeholder.

| Source | Contenu repris |
|---|---|
| `DOCS/Memoire Adallah DIOUF.pdf` (92 p.) | MCC (p.21), les **9 MCT** (p.24-35), tableau des 53 flux, événements déclencheurs, MOT, liste des 34 entités, MLD |
| `DOCS/1-2-3 …pdf` + vues du mémoire | Les **3 vues du MCD** en haute résolution |
| `DOCS/*.png` | Les **17 captures** de l'application (mobile, agence, admin) |
| Le code du dépôt | 116 endpoints, 60 actions, 423 tests et leur répartition |

Les diagrammes ont été rendus à 260 DPI depuis le PDF et **recadrés automatiquement sur leur contenu graphique** — sans le titre de section, la légende ni le numéro de page.

---

## 2. La structure : un pitch en cinq actes

39 slides présentées, 6 slides d'annexe. Le récit va **problème → méthode → modèle → preuve → impact**.

| # | Slide | # | Slide |
|---|---|---|---|
| 1 | Couverture | 24 | Du conceptuel au relationnel (MLD) |
| **2** | **L'accroche** — « un loyer payé ne laisse aucune trace » | 25 | → **Partie 04 · Réalisation** |
| 3 | Sommaire | 26 | Architecture |
| 4 | → **Partie 01 · Cadrage** | 27 | Technologies |
| 5 | Contexte | **28** | **Parcours client** — 5 écrans mobiles |
| 6 | Étude de l'existant | 29 | Espace agence |
| 7 | Problématique | 30 | Du bien au contrat |
| 8 | Objectifs | 31 | Abonnement et paiement |
| 9 | → **Partie 02 · Analyse** | 32 | Back-office |
| 10 | Démarche Merise | **33** | **Trois garanties techniques** |
| 11 | Règles de gestion | 34 | Tests — 423 |
| 12 | **MCC** (image réelle) | 35 | → **Partie 05 · Bilan** |
| 13 | Les 9 processus — vue d'ensemble | 36 | Bilan & difficultés |
| 14 | **MCT P1** — inscription et validation | 37 | Perspectives |
| 15 | **MCT P2** — abonnement et paiement | 38 | Conclusion / Merci |
| 16 | **MCT P7** — contractualisation du bail | 39 | → **Annexes** |
| 17 | **MCT P8** — encaissement du loyer | 40 | Flux et événements |
| 18 | → **Partie 03 · Conception** | 41 | MCT 3 et 4 |
| 19 | MCD — vue d'ensemble (34 entités, 55 assoc.) | 42 | MCT 5 et 6 |
| 20 | **MCD vue 1** — gestion des agences | 43 | MCT 7, 8 et 9 |
| 21 | **MCD vue 2** — catalogue et interactions | 44 | MOT et 34 entités |
| 22 | **MCD vue 3** — gestion locative | 45 | MLD complet |
| **23** | **La spécialisation vente / location** | | |

### Les décisions de mise en scène

**Slide 2 — l'accroche.** Elle n'existait pas. Un pitch gagnant pose une tension avant de présenter un plan : *« Aujourd'hui à Dakar, un loyer payé ne laisse aucune trace opposable. »* La conclusion (slide 38) referme exactement sur cette phrase — « ce loyer laisse désormais une échéance, une imputation, une quittance ». C'est la boucle qui fait qu'un jury retient une soutenance.

**4 MCT présentés sur 9.** Dérouler les neuf tue le rythme. J'ai gardé ceux qui portent le métier et le risque financier : P1, P2, P7, P8. La slide 13 montre les neuf d'un coup et annonce que les autres sont en annexe — tu passes pour quelqu'un qui a fait des choix, pas pour quelqu'un qui a manqué de temps. Chaque MCT présenté a le diagramme à gauche et **ses opérations écrites en clair à droite** : lisible même si le projecteur est mauvais.

**Slide 23 — la spécialisation.** Une slide entière sur un seul choix de conception, en « solution écartée / solution retenue ». C'est ton meilleur argument de modélisation et il était noyé dans le MCD.

**Slide 28 — le parcours client.** Tes 5 captures mobiles rangées dans l'ordre du parcours réel : recherche → fiche → conditions → demande déposée → fil. Ce n'est plus une galerie d'écrans, c'est une démonstration.

---

## 3. Ce qu'il te reste à faire

**Un seul champ** : `[Titre Prénom NOM]` de ton encadreur, et `[2025 – 2026]` si l'année diffère (slide 1). Ton nom est déjà en place.

---

## 4. Le design

Couleurs extraites de `agency/src/index.css` et `admin/src/index.css`, thème clair.

| Rôle | Valeur | Origine |
|---|---|---|
| Fond de page | `#F8FAFC` | `bg-[#F8FAFC]` des écrans |
| Cartes | `#FFFFFF` + bordure `#E2E8F0` | `bg-white border-slate-200` |
| Vert identitaire | `#00875A` | `--primary: oklch(0.55 0.18 160)` |
| Vert secondaire | `#00A091` | dégradé de marque `oklch(0.62 0.14 185)` |
| Titres / corps / atténué | `#0F172A` / `#475569` / `#94A3B8` | slate-900 / 600 / 400 |

Heureux hasard : **tes diagrammes Merise sont déjà verts**, ils s'accordent au thème sans retouche. Le MCD sort en cyan de PowerAMC — je l'ai laissé tel quel, c'est ta pièce officielle et elle se lit très bien sur fond blanc.

Les fonds de couverture et de transition reproduisent ton écran de connexion (`.auth-split`) : dégradé 135°, deux halos verts, grille fine. **Police : Segoe UI** — Geist n'est installé sur aucun poste standard.

---

## 5. Contrôle qualité

- Validation OOXML : **passée**.
- 45 slides mesurées au pixel dans un navigateur, à la géométrie exacte du deck : **0 débordement de texte, 0 chevauchement, 0 image déformée, 0 image manquante** sur les 41 images de contenu.
- Chaque image est placée à son ratio source exact — rien n'est étiré.

**Limite** : LibreOffice n'est pas installé et la pane navigateur n'était pas affichée, donc je n'ai pas pu produire de rendu image. La vérification est géométrique et complète, mais je n'ai pas *regardé* les slides. Ouvre le fichier et signale-moi ce qui te déplaît.
