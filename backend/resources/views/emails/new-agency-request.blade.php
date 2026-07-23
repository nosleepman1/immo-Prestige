<!DOCTYPE html>
<html lang="fr">
<body>
    <h1>Nouvelle demande d'agence</h1>
    <p>L'agence <strong>{{ $agency->company_name }}</strong> (gérant : {{ $agency->manager_name }})
        a déposé une demande d'inscription à traiter dans le tableau de bord administrateur.</p>
    <ul>
        <li>Ville : {{ $agency->city }}</li>
        <li>Zone d'activité : {{ $agency->activity_zone }}</li>
        <li>Téléphone : {{ $agency->phone }}</li>
    </ul>
</body>
</html>
