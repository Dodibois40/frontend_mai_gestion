# 🚀 GUIDE RAPIDE SSL - O2SWITCH

## Installation SSL pour api.lamanufacturedubois.com

### 📋 Étape 1 : Vérifier le sous-domaine
Uploadez et exécutez `verif-avant-ssl.php` :
```
https://crm.lamanufacturedubois.com/verif-avant-ssl.php
```

### 🔒 Étape 2 : Installer le certificat SSL

#### Méthode la plus simple : AutoSSL
1. **cPanel** → **SSL/TLS Status**
2. Trouvez `api.lamanufacturedubois.com`
3. Cliquez sur **AutoSSL** (ou le bouton d'action à droite)
4. Attendez 2-3 minutes

#### Alternative : Let's Encrypt
1. **cPanel** → **Let's Encrypt™ SSL**
2. Section **"Issue a new certificate"**
3. Cochez `api.lamanufacturedubois.com`
4. Cliquez **"Issue"**

### ✅ Étape 3 : Vérifier
1. Testez : https://api.lamanufacturedubois.com/
2. Videz le cache navigateur (CTRL+F5)
3. Reconnectez-vous sur Mai Gestion

### 🆘 Problème ?
- **DNS non résolu** : Créez d'abord le sous-domaine dans cPanel
- **SSL ne s'installe pas** : Contactez support@o2switch.fr
- **Erreur persiste** : Attendez 5-10 minutes et videz le cache

### 📌 Note importante
Si vous utilisez Cloudflare, désactivez temporairement le proxy orange pendant l'installation SSL. 