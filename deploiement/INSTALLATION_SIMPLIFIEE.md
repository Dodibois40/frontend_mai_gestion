# 🚀 GUIDE D'INSTALLATION SIMPLIFIÉ

## 1️⃣ CRÉER LE SOUS-DOMAINE (1 seul !)
**cPanel → Sous-domaines**
- Sous-domaine : `crm`
- Racine : `/public_html/crm`

## 2️⃣ CRÉER LA BASE DE DONNÉES
**cPanel → Bases de données MySQL**
- Base : `mai_gestion`
- User : `mai_user`
- Pass : `Do@66001699`
- Ajouter l'utilisateur à la base avec TOUS les privilèges

## 3️⃣ CRÉER L'APPLICATION NODE.JS
**cPanel → Node.js Application Manager → CREATE APPLICATION**
- Node.js version : **20**
- Application mode : **Production**
- Application root : `nodejs_apps/mai-gestion-api`
- Application URL : `api-crm.lamanufacturedubois.com`
- Application startup file : `dist/main.js`

## 4️⃣ VARIABLES D'ENVIRONNEMENT
Cliquez sur le crayon pour éditer et ajoutez :
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
SMTP_PASS = [votre_mot_de_passe_email]
MAX_FILE_SIZE = 10485760
UPLOAD_PATH = /home/cexe9174/nodejs_apps/mai-gestion-api/uploads
```
**SAVE**

## 5️⃣ UPLOADER LES FICHIERS

### Backend :
1. File Manager → `/home/cexe9174/nodejs_apps/mai-gestion-api/`
2. Upload `backend-api-crm-*.zip`
3. Extraire
4. Supprimer le ZIP

### Frontend :
1. File Manager → `/public_html/crm/`
2. Upload `frontend-crm-*.zip`
3. Extraire
4. Supprimer le ZIP

## 6️⃣ INSTALLER LES DÉPENDANCES
**Node.js App Manager**
- Cliquez "Run NPM Install"
- Attendez (5-10 min)

## 7️⃣ DÉMARRER
**Node.js App Manager**
- Cliquez "RESTART"

## ✅ TESTER
1. Backend : https://api-crm.lamanufacturedubois.com
2. Frontend : https://crm.lamanufacturedubois.com

## 🎉 TERMINÉ ! 