# Loads variables from .env and starts the Spring Boot application.
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found. Copy .env.example to .env first." -ForegroundColor Red
    exit 1
}

Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#=\s][^=]*)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
}

mvn spring-boot:run
