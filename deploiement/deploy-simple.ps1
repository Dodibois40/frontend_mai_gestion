# Script de deploiement simple
Write-Host "=== DEPLOIEMENT MAI GESTION ===" -ForegroundColor Green

# Creer les dossiers
New-Item -ItemType Directory -Path build -Force | Out-Null
New-Item -ItemType Directory -Path build\backend -Force | Out-Null
New-Item -ItemType Directory -Path build\frontend -Force | Out-Null

# Backend
Write-Host "Preparation du backend..." -ForegroundColor Yellow
Copy-Item -Path "..\backend\dist\*" -Destination "build\backend\" -Recurse -Force
Copy-Item -Path "..\backend\package.json" -Destination "build\backend\"
Copy-Item -Path "..\backend\prisma" -Destination "build\backend\" -Recurse -Force

# Frontend
Write-Host "Preparation du frontend..." -ForegroundColor Yellow
if (Test-Path "..\frontend\dist") {
    Copy-Item -Path "..\frontend\dist\*" -Destination "build\frontend\" -Recurse -Force
}

# Htaccess
$htaccess = @'
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
'@
Set-Content -Path "build\frontend\.htaccess" -Value $htaccess

# ZIPs
$date = Get-Date -Format "yyyyMMdd-HHmmss"
$backendZip = "build\backend-$date.zip"
$frontendZip = "build\frontend-$date.zip"

Write-Host "Creation des ZIPs..." -ForegroundColor Yellow
Compress-Archive -Path "build\backend\*" -DestinationPath $backendZip -Force
Compress-Archive -Path "build\frontend\*" -DestinationPath $frontendZip -Force

Write-Host ""
Write-Host "TERMINE !" -ForegroundColor Green
Write-Host "Backend : $backendZip" -ForegroundColor Cyan
Write-Host "Frontend : $frontendZip" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCTIONS :" -ForegroundColor Yellow
Write-Host "1. Uploadez les ZIPs sur O2SWITCH"
Write-Host "2. Extrayez-les aux bons endroits"
Write-Host "3. RESTART l'app Node.js" 