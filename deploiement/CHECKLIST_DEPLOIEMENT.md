# ✅ CHECKLIST DÉPLOIEMENT MAI GESTION

## 🧹 NETTOYAGE O2SWITCH
- [ ] App Node.js supprimée
- [ ] Dossier `/nodejs_apps/mai-gestion-api/` supprimé
- [ ] Dossier `/public_html/crm/` supprimé
- [ ] Sous-domaines `crm` et `api` supprimés
- [ ] Base de données MySQL supprimée
- [ ] Utilisateur MySQL supprimé

## 🔧 PRÉPARATION LOCALE
- [ ] CORS corrigé dans `backend/src/main.ts`
- [ ] Backend rebuild avec `npm run build`
- [ ] Script `deploy-simple.ps1` exécuté
- [ ] Fichiers ZIP créés dans `deploiement/build/`

## 📦 INSTALLATION BACKEND
- [ ] Base MySQL créée
- [ ] Utilisateur MySQL créé avec privilèges
- [ ] App Node.js créée (version 20)
- [ ] Variables d'environnement configurées
- [ ] Backend ZIP uploadé et extrait
- [ ] NPM Install exécuté
- [ ] App Node.js démarrée (RESTART)

## 🎨 INSTALLATION FRONTEND
- [ ] Sous-domaine `crm` créé
- [ ] Frontend ZIP uploadé dans `/public_html/crm/`
- [ ] ZIP extrait
- [ ] Fichiers vérifiés (index.html, assets/, .htaccess)

## 🔒 FINALISATION
- [ ] SSL vérifié pour les deux domaines
- [ ] API testée : https://api.lamanufacturedubois.com
- [ ] Frontend testée : https://crm.lamanufacturedubois.com
- [ ] Connexion testée avec succès

## 🎉 DÉPLOIEMENT TERMINÉ !

Date : _______________
Heure : ______________
Par : ________________ 