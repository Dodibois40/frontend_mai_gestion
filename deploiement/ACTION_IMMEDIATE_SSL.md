# 🚨 ACTION IMMÉDIATE - Résoudre l'erreur SSL

## ❌ Problème
- **Erreur** : `ERR_CERT_AUTHORITY_INVALID`
- **Cause** : Pas de certificat SSL sur `api.lamanufacturedubois.com`

## ✅ Solution : Installer SSL dans cPanel

### 🚀 Méthode la plus rapide (2 minutes)

1. **Connectez-vous à cPanel O2Switch**

2. **Cherchez** : `SSL/TLS Status`

3. **Trouvez** : `api.lamanufacturedubois.com` dans la liste

4. **Cliquez** : sur le bouton **"AutoSSL"** à droite

5. **Attendez** : 2-3 minutes

6. **Videz le cache** : CTRL + F5 dans votre navigateur

7. **C'est fait !** Reconnectez-vous sur Mai Gestion

## 📁 Fichiers utiles (optionnels)

Si vous voulez vérifier avant/après :

- **`verif-avant-ssl.php`** - Teste si tout est prêt
- **`test-ssl-api.php`** - Vérifie que SSL est installé

Uploadez-les dans `/public_html/crm/` et accédez-y via :
- https://crm.lamanufacturedubois.com/verif-avant-ssl.php
- https://crm.lamanufacturedubois.com/test-ssl-api.php

## ⚠️ Important
- N'utilisez PAS `api-crm.lamanufacturedubois.com` (n'existe pas)
- Utilisez `api.lamanufacturedubois.com` (déjà configuré)

## 🆘 Besoin d'aide ?
Contactez support@o2switch.fr : 
"J'ai besoin d'un certificat SSL sur api.lamanufacturedubois.com" 