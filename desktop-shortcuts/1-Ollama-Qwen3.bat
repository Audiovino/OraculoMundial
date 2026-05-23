@echo off
REM Inicia Ollama con Qwen3 - Chat directo
REM Click para abrir chat local con Qwen3

echo.
echo ========================================
echo   Ollama + Qwen3 - Chat Local
echo ========================================
echo.
echo Iniciando Ollama...
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
echo Abriendo chat con Qwen3...
echo.

REM Iniciar chat directo
ollama run qwen2:7b

pause
