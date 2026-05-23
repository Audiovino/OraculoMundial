@echo off
REM Abre Kiro (este IDE) con Ollama + Qwen3
REM Ya esta configurado para usar modelos locales

echo.
echo ========================================
echo   Kiro (IDE Actual)
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
echo Kiro ya esta abierto en tu navegador
echo.
echo Modelos disponibles:
echo   - qwen2:7b (codigo)
echo   - hermes3 (texto/agentes)
echo   - gemma4 (multimodal)
echo.
echo Usa Kiro normalmente. Todo funciona con Ollama local.
echo.

pause
