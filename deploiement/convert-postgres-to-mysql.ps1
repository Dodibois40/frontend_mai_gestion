# Script d'aide à la conversion PostgreSQL vers MySQL
Write-Host "=== Conversion PostgreSQL vers MySQL ===" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$prismaDir = Join-Path $projectRoot "backend\prisma"
$schemaFile = Join-Path $prismaDir "schema.prisma"

Write-Host "`nCe script vous aide à convertir votre base PostgreSQL vers MySQL pour O2SWITCH" -ForegroundColor Yellow

# 1. Vérifier l'existence du schema.prisma
if (-not (Test-Path $schemaFile)) {
    Write-Host "✗ Fichier schema.prisma introuvable : $schemaFile" -ForegroundColor Red
    exit 1
}

# 2. Créer une sauvegarde
$backupFile = Join-Path $prismaDir "schema.prisma.backup"
Copy-Item -Path $schemaFile -Destination $backupFile -Force
Write-Host "✓ Sauvegarde créée : schema.prisma.backup" -ForegroundColor Green

# 3. Afficher les conversions nécessaires
Write-Host "`n📋 Conversions de types nécessaires :" -ForegroundColor Cyan
Write-Host "PostgreSQL → MySQL" -ForegroundColor White
Write-Host "=================" -ForegroundColor Gray
Write-Host "Serial/Int @id @default(autoincrement()) → Int @id @default(autoincrement())" -ForegroundColor Yellow
Write-Host "Text[] → Json" -ForegroundColor Yellow
Write-Host "Boolean → Boolean (OK)" -ForegroundColor Green
Write-Host "DateTime → DateTime (OK)" -ForegroundColor Green
Write-Host "Decimal → Decimal (OK)" -ForegroundColor Green
Write-Host "Json → Json (OK)" -ForegroundColor Green

# 4. Proposer de faire la conversion automatique
Write-Host "`n⚠️ Voulez-vous que je tente une conversion automatique du schema.prisma ?" -ForegroundColor Yellow
Write-Host "Cette opération va :" -ForegroundColor White
Write-Host "1. Changer le provider de postgresql à mysql" -ForegroundColor White
Write-Host "2. Remplacer Text[] par Json" -ForegroundColor White
Write-Host "3. Ajuster les types incompatibles" -ForegroundColor White

$confirm = Read-Host "`nContinuer ? (oui/non)"

if ($confirm -eq "oui") {
    # Lire le fichier
    $content = Get-Content $schemaFile -Raw
    
    # Conversions
    $newContent = $content
    
    # 1. Changer le provider
    $newContent = $newContent -replace 'provider\s*=\s*"postgresql"', 'provider = "mysql"'
    
    # 2. Remplacer Text[] par Json
    $newContent = $newContent -replace '\bText\[\]', 'Json'
    
    # 3. Remplacer String[] par Json
    $newContent = $newContent -replace '\bString\[\]', 'Json'
    
    # 4. Ajouter @db.Text sur les champs Text longs si nécessaire
    # (MySQL a une limite sur les String, on peut utiliser @db.Text pour les longs textes)
    
    # Sauvegarder le nouveau fichier
    $newSchemaFile = Join-Path $prismaDir "schema.mysql.prisma"
    $newContent | Out-File -FilePath $newSchemaFile -Encoding UTF8
    
    Write-Host "`n✓ Nouveau schema créé : schema.mysql.prisma" -ForegroundColor Green
    Write-Host "  Vérifiez-le manuellement avant de remplacer l'original !" -ForegroundColor Yellow
}

# 5. Script SQL de migration des données
Write-Host "`n📝 Création du guide de migration des données..." -ForegroundColor Cyan

$migrationGuide = @"
# Guide de Migration PostgreSQL vers MySQL

## 1. Export depuis PostgreSQL (sur votre machine locale)

```bash
# Export complet avec données
pg_dump -h localhost -U postgres -d mai_gestion > mai_gestion_postgres.sql

# Export structure seulement
pg_dump -h localhost -U postgres -d mai_gestion --schema-only > mai_gestion_structure.sql

# Export données seulement
pg_dump -h localhost -U postgres -d mai_gestion --data-only > mai_gestion_data.sql
```

## 2. Conversions manuelles nécessaires

### Types de données
- SERIAL → INT AUTO_INCREMENT
- TEXT[] → JSON
- BOOLEAN → TINYINT(1) ou BOOLEAN
- UUID → CHAR(36) ou VARCHAR(36)
- JSONB → JSON

### Syntaxe
- true/false → 1/0 (pour BOOLEAN)
- Array literals {'a','b'} → JSON ["a","b"]
- NOW() → NOW() (OK)
- gen_random_uuid() → UUID()

### Exemple de conversion manuelle
```sql
-- PostgreSQL
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    roles TEXT[],
    is_active BOOLEAN DEFAULT true
);

-- MySQL
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roles JSON,
    is_active BOOLEAN DEFAULT 1
);
```

## 3. Import dans MySQL O2SWITCH

1. Se connecter à phpMyAdmin via cPanel
2. Sélectionner la base de données
3. Onglet "Importer"
4. Choisir le fichier SQL converti
5. Exécuter

## 4. Utiliser Prisma pour créer les tables

Alternative recommandée : laissez Prisma créer les tables

```bash
# Sur le serveur O2SWITCH via SSH
cd /home/cexe9174/nodejs_apps/mai-gestion-api/
npx prisma db push
```

Cela créera automatiquement toutes les tables avec la bonne structure MySQL.

## 5. Migration des données uniquement

Si vous utilisez Prisma db push, vous pouvez ensuite :
1. Exporter seulement les données de PostgreSQL
2. Adapter le format (arrays → JSON)
3. Importer dans MySQL

## Outils utiles

- **pgloader** : Outil de migration PostgreSQL → MySQL
- **MySQL Workbench** : Pour la conversion manuelle
- **Online converters** : https://www.rebasedata.com/convert-postgresql-to-mysql-online

"@

$migrationGuide | Out-File -FilePath (Join-Path $PSScriptRoot "GUIDE_MIGRATION_MYSQL.md") -Encoding UTF8
Write-Host "✓ Guide créé : GUIDE_MIGRATION_MYSQL.md" -ForegroundColor Green

# 6. Créer un template de connexion MySQL pour tester
$mysqlEnv = @"
# Configuration MySQL pour O2SWITCH
DATABASE_URL="mysql://cexe9174_mai_user:VOTRE_MOT_DE_PASSE@localhost:3306/cexe9174_mai_gestion"

# Format détaillé :
# mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE
# 
# USERNAME : cexe9174_mai_user (créé dans cPanel)
# PASSWORD : (mot de passe fort généré dans cPanel)
# HOST : localhost (sur O2SWITCH)
# PORT : 3306 (port MySQL standard)
# DATABASE : cexe9174_mai_gestion (créé dans cPanel)
"@

$mysqlEnv | Out-File -FilePath (Join-Path $PSScriptRoot "mysql-connection.txt") -Encoding UTF8

Write-Host "`n✅ Conversion préparée !" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Vérifiez le fichier schema.mysql.prisma" -ForegroundColor White
Write-Host "2. Créez la base MySQL dans cPanel O2SWITCH" -ForegroundColor White
Write-Host "3. Utilisez 'npx prisma db push' pour créer les tables" -ForegroundColor White
Write-Host "4. Migrez vos données avec le guide GUIDE_MIGRATION_MYSQL.md" -ForegroundColor White 