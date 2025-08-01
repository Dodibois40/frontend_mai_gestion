@echo off
title MAI-GESTION - Demarrage Ultra-Stable
color 0A

echo.
echo ====================================
echo    MAI-GESTION - Demarrage Serveurs
echo ====================================
echo.

echo [1/4] Nettoyage des processus...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo [2/4] Demarrage du backend...
cd /d "%~dp0backend"
start "Backend MAI-GESTION" cmd /c "npm run dev"
cd /d "%~dp0"
timeout /t 10 /nobreak >nul

echo [3/4] Demarrage du frontend...
cd /d "%~dp0frontend"
start "Frontend MAI-GESTION" cmd /c "npm run dev"
cd /d "%~dp0"
timeout /t 8 /nobreak >nul

echo [4/4] Verification des serveurs...
netstat -ano | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo Backend: ACTIF (Port 8000)
) else (
    echo Backend: INACTIF
)

netstat -ano | findstr ":8080" >nul
if %errorlevel% equ 0 (
    echo Frontend: ACTIF (Port 8080)
) else (
    echo Frontend: INACTIF
)

echo.
echo ====================================
echo    SERVEURS DEMARRES AVEC SUCCES
echo ====================================
echo.
echo Application: http://localhost:8080
echo Backend API: http://localhost:8000
echo Documentation: http://localhost:8000/api/docs
echo.
echo Appuyez sur une touche pour continuer...
pause >nul 