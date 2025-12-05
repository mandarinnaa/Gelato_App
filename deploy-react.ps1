# Script PowerShell para copiar el build de React al backend Laravel

Write-Host "Copiando build de React a Laravel..." -ForegroundColor Cyan

# Rutas
$reactBuildPath = "..\integradora-web\build"
$laravelPublicPath = "public\react-app"

# Verificar que existe el build de React
if (-Not (Test-Path $reactBuildPath)) {
    Write-Host "Error: No se encontro el build de React en $reactBuildPath" -ForegroundColor Red
    Write-Host "Por favor ejecuta 'npm run build' en el proyecto React primero." -ForegroundColor Yellow
    exit 1
}

# Eliminar build anterior si existe
if (Test-Path $laravelPublicPath) {
    Write-Host "Eliminando build anterior..." -ForegroundColor Yellow
    Remove-Item -Path $laravelPublicPath -Recurse -Force
}

# Copiar nuevo build
Write-Host "Copiando archivos..." -ForegroundColor Yellow
Copy-Item -Path $reactBuildPath -Destination $laravelPublicPath -Recurse

Write-Host "Build copiado exitosamente a $laravelPublicPath" -ForegroundColor Green
Write-Host ""
Write-Host "Siguiente paso: Ejecuta 'php artisan serve' para probar localmente" -ForegroundColor Cyan
