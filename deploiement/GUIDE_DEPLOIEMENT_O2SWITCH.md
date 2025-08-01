# 🚀 Guide de Déploiement CRM Mai Gestion sur O2SWITCH Cloud

## 📋 Informations de Connexion
- **Hébergeur** : O2SWITCH - Offre Unique Cloud
- **Nom d'utilisateur FTP** : crm@crm.cexe9174.odns.fr
- **Mot de passe** : Do@66001699
- **Serveur FTP** : ftp.cexe9174.odns.fr
- **Port FTP/FTPS** : 21
- **Domaine principal** : lamanufacturedubois.com
- **Compte cPanel** : cexe9174

## ✨ Ressources Disponibles
- **CPU** : 12 Threads CPU 🔥
- **RAM** : 48 Go mémoire 💪
- **I/O** : 42MB/s
- **Stockage** : Espace disque NVMe Illimité
- **Bases de données** : Illimitées (MySQL/MariaDB)
- **Support** : 24/7 Prioritaire N2

## 🎯 Architecture de Déploiement

```
┌────────────────────────────────────────────────────┐
│              O2SWITCH CLOUD (48GB RAM)              │
├────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────┐   │
│  │  Frontend React │    │   Backend NestJS     │   │
│  │  (Build Static) │    │   (Node.js + PM2)    │   │
│  └─────────────────┘    └─────────────────────┘   │
│           ↓                        ↓               │
│  ┌─────────────────────────────────────────────┐  │
│  │         Base de Données MySQL               │  │
│  │         (Conversion depuis PostgreSQL)       │  │
│  └─────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

## 📝 Plan de Déploiement en 7 Étapes

### Étape 1 : Préparation Locale

1. **Vérifier les prérequis**
   ```powershell
   # Vérifier Node.js
   node --version  # Doit être 18+
   
   # Vérifier npm
   npm --version
   ```

2. **Préparer les variables d'environnement**
   - Copier `.env.template` vers `.env.production`
   - Remplir avec les vraies valeurs

### Étape 2 : Accès cPanel et Configuration

1. **Se connecter à cPanel**
   - URL : https://lamanufacturedubois.com:2083/
   - Utilisateur : cexe9174
   - Mot de passe : [Votre mot de passe cPanel]

2. **Vérifier/Activer SSH**
   - Dans cPanel → "Terminal" ou "SSH Access"
   - Générer une clé SSH si nécessaire

3. **Vérifier Node.js**
   - Dans cPanel → "Setup Node.js App"
   - Noter les versions disponibles

### Étape 3 : Base de Données MySQL

1. **Créer la base de données**
   - cPanel → "MySQL Databases"
   - Nom : `cexe9174_mai_gestion`
   - Créer un utilisateur : `cexe9174_mai_user`
   - Mot de passe fort : [Générer et noter]
   - Attribuer TOUS les privilèges

2. **Préparer la migration PostgreSQL → MySQL**
   ```sql
   -- Les types à adapter :
   -- SERIAL → INT AUTO_INCREMENT
   -- TEXT[] → JSON
   -- BOOLEAN → TINYINT(1)
   -- TIMESTAMP → DATETIME
   ```

### Étape 4 : Déploiement Backend

1. **Préparer le backend localement**
   ```powershell
   cd backend
   
   # Adapter Prisma pour MySQL
   # Modifier schema.prisma : provider = "mysql"
   
   # Build de production
   npm install
   npm run build
   ```

2. **Structure sur le serveur**
   ```
   /home/cexe9174/
   ├── nodejs_apps/
   │   └── mai-gestion-api/
   │       ├── dist/
   │       ├── node_modules/
   │       ├── package.json
   │       ├── .env
   │       └── prisma/
   └── public_html/
       └── api/ → (lien symbolique vers app Node.js)
   ```

3. **Upload via FTP**
   - Utiliser FileZilla ou WinSCP
   - Transférer tous les fichiers sauf node_modules
   - Puis installer sur le serveur via SSH

4. **Configuration Node.js dans cPanel**
   - Application root : `/home/cexe9174/nodejs_apps/mai-gestion-api`
   - Application URL : `api.lamanufacturedubois.com`
   - Application startup file : `dist/src/main.js`
   - Environment : `production`

### Étape 5 : Déploiement Frontend

1. **Build de production**
   ```powershell
   cd frontend
   
   # Créer .env.production
   echo "VITE_API_URL=https://api.lamanufacturedubois.com" > .env.production
   
   # Build
   npm install
   npm run build
   ```

2. **Upload du frontend**
   ```
   Transférer dist/* vers :
   /home/cexe9174/public_html/crm/
   ```

3. **Configuration .htaccess**
   Créer `/home/cexe9174/public_html/crm/.htaccess`

### Étape 6 : Configuration DNS et SSL

1. **Créer les sous-domaines dans cPanel**
   - `crm.lamanufacturedubois.com` → `/public_html/crm`
   - `api.lamanufacturedubois.com` → Application Node.js

2. **Activer SSL Let's Encrypt**
   - Pour chaque sous-domaine
   - Via cPanel → "SSL/TLS Status"

### Étape 7 : Tests et Finalisation

1. **Tester l'API**
   ```bash
   curl https://api.lamanufacturedubois.com/health
   ```

2. **Tester le Frontend**
   - Accéder à https://crm.lamanufacturedubois.com
   - Vérifier la connexion
   - Tester les fonctionnalités principales

## 📋 Checklist de Déploiement

### Préparation
- [ ] Variables d'environnement préparées
- [ ] Backup local effectué
- [ ] Identifiants FTP/cPanel vérifiés

### Backend
- [ ] Prisma adapté pour MySQL
- [ ] Build de production créé
- [ ] Fichiers uploadés
- [ ] Node.js app configurée dans cPanel
- [ ] Base de données MySQL créée
- [ ] Migrations exécutées
- [ ] API accessible

### Frontend
- [ ] Build de production créé
- [ ] Fichiers uploadés
- [ ] .htaccess configuré
- [ ] Assets accessibles

### Configuration
- [ ] Sous-domaines créés
- [ ] SSL activé
- [ ] DNS propagé
- [ ] Tests complets réussis

## 🔧 Scripts Utiles

### Script de backup (à planifier dans cPanel)
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/cexe9174/backups"

# Backup DB
mysqldump -u cexe9174_mai_user -p cexe9174_mai_gestion > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /home/cexe9174/nodejs_apps/mai-gestion-api/uploads/

# Nettoyer anciens backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

## ⚠️ Points d'Attention

1. **Sécurité**
   - Ne jamais commiter les fichiers .env
   - Utiliser des mots de passe forts
   - Activer la 2FA sur cPanel

2. **Performance**
   - Activer la compression Gzip
   - Configurer le cache des assets
   - Utiliser PM2 pour la gestion des processus

3. **Monitoring**
   - Configurer les alertes cPanel
   - Surveiller l'utilisation des ressources
   - Logs d'erreurs réguliers

## 📞 Support

- **O2SWITCH** : 04 44 44 60 40
- **Documentation** : https://faq.o2switch.fr/
- **Ticket** : Via espace client O2SWITCH

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, votre CRM Mai Gestion sera opérationnel sur O2SWITCH !

---

*Guide créé le : 26/07/2025*  
*Version : 1.0* 