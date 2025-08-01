# Script de déploiement simple pour Mai Gestion
Write-Host "=== DÉPLOIEMENT MAI GESTION ===" -ForegroundColor Green
Write-Host ""

# 1. Créer le dossier build
Write-Host "📁 Création du dossier build..." -ForegroundColor Yellow
if (!(Test-Path build)) { 
    New-Item -ItemType Directory -Path build | Out-Null
}
if (!(Test-Path build\backend)) { 
    New-Item -ItemType Directory -Path build\backend | Out-Null
}
if (!(Test-Path build\frontend)) { 
    New-Item -ItemType Directory -Path build\frontend | Out-Null
}

# 2. Copier le backend
Write-Host "📦 Préparation du backend..." -ForegroundColor Yellow
Copy-Item -Path "..\backend\dist\*" -Destination "build\backend\" -Recurse -Force
Copy-Item -Path "..\backend\package.json" -Destination "build\backend\"
Copy-Item -Path "..\backend\prisma" -Destination "build\backend\" -Recurse -Force
Copy-Item -Path "..\backend\.env.production" -Destination "build\backend\.env" -ErrorAction SilentlyContinue

# 3. Copier le frontend
Write-Host "📦 Préparation du frontend..." -ForegroundColor Yellow
if (Test-Path "..\frontend\dist") {
    Copy-Item -Path "..\frontend\dist\*" -Destination "build\frontend\" -Recurse -Force
} else {
    Write-Host "⚠️  Pas de build frontend trouvé. Exécutez 'npm run build' dans le dossier frontend." -ForegroundColor Red
}

# Copier le .htaccess simple
$htaccess = @"
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
"@
$htaccess | Out-File -FilePath "build\frontend\.htaccess" -Encoding ASCII

# 4. Créer les ZIPs
Write-Host "🗜️  Création des archives ZIP..." -ForegroundColor Yellow
$backendZip = "build\backend-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".zip"
$frontendZip = "build\frontend-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".zip"

Compress-Archive -Path "build\backend\*" -DestinationPath $backendZip -Force
Compress-Archive -Path "build\frontend\*" -DestinationPath $frontendZip -Force

Write-Host ""
Write-Host "✅ PRÉPARATION TERMINÉE !" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Fichiers créés :" -ForegroundColor Cyan
Write-Host "   - $backendZip" -ForegroundColor White
Write-Host "   - $frontendZip" -ForegroundColor White
Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES :" -ForegroundColor Magenta
Write-Host "1. Uploadez $backendZip dans /home/cexe9174/nodejs_apps/mai-gestion-api/" -ForegroundColor White
Write-Host "2. Extrayez et écrasez les fichiers" -ForegroundColor White
Write-Host "3. Dans cPanel Node.js, cliquez RESTART" -ForegroundColor White
Write-Host "4. Uploadez $frontendZip dans /public_html/crm/" -ForegroundColor White
Write-Host "5. Extrayez et écrasez les fichiers" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Et voilà, Mai Gestion sera en ligne avec CORS corrigé !" -ForegroundColor Green 