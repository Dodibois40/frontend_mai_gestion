# Script de build du Backend pour O2SWITCH
Write-Host "=== Build Backend Mai Gestion ===" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$buildDir = Join-Path $PSScriptRoot "build\backend"

# Verifier que le dossier backend existe
if (-not (Test-Path $backendDir)) {
    Write-Host "Dossier backend introuvable : $backendDir" -ForegroundColor Red
    exit 1
}

# Se deplacer dans le dossier backend
Set-Location $backendDir
Write-Host "Dossier de travail : $backendDir" -ForegroundColor Gray

# 1. Installer les dependances
Write-Host ""
Write-Host "1. Installation des dependances..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dependances" -ForegroundColor Red
    exit 1
}
Write-Host "Dependances installees" -ForegroundColor Green

# 2. Generer Prisma Client
Write-Host ""
Write-Host "2. Generation du client Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de la generation Prisma" -ForegroundColor Red
    exit 1
}
Write-Host "Client Prisma genere" -ForegroundColor Green

# 3. Build TypeScript
Write-Host ""
Write-Host "3. Build de production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors du build" -ForegroundColor Red
    exit 1
}
Write-Host "Build termine" -ForegroundColor Green

# 4. Copier les fichiers necessaires vers le dossier de build
Write-Host ""
Write-Host "4. Preparation des fichiers pour le deploiement..." -ForegroundColor Yellow

# Nettoyer le dossier de build
if (Test-Path $buildDir) {
    Remove-Item -Path $buildDir -Recurse -Force
}
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null

# Copier les fichiers
$filesToCopy = @("dist", "prisma", "package.json", "package-lock.json", "tsconfig.json")

foreach ($file in $filesToCopy) {
    $source = Join-Path $backendDir $file
    $destination = Join-Path $buildDir $file
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $destination -Recurse -Force
        Write-Host "Copie : $file" -ForegroundColor Green
    } else {
        Write-Host "Non trouve : $file" -ForegroundColor Yellow
    }
}

# 5. Copier le fichier .env de production
$envSource = Join-Path $backendDir ".env.production"
$envDest = Join-Path $buildDir ".env"

if (Test-Path $envSource) {
    Copy-Item -Path $envSource -Destination $envDest
    Write-Host "Fichier .env copie" -ForegroundColor Green
} else {
    Write-Host "Fichier .env.production non trouve" -ForegroundColor Yellow
}

# Retour au dossier initial
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "Build Backend termine !" -ForegroundColor Green
Write-Host "Fichiers prets dans : $buildDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT :" -ForegroundColor Yellow
Write-Host "1. Verifiez le fichier .env dans le dossier de build" -ForegroundColor White
Write-Host "2. Uploadez tous les fichiers vers /home/cexe9174/nodejs_apps/mai-gestion-api/" -ForegroundColor White 