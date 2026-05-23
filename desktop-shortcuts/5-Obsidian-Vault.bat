@echo off
REM Abre Obsidian con la vault de Propgear
REM Donde se guardan todas las sesiones de contexto

echo.
echo ========================================
echo   Obsidian - Vault Propgear
echo ========================================
echo.

echo Abriendo Obsidian...
echo.

REM Abrir Obsidian con la vault
start "" "C:\Users\gerad\AppData\Local\Obsidian\Obsidian.exe" "C:\Proyectos\Propgear-AI\Propgear-Notas"

echo.
echo [INFO] Obsidian abierto
echo [INFO] Navega a: Sesiones-Kiro para ver tus sesiones guardadas
echo.

timeout /t 2 /nobreak
