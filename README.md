# MAI-GESTION

## Description

MAI-GESTION est une application de gestion d'entreprise complète développée avec NestJS et React. Elle comprend un système de gestion des affaires, des achats, des devis, du planning interactif, et bien plus encore.

## Fonctionnalités

### 🏢 Gestion des Affaires
- Création et suivi des affaires
- Gestion des devis et bons de commande
- Suivi financier et rentabilité
- Gestion des équipes et phases

### 📋 Planning Interactif
- Planification visuelle des projets
- Gestion des ressources et équipes
- Suivi des temps et pointages
- Statistiques en temps réel

### 💰 Gestion des Achats
- Bons de commande
- Suivi des fournisseurs
- Gestion des catégories d'achat
- Estimations budgétaires

### 🤖 Assistant IA (Claude)
- Chat intelligent pour l'aide à la gestion
- Analyse de documents
- Actions rapides automatisées

### 👥 Gestion des Utilisateurs
- Système d'authentification sécurisé
- Gestion des rôles et permissions
- Profils utilisateurs avancés

## Technologies

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM pour base de données
- **SQLite** - Base de données
- **JWT** - Authentification
- **Multer** - Upload de fichiers

### Frontend
- **React** - Interface utilisateur
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Graphiques
- **React Router** - Navigation

## Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation Backend

```bash
cd backend
npm install
```

### Installation Frontend

```bash
cd frontend
npm install
```

### Configuration

1. Créer un fichier `.env` dans le dossier `backend` :

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-jwt"
CLAUDE_API_KEY="votre-clé-api-claude"
```

2. Initialiser la base de données :

```bash
cd backend
npx prisma generate
npx prisma db push
```

## Démarrage

### Développement

Pour démarrer en mode développement :

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Ou utiliser le script de démarrage automatique :

```bash
./start-servers.sh
```

### Accès à l'application

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:8000
- **Prisma Studio** : http://localhost:5556

## Structure du Projet

```
MAI-GESTION/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/        # Modules métier
│   │   ├── common/         # Services communs
│   │   └── prisma/         # Configuration Prisma
│   ├── uploads/            # Fichiers uploadés
│   └── prisma/             # Schéma et migrations
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   └── utils/          # Utilitaires
│   └── public/             # Fichiers statiques
└── tests/                  # Tests automatisés
```

## Scripts Utiles

```bash
# Démarrer les serveurs
./start-servers.sh

# Réinitialiser la base de données
cd backend && npx prisma db push --force-reset

# Générer les types Prisma
cd backend && npx prisma generate

# Accéder à Prisma Studio
cd backend && npx prisma studio
```

## Développement

### Ajout d'une nouvelle fonctionnalité

1. **Backend** : Créer un module dans `backend/src/modules/`
2. **Frontend** : Ajouter les composants dans `frontend/src/components/`
3. **API** : Créer les services dans `frontend/src/services/`

### Tests

```bash
# Tests backend
cd backend && npm test

# Tests frontend
cd frontend && npm test
```

## Déploiement

Le projet est configuré pour le déploiement sur Netlify et autres plateformes.

```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## Auteur

**Dorian Lacanau** - *Développeur Principal*
- GitHub: [@Dodibois40](https://github.com/Dodibois40)
- Email: dorianlacanau@gmail.com

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Support

Pour toute question ou problème, n'hésitez pas à :
- Ouvrir une issue sur GitHub
- Contacter par email : dorianlacanau@gmail.com

---

*Développé avec ❤️ par Dorian Lacanau*
