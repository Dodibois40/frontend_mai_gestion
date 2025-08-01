# Script de build du Frontend pour O2SWITCH
Write-Host "=== Build Frontend Mai Gestion ===" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $projectRoot "frontend"
$buildDir = Join-Path $PSScriptRoot "build\frontend"

# Vérifier que le dossier frontend existe
if (-not (Test-Path $frontendDir)) {
    Write-Host "✗ Dossier frontend introuvable : $frontendDir" -ForegroundColor Red
    exit 1
}

# Se déplacer dans le dossier frontend
Set-Location $frontendDir
Write-Host "📁 Dossier de travail : $frontendDir" -ForegroundColor Gray

# 1. Installer les dépendances
Write-Host "`n1. Installation des dépendances..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dépendances installées" -ForegroundColor Green

# 2. Créer le fichier .env.production si nécessaire
$envTemplate = Join-Path $PSScriptRoot "frontend-env-template.txt"
$envProd = Join-Path $frontendDir ".env.production"

if (Test-Path $envTemplate) {
    if (-not (Test-Path $envProd)) {
        Copy-Item -Path $envTemplate -Destination $envProd
        Write-Host "✓ Template .env.production copié - À CONFIGURER !" -ForegroundColor Yellow
        
        # Demander l'URL de l'API
        Write-Host "`nConfiguration de l'API Backend :" -ForegroundColor Cyan
        Write-Host "URL par défaut : https://api.lamanufacturedubois.com"
        $apiUrl = Read-Host "Appuyez sur Entrée pour garder la valeur par défaut ou entrez une nouvelle URL"
        
        if ([string]::IsNullOrWhiteSpace($apiUrl)) {
            $apiUrl = "https://api.lamanufacturedubois.com"
        }
        
        # Mettre à jour le fichier
        (Get-Content $envProd) -replace 'VITE_API_URL=.*', "VITE_API_URL=$apiUrl" | Set-Content $envProd
        Write-Host "✓ API URL configurée : $apiUrl" -ForegroundColor Green
    } else {
        Write-Host "✓ Fichier .env.production existant conservé" -ForegroundColor Green
    }
}

# 3. Build de production
Write-Host "`n2. Build de production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Erreur lors du build" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build terminé" -ForegroundColor Green

# 4. Préparer les fichiers pour le déploiement
Write-Host "`n3. Préparation des fichiers pour le déploiement..." -ForegroundColor Yellow

# Nettoyer le dossier de build
if (Test-Path $buildDir) {
    Remove-Item -Path $buildDir\* -Recurse -Force
}

# Copier le build
$distDir = Join-Path $frontendDir "dist"
if (Test-Path $distDir) {
    Copy-Item -Path "$distDir\*" -Destination $buildDir -Recurse -Force
    Write-Host "✓ Build copié" -ForegroundColor Green
} else {
    Write-Host "✗ Dossier dist introuvable" -ForegroundColor Red
    exit 1
}

# 5. Copier le .htaccess
$htaccessTemplate = Join-Path $PSScriptRoot "htaccess-frontend.txt"
$htaccessDest = Join-Path $buildDir ".htaccess"

if (Test-Path $htaccessTemplate) {
    Copy-Item -Path $htaccessTemplate -Destination $htaccessDest
    Write-Host "✓ Fichier .htaccess copié" -ForegroundColor Green
} else {
    Write-Host "⚠️ Template .htaccess non trouvé" -ForegroundColor Yellow
}

# 6. Créer un README pour le déploiement
$readmeContent = @"
# Frontend Mai Gestion - Prêt pour le déploiement

## Fichiers à uploader sur O2SWITCH
Tous les fichiers de ce dossier doivent être uploadés dans :
/home/cexe9174/public_html/crm/

## Structure attendue sur le serveur
```
/home/cexe9174/public_html/crm/
├── .htaccess
├── index.html
├── assets/
│   ├── *.js
│   ├── *.css
│   └── images/
├── favicon.ico
└── [autres fichiers du build]
```

## Configuration dans cPanel
1. Créer le sous-domaine : crm.lamanufacturedubois.com
2. Document root : /home/cexe9174/public_html/crm
3. Activer SSL Let's Encrypt

## Vérification
1. Accéder à https://crm.lamanufacturedubois.com
2. Vérifier que l'application se charge
3. Tester la connexion
4. Vérifier la console navigateur pour les erreurs

## Dépannage
- Si page blanche : vérifier le .htaccess
- Si erreur API : vérifier VITE_API_URL dans le build
- Si erreur 404 : vérifier RewriteBase dans .htaccess
"@

$readmeContent | Out-File -FilePath (Join-Path $buildDir "README_DEPLOY.md") -Encoding UTF8

# 7. Analyser la taille du build
$buildSize = (Get-ChildItem $buildDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "`n📊 Statistiques du build :" -ForegroundColor Cyan
Write-Host "Taille totale : $([math]::Round($buildSize, 2)) MB" -ForegroundColor White

$jsFiles = Get-ChildItem $buildDir -Filter "*.js" -Recurse
$cssFiles = Get-ChildItem $buildDir -Filter "*.css" -Recurse
Write-Host "Fichiers JS : $($jsFiles.Count)" -ForegroundColor White
Write-Host "Fichiers CSS : $($cssFiles.Count)" -ForegroundColor White

# Retour au dossier initial
Set-Location $PSScriptRoot

Write-Host "`n✅ Build Frontend terminé !" -ForegroundColor Green
Write-Host "📁 Fichiers prêts dans : $buildDir" -ForegroundColor Cyan
Write-Host "`n⚠️ IMPORTANT :" -ForegroundColor Yellow
Write-Host "1. Vérifiez que l'URL de l'API est correcte" -ForegroundColor White
Write-Host "2. Testez localement avec 'npm run preview'" -ForegroundColor White
Write-Host "3. N'oubliez pas d'uploader le .htaccess" -ForegroundColor White 