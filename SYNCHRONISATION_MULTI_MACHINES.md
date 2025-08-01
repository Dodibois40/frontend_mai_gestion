# 🔄 SYNCHRONISATION MULTI-MACHINES - MAI-GESTION

## 📋 Configuration actuelle

### 🖥️ **PC FIXE** (Machine principale)
- **Cursor principal** avec le projet complet MAI-GESTION
- **Répertoire :** `C:\Users\doria\Mon Drive\Mai gestion\MAI-GESTION-main`
- **Rôle :** Machine de développement principal

### 📱 **TABLETTE SURFACE** (Machine secondaire)
- **Cursor secondaire** pour développement nomade
- **Rôle :** Machine de développement mobile/appoint

## 🎯 **DÉPÔT GITHUB CENTRAL**
- **Repository :** `https://github.com/Dodibois40/M.AI-GESTION2.git`
- **Branch principale :** `master`
- **Fonction :** Point de synchronisation entre les deux machines

---

## ⚠️ **PROBLÈME RÉSOLU**

### **Ce qui s'est passé :**
1. ❌ Sur la **tablette Surface**, erreur de manipulation :
   - Upload **Cursor → GitHub** (au lieu de download GitHub → Cursor)
   - Cela a créé des fichiers parasites dans le dépôt GitHub

2. ✅ **Solution appliquée :**
   - Force push du **PC fixe** vers GitHub M.AI-GESTION2
   - Écrasement des fichiers incorrects
   - Le dépôt contient maintenant la **version correcte** du PC fixe

---

## 🔧 **PROCÉDURE DE SYNCHRONISATION**

### **📤 UPLOAD depuis PC FIXE (Push)**
```bash
# Dans le répertoire du projet
git add .
git commit -m "Mise à jour depuis PC fixe"
git push origin master
```

### **📥 DOWNLOAD sur TABLETTE SURFACE (Pull)**
```bash
# Première fois : cloner le projet
git clone https://github.com/Dodibois40/M.AI-GESTION2.git

# Mises à jour suivantes
git pull origin master
```

### **🔄 WORKFLOW RECOMMANDÉ**

#### **Démarrage d'une session :**
1. **TOUJOURS** faire `git pull` avant de commencer à coder
2. Vérifier que vous êtes à jour avec la version distante

#### **Fin de session :**
1. `git add .`
2. `git commit -m "Description des modifications"`
3. `git push origin master`

---

## 📊 **ÉTAT ACTUEL**

✅ **Dépôt M.AI-GESTION2** contient :
- Backend NestJS complet avec Prisma
- Frontend React avec Vite
- Toutes les configurations (.gitignore, nodemon.json, etc.)
- Scripts d'upload PowerShell
- Documentation complète

✅ **PC Fixe** : Synchronisé avec GitHub
✅ **Tablette Surface** : Prête à cloner/synchroniser

---

## 🚨 **RÈGLES IMPORTANTES**

### **❌ À NE JAMAIS FAIRE :**
- Travailler sur les deux machines simultanément sans synchroniser
- Oublier de faire `git pull` avant de commencer
- Faire un push sans avoir fait un pull récent

### **✅ BONNES PRATIQUES :**
- Une seule machine active à la fois
- Toujours synchroniser avant/après chaque session
- Commits fréquents avec messages clairs
- Vérifier l'état avec `git status` régulièrement

---

## 📞 **SUPPORT**

En cas de conflit ou problème :
1. `git status` pour voir l'état
2. `git pull` pour récupérer les modifications distantes
3. Résoudre les conflits si nécessaire
4. `git add .` puis `git commit` puis `git push`

---

**📅 Dernière mise à jour :** $(date)
**🎯 Statut :** Configuration terminée - Prêt pour synchronisation 