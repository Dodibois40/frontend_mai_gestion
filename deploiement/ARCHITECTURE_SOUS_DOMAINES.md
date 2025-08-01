# 🏗️ ARCHITECTURE MAI GESTION AVEC SOUS-DOMAINES

## 📋 STRUCTURE DES DOMAINES

### Site principal (NE PAS TOUCHER)
- **URL** : https://lamanufacturedubois.com
- **Dossier** : `/public_html/`
- **Fonction** : Votre logiciel de commande en ligne

### CRM Mai Gestion
- **Frontend URL** : https://crm.lamanufacturedubois.com
- **Backend URL** : https://api-crm.lamanufacturedubois.com
- **Dossiers** :
  - Frontend : `/public_html/crm/`
  - Backend : `/home/cexe9174/nodejs_apps/mai-gestion-api/`

## 🔧 CONFIGURATION DES SOUS-DOMAINES

### 1. Créer le sous-domaine Frontend
- **cPanel → Sous-domaines**
- **Sous-domaine** : `crm`
- **Racine du document** : `/public_html/crm`

### 2. Créer le sous-domaine Backend
- **cPanel → Sous-domaines**
- **Sous-domaine** : `api-crm`
- **Racine du document** : `/public_html/api-crm` (temporaire)

### 3. Configurer l'app Node.js
- **Application URL** : `api-crm.lamanufacturedubois.com`
- **Application root** : `nodejs_apps/mai-gestion-api`

## 📦 VARIABLES D'ENVIRONNEMENT À METTRE À JOUR

### Backend (.env)
```
FRONTEND_URL = https://crm.lamanufacturedubois.com
API_URL = https://api-crm.lamanufacturedubois.com
```

### Frontend (.env.production)
```
VITE_API_URL = https://api-crm.lamanufacturedubois.com
```

## ✅ AVANTAGES
- Votre site principal reste intact
- CRM complètement séparé
- Pas de conflit entre les deux applications
- URLs claires et professionnelles

## 🚀 RÉSULTAT FINAL
- Site e-commerce : https://lamanufacturedubois.com
- CRM Mai Gestion : https://crm.lamanufacturedubois.com
- API du CRM : https://api-crm.lamanufacturedubois.com 