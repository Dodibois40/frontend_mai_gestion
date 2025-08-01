@echo off
title MAI-GESTION - Verification Serveurs
color 0B

echo.
echo ====================================
echo    VERIFICATION SERVEURS
echo ====================================
echo.

echo Processus Node.js en cours:
tasklist | findstr node.exe

echo.
echo Ports utilises:
netstat -ano | findstr ":8000"
netstat -ano | findstr ":8080"

echo.
echo Test de connexion:
echo Tentative de connexion au backend...
ping -n 1 localhost >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend accessible
) else (
    echo Backend inaccessible
)

echo.
echo Appuyez sur une touche pour continuer...
pause >nul 