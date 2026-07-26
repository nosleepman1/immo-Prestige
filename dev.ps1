# dev.ps1 - lance tout l'environnement de developpement ImmoPrestige en un
# seul script : PostgreSQL (service Windows natif) + Redis (via WSL Ubuntu),
# puis le backend (API + queue + logs + Reverb) et les 3 frontends (admin,
# agency, mobile), chacun dans sa propre fenetre PowerShell.
#
# Prerequis :
#   - PostgreSQL installe en natif sur Windows, tournant comme service
#     (ex: "postgresql-x64-18"), role "postgres" / mot de passe "root",
#     base "immo_prestige" deja creee.
#   - Redis installe dans la distro WSL "Ubuntu" (apt install redis-server).
# Ce script ne les installe pas - il se contente de demarrer les services et
# de verifier qu'ils repondent.
#
# Usage : depuis la racine du repo -> ./dev.ps1
# Pour tout arreter : fermez les fenetres ouvertes, ou Ctrl+C dans chacune.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$wslDistro = "Ubuntu"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Start-DevWindow($title, $workDir, $command) {
    $psCommand = "Set-Location -LiteralPath '$workDir'; `$Host.UI.RawUI.WindowTitle = '$title'; $command"
    Start-Process powershell -ArgumentList @("-NoExit", "-Command", $psCommand) | Out-Null
    Write-Host "  started: $title" -ForegroundColor Green
}

# -- 1. PostgreSQL (service Windows natif) -----------------------------------

Write-Step "PostgreSQL (service Windows)"

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $pgService) {
    Write-Host "  Aucun service 'postgresql*' trouve - verifiez votre installation." -ForegroundColor Yellow
} elseif ($pgService.Status -ne "Running") {
    Write-Host "  Service $($pgService.Name) arrete - demarrage..." -ForegroundColor Yellow
    Start-Service -Name $pgService.Name
    Start-Sleep -Seconds 2
    Write-Host "  $($pgService.Name) : $((Get-Service -Name $pgService.Name).Status)" -ForegroundColor Green
} else {
    Write-Host "  $($pgService.Name) : deja demarre" -ForegroundColor Green
}

$pgPort = (Test-NetConnection -ComputerName 127.0.0.1 -Port 5432 -WarningAction SilentlyContinue).TcpTestSucceeded
if ($pgPort) {
    Write-Host "  Port 5432 : accessible" -ForegroundColor Green
} else {
    Write-Host "  Port 5432 : injoignable - verifiez le service PostgreSQL" -ForegroundColor Yellow
}

# -- 2. Redis (WSL) -----------------------------------------------------------

Write-Step "Redis (WSL : $wslDistro)"

# Une commande "wsl -d <distro> -- ..." demarre automatiquement la distro si
# elle est arretee - pas besoin de la lancer separement.
wsl -d $wslDistro -u root -- bash -c "service redis-server start" 2>&1 | Out-Null
Start-Sleep -Seconds 1

$redisReady = wsl -d $wslDistro -- bash -c "redis-cli ping 2>&1"
if ($redisReady -match "PONG") {
    Write-Host "  Redis : OK" -ForegroundColor Green
} else {
    Write-Host "  Redis : injoignable ($redisReady) - verifiez l'installation dans WSL" -ForegroundColor Yellow
}

# -- 3. Backend : verifie/complete le .env pour pointer vers Postgres --------

Write-Step "Verification de backend/.env"

$backendDir = Join-Path $root "backend"
$envPath = Join-Path $backendDir ".env"

if (-not (Test-Path $envPath)) {
    Copy-Item (Join-Path $backendDir ".env.example") $envPath
    Write-Host "  .env cree depuis .env.example" -ForegroundColor Yellow
}

$envContent = Get-Content $envPath -Raw -Encoding UTF8
$replacements = @{
    'DB_CONNECTION=.*'  = 'DB_CONNECTION=pgsql'
    'DB_HOST=.*'        = 'DB_HOST=127.0.0.1'
    'DB_PORT=.*'        = 'DB_PORT=5432'
    'DB_DATABASE=.*'    = 'DB_DATABASE=immo_prestige'
    'DB_USERNAME=.*'    = 'DB_USERNAME=postgres'
    'DB_PASSWORD=.*'    = 'DB_PASSWORD=root'
}
$changed = $false
foreach ($pattern in $replacements.Keys) {
    if ($envContent -match $pattern) {
        $newContent = $envContent -replace $pattern, $replacements[$pattern]
        if ($newContent -ne $envContent) { $changed = $true }
        $envContent = $newContent
    }
}
if ($changed) {
    Set-Content -Path $envPath -Value $envContent -NoNewline -Encoding utf8
    Write-Host "  Identifiants Postgres (postgres/root) appliques dans .env" -ForegroundColor Green
} else {
    Write-Host "  .env deja configure" -ForegroundColor Green
}

if (-not (Test-Path (Join-Path $backendDir "vendor"))) {
    Write-Host "  vendor/ absent - installation des dependances Composer..." -ForegroundColor Yellow
    Push-Location $backendDir
    composer install --no-interaction
    Pop-Location
}

# -- 4. Fenetres de developpement ---------------------------------------------

Write-Step "Lancement des serveurs"

# Backend : API (php artisan serve) + queue worker + logs (pail), via le
# script composer "dev" deja defini dans backend/composer.json.
Start-DevWindow "Backend (API + Queue + Logs)" $backendDir "composer run dev"

# Reverb : serveur WebSocket pour la messagerie temps reel.
Start-DevWindow "Reverb (WebSockets)" $backendDir "php artisan reverb:start"

# Frontends.
Start-DevWindow "Admin (5173)"  (Join-Path $root "admin")  "npm run dev"
Start-DevWindow "Agency (5174)" (Join-Path $root "agency") "npm run dev -- --port 5174"
Start-DevWindow "Mobile (Expo)" (Join-Path $root "mobile")  "npm run start"

Write-Step "Termine"
Write-Host "Backend  : http://localhost:8000"
Write-Host "Admin    : http://localhost:5173"
Write-Host "Agency   : http://localhost:5174"
Write-Host "Mobile   : QR code / http://localhost:8081 (appuyez sur 'w' dans la fenetre Expo)"
Write-Host ""
Write-Host "Chaque service tourne dans sa propre fenetre - fermez-les (ou Ctrl+C) pour l'arreter." -ForegroundColor DarkGray
