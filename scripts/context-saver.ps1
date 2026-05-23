param(
    [string]$SessionName = "sesion-$(Get-Date -Format 'yyyy-MM-dd-HHmm')",
    [string]$Workspace = (Get-Location).Path,
    [string]$VaultPath = "C:\Proyectos\Propgear-AI\Propgear-Notas"
)

$SessionDir = "$VaultPath\Sesiones-Kiro"
if (-not (Test-Path $SessionDir)) {
    New-Item -ItemType Directory -Force -Path $SessionDir | Out-Null
}

$RecentFiles = Get-ChildItem -Path $Workspace -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-2) } |
    Select-Object -ExpandProperty FullName |
    ForEach-Object { $_ -replace [regex]::Escape($Workspace), "." }

$GitStatus = ""
if (Test-Path "$Workspace\.git") {
    Push-Location $Workspace
    $GitStatus = git status --short 2>$null
    Pop-Location
}

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$currentTime = Get-Date -Format 'HH:mm:ss'
$fileCount = $RecentFiles.Count

$filesList = if ($RecentFiles) { 
    ($RecentFiles | ForEach-Object { "- $_" }) -join "`n"
} else { 
    "Ninguno"
}

$gitInfo = if ($GitStatus) { 
    $GitStatus
} else { 
    "Sin cambios pendientes"
}

$SessionContent = "---`n"
$SessionContent += "fecha: $timestamp`n"
$SessionContent += "tags: [sesion, kiro, propgear, context-handoff]`n"
$SessionContent += "workspace: $Workspace`n"
$SessionContent += "ide: vscode`n"
$SessionContent += "---`n`n"
$SessionContent += "# Sesion $SessionName`n`n"
$SessionContent += "## Resumen Rapido`n"
$SessionContent += "- Workspace: $Workspace`n"
$SessionContent += "- Hora: $currentTime`n"
$SessionContent += "- Archivos modificados: $fileCount`n`n"
$SessionContent += "## Archivos Modificados (ultimas 2 horas)`n"
$SessionContent += "$filesList`n`n"
$SessionContent += "## Estado de Git`n"
$SessionContent += "$gitInfo`n`n"
$SessionContent += "## Proximos Pasos`n"
$SessionContent += "1. Revisar archivos modificados arriba`n"
$SessionContent += "2. Continuar desde donde se quedo`n"
$SessionContent += "3. Ejecutar: .\context-loader.ps1 -SessionName `"$SessionName`"`n`n"
$SessionContent += "## Como Cargar Esta Sesion`n"
$SessionContent += "En VS Code Terminal o PowerShell:`n"
$SessionContent += "cd $Workspace`n"
$SessionContent += ".\context-loader.ps1 -SessionName `"$SessionName`"`n`n"
$SessionContent += "## Referencias Rapidas`n"
$SessionContent += "- Workspace: $Workspace`n"
$SessionContent += "- Vault: $VaultPath`n"
$SessionContent += "- Sesion guardada: $SessionDir\$SessionName.md`n`n"
$SessionContent += "---`n"
$SessionContent += "Sesion guardada automaticamente por context-saver.ps1`n"

$SessionFile = "$SessionDir\$SessionName.md"
$SessionContent | Out-File -FilePath $SessionFile -Encoding UTF8 -Force

Write-Host ""
Write-Host "OK SESION GUARDADA" -ForegroundColor Green
Write-Host "Archivo: $SessionFile" -ForegroundColor Cyan
Write-Host "Archivos modificados: $fileCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para cargar esta sesion despues:" -ForegroundColor Magenta
Write-Host "   .\context-loader.ps1 -SessionName '$SessionName'" -ForegroundColor White
Write-Host ""
