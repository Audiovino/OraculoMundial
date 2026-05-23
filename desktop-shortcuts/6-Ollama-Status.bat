@echo off
REM Verifica el estado de Ollama y modelos disponibles

echo.
echo ========================================
echo   Ollama - Estado y Modelos
echo ========================================
echo.

REM Verificar si Ollama esta corriendo
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Ollama esta corriendo
) else (
    echo [ERROR] Ollama NO esta corriendo
    echo.
    echo Iniciando Ollama...
    start "" "C:\Users\gerad\AppData\Local\Programs\Ollama\ollama.exe"
    timeout /t 3 /nobreak
)

echo.
echo Modelos disponibles:
echo.

ollama list

echo.
echo Para descargar un modelo:
echo   ollama pull qwen2:7b
echo   ollama pull hermes3
echo   ollama pull gemma4
echo.

pause
