# 🔍 VÉRIFICATION APP NODE.JS

## DANS cPanel → Setup Node.js App

### Vérifiez ces points :

1. **Application URL** : 
   - Si c'est `api-crm.lamanufacturedubois.com` → PROBLÈME !
   - Ça doit être `api.lamanufacturedubois.com`

2. **Application root** :
   - Doit être : `/home/cexe9174/nodejs_apps/mai-gestion-api`

3. **Application startup file** :
   - Doit être : `dist/main.js`

4. **Status** :
   - Doit être : "Running"

## SI L'URL EST MAUVAISE :

1. **STOP** l'app
2. Changez l'URL pour : `api.lamanufacturedubois.com`
3. **SAVE**
4. **START**

## OU ALORS :

Si vous ne pouvez pas créer `api.lamanufacturedubois.com`, uploadez ces fichiers dans `/public_html/crm/` :
- `fix-to-api-crm.php`
- `diagnostic-api.php`

Puis allez sur : https://crm.lamanufacturedubois.com/diagnostic-api.php 