$ErrorActionPreference = "Stop"

$RepoRoot = Join-Path $PSScriptRoot ".."

Push-Location (Join-Path $RepoRoot "frontend")
npm install
npm run test:all
Pop-Location

docker build -t pm-app $RepoRoot

docker rm -f pm-app 2>$null | Out-Null

docker run -d --name pm-app -p 8000:8000 pm-app
