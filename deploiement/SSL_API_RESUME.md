# 🔒 RÉSUMÉ - Installation SSL sur api.lamanufacturedubois.com

## 📂 Fichiers créés pour vous

1. **`verif-avant-ssl.php`** - Vérification pré-installation
   - Vérifie que le sous-domaine existe
   - Teste la configuration DNS
   - Indique si tout est prêt pour l'installation SSL

2. **`test-ssl-api.php`** - Test post-installation
   - Vérifie que le certificat SSL est bien installé
   - Confirme que l'erreur est résolue

3. **`INSTALLATION_SSL_API.md`** - Guide détaillé complet
4. **`GUIDE_RAPIDE_SSL_O2SWITCH.md`** - Guide rapide

## 🚀 Procédure en 3 étapes

### 1️⃣ Vérifier (optionnel)
```bash
# Uploadez verif-avant-ssl.php dans /public_html/crm/
# Puis accédez à :
https://crm.lamanufacturedubois.com/verif-avant-ssl.php
```

### 2️⃣ Installer le SSL
**Dans cPanel :**
- **SSL/TLS Status** → Trouvez `api.lamanufacturedubois.com` → **AutoSSL**
- OU
- **Let's Encrypt™ SSL** → Cochez `api.lamanufacturedubois.com` → **Issue**

### 3️⃣ Vérifier l'installation
```bash
# Uploadez test-ssl-api.php dans /public_html/crm/
# Puis accédez à :
https://crm.lamanufacturedubois.com/test-ssl-api.php
```

## ✅ Résultat attendu
- Plus d'erreur `ERR_CERT_AUTHORITY_INVALID`
- Connexion normale à Mai Gestion
- Cadenas vert sur https://api.lamanufacturedubois.com/

## 🆘 Support
Si besoin, contactez support@o2switch.fr en mentionnant :
"J'ai besoin d'installer un certificat SSL sur le sous-domaine api.lamanufacturedubois.com" 