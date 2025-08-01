# 🔒 INSTALLATION CERTIFICAT SSL - api.lamanufacturedubois.com

## 📋 Prérequis
- Accès à cPanel
- Le sous-domaine `api.lamanufacturedubois.com` doit exister

## 🚀 Étapes d'installation

### 1. Accéder à cPanel
- Connectez-vous à votre cPanel O2Switch
- URL : https://o2switch.net (puis connexion client)

### 2. Installer Let's Encrypt SSL

#### Option A : AutoSSL (Recommandé - Automatique)
1. Dans cPanel, recherchez **"SSL/TLS Status"**
2. Cliquez sur **"SSL/TLS Status"**
3. Trouvez `api.lamanufacturedubois.com` dans la liste
4. Cliquez sur **"AutoSSL"** ou **"Run AutoSSL"**
5. Attendez quelques minutes que le certificat soit généré

#### Option B : Let's Encrypt manuel
1. Dans cPanel, recherchez **"Let's Encrypt™ SSL"**
2. Cliquez dessus
3. Dans la section **"Issue a new certificate"**
4. Sélectionnez `api.lamanufacturedubois.com`
5. Cochez les cases :
   - ✅ `api.lamanufacturedubois.com`
   - ✅ `www.api.lamanufacturedubois.com` (si disponible)
6. Cliquez sur **"Issue"**
7. Attendez la confirmation (généralement instantané)

### 3. Vérifier l'installation

#### Dans cPanel :
1. Allez dans **"SSL/TLS Status"**
2. Vérifiez que `api.lamanufacturedubois.com` a un cadenas vert ✅

#### Dans le navigateur :
1. Ouvrez : https://api.lamanufacturedubois.com/
2. Vérifiez le cadenas dans la barre d'adresse
3. Cliquez sur le cadenas pour voir les détails du certificat

### 4. Forcer HTTPS (Optionnel mais recommandé)

Si ce n'est pas déjà fait, forcez HTTPS :

1. Dans cPanel → **"Domains"**
2. Trouvez `api.lamanufacturedubois.com`
3. Activez **"Force HTTPS Redirect"**

## 🔍 Dépannage

### Le certificat ne s'installe pas ?

1. **Vérifiez le DNS** :
   ```
   - Le sous-domaine doit pointer vers votre serveur
   - Attendez la propagation DNS (jusqu'à 24h)
   ```

2. **Vérifiez les enregistrements CAA** :
   - Dans cPanel → "Zone Editor"
   - Assurez-vous qu'il n'y a pas de restrictions CAA

3. **Essayez AutoSSL** :
   - cPanel → "SSL/TLS Status"
   - Cliquez sur "Run AutoSSL for All Users"

### L'erreur persiste après installation ?

1. **Videz le cache** :
   - Navigateur : CTRL + F5
   - Essayez en navigation privée

2. **Vérifiez l'application Node.js** :
   - L'app doit écouter sur le bon port
   - Les CORS doivent être configurés

3. **Testez l'API directement** :
   ```
   curl https://api.lamanufacturedubois.com/
   ```

## ✅ Résultat attendu

Après l'installation :
- ✅ https://api.lamanufacturedubois.com/ accessible sans erreur SSL
- ✅ Cadenas vert dans le navigateur
- ✅ L'application Mai Gestion fonctionne sans erreur `ERR_CERT_AUTHORITY_INVALID`

## 📌 Notes importantes

- Les certificats Let's Encrypt sont **gratuits**
- Ils se renouvellent **automatiquement** tous les 90 jours
- O2Switch gère le renouvellement automatique
- Si vous utilisez Cloudflare, assurez-vous que le proxy est désactivé pendant l'installation

## 🆘 Support

Si vous rencontrez des problèmes :
1. Contactez le support O2Switch (très réactif)
2. Mentionnez que vous voulez installer SSL sur `api.lamanufacturedubois.com`
3. Ils peuvent l'installer pour vous si nécessaire 