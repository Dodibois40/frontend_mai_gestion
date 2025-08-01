# 🔧 Guide cPanel - Étape 3 : Configuration MySQL, Sous-domaines et SSL

## 1️⃣ Créer la Base de Données MySQL

### Dans cPanel, cliquez sur "MySQL Databases"

1. **Créer la base de données :**
   - Dans "Create New Database"
   - Nom : `mai_gestion` (sera préfixé automatiquement en `cexe9174_mai_gestion`)
   - Cliquez sur "Create Database"

2. **Créer l'utilisateur MySQL :**
   - Dans "MySQL Users" → "Add New User"
   - Username : `mai_user` (sera `cexe9174_mai_user`)
   - Password : Cliquez sur "Password Generator" pour un mot de passe fort
   - **⚠️ NOTEZ CE MOT DE PASSE !**
   - Strength : Doit être "Very Strong" (vert)
   - Cliquez sur "Create User"

3. **Associer l'utilisateur à la base :**
   - Dans "Add User To Database"
   - User : Sélectionnez `cexe9174_mai_user`
   - Database : Sélectionnez `cexe9174_mai_gestion`
   - Cliquez sur "Add"
   - Sur la page suivante : Cochez "ALL PRIVILEGES"
   - Cliquez sur "Make Changes"

### 📝 Notez vos informations MySQL :
```
Base de données : cexe9174_mai_gestion
Utilisateur     : cexe9174_mai_user
Mot de passe    : [VOTRE_MOT_DE_PASSE_GENERE]
Host            : localhost
Port            : 3306
```

## 2️⃣ Créer les Sous-domaines

### Dans cPanel, cliquez sur "Subdomains"

1. **Créer le sous-domaine API :**
   - Subdomain : `api`
   - Domain : lamanufacturedubois.com
   - Document Root : `/home/cexe9174/api` (se remplit automatiquement)
   - Cliquez sur "Create"

2. **Créer le sous-domaine CRM :**
   - Subdomain : `crm`
   - Domain : lamanufacturedubois.com
   - Document Root : `/home/cexe9174/crm` (se remplit automatiquement)
   - Cliquez sur "Create"

### ✅ Vous devriez maintenant avoir :
- api.lamanufacturedubois.com
- crm.lamanufacturedubois.com

## 3️⃣ Activer SSL Let's Encrypt

### Dans cPanel, cliquez sur "SSL/TLS Status"

1. **Pour chaque sous-domaine :**
   - Trouvez `api.lamanufacturedubois.com`
   - Cliquez sur "AutoSSL" ou "Run AutoSSL"
   - Attendez la validation (peut prendre 5-10 minutes)
   - Répétez pour `crm.lamanufacturedubois.com`

2. **Alternative : SSL/TLS → Manage SSL Sites**
   - Cliquez sur "Browse Certificates"
   - Pour chaque domaine, cliquez sur "Use Certificate"
   - Let's Encrypt devrait être disponible

### 🔍 Vérification SSL :
Les deux URLs devraient maintenant être accessibles en HTTPS :
- https://api.lamanufacturedubois.com (affichera une erreur 404, c'est normal)
- https://crm.lamanufacturedubois.com (affichera une erreur 404, c'est normal)

## 4️⃣ Configurer Node.js App (pour le Backend)

### Dans cPanel, cliquez sur "Setup Node.js App"

1. **Créer une nouvelle application :**
   - Cliquez sur "CREATE APPLICATION"
   
2. **Configuration :**
   - Node.js version : **18.x** ou plus récent (20.x si disponible)
   - Application mode : **Production**
   - Application root : `/home/cexe9174/nodejs_apps/mai-gestion-api`
   - Application URL : `api.lamanufacturedubois.com`
   - Application startup file : `dist/src/main.js`
   
3. **Variables d'environnement :**
   Cliquez sur "Add Variable" pour chaque ligne :
   ```
   NODE_ENV = production
   PORT = 3000
   DATABASE_URL = mysql://cexe9174_mai_user:VOTRE_MOT_DE_PASSE@localhost:3306/cexe9174_mai_gestion
   ```

4. **Cliquez sur "CREATE"**

### 📝 Notez la commande d'activation :
cPanel vous donnera une commande comme :
```bash
source /home/cexe9174/nodevenv/nodejs_apps/mai-gestion-api/18/bin/activate && cd /home/cexe9174/nodejs_apps/mai-gestion-api
```

## ✅ Checklist de Vérification

- [ ] Base de données MySQL créée : `cexe9174_mai_gestion`
- [ ] Utilisateur MySQL créé : `cexe9174_mai_user`
- [ ] Mot de passe MySQL noté et sécurisé
- [ ] Sous-domaine API créé : `api.lamanufacturedubois.com`
- [ ] Sous-domaine CRM créé : `crm.lamanufacturedubois.com`
- [ ] SSL activé sur les deux sous-domaines
- [ ] Application Node.js configurée

## 🎯 Prochaines Étapes

Maintenant que tout est configuré dans cPanel, vous pouvez :

1. **Mettre à jour vos fichiers .env** avec les vraies valeurs
2. **Lancer le build** avec les scripts PowerShell
3. **Uploader les fichiers** via FTP

---

*Une fois ces étapes terminées, votre infrastructure O2SWITCH est prête !* 