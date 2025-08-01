# 📦 Dossier de Déploiement Mai Gestion

Ce dossier contient tous les outils et guides nécessaires pour déployer Mai Gestion sur O2SWITCH.

## 🗂️ Contenu du Dossier

### 📖 Documentation
- **`GUIDE_DEPLOIEMENT_O2SWITCH.md`** - Guide complet étape par étape pour le déploiement
- **`GUIDE_MIGRATION_MYSQL.md`** - Guide pour migrer de PostgreSQL vers MySQL (généré par le script)

### 🛠️ Scripts PowerShell
- **`prepare-deployment.ps1`** - Script principal avec menu interactif
- **`build-backend.ps1`** - Build automatisé du backend
- **`build-frontend.ps1`** - Build automatisé du frontend  
- **`convert-postgres-to-mysql.ps1`** - Assistant de conversion PostgreSQL → MySQL

### 📄 Templates de Configuration
- **`backend-env-template.txt`** - Template des variables d'environnement backend
- **`frontend-env-template.txt`** - Template des variables d'environnement frontend
- **`htaccess-frontend.txt`** - Fichier .htaccess optimisé pour le frontend React
- **`mysql-connection.txt`** - Template de connexion MySQL (généré par le script)

## 🚀 Démarrage Rapide

1. **Lancer le script principal :**
   ```powershell
   .\prepare-deployment.ps1
   ```

2. **Choisir l'option 3** pour préparer frontend et backend

3. **Configurer les fichiers .env** avec vos vraies valeurs

4. **Se connecter à cPanel O2SWITCH** et suivre le guide

## 📋 Ordre Recommandé

1. ✅ Lire `GUIDE_DEPLOIEMENT_O2SWITCH.md`
2. ✅ Exécuter `prepare-deployment.ps1`
3. ✅ Configurer les bases de données avec `convert-postgres-to-mysql.ps1`
4. ✅ Builder avec `build-backend.ps1` et `build-frontend.ps1`
5. ✅ Uploader via FTP (FileZilla/WinSCP)
6. ✅ Configurer dans cPanel
7. ✅ Tester l'application

## 💡 Conseils

- **Toujours faire un backup** avant de déployer
- **Tester localement** avant d'uploader
- **Vérifier les logs** en cas de problème
- **Utiliser HTTPS** partout (SSL Let's Encrypt gratuit)

## 🔐 Sécurité

⚠️ **NE JAMAIS** commiter les fichiers suivants sur Git :
- `.env`
- `.env.production`
- Fichiers avec mots de passe
- Clés API

## 📞 Support

- **O2SWITCH** : 04 44 44 60 40
- **Documentation O2SWITCH** : https://faq.o2switch.fr/
- **GitHub du projet** : https://github.com/Dodibois40/Sauvegarde-MAI-gestion

---

*Dernière mise à jour : 26/07/2025* 