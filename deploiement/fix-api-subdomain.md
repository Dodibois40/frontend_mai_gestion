# 🔧 CONFIGURATION CORRECTE DU SOUS-DOMAINE API

## LE PROBLÈME :
Le sous-domaine `api.lamanufacturedubois.com` pointe directement vers le dossier de l'app au lieu de passer par Passenger.

## LA SOLUTION :

### 1️⃣ Dans cPanel → Subdomains
1. Trouvez `api.lamanufacturedubois.com`
2. **Modifiez** le Document Root pour : `/home/cexe9174/public_html/api`
3. **Save**

### 2️⃣ Dans cPanel → File Manager
1. Créez le dossier `/home/cexe9174/public_html/api` (s'il n'existe pas)
2. Dans ce dossier, créez un `.htaccess` avec :

```
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

### 3️⃣ Vérifiez l'app Node.js
1. Dans Setup Node.js App
2. L'URL doit être : `api.lamanufacturedubois.com`
3. Le port doit être : `3000`
4. Status : Running

## RÉSULTAT :
- Les requêtes vers api.lamanufacturedubois.com seront redirigées vers l'app Node.js sur le port 3000
- Plus d'erreur "Index of /"
- Plus d'erreur 500 