# Script de build du Backend pour O2SWITCH
Write-Host "=== Build Backend Mai Gestion ===" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$buildDir = Join-Path $PSScriptRoot "build\backend"

# Vérifier que le dossier backend existe
if (-not (Test-Path $backendDir)) {
    Write-Host "✗ Dossier backend introuvable : $backendDir" -ForegroundColor Red
    exit 1
}

# Se déplacer dans le dossier backend
Set-Location $backendDir
Write-Host "📁 Dossier de travail : $backendDir" -ForegroundColor Gray

# 1. Installer les dépendances
Write-Host "`n1. Installation des dépendances..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dépendances installées" -ForegroundColor Green

# 2. Générer Prisma Client
Write-Host "`n2. Génération du client Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors de la génération Prisma" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Client Prisma généré" -ForegroundColor Green

# 3. Build TypeScript
Write-Host "`n3. Build de production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors du build" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build terminé" -ForegroundColor Green

# 4. Copier les fichiers nécessaires vers le dossier de build
Write-Host "`n4. Préparation des fichiers pour le déploiement..." -ForegroundColor Yellow

# Nettoyer le dossier de build
if (Test-Path $buildDir) {
    Remove-Item -Path $buildDir\* -Recurse -Force
}

# Copier les fichiers
$filesToCopy = @(
    "dist",
    "prisma",
    "package.json",
    "package-lock.json",
    "tsconfig.json"
)

foreach ($file in $filesToCopy) {
    $source = Join-Path $backendDir $file
    $destination = Join-Path $buildDir $file
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $destination -Recurse -Force
        Write-Host "✓ Copié : $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Non trouvé : $file" -ForegroundColor Yellow
    }
}

# 5. Créer le fichier .env de production si le template existe
$envTemplate = Join-Path $PSScriptRoot "backend-env-template.txt"
$envProd = Join-Path $buildDir ".env"

if (Test-Path $envTemplate) {
    Copy-Item -Path $envTemplate -Destination $envProd
    Write-Host "✓ Template .env copié - À CONFIGURER !" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ Template .env non trouvé" -ForegroundColor Yellow
}

# 6. Créer un script de démarrage
$startScript = @"
#!/bin/bash
# Script de démarrage pour Mai Gestion API

# Charger les variables d'environnement
if [ -f .env ]; then
    export \$(cat .env | grep -v '^#' | xargs)
fi

# Démarrer avec PM2
pm2 start dist/src/main.js --name mai-gestion-api --env production

# Ou sans PM2
# NODE_ENV=production node dist/src/main.js
"@

$startScript | Out-File -FilePath (Join-Path $buildDir "start.sh") -Encoding UTF8
Write-Host "✓ Script de démarrage créé" -ForegroundColor Green

# 7. Créer un README pour le déploiement
$readmeContent = @"
# Backend Mai Gestion - Prêt pour le déploiement

## Fichiers à uploader sur O2SWITCH
- dist/ (dossier complet)
- prisma/ (dossier complet)
- package.json
- package-lock.json
- .env (à configurer)
- start.sh

## Installation sur le serveur
1. Uploader les fichiers dans /home/cexe9174/nodejs_apps/mai-gestion-api/
2. Via SSH ou Terminal cPanel :
   ```bash
   cd /home/cexe9174/nodejs_apps/mai-gestion-api/
   npm install --production
   npx prisma db push  # Pour créer les tables
   chmod +x start.sh
   ```

## Configuration Node.js dans cPanel
- Application root: /home/cexe9174/nodejs_apps/mai-gestion-api
- Application URL: api.lamanufacturedubois.com
- Application startup file: dist/src/main.js
- Environment: production

## Vérification
```bash
curl https://api.lamanufacturedubois.com/health
```
"@

$readmeContent | Out-File -FilePath (Join-Path $buildDir "README_DEPLOY.md") -Encoding UTF8

# Retour au dossier initial
Set-Location $PSScriptRoot

Write-Host "`n✅ Build Backend terminé !" -ForegroundColor Green
Write-Host "📁 Fichiers prêts dans : $buildDir" -ForegroundColor Cyan
Write-Host "`n⚠️ IMPORTANT :" -ForegroundColor Yellow
Write-Host "1. Configurez le fichier .env avec vos vraies valeurs" -ForegroundColor White
Write-Host "2. Adaptez le schema.prisma pour MySQL si nécessaire" -ForegroundColor White
Write-Host "3. Testez localement avant le déploiement" -ForegroundColor White 