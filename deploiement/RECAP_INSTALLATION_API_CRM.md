# 📋 RÉCAPITULATIF INSTALLATION MAI GESTION

## ✅ CE QUI A ÉTÉ FAIT :

### 1. CORS mis à jour
- ✅ `https://api-crm.lamanufacturedubois.com` ajouté dans main.ts
- ✅ Backend rebuild avec les bonnes URLs

### 2. Fichiers de configuration créés
- ✅ `backend-env-production.txt` avec API_URL = api-crm
- ✅ `frontend-env-production.txt` avec VITE_API_URL = api-crm
- ✅ Fichiers .env.production copiés dans les projets

### 3. Fichiers de déploiement prêts
- ✅ `backend-api-crm-20250727-010427.zip`
- ✅ `frontend-crm-20250727-010427.zip`

## 🎯 ARCHITECTURE FINALE :

```
lamanufacturedubois.com ← VOTRE SITE (ne pas toucher)
├── crm.lamanufacturedubois.com ← Frontend Mai Gestion
└── api-crm.lamanufacturedubois.com ← Backend Mai Gestion
```

## 📝 ÉTAPES D'INSTALLATION SUR O2SWITCH :

### 1️⃣ Nettoyer l'ancien (si nécessaire)
- Supprimer l'ancienne app Node.js
- Supprimer `/public_html/crm/`
- Supprimer les anciens sous-domaines

### 2️⃣ Créer les sous-domaines
- **Sous-domaine 1** : `crm` → `/public_html/crm`
- **Sous-domaine 2** : `api-crm` → `/public_html/api-crm`

### 3️⃣ Base de données MySQL
- Base : `cexe9174_mai_gestion`
- User : `cexe9174_mai_user`
- Pass : `Do@66001699`

### 4️⃣ Application Node.js
- **URL** : `api-crm.lamanufacturedubois.com`
- **Root** : `nodejs_apps/mai-gestion-api`
- **Startup** : `dist/main.js`
- **Version** : 20

### 5️⃣ Variables d'environnement
```
NODE_ENV = production
PORT = 3000
DATABASE_URL = mysql://cexe9174_mai_user:Do@66001699@localhost:3306/cexe9174_mai_gestion
JWT_SECRET = xK9mP3nQ7rT5vY2bC4dF6gH8jL1aS0wE
FRONTEND_URL = https://crm.lamanufacturedubois.com
API_URL = https://api-crm.lamanufacturedubois.com
SMTP_HOST = mail.lamanufacturedubois.com
SMTP_PORT = 465
SMTP_USER = noreply@lamanufacturedubois.com
SMTP_PASS = [votre_mot_de_passe]
MAX_FILE_SIZE = 10485760
UPLOAD_PATH = /home/cexe9174/nodejs_apps/mai-gestion-api/uploads
```

### 6️⃣ Upload et installation
1. Backend ZIP → `/home/cexe9174/nodejs_apps/mai-gestion-api/`
2. Frontend ZIP → `/public_html/crm/`
3. Extraire les deux
4. Run NPM Install pour le backend
5. RESTART l'app Node.js

## ✅ RÉSULTAT ATTENDU :

- 🏢 Site principal intact : https://lamanufacturedubois.com
- 📊 CRM Mai Gestion : https://crm.lamanufacturedubois.com
- 🔧 API fonctionnelle : https://api-crm.lamanufacturedubois.com
- 🔒 SSL automatique sur tous les domaines
- ✅ CORS configuré correctement
- ✅ Pas de conflit avec votre site principal 