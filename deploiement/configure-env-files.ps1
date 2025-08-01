# Script de configuration des fichiers .env pour Mai Gestion
Write-Host "=== Configuration des fichiers .env ===" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$deployDir = $PSScriptRoot

# Demander les informations MySQL
Write-Host "`n📝 Entrez les informations MySQL créées dans cPanel :" -ForegroundColor Yellow

$mysqlUser = Read-Host "Utilisateur MySQL (ex: cexe9174_mai_user)"
$mysqlPassword = Read-Host "Mot de passe MySQL" -AsSecureString
$mysqlDatabase = Read-Host "Base de données (ex: cexe9174_mai_gestion)"

# Convertir le mot de passe sécurisé en texte
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
)

# Générer une clé JWT sécurisée
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "`n✓ Clé JWT générée automatiquement" -ForegroundColor Green

# Configuration Backend
Write-Host "`n🔧 Configuration du Backend..." -ForegroundColor Yellow

$backendEnvContent = @"
# Configuration Backend Mai Gestion - Production O2SWITCH
NODE_ENV=production
PORT=3000

# Base de données MySQL O2SWITCH
DATABASE_URL="mysql://${mysqlUser}:${mysqlPasswordPlain}@localhost:3306/${mysqlDatabase}"

# Sécurité JWT
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d

# Firebase (à configurer si utilisé)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Anthropic API (pour Claude)
ANTHROPIC_API_KEY=

# Configuration Email (SMTP O2SWITCH)
SMTP_HOST=mail.lamanufacturedubois.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@lamanufacturedubois.com
SMTP_PASS=

# URLs de l'application
FRONTEND_URL=https://crm.lamanufacturedubois.com
API_URL=https://api.lamanufacturedubois.com

# Upload files
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/cexe9174/nodejs_apps/mai-gestion-api/uploads
"@

# Sauvegarder le fichier backend .env
$backendEnvPath = Join-Path $projectRoot "backend\.env.production"
$backendEnvContent | Out-File -FilePath $backendEnvPath -Encoding UTF8
Write-Host "✓ Fichier backend/.env.production créé" -ForegroundColor Green

# Pour le dossier de build aussi
$buildBackendEnvPath = Join-Path $deployDir "build\backend\.env"
if (Test-Path (Split-Path $buildBackendEnvPath -Parent)) {
    $backendEnvContent | Out-File -FilePath $buildBackendEnvPath -Encoding UTF8
    Write-Host "✓ Fichier build/backend/.env créé" -ForegroundColor Green
}

# Configuration Frontend
Write-Host "`n🎨 Configuration du Frontend..." -ForegroundColor Yellow

$frontendEnvContent = @"
# Configuration Frontend Mai Gestion - Production O2SWITCH
VITE_API_URL=https://api.lamanufacturedubois.com

# Firebase Configuration (à configurer si utilisé)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Configuration de l'application
VITE_APP_NAME=Mai Gestion
VITE_APP_VERSION=1.0.0

# Features flags
VITE_ENABLE_CLAUDE=true
VITE_ENABLE_DOCUMENTS=true
VITE_ENABLE_PLANNING=true
"@

# Sauvegarder le fichier frontend .env
$frontendEnvPath = Join-Path $projectRoot "frontend\.env.production"
$frontendEnvContent | Out-File -FilePath $frontendEnvPath -Encoding UTF8
Write-Host "✓ Fichier frontend/.env.production créé" -ForegroundColor Green

# Créer un fichier de sauvegarde des credentials
$credentialsContent = @"
# INFORMATIONS DE CONNEXION MAI GESTION
# ⚠️ GARDEZ CE FICHIER EN SÉCURITÉ !

## MySQL
Base de données : $mysqlDatabase
Utilisateur : $mysqlUser
Mot de passe : $mysqlPasswordPlain

## JWT
Clé secrète : $jwtSecret

## URLs
Frontend : https://crm.lamanufacturedubois.com
API : https://api.lamanufacturedubois.com

## FTP
Serveur : ftp.cexe9174.odns.fr
Utilisateur : crm@crm.cexe9174.odns.fr
Port : 21

Date de création : $(Get-Date -Format "dd/MM/yyyy HH:mm")
"@

$credentialsPath = Join-Path $deployDir "CREDENTIALS_SECURISE.txt"
$credentialsContent | Out-File -FilePath $credentialsPath -Encoding UTF8
Write-Host "`n⚠️ Fichier de credentials créé : CREDENTIALS_SECURISE.txt" -ForegroundColor Yellow
Write-Host "  GARDEZ CE FICHIER EN LIEU SÛR !" -ForegroundColor Red

# Résumé
Write-Host "`n✅ Configuration terminée !" -ForegroundColor Green
Write-Host "`nFichiers créés :" -ForegroundColor Cyan
Write-Host "- backend/.env.production" -ForegroundColor White
Write-Host "- frontend/.env.production" -ForegroundColor White
Write-Host "- deploiement/CREDENTIALS_SECURISE.txt" -ForegroundColor White

Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Vérifiez les fichiers .env créés" -ForegroundColor White
Write-Host "2. Ajoutez les clés Firebase/Anthropic si nécessaire" -ForegroundColor White
Write-Host "3. Lancez les builds avec prepare-deployment.ps1" -ForegroundColor White
Write-Host "4. N'oubliez pas d'ajouter CREDENTIALS_SECURISE.txt à .gitignore !" -ForegroundColor Red 