# Script de build du Frontend pour O2SWITCH
Write-Host "=== Build Frontend Mai Gestion ===" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $projectRoot "frontend"
$buildDir = Join-Path $PSScriptRoot "build\frontend"

# Verifier que le dossier frontend existe
if (-not (Test-Path $frontendDir)) {
    Write-Host "Dossier frontend introuvable : $frontendDir" -ForegroundColor Red
    exit 1
}

# Se deplacer dans le dossier frontend
Set-Location $frontendDir
Write-Host "Dossier de travail : $frontendDir" -ForegroundColor Gray

# 1. Installer les dependances
Write-Host ""
Write-Host "1. Installation des dependances..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dependances" -ForegroundColor Red
    exit 1
}
Write-Host "Dependances installees" -ForegroundColor Green

# 2. Build de production
Write-Host ""
Write-Host "2. Build de production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build" -ForegroundColor Red
    exit 1
}
Write-Host "Build termine" -ForegroundColor Green

# 3. Preparer les fichiers pour le deploiement
Write-Host ""
Write-Host "3. Preparation des fichiers pour le deploiement..." -ForegroundColor Yellow

# Nettoyer le dossier de build
if (Test-Path $buildDir) {
    Remove-Item -Path $buildDir -Recurse -Force
}
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null

# Copier le build
$distDir = Join-Path $frontendDir "dist"
if (Test-Path $distDir) {
    Copy-Item -Path "$distDir\*" -Destination $buildDir -Recurse -Force
    Write-Host "Build copie" -ForegroundColor Green
} else {
    Write-Host "Dossier dist introuvable" -ForegroundColor Red
    exit 1
}

# 4. Copier le .htaccess
$htaccessSource = Join-Path $PSScriptRoot "htaccess-frontend.txt"
$htaccessDest = Join-Path $buildDir ".htaccess"

if (Test-Path $htaccessSource) {
    Copy-Item -Path $htaccessSource -Destination $htaccessDest
    Write-Host "Fichier .htaccess copie" -ForegroundColor Green
} else {
    Write-Host "Template .htaccess non trouve" -ForegroundColor Yellow
}

# Retour au dossier initial
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "Build Frontend termine !" -ForegroundColor Green
Write-Host "Fichiers prets dans : $buildDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT :" -ForegroundColor Yellow
Write-Host "1. Uploadez tous les fichiers vers /home/cexe9174/public_html/crm/" -ForegroundColor White
Write-Host "2. N'oubliez pas le fichier .htaccess !" -ForegroundColor White 