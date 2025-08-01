# 🔧 Guide d'installation complet pour Windows

Ce guide vous aide à installer tous les outils nécessaires pour faire fonctionner MAI-GESTION sur Windows.

## 🚨 Problème identifié

Votre projet utilise des **modules natifs** (bcrypt, node-gyp) qui nécessitent des outils de compilation C++ sur Windows. C'est pourquoi les serveurs ne se lancent pas.

## 📋 Liste des outils à installer

### 1. **Node.js (obligatoire)**
```cmd
# Télécharger depuis https://nodejs.org/
# Choisir la version LTS (Long Term Support)
# Cocher "Add to PATH" lors de l'installation
```

### 2. **Python (obligatoire pour node-gyp)**
```cmd
# Option A : Microsoft Store (recommandé)
# Rechercher "Python" dans le Microsoft Store
# Installer Python 3.11 ou 3.12

# Option B : Site officiel
# https://www.python.org/downloads/windows/
# Cocher "Add Python to PATH"
```

### 3. **Outils de compilation C++ (obligatoire)**

**Option A : Chocolatey (le plus simple)**
```powershell
# 1. Installer Chocolatey (gestionnaire de packages)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. Installer Python et Visual Studio Build Tools
choco install python visualstudio2022-workload-vctools -y
```

**Option B : Installation manuelle**
```cmd
# 1. Télécharger Visual Studio Community 2022 (gratuit)
# https://visualstudio.microsoft.com/fr/downloads/

# 2. Lors de l'installation, cocher :
#    - "Développement Desktop avec C++"
#    - "C++ Clang Compiler for Windows"
#    - "MSBuild support for LLVM (clang-cl)"
```

**Option C : Build Tools uniquement (plus léger)**
```cmd
# Télécharger Visual Studio Build Tools 2022
# https://visualstudio.microsoft.com/fr/downloads/#build-tools-for-visual-studio-2022

# Sélectionner "C++ build tools" lors de l'installation
```

### 4. **Git (recommandé)**
```cmd
# Télécharger depuis https://git-scm.com/download/win
# Accepter les paramètres par défaut
```

## 🔧 Installation automatique (recommandée)

Ouvrez **PowerShell en tant qu'administrateur** et exécutez :

```powershell
# Installation complète avec Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Redémarrer PowerShell puis :
choco install nodejs python visualstudio2022-workload-vctools git -y

# Installer node-gyp globalement
npm install -g node-gyp@latest
```

## ✅ Vérification de l'installation

Après installation, redémarrez votre ordinateur puis testez :

```cmd
# Vérifier Node.js
node --version
npm --version

# Vérifier Python
python --version

# Vérifier Git
git --version

# Vérifier node-gyp
node-gyp --version

# Tester la compilation
npm install -g windows-build-tools
```

## 🚀 Démarrage du projet

Une fois tous les outils installés :

```cmd
# Méthode 1 : Script automatique
.\start-servers.bat

# Méthode 2 : PowerShell
.\start-servers.ps1

# Méthode 3 : Manuel
cd backend
npm install
npm run dev

# Dans un autre terminal
cd frontend
npm install
npm run dev
```

## 🔍 Dépannage courant

### Erreur : "Python non trouvé"
```cmd
# Vérifier l'installation Python
python --version

# Configurer npm pour utiliser Python
npm config set python python3
```

### Erreur : "node-gyp compilation failed"
```cmd
# Installer les outils de build Windows
npm install -g windows-build-tools

# Ou réinstaller node-gyp
npm uninstall -g node-gyp
npm install -g node-gyp@latest
```

### Erreur : "Visual Studio non trouvé"
```cmd
# Spécifier la version de Visual Studio
npm config set msvs_version 2022

# Ou installer les modules PowerShell VS
Install-Module VSSetup -Scope CurrentUser
```

### Erreur : "bcrypt compilation failed"
```cmd
# Option 1 : Utiliser bcryptjs (alternative pure JS)
cd backend
npm uninstall bcrypt
npm install bcryptjs

# Option 2 : Forcer la recompilation
npm install bcrypt --build-from-source
```

### Erreur : "Permission denied"
```cmd
# Exécuter en tant qu'administrateur
# Ou configurer npm pour éviter les permissions élevées
mkdir %APPDATA%\npm-global
npm config set prefix %APPDATA%\npm-global
```

## 📦 Alternatives si problèmes persistants

### Option 1 : Utiliser des alternatives JavaScript pures
```json
// Dans backend/package.json, remplacer :
"bcrypt": "^6.0.0"
// Par :
"bcryptjs": "^3.0.2"
```

### Option 2 : Utiliser Docker (avancé)
```cmd
# Installer Docker Desktop
# Puis utiliser le projet dans un conteneur Linux
```

### Option 3 : Utiliser WSL2 (Windows Subsystem for Linux)
```cmd
# Installer WSL2 et Ubuntu
# Développer dans l'environnement Linux
```

## 🎯 Commandes utiles Windows

```cmd
# Voir les variables d'environnement
echo %PATH%

# Voir les ports utilisés
netstat -ano | findstr :8000
netstat -ano | findstr :8080

# Redémarrer les services Node.js
taskkill /f /im node.exe

# Nettoyer le cache npm
npm cache clean --force

# Réinstaller complètement les dépendances
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 📞 Support

Si vous rencontrez encore des problèmes :

1. **Vérifiez les prérequis** : Node.js, Python, Visual Studio Build Tools
2. **Redémarrez** votre ordinateur après l'installation
3. **Exécutez en tant qu'administrateur** si nécessaire
4. **Utilisez les alternatives** JavaScript pures si la compilation échoue

---

**Note** : L'installation complète peut prendre 30-45 minutes selon votre connexion internet. Soyez patient ! 🕒 