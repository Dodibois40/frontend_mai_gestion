# Script pour ajouter les domaines de production au CORS
Write-Host "=== Correction du CORS dans le code source ===" -ForegroundColor Green

$mainTsPath = "..\backend\src\main.ts"

# Lire le contenu
$content = Get-Content $mainTsPath -Raw

# Chercher la ligne avec 'mai-gestion-main.netlify.app'
$searchLine = "'https://mai-gestion-main.netlify.app'"
$newLines = @"
        'https://mai-gestion-main.netlify.app',
        'https://crm.lamanufacturedubois.com',
        'https://api.lamanufacturedubois.com',
        'https://lamanufacturedubois.com'
"@

# Remplacer
if ($content -match [regex]::Escape($searchLine)) {
    $content = $content -replace [regex]::Escape($searchLine), $newLines
    Set-Content -Path $mainTsPath -Value $content -NoNewline
    Write-Host "✅ Domaines de production ajoutés au CORS !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Domaines ajoutés :" -ForegroundColor Yellow
    Write-Host "- https://crm.lamanufacturedubois.com" -ForegroundColor Cyan
    Write-Host "- https://api.lamanufacturedubois.com" -ForegroundColor Cyan
    Write-Host "- https://lamanufacturedubois.com" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Ligne non trouvée. Vérifiez manuellement." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Magenta
Write-Host "1. cd ..\backend" -ForegroundColor White
Write-Host "2. npm run build" -ForegroundColor White
Write-Host "3. Uploader le nouveau build" -ForegroundColor White 