# Immo Prestige
Bienvenue dans le projet Immo Prestige, une application dédiée à la gestion et à la visualisation des biens immobiliers de prestige. Ce projet vise à offrir une interface utilisateur intuitive et des fonctionnalités avancées pour les agents immobiliers et les acheteurs potentiels.

## Fonctionnalités
- **Gestion des biens immobiliers** : Ajout, modification et suppression des propriétés.
- **Visualisation des biens immobiliers** : Affichage des propriétés avec des images, descriptions et caractéristiques détaillées.
- **Recherche avancée** : Filtrage des propriétés par critères tels que le prix, la localisation, le type de bien, etc.

- **Interface utilisateur responsive** : Adaptée pour une utilisation sur desktop et mobile.
- **Intégration de cartes** : Affichage des propriétés sur une carte interactive pour une meilleure localisation.
- **Système de favoris** : Permet aux utilisateurs de sauvegarder leurs propriétés préférées pour un accès rapide.
## Technologies utilisées
- Frontend : React, Redux, Tailwind CSS
- Backend : Node.js, Express, MongoDB, Mongoose
- Database : PostgreSQL
- Authentification : sanctum, OAuth (possibilité d'intégration avec Google, Facebook, etc.)

## Installation
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/yourusername/immo-prestige.git
    cd immo-prestige
    ```
   
    2. Installez les dépendances (frontend et backend) :
   
    ```bash   cd frontend
            npm install
    cd ../backend
            npm install 
   
    ```

3. Configurez les variables d'environnement pour le backend (exemple dans `.env.example`).
4. Démarrez le serveur backend :
   ```bash
   cd backend
    php artisan serve
   ```
5. Démarrez le serveur frontend :
   ```bash
   cd frontend
    npm run dev
    ```
