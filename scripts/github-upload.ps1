# Script d'upload GitHub pour MAI-GESTION
# Utilisation: .\scripts\github-upload.ps1 "Votre message de commit"

param(
    [string]$Message = "Mise à jour du projet $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
)

Write-Host "🚀 Début de l'upload vers GitHub..." -ForegroundColor Green

# Vérifier si Git est installé
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Git n'est pas installé. Veuillez installer Git d'abord." -ForegroundColor Red
    exit 1
}

# Aller au dossier racine du projet
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "📁 Dossier de travail: $projectRoot" -ForegroundColor Cyan

# Vérifier si c'est un repository Git
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initialisation du repository Git..." -ForegroundColor Yellow
    git init
    
    # Demander l'URL du repository GitHub
    $repoUrl = Read-Host "🔗 Entrez l'URL de votre repository GitHub (ex: https://github.com/username/repo.git)"
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "✅ Repository distant configuré: $repoUrl" -ForegroundColor Green
    }
}

# Ajouter tous les fichiers (en respectant .gitignore)
Write-Host "📋 Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Vérifier s'il y a des changements
$status = git status --porcelain
if (-not $status) {
    Write-Host "✅ Aucun changement à commiter." -ForegroundColor Green
    exit 0
}

# Commit
Write-Host "💾 Création du commit: $Message" -ForegroundColor Yellow
git commit -m $Message

# Pousser vers GitHub
Write-Host "☁️ Upload vers GitHub..." -ForegroundColor Yellow
try {
    # Essayer de pousser vers la branche main
    git push origin main
    Write-Host "🎉 Upload terminé avec succès!" -ForegroundColor Green
} catch {
    # Si ça échoue, essayer master
    try {
        git push origin master
        Write-Host "🎉 Upload terminé avec succès!" -ForegroundColor Green
    } catch {
        # Si c'est le premier push
        try {
            git push -u origin main
            Write-Host "🎉 Premier upload terminé avec succès!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erreur lors de l'upload. Vérifiez vos permissions GitHub." -ForegroundColor Red
            Write-Host "💡 Assurez-vous d'être connecté à GitHub et d'avoir les droits sur le repository." -ForegroundColor Yellow
        }
    }
}

Write-Host "✨ Script terminé!" -ForegroundColor Green 