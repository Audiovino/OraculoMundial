# Test Edge Function sync-matches

$url = "https://rthdnwkwocojijyfcrtr.supabase.co/functions/v1/sync-matches"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aGRud2t3b2NvamlqeWZjcnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTY3NDAsImV4cCI6MjA4MTI5Mjc0MH0.zTrbAG5B5SWlFBW__qJgJhOZcRQrmfxsryyiixQI0LI"

Write-Host "🚀 Probando Edge Function sync-matches..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    }
    
    Write-Host "✅ Edge Function ejecutada correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error al ejecutar Edge Function:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Detalles:" -ForegroundColor Yellow
    $_.ErrorDetails.Message
}
