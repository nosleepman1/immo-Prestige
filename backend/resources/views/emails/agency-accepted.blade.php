<!DOCTYPE html>
<html lang="fr">
<body>
    <h1>Bienvenue sur Immo-Prestige</h1>
    <p>Bonjour {{ $agency->manager_name }},</p>
    <p>La demande de votre agence <strong>{{ $agency->company_name }}</strong> a été acceptée.</p>
    <p>Définissez votre mot de passe pour activer votre compte (lien valable 24 h, à usage unique) :</p>
    <p><a href="{{ $setupUrl }}">Définir mon mot de passe</a></p>
    <p>Votre période d'essai de 30 jours démarrera dès la définition de votre mot de passe.</p>
</body>
</html>
