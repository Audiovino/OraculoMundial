# Context Handoff System - Verification Script
# Verifica que todo este instalado y funcionando correctamente

Write-Host ""
Write-Host "Context Handoff System - Verification" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$checks = @()
$workspace = "c:\Proyectos\OraculoMundial"
$vaultPath = "C:\Proyectos\Propgear-AI\Propgear-Notas"
$sessionDir = "$vaultPath\Sesiones-Kiro"

# Check 1: Scripts existen
Write-Host "1. Verificando scripts..." -ForegroundColor Yellow
$scriptSaver = Test-Path "$workspace\scripts\context-saver.ps1"
$scriptLoader = Test-Path "$workspace\scripts\context-loader.ps1"
$scriptPython = Test-Path "$workspace\scripts\antigravity-context-integration.py"

if ($scriptSaver -and $scriptLoader -and $scriptPython) {
    Write-Host "   [OK] Scripts encontrados" -ForegroundColor Green
    $checks += $true
}
else {
    Write-Host "   [ERROR] Scripts faltantes" -ForegroundColor Red
    if (-not $scriptSaver) { Write-Host "      - context-saver.ps1" -ForegroundColor Red }
    if (-not $scriptLoader) { Write-Host "      - context-loader.ps1" -ForegroundColor Red }
    if (-not $scriptPython) { Write-Host "      - antigravity-context-integration.py" -ForegroundColor Red }
    $checks += $false
}

# Check 2: VS Code configuration
Write-Host ""
Write-Host "2. Verificando configuracion VS Code..." -ForegroundColor Yellow
$tasksJson = Test-Path "$workspace\.vscode\tasks.json"
$clineSettings = Test-Path "$workspace\.vscode\cline-settings.json"

if ($tasksJson -and $clineSettings) {
    Write-Host "   [OK] Configuracion VS Code completa" -ForegroundColor Green
    $checks += $true
}
else {
    Write-Host "   [ERROR] Configuracion VS Code incompleta" -ForegroundColor Red
    if (-not $tasksJson) { Write-Host "      - tasks.json" -ForegroundColor Red }
    if (-not $clineSettings) { Write-Host "      - cline-settings.json" -ForegroundColor Red }
    $checks += $false
}

# Check 3: Documentacion
Write-Host ""
Write-Host "3. Verificando documentacion..." -ForegroundColor Yellow
$quickStart = Test-Path "$workspace\CONTEXT_QUICK_START.md"
$fullGuide = Test-Path "$workspace\CONTEXT_HANDOFF_GUIDE.md"
$dashboard = Test-Path "$workspace\context-dashboard.html"
$implemented = Test-Path "$workspace\CONTEXT_SYSTEM_IMPLEMENTED.md"

if ($quickStart -and $fullGuide -and $dashboard -and $implemented) {
    Write-Host "   [OK] Documentacion completa" -ForegroundColor Green
    $checks += $true
}
else {
    Write-Host "   [WARNING] Documentacion incompleta" -ForegroundColor Yellow
    if (-not $quickStart) { Write-Host "      - CONTEXT_QUICK_START.md" -ForegroundColor Yellow }
    if (-not $fullGuide) { Write-Host "      - CONTEXT_HANDOFF_GUIDE.md" -ForegroundColor Yellow }
    if (-not $dashboard) { Write-Host "      - context-dashboard.html" -ForegroundColor Yellow }
    if (-not $implemented) { Write-Host "      - CONTEXT_SYSTEM_IMPLEMENTED.md" -ForegroundColor Yellow }
    $checks += $false
}

