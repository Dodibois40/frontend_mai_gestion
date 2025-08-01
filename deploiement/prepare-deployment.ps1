# Script de préparation du déploiement Mai Gestion sur O2SWITCH
Write-Host "=== Préparation du Déploiement Mai Gestion sur O2SWITCH ===" -ForegroundColor Cyan

# Variables
$projectRoot = Split-Path -Parent $PSScriptRoot
$deployDir = $PSScriptRoot

# Vérifier les prérequis
Write-Host "`n1. Vérification des prérequis..." -ForegroundColor Yellow

# Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installé : $nodeVersion" -ForegroundColor Green
    if ($nodeVersion -notmatch "v(1[89]|[2-9]\d)\.") {
        Write-Host "⚠️ Version Node.js recommandée : 18+" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Node.js non trouvé - Installez Node.js 18+" -ForegroundColor Red
    exit 1
}

# npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "✓ npm installé : $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm non trouvé" -ForegroundColor Red
    exit 1
}

# Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "✓ Git installé" -ForegroundColor Green
} else {
    Write-Host "⚠️ Git non trouvé - Recommandé pour le versioning" -ForegroundColor Yellow
}

# Vérifier les fichiers sensibles
Write-Host "`n2. Vérification de la sécurité..." -ForegroundColor Yellow

$sensitiveFiles = @(
    "$projectRoot\backend\.env",
    "$projectRoot\frontend\.env",
    "$projectRoot\backend\.env.local",
    "$projectRoot\frontend\.env.local"
)

$foundSensitive = $false
foreach ($file in $sensitiveFiles) {
    if (Test-Path $file) {
        Write-Host "⚠️ Fichier sensible trouvé : $file" -ForegroundColor Yellow
        Write-Host "   Assurez-vous qu'il est dans .gitignore !" -ForegroundColor Yellow
        $foundSensitive = $true
    }
}

if (-not $foundSensitive) {
    Write-Host "✓ Aucun fichier .env exposé" -ForegroundColor Green
}

# Créer les dossiers de build
Write-Host "`n3. Création des dossiers de build..." -ForegroundColor Yellow

$buildDirs = @(
    "$deployDir\build",
    "$deployDir\build\backend",
    "$deployDir\build\frontend"
)

foreach ($dir in $buildDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Créé : $dir" -ForegroundColor Green
    }
}

# Menu interactif
Write-Host "`n=== Que voulez-vous préparer ? ===" -ForegroundColor Cyan
Write-Host "1. Backend seulement"
Write-Host "2. Frontend seulement"
Write-Host "3. Les deux (recommandé)"
Write-Host "4. Vérifier la configuration"
Write-Host "5. Quitter"

$choice = Read-Host "`nVotre choix (1-5)"

switch ($choice) {
    "1" { 
        Write-Host "`nPréparation du Backend..." -ForegroundColor Yellow
        & "$deployDir\build-backend.ps1"
    }
    "2" { 
        Write-Host "`nPréparation du Frontend..." -ForegroundColor Yellow
        & "$deployDir\build-frontend.ps1"
    }
    "3" { 
        Write-Host "`nPréparation complète..." -ForegroundColor Yellow
        & "$deployDir\build-backend.ps1"
        & "$deployDir\build-frontend.ps1"
    }
    "4" {
        Write-Host "`n=== Configuration actuelle ===" -ForegroundColor Cyan
        
        # Vérifier les templates
        Write-Host "`nTemplates disponibles :" -ForegroundColor Yellow
        if (Test-Path "$deployDir\backend-env-template.txt") {
            Write-Host "✓ Template Backend" -ForegroundColor Green
        }
        if (Test-Path "$deployDir\frontend-env-template.txt") {
            Write-Host "✓ Template Frontend" -ForegroundColor Green
        }
        if (Test-Path "$deployDir\htaccess-frontend.txt") {
            Write-Host "✓ Template .htaccess" -ForegroundColor Green
        }
        
        # Afficher les informations de connexion
        Write-Host "`nInformations O2SWITCH :" -ForegroundColor Yellow
        Write-Host "FTP Host : ftp.cexe9174.odns.fr" -ForegroundColor White
        Write-Host "FTP User : crm@crm.cexe9174.odns.fr" -ForegroundColor White
        Write-Host "cPanel   : https://lamanufacturedubois.com:2083/" -ForegroundColor White
    }
    "5" {
        Write-Host "`nAu revoir !" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "`nChoix invalide" -ForegroundColor Red
    }
}

Write-Host "`n=== Prochaines étapes ===" -ForegroundColor Cyan
Write-Host "1. Configurez les fichiers .env avec vos vraies valeurs"
Write-Host "2. Connectez-vous à cPanel O2SWITCH"
Write-Host "3. Créez la base de données MySQL"
Write-Host "4. Configurez Node.js dans cPanel"
Write-Host "5. Utilisez FileZilla/WinSCP pour l'upload"

Write-Host "`nConsultez le guide complet : $deployDir\GUIDE_DEPLOIEMENT_O2SWITCH.md" -ForegroundColor Yellow 