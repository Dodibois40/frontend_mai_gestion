# 🚀 Démarrage Rapide - MAI-GESTION sur Windows

## ✅ Serveurs actuellement fonctionnels !

Vos serveurs sont maintenant configurés et fonctionnent sur :
- **Backend** : http://localhost:8000 ✅
- **Frontend** : http://localhost:8080 ✅
- **API d'authentification** : http://localhost:8000/api/auth/login ✅

## 🔄 Pour redémarrer l'application à l'avenir

### Méthode 1 : Script automatique (recommandé)
```cmd
# Double-cliquez sur le fichier :
start-servers-windows.bat
```

### Méthode 2 : Manuelle (si problème avec les scripts)
```powershell
# Terminal 1 - Backend
cd backend
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

# Terminal 2 - Frontend (attendre 3 secondes)
cd frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

# Terminal 3 - Ouvrir l'application (attendre 8 secondes)
Start-Process "http://localhost:8080"
```

### Méthode 3 : Si npm n'est pas reconnu
```powershell
# D'abord recharger les variables d'environnement :
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Puis démarrer manuellement dans 2 terminaux séparés :
# Terminal 1 :
cd backend
npm run dev

# Terminal 2 :
cd frontend
npm run dev
```

## 🛠️ Dépannage

### Si l'erreur 404 sur /auth/login revient
```powershell
# 1. Arrêter tous les processus Node.js
taskkill /f /im node.exe

# 2. Attendre 5 secondes
Start-Sleep 5

# 3. Redémarrer les serveurs (méthode 2 ci-dessus)
```

### Vérifier que les serveurs fonctionnent
```powershell
# Vérifier les ports
netstat -ano | findstr :8000  # Backend
netstat -ano | findstr :8080  # Frontend

# Tester l'API
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test","password":"test"}'
# Doit retourner "Identifiants invalides" = ✅ L'API fonctionne
```

## 📱 Accès à l'application

- **URL** : http://localhost:8080
- **API Documentation** : http://localhost:8000/api/docs (Swagger)
- **Base de données** : Fichier SQLite dans `backend/prisma/dev.db`

## 🔑 Première connexion

Si vous n'avez pas encore d'utilisateur, vous devez en créer un. Consultez la documentation du projet pour les instructions de création d'utilisateur initial.

## 🆘 En cas de problème

1. **Redémarrez les terminaux** et rechargez les variables d'environnement
2. **Arrêtez tous les processus Node.js** : `taskkill /f /im node.exe`
3. **Attendez 5 secondes** puis redémarrez manuellement
4. **Vérifiez les ports** avec `netstat`
5. **Consultez les logs** dans les fenêtres PowerShell des serveurs

---

**🎉 Installation réussie ! Votre environnement de développement Windows est prêt !** 