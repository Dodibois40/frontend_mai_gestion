@echo off
title MAI-GESTION - Arret Serveurs
color 0C

echo.
echo ====================================
echo    ARRET COMPLET DES SERVEURS
echo ====================================
echo.

echo Arret de tous les processus Node.js...
taskkill /f /im node.exe

echo Verification...
timeout /t 2 /nobreak >nul
tasklist | findstr node.exe

echo.
echo Serveurs arretes avec succes !
echo.
pause 