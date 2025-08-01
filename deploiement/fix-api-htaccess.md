# 🔧 CORRECTION : API affiche "Index of /"

## PROBLÈME :
L'API montre la liste des fichiers au lieu de l'application Node.js

## SOLUTION :

### Option 1 : Créer un .htaccess
1. Dans cPanel → File Manager
2. Allez dans `/home/cexe9174/nodejs_apps/mai-gestion-api/`
3. Créez un fichier `.htaccess` avec ce contenu :

```
PassengerAppRoot /home/cexe9174/nodejs_apps/mai-gestion-api
PassengerAppType node
PassengerStartupFile dist/main.js
PassengerNodejs /opt/cpanel/ea-nodejs20/bin/node
```

### Option 2 : Vérifier le Document Root
1. Dans cPanel → Subdomains
2. Trouvez `api.lamanufacturedubois.com`
3. Le Document Root doit pointer vers :
   - `/home/cexe9174/nodejs_apps/mai-gestion-api/public`
   - OU `/home/cexe9174/public_html/api`

### Option 3 : Utiliser une autre URL
Si `api.lamanufacturedubois.com` ne fonctionne pas :
1. Essayez `api.cexe9174.odns.fr` dans l'app Node.js
2. Ou créez un nouveau sous-domaine `backend.lamanufacturedubois.com`

## TEST FINAL :
Après les changements, l'API devrait répondre avec du JSON, pas "Index of /" 