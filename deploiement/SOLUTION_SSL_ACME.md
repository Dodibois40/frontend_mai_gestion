# 🚨 SOLUTION RAPIDE - Erreur SSL ACME Challenge

## ❌ Problème
Let's Encrypt ne peut pas valider : erreur 500 sur `.well-known/acme-challenge/`

## ✅ Solution rapide

### Option 1 : Utiliser AutoSSL (Le plus simple)
1. Dans cPanel → **SSL/TLS Status**
2. Trouvez `api.lamanufacturedubois.com`
3. Cliquez sur **"Run AutoSSL"**
4. AutoSSL gère automatiquement les problèmes de validation

### Option 2 : Corriger pour Let's Encrypt

#### Étape 1 : Identifier où pointe api.lamanufacturedubois.com
1. cPanel → **Subdomains**
2. Trouvez `api.lamanufacturedubois.com`
3. Notez le "Document Root" (ex: `/public_html/api/`)

#### Étape 2 : Créer la structure nécessaire
Dans le File Manager, allez dans le document root et créez :
```
/public_html/api/
├── .well-known/
│   └── acme-challenge/
└── .htaccess
```

#### Étape 3 : Créer le .htaccess
Dans `/public_html/api/.htaccess`, mettez :
```apache
RewriteEngine On
# Permettre l'accès Let's Encrypt
RewriteCond %{REQUEST_URI} ^/\.well-known/acme-challenge/
RewriteRule ^ - [L]
```

#### Étape 4 : Si vous avez une app Node.js
1. cPanel → **Setup Node.js App**
2. Trouvez l'app pour api.lamanufacturedubois.com
3. Cliquez **"Stop App"** temporairement
4. Générez le certificat SSL
5. Redémarrez l'app après

## 📁 Script automatique
Uploadez `fix-acme-challenge.php` dans `/public_html/crm/` et exécutez :
https://crm.lamanufacturedubois.com/fix-acme-challenge.php

## ⚡ Alternative rapide
Si rien ne fonctionne, dans cPanel :
1. Changez temporairement le document root de `api` vers `/public_html/api/`
2. Générez le SSL
3. Rechangez vers votre configuration Node.js après

## 🆘 Support
Contactez support@o2switch.fr : "J'ai besoin d'aide pour installer SSL sur api.lamanufacturedubois.com, erreur ACME challenge 500" 