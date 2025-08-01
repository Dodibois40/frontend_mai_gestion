# 🚀 PLAN DE REDÉPLOIEMENT SIMPLE - MAI GESTION

## ✅ CE QU'ON VA FAIRE (sans rien supprimer) :

### ÉTAPE 1 : Corriger le CORS dans le code source
```powershell
cd C:\Users\doria\Mon Drive\Mai gestion\MAI-GESTION-main\deploiement
.\fix-cors-source.ps1
```

### ÉTAPE 2 : Reconstruire le backend avec le CORS corrigé
```powershell
cd ..\backend
npm run build
```

### ÉTAPE 3 : Préparer les fichiers pour O2SWITCH
```powershell
cd ..\deploiement
.\build-backend-simple.ps1
.\build-frontend-simple.ps1
```

### ÉTAPE 4 : Créer des ZIPs pour upload facile
```powershell
# Dans le dossier deploiement\build
Compress-Archive -Path backend\* -DestinationPath backend-fixed.zip -Force
Compress-Archive -Path frontend\* -DestinationPath frontend-fixed.zip -Force
```

### ÉTAPE 5 : Uploader et extraire sur O2SWITCH
1. **Backend** :
   - Uploader `backend-fixed.zip` dans `/home/cexe9174/nodejs_apps/mai-gestion-api/`
   - Extraire et écraser les anciens fichiers
   - RESTART l'app Node.js

2. **Frontend** :
   - Uploader `frontend-fixed.zip` dans `/public_html/crm/`
   - Extraire et écraser les anciens fichiers

## 🎯 RÉSULTAT :
- ✅ CORS corrigé définitivement
- ✅ Rien supprimé en local
- ✅ Mai Gestion fonctionnel en ligne

## 💡 TEMPS ESTIMÉ : 15-20 minutes 