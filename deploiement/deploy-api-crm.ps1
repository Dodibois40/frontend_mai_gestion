# Script de deploiement avec sous-domaine api-crm
Write-Host "=== DEPLOIEMENT MAI GESTION (api-crm) ===" -ForegroundColor Green

# Supprimer l'ancien dossier build
if (Test-Path build) {
    Remove-Item -Path build -Recurse -Force
}

# Creer les dossiers
New-Item -ItemType Directory -Path build -Force | Out-Null
New-Item -ItemType Directory -Path build\backend -Force | Out-Null
New-Item -ItemType Directory -Path build\frontend -Force | Out-Null

# Backend
Write-Host "Preparation du backend..." -ForegroundColor Yellow
Copy-Item -Path "..\backend\dist\*" -Destination "build\backend\" -Recurse -Force
Copy-Item -Path "..\backend\package.json" -Destination "build\backend\"
Copy-Item -Path "..\backend\prisma" -Destination "build\backend\" -Recurse -Force
Copy-Item -Path "..\backend\.env.production" -Destination "build\backend\.env" -Force

# Frontend
Write-Host "Preparation du frontend..." -ForegroundColor Yellow
if (Test-Path "..\frontend\dist") {
    Copy-Item -Path "..\frontend\dist\*" -Destination "build\frontend\" -Recurse -Force
}

# Htaccess simple
$htaccess = @'
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
'@
Set-Content -Path "build\frontend\.htaccess" -Value $htaccess

# ZIPs avec nouveau nom
$date = Get-Date -Format "yyyyMMdd-HHmmss"
$backendZip = "build\backend-api-crm-$date.zip"
$frontendZip = "build\frontend-crm-$date.zip"

Write-Host "Creation des ZIPs..." -ForegroundColor Yellow
Compress-Archive -Path "build\backend\*" -DestinationPath $backendZip -Force
Compress-Archive -Path "build\frontend\*" -DestinationPath $frontendZip -Force

Write-Host ""
Write-Host "TERMINE !" -ForegroundColor Green
Write-Host ""
Write-Host "URLs de production :" -ForegroundColor Cyan
Write-Host "- Site principal : https://lamanufacturedubois.com (ne pas toucher)" -ForegroundColor White
Write-Host "- CRM Frontend : https://crm.lamanufacturedubois.com" -ForegroundColor Yellow
Write-Host "- CRM Backend : https://api-crm.lamanufacturedubois.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "Fichiers a uploader :" -ForegroundColor Cyan
Write-Host "- Backend : $backendZip" -ForegroundColor White
Write-Host "- Frontend : $frontendZip" -ForegroundColor White
Write-Host ""
Write-Host "INSTRUCTIONS :" -ForegroundColor Magenta
Write-Host "1. Creer le sous-domaine 'api-crm' dans cPanel" -ForegroundColor White
Write-Host "2. Creer l'app Node.js avec URL : api-crm.lamanufacturedubois.com" -ForegroundColor White
Write-Host "3. Uploader et extraire les ZIPs" -ForegroundColor White
Write-Host "4. RESTART l'app Node.js" -ForegroundColor White 