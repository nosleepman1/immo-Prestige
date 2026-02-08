<!DOCTYPE html>
<html lang="fr">
<body>
    <h1>Échec de job</h1>
    <ul>
        <li>Job : {{ $details['job'] }}</li>
        <li>Queue : {{ $details['queue'] }}</li>
        <li>Connexion : {{ $details['connection'] }}</li>
        <li>Exception : {{ $details['exception'] }}</li>
    </ul>
</body>
</html>
