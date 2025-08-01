# ========================================
# 🚀 SETUP ENVIRONNEMENT DE DÉVELOPPEMENT LOCAL
# ========================================
# Script pour configurer l'environnement de développement

Write-Host "🔧 SETUP DÉVELOPPEMENT LOCAL - MAI-GESTION" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# 1. Créer fichier de configuration frontend local
Write-Host "📝 Création de la configuration locale..." -ForegroundColor Yellow

$envLocalContent = @"
# ========================================
# 🔧 ENVIRONNEMENT DE DÉVELOPPEMENT LOCAL
# ========================================
# Ce fichier n'affecte PAS la production !

# URL du backend local
VITE_API_URL=http://localhost:8000/api

# Mode développement
NODE_ENV=development

# ========================================
# 📝 Backend local : http://localhost:8000
# 📝 Frontend local : http://localhost:8080
# ========================================
"@

# Créer .env.local pour le frontend
$envLocalContent | Out-File -FilePath "frontend/.env.local" -Encoding UTF8
Write-Host "✅ frontend/.env.local créé" -ForegroundColor Green

# 2. Vérifier que le backend a sa configuration
if (!(Test-Path "backend/.env")) {
    Write-Host "📝 Création configuration backend locale..." -ForegroundColor Yellow
    
    $backendEnvContent = @"
# Configuration backend local
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-jwt-secret-local-only-not-for-production"
PORT=8000
NODE_ENV=development
"@
    
    $backendEnvContent | Out-File -FilePath "backend/.env" -Encoding UTF8
    Write-Host "✅ backend/.env créé" -ForegroundColor Green
} else {
    Write-Host "✅ backend/.env existe déjà" -ForegroundColor Green
}

# 3. Vérifier les dépendances
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow

$frontendNodeModules = Test-Path "frontend/node_modules"
$backendNodeModules = Test-Path "backend/node_modules"

if (!$frontendNodeModules -or !$backendNodeModules) {
    Write-Host "🔄 Installation des dépendances..." -ForegroundColor Cyan
    
    if (!$backendNodeModules) {
        Write-Host "   • Backend..." -ForegroundColor White
        Set-Location "backend"
        npm install
        Set-Location ".."
    }
    
    if (!$frontendNodeModules) {
        Write-Host "   • Frontend..." -ForegroundColor White
        Set-Location "frontend" 
        npm install
        Set-Location ".."
    }
} else {
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
}

# 4. Créer base de données de développement si nécessaire
Write-Host "🗄️ Initialisation base de données locale..." -ForegroundColor Yellow
Set-Location "backend"
npm run db:push 2>$null
Set-Location ".."
Write-Host "✅ Base de données locale prête" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 ENVIRONNEMENT LOCAL CONFIGURÉ !" -ForegroundColor Green -BackgroundColor DarkBlue
Write-Host ""
Write-Host "🚀 ÉTAPES SUIVANTES :" -ForegroundColor White
Write-Host "1. Démarrer les serveurs : .\start-dev-local.ps1" -ForegroundColor Cyan
Write-Host "2. Ouvrir : http://localhost:8080" -ForegroundColor Cyan
Write-Host "3. Développer et tester" -ForegroundColor Cyan
Write-Host "4. Déployer : .\deploy-secure.ps1" -ForegroundColor Cyan
Write-Host ""
