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

# Certaines lignes DB_*/REDIS_*/QUEUE_* peuvent deja exister mais etre
# commentees (ex: "# DB_HOST=127.0.0.1") - un simple -replace sur la valeur
# les laisserait inactives. On force donc une ligne active "CLE=valeur" pour
# chaque cle, qu'elle soit absente, commentee, ou deja presente.
$desiredEnv = [ordered]@{
    'DB_CONNECTION'        = 'pgsql'
    'DB_HOST'              = '127.0.0.1'
    'DB_PORT'              = '5432'
    'DB_DATABASE'          = 'immo_prestige'
    'DB_USERNAME'          = 'postgres'
    'DB_PASSWORD'          = 'root'
    'REDIS_CLIENT'         = 'predis'
    'REDIS_HOST'           = '127.0.0.1'
    'REDIS_PORT'           = '6379'
    'QUEUE_CONNECTION'     = 'redis'
    'CACHE_STORE'          = 'redis'
    'BROADCAST_CONNECTION' = 'reverb'
}

$lines = Get-Content $envPath -Encoding UTF8
$changed = $false

foreach ($key in $desiredEnv.Keys) {
    $desiredLine = "$key=$($desiredEnv[$key])"
    $linePattern = "^\s*#*\s*$key="
    $matchIndex = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match $linePattern) { $matchIndex = $i; break }
    }
    if ($matchIndex -ge 0) {
        if ($lines[$matchIndex] -ne $desiredLine) {
            $lines[$matchIndex] = $desiredLine
            $changed = $true
        }
    } else {
        $lines += $desiredLine
        $changed = $true
    }
}

if ($changed) {
    Set-Content -Path $envPath -Value $lines -Encoding utf8
    Write-Host "  Postgres (postgres/root) + Redis (queue/cache/broadcast) appliques dans .env" -ForegroundColor Green
} else {
    Write-Host "  .env deja configure" -ForegroundColor Green
}

$envContent = Get-Content $envPath -Raw -Encoding UTF8

if (-not (Test-Path (Join-Path $backendDir "vendor"))) {
    Write-Host "  vendor/ absent - installation des dependances Composer..." -ForegroundColor Yellow
    Push-Location $backendDir
    composer install --no-interaction
    Pop-Location
}

$hasAppKey = (Get-Content $envPath -Encoding UTF8) | Where-Object { $_ -match "^APP_KEY=base64:" }
if (-not $hasAppKey) {
    Write-Host "  APP_KEY absente - generation..." -ForegroundColor Yellow
    Push-Location $backendDir
    php artisan key:generate --ansi
    Pop-Location
}

# Une configuration mise en cache (bootstrap/cache/config.php, par ex. via un
# ancien "artisan config:cache") ferait ignorer .env silencieusement - on
# repart toujours d'un cache propre, et on applique les migrations en attente.
Push-Location $backendDir
php artisan config:clear --ansi
php artisan migrate --ansi
Pop-Location

# -- 4. Fenetres de developpement ---------------------------------------------

Write-Step "Lancement des serveurs"

# Backend API.
Start-DevWindow "Backend API (8000)" $backendDir "php artisan serve"

# Queue worker (jobs : emails, media, notifications...).
Start-DevWindow "Queue Worker" $backendDir "php artisan queue:listen --tries=1"

# Logs : "php artisan pail" exige l'extension pcntl, absente des builds PHP
# Windows - on tail simplement le fichier de log a la place.
$logPath = Join-Path $backendDir "storage\logs\laravel.log"
Start-DevWindow "Logs" $backendDir "if (-not (Test-Path '$logPath')) { New-Item -ItemType File -Path '$logPath' -Force | Out-Null }; Get-Content -Path '$logPath' -Wait -Tail 30"

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
