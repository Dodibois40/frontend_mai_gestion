# Script de configuration des fichiers .env pour Mai Gestion
Write-Host "=== Configuration des fichiers .env ===" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$deployDir = $PSScriptRoot

# Demander les informations MySQL
Write-Host ""
Write-Host "Entrez les informations MySQL creees dans cPanel :" -ForegroundColor Yellow

$mysqlUser = Read-Host "Utilisateur MySQL (ex: cexe9174_mai_user)"
$mysqlPassword = Read-Host "Mot de passe MySQL"
$mysqlDatabase = Read-Host "Base de donnees (ex: cexe9174_mai_gestion)"

# Generer une cle JWT securisee
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host ""
Write-Host "Cle JWT generee automatiquement" -ForegroundColor Green

# Configuration Backend
Write-Host ""
Write-Host "Configuration du Backend..." -ForegroundColor Yellow

$backendEnvContent = @"
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://${mysqlUser}:${mysqlPassword}@localhost:3306/${mysqlDatabase}
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://crm.lamanufacturedubois.com
API_URL=https://api.lamanufacturedubois.com
"@

# Sauvegarder le fichier backend .env
$backendEnvPath = Join-Path $projectRoot "backend" ".env.production"
$backendEnvContent | Out-File -FilePath $backendEnvPath -Encoding UTF8
Write-Host "Fichier backend/.env.production cree" -ForegroundColor Green

# Configuration Frontend
Write-Host ""
Write-Host "Configuration du Frontend..." -ForegroundColor Yellow

$frontendEnvContent = @"
VITE_API_URL=https://api.lamanufacturedubois.com
VITE_APP_NAME=Mai Gestion
VITE_APP_VERSION=1.0.0
"@

# Sauvegarder le fichier frontend .env
$frontendEnvPath = Join-Path $projectRoot "frontend" ".env.production"
$frontendEnvContent | Out-File -FilePath $frontendEnvPath -Encoding UTF8
Write-Host "Fichier frontend/.env.production cree" -ForegroundColor Green

# Creer un fichier de sauvegarde des credentials
$credentialsContent = @"
INFORMATIONS DE CONNEXION MAI GESTION
=====================================

MySQL
-----
Base de donnees : $mysqlDatabase
Utilisateur : $mysqlUser
Mot de passe : $mysqlPassword

JWT
---
Cle secrete : $jwtSecret

URLs
----
Frontend : https://crm.lamanufacturedubois.com
API : https://api.lamanufacturedubois.com

FTP
---
Serveur : ftp.cexe9174.odns.fr
Utilisateur : crm@crm.cexe9174.odns.fr
Port : 21

Date : $(Get-Date -Format "dd/MM/yyyy HH:mm")
"@

$credentialsPath = Join-Path $deployDir "CREDENTIALS_SECURISE.txt"
$credentialsContent | Out-File -FilePath $credentialsPath -Encoding UTF8
Write-Host ""
Write-Host "Fichier de credentials cree : CREDENTIALS_SECURISE.txt" -ForegroundColor Yellow
Write-Host "GARDEZ CE FICHIER EN SECURITE !" -ForegroundColor Red

Write-Host ""
Write-Host "Configuration terminee !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host "1. Verifiez les fichiers .env crees" -ForegroundColor White
Write-Host "2. Lancez les builds avec prepare-deployment.ps1" -ForegroundColor White 