# Check 4: Carpeta de sesiones
Write-Host ""
Write-Host "4. Verificando carpeta de sesiones..." -ForegroundColor Yellow
if (Test-Path $sessionDir) {
    Write-Host "   [OK] Carpeta de sesiones existe" -ForegroundColor Green
    $sessionCount = (Get-ChildItem -Path $sessionDir -Filter "*.md" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "      Sesiones guardadas: $sessionCount" -ForegroundColor Cyan
    $checks += $true
}
else {
    Write-Host "   [WARNING] Carpeta de sesiones no existe" -ForegroundColor Yellow
    Write-Host "      Creando carpeta..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null
    Write-Host "      [OK] Carpeta creada" -ForegroundColor Green
    $checks += $true
}

# Check 5: Permisos de ejecucion
Write-Host ""
Write-Host "5. Verificando permisos de ejecucion..." -ForegroundColor Yellow
$policy = Get-ExecutionPolicy -Scope CurrentUser
if ($policy -eq "RemoteSigned" -or $policy -eq "Unrestricted" -or $policy -eq "Bypass") {
    Write-Host "   [OK] Permisos correctos: $policy" -ForegroundColor Green
    $checks += $true
}
else {
    Write-Host "   [WARNING] Politica de ejecucion: $policy" -ForegroundColor Yellow
    Write-Host "      Recomendacion: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    $checks += $false
}

# Check 6: Integraciones adicionales
Write-Host ""
Write-Host "6. Verificando integraciones adicionales..." -ForegroundColor Yellow
$n8nWorkflow = Test-Path "$workspace\scripts\n8n-context-workflow.json"
$obsidianPlugin = Test-Path "$workspace\scripts\obsidian-context-plugin.js"

$integrations = 0
if ($n8nWorkflow) { 
    Write-Host "   [OK] n8n workflow disponible" -ForegroundColor Green
    $integrations++
}
if ($obsidianPlugin) { 
    Write-Host "   [OK] Obsidian plugin disponible" -ForegroundColor Green
    $integrations++
}

if ($integrations -eq 0) {
    Write-Host "   [INFO] Sin integraciones adicionales (opcional)" -ForegroundColor Cyan
}

# Check 7: Prueba de funcionamiento
Write-Host ""
Write-Host "7. Prueba de funcionamiento..." -ForegroundColor Yellow
$testSession = "verify-test-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
& "$workspace\scripts\context-saver.ps1" -SessionName $testSession 2>&1 | Out-Null

if (Test-Path "$sessionDir\$testSession.md") {
    Write-Host "   [OK] Sistema funcionando correctamente" -ForegroundColor Green
    Write-Host "      Sesion de prueba: $testSession.md" -ForegroundColor Cyan
    $checks += $true
    
    # Limpiar sesion de prueba
    Remove-Item "$sessionDir\$testSession.md" -Force -ErrorAction SilentlyContinue
}
else {
    Write-Host "   [ERROR] Error al crear sesion de prueba" -ForegroundColor Red
    $checks += $false
}

# Resumen
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
$passedChecks = ($checks | Where-Object { $_ -eq $true } | Measure-Object).Count
$totalChecks = $checks.Count
$percentage = [math]::Round(($passedChecks / $totalChecks) * 100)

Write-Host ""
Write-Host "RESULTADO: $passedChecks/$totalChecks checks pasados ($percentage%)" -ForegroundColor Cyan
Write-Host ""

if ($percentage -eq 100) {
    Write-Host "[OK] Sistema completamente funcional" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Green
    Write-Host "   1. Abri VS Code" -ForegroundColor White
    Write-Host "   2. Presiona Ctrl+Shift+P" -ForegroundColor White
    Write-Host "   3. Busca 'Tasks: Run Task'" -ForegroundColor White
    Write-Host "   4. Selecciona 'Save Context to Obsidian'" -ForegroundColor White
}
elseif ($percentage -ge 80) {
    Write-Host "[WARNING] Sistema parcialmente funcional" -ForegroundColor Yellow
    Write-Host "   Revisa los items marcados con [ERROR] o [WARNING]" -ForegroundColor Yellow
}
else {
    Write-Host "[ERROR] Sistema requiere configuracion" -ForegroundColor Red
    Write-Host "   Revisa los items marcados con [ERROR]" -ForegroundColor Red
}

Write-Host ""
Write-Host "Documentacion:" -ForegroundColor Cyan
Write-Host "   - CONTEXT_QUICK_START.md (30 segundos)" -ForegroundColor White
Write-Host "   - CONTEXT_HANDOFF_GUIDE.md (guia completa)" -ForegroundColor White
Write-Host "   - context-dashboard.html (dashboard visual)" -ForegroundColor White
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
