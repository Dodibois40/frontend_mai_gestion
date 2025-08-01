# Script d'upload automatique FTP pour O2SWITCH
param(
    [string]$LocalFile,
    [string]$RemotePath = "/public_html/"
)

$ftpServer = "ftp.cexe9174.odns.fr"
$ftpUser = "crm@crm.cexe9174.odns.fr"
$ftpPass = "Do@66001699"

# Créer l'URL FTP complète
$ftpUrl = "ftp://${ftpUser}:${ftpPass}@${ftpServer}${RemotePath}"

# Upload du fichier
$webclient = New-Object System.Net.WebClient
$uri = New-Object System.Uri($ftpUrl + [System.IO.Path]::GetFileName($LocalFile))

try {
    $webclient.UploadFile($uri, $LocalFile)
    Write-Host "✅ Fichier uploadé : $LocalFile -> $RemotePath" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur upload : $_" -ForegroundColor Red
}

# Exemple d'utilisation :
# .\auto-upload-ftp.ps1 -LocalFile ".\fix-cors-simple.php" -RemotePath "/public_html/" 