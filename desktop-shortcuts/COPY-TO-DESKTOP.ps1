# Copia todos los .bat al escritorio automaticamente

$sourceDir = "c:\Proyectos\OraculoMundial\desktop-shortcuts"
$desktopDir = "$env:USERPROFILE\Desktop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Copiando shortcuts al escritorio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obtener todos los .bat
$batFiles = Get-ChildItem -Path $sourceDir -Filter "*.bat"

if ($batFiles.Count -eq 0) {
    Write-Host "No se encontraron archivos .bat" -ForegroundColor Red
    exit
}

Write-Host "Archivos a copiar: $($batFiles.Count)" -ForegroundColor Yellow
Write-Host ""

# Copiar cada archivo
foreach ($file in $batFiles) {
    $destination = Join-Path $desktopDir $file.Name
    
    if (Test-Path $destination) {
        Write-Host "  [SKIP] $($file.Name) (ya existe)" -ForegroundColor Yellow
    } else {
        Copy-Item -Path $file.FullName -Destination $destination -Force
        Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Listo! Shortcuts en el escritorio" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Archivos copiados:" -ForegroundColor Cyan
Get-ChildItem -Path $desktopDir -Filter "*.bat" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}
Write-Host ""
Write-Host "Ahora podes hacer double-click en cualquier .bat del escritorio" -ForegroundColor Green
Write-Host ""

pause
