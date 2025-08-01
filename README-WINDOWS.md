# 🪟 Guide MAI-GESTION pour Windows

Ce guide vous aide à configurer et utiliser MAI-GESTION sur Windows 10/11.

## 🚀 Installation rapide

### 1. Prérequis Windows

Téléchargez et installez :
- **Node.js 18+** : https://nodejs.org/ (version LTS recommandée)
- **Git** : https://git-scm.com/download/win
- **VS Code** (optionnel) : https://code.visualstudio.com/

### 2. Télécharger le projet

```cmd
# Cloner le projet
git clone https://github.com/votre-repo/MAI-GESTION.git
cd MAI-GESTION
```

### 3. Démarrage automatique

**Option A : Script PowerShell (recommandé)**
```powershell
# Clic droit > "Exécuter avec PowerShell"
.\start-servers.ps1
```

**Option B : Script Batch**
```cmd
# Double-clic sur le fichier
start-servers.bat
```

**Option C : Manuellement**
```cmd
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

## 🔧 Configuration Windows spécifique

### Variables d'environnement

Les fichiers `.env` sont créés automatiquement, mais vous pouvez les personnaliser :

**Backend** (`backend\.env`) :
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-jwt"
NODE_ENV="development"
PORT=8000
FRONTEND_URL="http://localhost:8080"
ANTHROPIC_API_KEY="votre-clé-claude"
```

**Frontend** (`frontend\.env`) :
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=MAI-GESTION
VITE_GOOGLE_MAPS_API_KEY=VOTRE_CLE_API
```

### Base de données SQLite

✅ **Avantage Windows** : SQLite fonctionne parfaitement sur Windows sans configuration supplémentaire.

Le fichier de base `dev.db` sera créé automatiquement dans `backend/prisma/`.

## 🎯 Commandes Windows utiles

```cmd
# Réinstaller les dépendances
rmdir /s backend\node_modules
rmdir /s frontend\node_modules
cd backend && npm install
cd frontend && npm install

# Réinitialiser la base de données
cd backend
npx prisma db push --force-reset

# Ouvrir Prisma Studio
cd backend
npx prisma studio
```

## 🔍 Résolution des problèmes Windows

### Problème : "Execution Policy"
Si PowerShell refuse d'exécuter le script :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problème : Ports occupés
```cmd
# Vérifier les ports utilisés
netstat -ano | findstr :8000
netstat -ano | findstr :8080

# Tuer un processus (remplacer PID)
taskkill /PID 1234 /F
```

### Problème : Node.js non trouvé
1. Réinstaller Node.js depuis https://nodejs.org/
2. Redémarrer l'invite de commandes
3. Vérifier : `node --version`

### Problème : Git non trouvé
1. Installer Git : https://git-scm.com/download/win
2. Redémarrer l'invite de commandes
3. Vérifier : `git --version`

## 📁 Structure des fichiers Windows

```
MAI-GESTION\
├── backend\
│   ├── .env                 # Configuration backend
│   ├── prisma\
│   │   └── dev.db          # Base SQLite
│   └── node_modules\
├── frontend\
│   ├── .env                # Configuration frontend
│   └── node_modules\
├── start-servers.ps1       # Script PowerShell
├── start-servers.bat       # Script Batch
└── README-WINDOWS.md       # Ce guide
```

## 🌐 Accès à l'application

Une fois démarrée :
- **Application** : http://localhost:8080
- **API Backend** : http://localhost:8000
- **Prisma Studio** : http://localhost:5555

## 💡 Conseils Windows

1. **Utilisez Windows Terminal** pour une meilleure expérience
2. **Ajoutez des exceptions antivirus** pour le dossier node_modules
3. **Utilisez npm au lieu de yarn** pour la compatibilité
4. **Fermez proprement** les serveurs avec Ctrl+C

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que Node.js 18+ est installé
2. Vérifiez que les ports 8000 et 8080 sont libres
3. Supprimez node_modules et réinstallez
4. Redémarrez votre ordinateur en dernier recours

---

**Développé par Dorian Lacanau** - Compatible Windows 10/11 