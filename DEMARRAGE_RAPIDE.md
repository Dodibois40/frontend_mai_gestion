# 🚀 Démarrage Rapide

## Méthodes pour lancer les serveurs de développement

### 📋 Ports configurés
- **Backend (NestJS)** : http://localhost:8000
- **Frontend (React/Vite)** : http://localhost:8080
- **API Documentation** : http://localhost:8000/api/docs

---

## 🎯 Option 1 : Script NPM (Recommandé)

```bash
# Démarrer les deux serveurs en parallèle
npm run dev

# Ou individuellement
npm run backend:dev    # Backend uniquement
npm run frontend:dev   # Frontend uniquement
```

---

## 🎯 Option 2 : Script Shell (Linux/macOS)

```bash
# Démarrer les serveurs
./start-dev.sh
```

---

## 🎯 Option 3 : Script Batch (Windows)

```batch
# Double-cliquer sur le fichier ou exécuter dans cmd
start-dev.bat
```

---

## 🔧 Installation initiale

```bash
# Installer toutes les dépendances
npm run install:all

# Ou manuellement
npm install && cd backend && npm install && cd ../frontend && npm install
```

---

## ⚡ Accès rapide

Une fois les serveurs démarrés :

- **🌐 Application** : http://localhost:8080
- **🔧 API Backend** : http://localhost:8000/api
- **📖 Documentation API** : http://localhost:8000/api/docs
- **💾 Base de données (Prisma Studio)** : `cd backend && npm run db:studio`

---

## 🛑 Arrêter les serveurs

- **Script NPM/Shell** : Appuyez sur `Ctrl+C`
- **Script Windows** : Fermez les fenêtres de commande

---

## 🐛 Résolution des problèmes

### Ports déjà utilisés ?
```bash
# Vérifier les processus utilisant les ports
lsof -i :8000  # Backend
lsof -i :8080  # Frontend

# Tuer les processus si nécessaire
kill -9 $(lsof -t -i:8000)
kill -9 $(lsof -t -i:8080)
```

### Problèmes de CORS ?
Les ports sont déjà configurés dans `backend/src/main.ts` pour accepter les requêtes du frontend.

### Erreurs de dépendances ?
```bash
# Réinstaller toutes les dépendances
npm run install:all
``` 