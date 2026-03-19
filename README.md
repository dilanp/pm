# Project Management MVP

## Run

### Windows (PowerShell)

```powershell
./scripts/start.ps1
```

To stop and remove the container:

```powershell
./scripts/stop.ps1
```

### macOS / Linux

```bash
./scripts/start.sh
```

To stop and remove the container:

```bash
./scripts/stop.sh
```

## Notes

- The start scripts run frontend unit tests before building and running the Docker container.
- The app is served at http://localhost:8000 after the container starts.
- The API sample endpoint is available at http://localhost:8000/api/hello.
