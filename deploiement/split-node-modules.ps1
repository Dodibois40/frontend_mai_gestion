# Script pour diviser node_modules.zip en parties de 50MB
Write-Host "Division de node_modules.zip en parties de 50MB..." -ForegroundColor Yellow

# Utiliser 7-Zip si disponible
$sevenZipPath = "C:\Program Files\7-Zip\7z.exe"
if (Test-Path $sevenZipPath) {
    & $sevenZipPath a -v50m node_modules_split.7z node_modules.zip
    Write-Host "Fichiers créés avec 7-Zip" -ForegroundColor Green
} else {
    Write-Host "7-Zip non trouvé. Installation recommandée pour diviser le fichier." -ForegroundColor Red
    Write-Host "Téléchargez 7-Zip depuis: https://www.7-zip.org/" -ForegroundColor Yellow
} 