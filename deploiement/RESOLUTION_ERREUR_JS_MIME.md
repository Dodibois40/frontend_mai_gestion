# 🚨 RÉSOLUTION ERREUR JAVASCRIPT - Mai Gestion

## ❌ Nouveau problème identifié

**Erreurs** :
- `Unexpected token '<'` 
- `Expected a JavaScript module but the server responded with MIME type "text/html"`

**Cause** : Le serveur renvoie une page HTML (erreur 404) au lieu des fichiers JavaScript

## ✅ Solution rapide (2 étapes)

### Étape 1 : Supprimer spa-redirect.js

**Option A** : Script automatique
1. Uploadez `remove-spa-redirect.php` dans `/public_html/crm/`
2. Accédez à : https://crm.lamanufacturedubois.com/remove-spa-redirect.php
3. Le script supprimera automatiquement la référence problématique

**Option B** : Manuel dans cPanel
1. File Manager → `/public_html/crm/index.html`
2. Éditez et supprimez ces lignes :
   ```html
   <!-- Script pour gérer les redirections SPA -->
   <script src="./spa-redirect.js"></script>
   ```

### Étape 2 : Corriger le .htaccess

1. Dans cPanel → File Manager
2. Allez dans `/public_html/crm/`
3. Éditez `.htaccess`
4. Remplacez TOUT le contenu par :

```apache
# .htaccess pour Mai Gestion
RewriteEngine On

# Forcer HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Ne PAS rediriger les fichiers existants
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Ne PAS rediriger les dossiers existants
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Rediriger les routes SPA vers index.html
RewriteRule ^(.*)$ index.html [L]

# Types MIME
AddType application/javascript .js
AddType text/css .css
```

### Étape 3 : Vider le cache

1. **CTRL + F5** dans votre navigateur
2. Ou testez en navigation privée

## 📁 Fichiers utiles

- **`fix-js-mime-error.php`** - Diagnostic et correction automatique complète
- **`remove-spa-redirect.php`** - Supprime uniquement spa-redirect.js
- **`htaccess-fix-js.txt`** - Fichier .htaccess corrigé

## 🔍 Vérification

L'erreur est résolue si :
- Plus d'erreur "Unexpected token '<'"
- Les fichiers JS se chargent correctement
- Vous pouvez vous connecter à Mai Gestion

## ⚠️ Important

Le problème vient du fichier `.htaccess` qui redirige TOUS les fichiers vers index.html, y compris les fichiers JavaScript. La correction consiste à exclure les fichiers existants de cette redirection. 