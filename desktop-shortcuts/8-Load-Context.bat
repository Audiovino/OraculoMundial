@echo off
REM Carga una sesion guardada desde Obsidian

echo.
echo ========================================
echo   Cargar Contexto desde Obsidian
echo ========================================
echo.

cd c:\Proyectos\OraculoMundial

echo Sesiones disponibles:
echo.

.\scripts\context-loader.ps1

echo.
echo [INFO] Selecciona una sesion arriba para cargarla
echo.

pause
