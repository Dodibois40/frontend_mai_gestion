# ========================================
# DEMARRAGE DEVELOPPEMENT LOCAL SECURISE
# ========================================
# Script optimise pour lancer l'environnement de developpement

param(
    [switch]$QuickStart = $false
)

Write-Host "DEMARRAGE ENVIRONNEMENT LOCAL" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Verification rapide des prerequis
if (!(Test-Path "frontend/.env.local")) {
    Write-Host "ERREUR Configuration locale manquante !" -ForegroundColor Red
    Write-Host "Executez d'abord : .\setup-dev-local.ps1" -ForegroundColor Yellow
    exit 1
}

# Nettoyer les processus Node.js existants
Write-Host "Nettoyage des processus existants..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Verifier que les ports sont libres
Write-Host "Verification des ports 8000 et 8080..." -ForegroundColor Cyan
$busyPorts = @()
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

if ($port8000) { $busyPorts += "8000" }
if ($port8080) { $busyPorts += "8080" }

if ($busyPorts.Count -gt 0) {
    Write-Host "ERREUR Ports occupes : $($busyPorts -join ', ')" -ForegroundColor Red
    Write-Host "Liberation forcee..." -ForegroundColor Yellow
    
    foreach ($port in $busyPorts) {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($proc in $processes) {
            Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host "OK Ports libres" -ForegroundColor Green

# Demarrer le backend
Write-Host "Demarrage du backend (Port 8000)..." -ForegroundColor Blue

$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    Set-Location "backend"
    
    # Verifier la base de donnees
    if (!(Test-Path "dev.db")) {
        Write-Host "Initialisation de la base de donnees..."
        npm run db:push
    }
    
    npm run dev
}

# Attendre le demarrage du backend
Write-Host "Attente demarrage backend..." -ForegroundColor White
Start-Sleep -Seconds 6

# Verifier que le backend est demarre
$backendRunning = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if (!$backendRunning) {
    Write-Host "ERREUR Echec demarrage backend ! Consultez les logs :" -ForegroundColor Red
    Receive-Job $backendJob -Keep
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "OK Backend demarre sur http://localhost:8000" -ForegroundColor Green

# Demarrer le frontend
Write-Host "Demarrage du frontend (Port 8080)..." -ForegroundColor Magenta

$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    Set-Location "frontend"
    npm run dev
}

# Attendre le demarrage du frontend
Write-Host "Attente demarrage frontend..." -ForegroundColor White
Start-Sleep -Seconds 8

# Verifier que le frontend est demarre
$frontendRunning = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if (!$frontendRunning) {
    Write-Host "ERREUR Echec demarrage frontend ! Consultez les logs :" -ForegroundColor Red
    Receive-Job $frontendJob -Keep
    Stop-Job $frontendJob $backendJob -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "OK Frontend demarre sur http://localhost:8080" -ForegroundColor Green

# Test de connectivite
Write-Host "Test de connectivite..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "OK Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "ATTENTION Backend non accessible - Verifiez les logs" -ForegroundColor Yellow
}

# Resume final
Write-Host ""
Write-Host "ENVIRONNEMENT DE DEVELOPPEMENT PRET !" -ForegroundColor Green -BackgroundColor DarkBlue
Write-Host "=====================================" -ForegroundColor White
Write-Host ""
Write-Host "APPLICATION      : http://localhost:8080" -ForegroundColor Cyan
Write-Host "API BACKEND      : http://localhost:8000/api" -ForegroundColor Cyan
Write-Host "DOCUMENTATION API: http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "COMMANDES UTILES :" -ForegroundColor Yellow
Write-Host "• Voir les jobs      : Get-Job" -ForegroundColor White
Write-Host "• Arreter un job     : Stop-Job -Id X" -ForegroundColor White
Write-Host "• Voir les logs      : Receive-Job -Id X" -ForegroundColor White
Write-Host "• Arreter tout       : Ctrl+C puis Stop-Job *" -ForegroundColor White
Write-Host ""
Write-Host "Les logs s'affichent en temps reel..." -ForegroundColor Gray
Write-Host "Appuyez sur Ctrl+C pour arreter tous les serveurs" -ForegroundColor Gray
Write-Host ""

# Afficher les jobs actifs
Get-Job | Format-Table -AutoSize

# Garder le script actif pour surveiller
try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Verifier que les jobs sont toujours actifs
        $jobs = Get-Job -State Running
        if ($jobs.Count -lt 2) {
            Write-Host "ATTENTION Un serveur s'est arrete !" -ForegroundColor Red
            Get-Job | Format-Table -AutoSize
            break
        }
    }
} catch {
    Write-Host "Arret demande par l'utilisateur" -ForegroundColor Yellow
} finally {
    Write-Host "Nettoyage..." -ForegroundColor Yellow
    Stop-Job * -ErrorAction SilentlyContinue
    Remove-Job * -Force -ErrorAction SilentlyContinue
    Write-Host "Serveurs arretes" -ForegroundColor Green
}
