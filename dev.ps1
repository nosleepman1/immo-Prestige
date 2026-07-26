# dev.ps1 - lance tout l'environnement de developpement ImmoPrestige en un
# seul script : PostgreSQL (service Windows natif) + Redis (via WSL Ubuntu)
# + un tunnel ngrok (webhook PayDunya), puis le backend (API + queue + logs
# + Reverb) et les 3 frontends (admin, agency, mobile), chacun dans sa
# propre fenetre PowerShell.
#
# Prerequis :
#   - PostgreSQL installe en natif sur Windows, tournant comme service
#     (ex: "postgresql-x64-18"), role "postgres" / mot de passe "root",
#     base "immo_prestige" deja creee.
#   - Redis installe dans la distro WSL "Ubuntu" (apt install redis-server).
#   - ngrok installe et authentifie (ngrok config check) - optionnel : sans
#     lui, tout fonctionne sauf la confirmation automatique des paiements
#     PayDunya (le webhook ne peut pas atteindre localhost).
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

# -- 3. ngrok : tunnel public pour le webhook PayDunya -----------------------

# PayDunya (comme tout fournisseur de paiement) appelle le callback_url
# depuis ses propres serveurs - "localhost" n'est jamais joignable depuis
# l'exterieur. On expose donc le backend via ngrok et on pointe APP_URL
# dessus, pour que route('webhooks.paydunya') genere une URL publique.
Write-Step "Tunnel ngrok (webhook PayDunya)"

$ngrokUrl = $null
$ngrokCmd = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokCmd) {
    Write-Host "  ngrok introuvable dans le PATH - le webhook PayDunya restera injoignable (localhost)." -ForegroundColor Yellow
} else {
    $ngrokAlreadyRunning = Get-Process -Name ngrok -ErrorAction SilentlyContinue
    if (-not $ngrokAlreadyRunning) {
        Start-DevWindow "ngrok (tunnel public)" $root "ngrok http 8000 --log=stdout"
    } else {
        Write-Host "  ngrok deja lance" -ForegroundColor Green
    }

    for ($i = 0; $i -lt 15 -and -not $ngrokUrl; $i++) {
        Start-Sleep -Seconds 1
        try {
            $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2 -ErrorAction Stop
            $https = $tunnels.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
            if ($https) { $ngrokUrl = $https.public_url }
        } catch {}
    }

    if ($ngrokUrl) {
        Write-Host "  Tunnel public : $ngrokUrl" -ForegroundColor Green
    } else {
        Write-Host "  ngrok n'a pas repondu a temps - le webhook PayDunya restera injoignable (localhost)." -ForegroundColor Yellow
    }
}

# -- 4. Backend : verifie/complete le .env pour pointer vers Postgres --------

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
    'PAYDUNYA_DRIVER'      = 'paydunya'
    'PAYDUNYA_MODE'        = 'test'
    # PayDunya's return_url is built from this - it must be the agency app
    # (port 5174), the only frontend that does checkout, not the admin app's
    # port (5173, Laravel's own historical default).
    'FRONTEND_URL'         = 'http://localhost:5174'
    # Both real-time frontends (agency, mobile's web preview) need a Reverb
    # connection - relying on the single-value FRONTEND_URL fallback would
    # only allow one of them.
    'REVERB_ALLOWED_ORIGINS' = 'http://localhost:5174,http://localhost:8081'
}

if ($ngrokUrl) {
    # Changes every run (free ngrok domain) - always overwritten, unlike the
    # PayDunya keys below.
    $desiredEnv['APP_URL'] = $ngrokUrl
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

# Cles PayDunya : jamais ecrasees si deja presentes (l'utilisateur les remplit
# lui-meme) - juste un emplacement vide ajoute une seule fois si absent.
$payDunyaKeys = @('PAYDUNYA_MASTER_KEY', 'PAYDUNYA_PRIVATE_KEY', 'PAYDUNYA_PUBLIC_KEY', 'PAYDUNYA_TOKEN')
foreach ($key in $payDunyaKeys) {
    $exists = $lines | Where-Object { $_ -match "^\s*#*\s*$key=" }
    if (-not $exists) {
        $lines += "$key="
        $changed = $true
    }
}

if ($changed) {
    Set-Content -Path $envPath -Value $lines -Encoding utf8
    Write-Host "  Postgres (postgres/root) + Redis (queue/cache/broadcast) appliques dans .env" -ForegroundColor Green
    Write-Host "  PAYDUNYA_MASTER_KEY / PRIVATE_KEY / PUBLIC_KEY / TOKEN : completez-les vous-meme dans backend/.env" -ForegroundColor Yellow
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

# -- 5. Fenetres de developpement ---------------------------------------------

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
if ($ngrokUrl) {
    Write-Host "Webhook  : $ngrokUrl (PayDunya callback_url - change a chaque relance du script)"
}
Write-Host "Admin    : http://localhost:5173"
Write-Host "Agency   : http://localhost:5174"
Write-Host "Mobile   : QR code / http://localhost:8081 (appuyez sur 'w' dans la fenetre Expo)"
Write-Host ""
Write-Host "Chaque service tourne dans sa propre fenetre - fermez-les (ou Ctrl+C) pour l'arreter." -ForegroundColor DarkGray
