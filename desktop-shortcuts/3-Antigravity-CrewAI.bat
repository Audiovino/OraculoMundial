@echo off
REM Inicia Antigravity con CrewAI (Agentes locales)
REM Usa Ollama + Qwen3 para multi-agentes

echo.
echo ========================================
echo   Antigravity + CrewAI (Agentes Locales)
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
echo Iniciando CrewAI con Qwen3...
echo.

REM Navegar a la carpeta de antigravity
cd C:\Users\gerad\.gemini\antigravity\scratch\antigravity-backup

REM Activar entorno virtual
call .\venv\Scripts\activate.bat

REM Ejecutar crew agent
python crew_agent.py

pause
