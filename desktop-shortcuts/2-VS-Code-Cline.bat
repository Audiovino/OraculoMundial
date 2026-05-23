@echo off
REM Abre VS Code con Cline (IDE local gratis)
REM Cline usa Ollama + Qwen3 automaticamente

echo.
echo ========================================
echo   VS Code + Cline (IDE Local)
echo ========================================
echo.

REM Verificar si Ollama esta corriendo
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Ollama ya esta corriendo
) else (
    echo [INFO] Iniciando Ollama...
    start "" "C:\Users\gerad\AppData\Local\Programs\Ollama\ollama.exe"
    timeout /t 3 /nobreak
)

echo.
echo Abriendo VS Code con Cline...
echo.

REM Abrir VS Code en el workspace
code c:\Proyectos\OraculoMundial

echo.
echo [INFO] VS Code abierto. Cline esta configurado para usar Ollama + Qwen3
echo [INFO] En VS Code: Click en el icono de Cline (barra lateral)
echo.

pause
