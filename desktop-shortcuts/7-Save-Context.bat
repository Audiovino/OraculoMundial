@echo off
REM Guarda la sesion actual en Obsidian
REM Util cuando se agota el contexto

echo.
echo ========================================
echo   Guardar Contexto en Obsidian
echo ========================================
echo.

cd c:\Proyectos\OraculoMundial

echo Guardando sesion...
echo.

.\scripts\context-saver.ps1 -SessionName "manual-$(Get-Date -Format yyyy-MM-dd-HHmm)"

echo.
echo [OK] Sesion guardada en Obsidian
echo.

pause
