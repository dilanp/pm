$ErrorActionPreference = "Stop"

docker stop pm-app 2>$null | Out-Null
docker rm pm-app 2>$null | Out-Null
