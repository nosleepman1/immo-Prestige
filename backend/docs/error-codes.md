# Codes d'erreur de l'API

Toute exception métier (`App\Exceptions\*`, sous-classes de `DomainException`) rend la même enveloppe :

```json
{ "message": "Message lisible en français.", "code": "STABLE_ERROR_CODE" }
```

Les erreurs de validation (422) et les erreurs framework (401/403/404/429) gardent la forme JSON par défaut de Laravel :
`{"message": "...", "errors": {"champ": ["..."]}}` pour la validation, `{"message": "..."}` sinon.

Le **code** est stable et prévu pour du branchement côté client (ex. rediriger vers l'écran de définition de mot de passe sur `PASSWORD_NOT_SET`). Le **statut HTTP** seul ne suffit pas toujours à distinguer deux erreurs de même statut (ex. deux 409 différents).

## Table complète

| Code | Statut | Levée par | Signification |
|---|---|---|---|
| `INVALID_CREDENTIALS` | 401 | `LoginUser` | Email/mot de passe incorrect à la connexion. |
| `EMAIL_NOT_VERIFIED` | 403 | `LoginUser` | Compte non vérifié — connexion refusée tant que l'email n'est pas confirmé. |
| `PASSWORD_NOT_SET` | 403 | `EnsurePasswordIsSet` (middleware) | Agence acceptée mais n'ayant pas encore défini son mot de passe — seuls `/agency/me` et `/agency/password` restent accessibles. |
| `INVALID_HASH` | 400 | `VerifyUserEmail` | Lien de vérification d'email invalide ou altéré. |
| `ALREADY_REVIEWED` | 409 | `AcceptAgency`, `RefuseAgency` | La demande d'agence a déjà été acceptée/refusée (idempotence — évite un double traitement lors d'un double-clic admin). |
| `AGENCY_NOT_REFUSED` | 409 | `ResubmitAgency` | Seule une agence à l'état `refused` peut redéposer un dossier. |
| `INVALID_SETUP_TOKEN` | 422 | `SetAgencyPassword` | Lien de définition de mot de passe invalide (email/token ne correspondent à aucun enregistrement). |
| `TOKEN_EXPIRED` | 410 | `SetAgencyPassword` | Lien de définition de mot de passe expiré (24 h). |
| `TOKEN_ALREADY_USED` | 410 | `SetAgencyPassword` | Lien de définition de mot de passe déjà consommé (usage unique). |
| `SUBSCRIPTION_INACTIVE` | 402 | `EnsureActiveSubscription` (middleware) | L'agence n'a pas d'abonnement actif (essai expiré ou jamais souscrit) — bloque la publication. |
| `PAYMENT_INITIATION_FAILED` | 502 | `CheckoutSubscription`, `CheckoutBadge` | Le fournisseur de paiement (PayDunya) n'a pas pu créer la facture. Le paiement est marqué `failed`, aucune ligne `pending` ne reste orpheline. |
| `PROPERTY_QUOTA_EXCEEDED` | 409 | `PublishProperty` | Le quota de propriétés publiables du plan de l'agence est atteint. |
| `INCOMPLETE_LISTING` | 422 | `PublishProperty` | La fiche n'a pas de description ou aucune photo — publication refusée. |
| `TOO_MANY_IMAGES` | 409 | `UploadPropertyImage` | Une propriété a atteint son plafond de photos (20). |
| `PROPERTY_NOT_PUBLISHED` | 422 | `CreatePost` | Seule une propriété à l'état `published` peut être partagée dans le fil social. |
| `PROPERTY_ALREADY_POSTED` | 409 | `CreatePost` | Cette propriété a déjà un post associé (une propriété = au plus un post). |

## Codes framework à connaître

| Statut | Cas |
|---|---|
| 401 | Non authentifié (`auth:sanctum` — token manquant/invalide/expiré). |
| 403 | Authentifié mais policy refusée (`$this->authorize(...)`), ou rôle insuffisant (`role:*` middleware). |
| 404 | Route model binding introuvable, ou ressource volontairement masquée (ex. propriété non publiée vue par un tiers — 404, pas 403, pour ne pas divulguer l'existence). |
| 422 | Échec de validation (`FormRequest::rules()`). |
| 429 | Rate limit dépassé (`throttle:*` — voir limiteurs `api`, `login`, `register`, `messages`, `reports` dans `AppServiceProvider`). |

## Emplacement du code source

Toutes les exceptions métier sont dans `app/Exceptions/`, chacune avec `public int $status` et `public string $errorCode`. Le rendu est centralisé dans `bootstrap/app.php` (`->withExceptions(...)`), pas répété contrôleur par contrôleur.
