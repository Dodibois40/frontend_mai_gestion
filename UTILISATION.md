# Guide d'utilisation des serveurs

Ce document explique comment démarrer, arrêter et gérer les serveurs frontend et backend de l'application.

## Démarrage rapide

Pour démarrer les deux serveurs simultanément, exécutez :

```bash
./run-servers.sh
```

Le backend sera disponible sur http://localhost:8000
Le frontend sera disponible sur http://localhost:8080

## Démarrage individuel des serveurs

Pour démarrer uniquement le backend :

```bash
./run-backend.sh
```

Pour démarrer uniquement le frontend :

```bash
./run-frontend.sh
```

## Résolution des problèmes

### Diagnostiquer et réparer automatiquement

Si vous rencontrez des problèmes lors du démarrage des serveurs, utilisez l'outil de diagnostic :

```bash
./fix-servers.sh
```

Cet outil va :
1. Détecter les problèmes courants (ports utilisés, dépendances manquantes, etc.)
2. Vous proposer de les réparer automatiquement
3. Vérifier que les réparations ont fonctionné

### Redémarrage propre en cas de problème

Si vous rencontrez des problèmes de connexion persistants avec le serveur Vite ou le HMR, utilisez :

```bash
./restart-vite.sh
```

Ce script va :
1. Arrêter tous les processus Node.js en cours
2. Libérer les ports utilisés
3. Nettoyer les caches
4. Recréer les configurations nécessaires
5. Redémarrer les serveurs via `concurrently` (backend et frontend)
Les sorties des serveurs s'affichent dans le terminal. Utilisez Ctrl+C pour les arrêter.


### Problèmes avec les fichiers JSX

Si vous rencontrez des erreurs de syntaxe JSX, utilisez :

```bash
./fix-jsx-errors.sh
```

Ce script va créer ou mettre à jour les fichiers nécessaires pour résoudre les problèmes liés à JSX et aux transitions React.

## Structure des répertoires

- `/frontend` : Application frontend React
- `/backend` : API backend Express
- `/scripts` : Scripts utilitaires

## Dépendances

Les dépendances seront installées automatiquement au premier démarrage des serveurs, mais vous pouvez aussi les installer manuellement :

```bash
# Pour le frontend
cd frontend
npm install

# Pour le backend
cd backend
npm install
```

## Notes importantes

1. Si vous modifiez des fichiers de configuration comme `vite.config.js`, ces modifications peuvent être écrasées par les scripts de réparation.

2. Les serveurs utilisent les ports suivants :
   - Frontend (Vite) : port 8080
   - Backend (NestJS) : port 8000
   - HMR (Hot Module Replacement) : port 24678

3. Si un port est déjà utilisé, les scripts tenteront de terminer le processus qui l'occupe.

4. Tous les scripts incluent des codes de couleur pour une meilleure lisibilité dans le terminal.

## En cas de problèmes persistants

Si vous rencontrez des problèmes persistants même après avoir utilisé les scripts de réparation :

2. Essayez de supprimer les répertoires `node_modules` et de réinstaller les dépendances
3. Assurez-vous qu'aucun autre processus n'utilise les ports 8080, 8000 ou 24678 