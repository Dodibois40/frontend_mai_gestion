# Script pour ouvrir les dossiers nécessaires à l'upload

Write-Host "=== ASSISTANT UPLOAD FTP ===" -ForegroundColor Cyan
Write-Host ""

# Ouvrir le dossier de build
$buildPath = Join-Path $PSScriptRoot "build"
Start-Process explorer.exe $buildPath

Write-Host "INFORMATIONS DE CONNEXION FTP :" -ForegroundColor Yellow
Write-Host "--------------------------------"
Write-Host "Serveur    : ftp.cexe9174.odns.fr" -ForegroundColor Green
Write-Host "Utilisateur: crm@crm.cexe9174.odns.fr" -ForegroundColor Green
Write-Host "Mot de passe: Do@66001699" -ForegroundColor Green
Write-Host "Port       : 21" -ForegroundColor Green
Write-Host ""

Write-Host "STRUCTURE A CREER SUR LE SERVEUR :" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host "1. Backend  -> /home/cexe9174/nodejs_apps/mai-gestion-api/" -ForegroundColor Cyan
Write-Host "2. Frontend -> /home/cexe9174/public_html/crm/" -ForegroundColor Cyan
Write-Host ""

Write-Host "OPTIONS POUR L'UPLOAD :" -ForegroundColor Yellow
Write-Host "----------------------"
Write-Host "1. Utiliser le client FTP integre de Windows"
Write-Host "2. Utiliser un navigateur web (cPanel File Manager)"
Write-Host "3. Telecharger FileZilla (recommande)"
Write-Host ""

$choice = Read-Host "Votre choix (1, 2 ou 3)"

switch ($choice) {
    "1" {
        Write-Host "`nOuverture du client FTP Windows..." -ForegroundColor Green
        Start-Process "ftp://crm%40crm.cexe9174.odns.fr:Do@66001699@ftp.cexe9174.odns.fr"
    }
    "2" {
        Write-Host "`nOuverture de cPanel..." -ForegroundColor Green
        Start-Process "https://lamanufacturedubois.com:2083/"
        Write-Host "Utilisez le File Manager dans cPanel" -ForegroundColor Yellow
    }
    "3" {
        Write-Host "`nTelecharger FileZilla..." -ForegroundColor Green
        Start-Process "https://filezilla-project.org/download.php?platform=win64"
    }
    default {
        Write-Host "Choix invalide" -ForegroundColor Red
    }
}

Write-Host "`nLes dossiers a uploader sont ouverts dans l'explorateur Windows." -ForegroundColor Green
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 