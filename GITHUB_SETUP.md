# 🚀 Configuration GitHub pour MAI-GESTION

## 📋 Prérequis

1. **Installer Git pour Windows**
   - Aller sur https://git-scm.com/download/win
   - Télécharger et installer avec les options par défaut
   - Redémarrer le terminal après l'installation

2. **Créer un compte GitHub**
   - Aller sur https://github.com
   - Créer un compte si vous n'en avez pas

## 🛠️ Configuration initiale

### 1. Configurer Git (première fois uniquement)
```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### 2. Créer un repository sur GitHub
1. Aller sur https://github.com/new
2. Nom du repository : `mai-gestion` (ou autre)
3. Description : `Application de gestion d'entreprise`
4. Choisir **Public** ou **Private**
5. **NE PAS** cocher "Add a README file"
6. Cliquer "Create repository"

### 3. Noter l'URL du repository
Exemple : `https://github.com/votre-username/mai-gestion.git`

## 🎯 Utilisation des scripts d'upload

### Upload rapide
```powershell
.\upload.ps1
```
- Lance un upload avec message de commit personnalisé
- Parfait pour les mises à jour quotidiennes

### Upload avec message spécifique
```powershell
.\scripts\github-upload.ps1 "Ajout de nouvelles fonctionnalités"
```

### Upload automatique
```powershell
.\scripts\github-upload.ps1
```
- Utilise un message automatique avec date/heure

## 🔑 Authentification GitHub

### Option 1 : Token Personnel (Recommandé)
1. Aller sur https://github.com/settings/tokens
2. "Generate new token" → "Classic"
3. Cocher : `repo`, `workflow`, `write:packages`
4. Copier le token généré
5. Lors du premier push, utiliser :
   - Username : votre nom d'utilisateur GitHub
   - Password : le token (pas votre mot de passe)

### Option 2 : GitHub CLI
```powershell
winget install --id GitHub.cli
gh auth login
```

## 📁 Structure ignorée par Git

Les fichiers/dossiers suivants sont automatiquement ignorés :
- `node_modules/`
- `dist/` et `build/`
- Fichiers `.env`
- Base de données (`*.db`)
- Dossiers de déploiement
- Fichiers temporaires Windows

## 🚀 Commandes utiles

### Voir le statut
```powershell
git status
```

### Voir l'historique
```powershell
git log --oneline
```

### Voir les modifications
```powershell
git diff
```

### Synchroniser depuis GitHub
```powershell
git pull
```

## 🆘 Résolution de problèmes

### "Git n'est pas reconnu"
- Redémarrer PowerShell après installation de Git
- Vérifier que Git est dans le PATH

### "Authentication failed"
- Utiliser un token personnel au lieu du mot de passe
- Vérifier les permissions du repository

### "Remote origin already exists"
```powershell
git remote set-url origin https://github.com/username/repo.git
```

### "Branch main doesn't exist"
```powershell
git branch -M main
git push -u origin main
```

## 📊 Workflow recommandé

1. **Développement** : Travailler normalement sur le code
2. **Test** : Vérifier que l'application fonctionne
3. **Upload** : Lancer `.\upload.ps1`
4. **Message** : Décrire les changements effectués
5. **Répéter** : Faire cela régulièrement

---

✨ **Avec ces scripts, l'upload vers GitHub devient un jeu d'enfant !** 