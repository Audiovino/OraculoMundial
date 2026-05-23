# Context Loader — Carga sesiones guardadas desde Obsidian
# Uso: .\context-loader.ps1 -SessionName "sesion-2026-05-23-1430"

param(
    [string]$SessionName,
    [string]$VaultPath = "C:\Proyectos\Propgear-AI\Propgear-Notas"
)

$SessionDir = "$VaultPath\Sesiones-Kiro"

if (-not $SessionName) {
    Write-Host "📂 Sesiones disponibles:" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path $SessionDir) {
        Get-ChildItem -Path $SessionDir -Filter "*.md" -File |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 10 |
            ForEach-Object {
                $Date = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
                Write-Host "  📄 $($_.BaseName)" -ForegroundColor Yellow
                Write-Host "     Guardada: $Date" -ForegroundColor Gray
                Write-Host ""
            }
    } else {
        Write-Host "  ❌ No hay sesiones guardadas aún" -ForegroundColor Red
    }
    
    Write-Host "💡 Uso:" -ForegroundColor Magenta
    Write-Host "   .\context-loader.ps1 -SessionName 'sesion-2026-05-23-1430'" -ForegroundColor White
    exit
}

$SessionFile = "$SessionDir\$SessionName.md"

if (-not (Test-Path $SessionFile)) {
    Write-Host "❌ Sesión no encontrada: $SessionFile" -ForegroundColor Red
    exit 1
}

# Leer y mostrar sesión
$Content = Get-Content -Path $SessionFile -Raw
Write-Host ""
Write-Host "📖 CARGANDO SESIÓN: $SessionName" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host $Content
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Sesión cargada. Continuá desde donde se quedó." -ForegroundColor Green
Write-Host ""
