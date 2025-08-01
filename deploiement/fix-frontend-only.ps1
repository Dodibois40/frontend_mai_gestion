# Script pour preparer seulement le frontend corrige
Write-Host "=== PREPARATION FRONTEND CORRIGE ===" -ForegroundColor Green

# Creer le dossier
New-Item -ItemType Directory -Path build\frontend-fix -Force | Out-Null

# Copier le frontend
Write-Host "Copie du frontend avec api-crm..." -ForegroundColor Yellow
Copy-Item -Path "..\frontend\dist\*" -Destination "build\frontend-fix\" -Recurse -Force

# Htaccess
$htaccess = @'
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
'@
Set-Content -Path "build\frontend-fix\.htaccess" -Value $htaccess

# ZIP
$date = Get-Date -Format "yyyyMMdd-HHmmss"
$frontendZip = "build\frontend-fix-api-crm-$date.zip"

Write-Host "Creation du ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "build\frontend-fix\*" -DestinationPath $frontendZip -Force

Write-Host ""
Write-Host "TERMINE !" -ForegroundColor Green
Write-Host "Frontend corrige : $frontendZip" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCTIONS :" -ForegroundColor Yellow
Write-Host "1. Supprimez tout dans /public_html/crm/" -ForegroundColor White
Write-Host "2. Uploadez ce ZIP dans /public_html/crm/" -ForegroundColor White
Write-Host "3. Extrayez-le" -ForegroundColor White
Write-Host "4. Testez : https://crm.lamanufacturedubois.com" -ForegroundColor White 