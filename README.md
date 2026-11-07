# Maîtrise Budget — PWA

Application web progressive de gestion budgétaire personnelle, en français et en FCFA.

## Fonctionnalités
- Revenus et sources de revenus par mois
- Dépenses quotidiennes avec catégories
- Provisions mensuelles et objectifs d'épargne
- Solde disponible calculé en temps réel : revenus − dépenses − provisions − épargne réservée
- Graphique de répartition des dépenses
- Indicateur de consommation du budget et avertissement visuel
- Stockage local sur l'appareil
- Installation PWA et cache hors ligne après le premier chargement

## Lancer en local
Un service worker exige `localhost` ou HTTPS. Dans le dossier du projet, lancez par exemple :

```bash
python -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.

## Déployer
Publiez le contenu du dossier sur un hébergement statique HTTPS (par exemple GitHub Pages, Netlify ou Vercel). Ouvrez ensuite l'adresse sur le téléphone et choisissez « Ajouter à l'écran d'accueil » / « Installer ».

## À savoir
- Les données restent dans le stockage local du navigateur (`localStorage`). Elles ne sont pas synchronisées entre appareils et ne sont pas sauvegardées sur un serveur.
- Pour une utilisation réelle à long terme, prévoyez une sauvegarde/export, une authentification facultative et une base de données sécurisée.
- Les alertes de dépassement sont affichées dans l'application lorsqu'une catégorie dépasse le montant provisionné. Les notifications push en arrière-plan ne sont pas activées dans cette première version.
- Le graphique et les calculs sont produits localement. Aucun compte bancaire n'est connecté.
