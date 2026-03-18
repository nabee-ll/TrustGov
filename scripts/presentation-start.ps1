$ErrorActionPreference = 'Continue'

function Stop-Ports {
  param([int[]]$Ports)

  foreach ($port in $Ports) {
    $listeners = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($procId in $listeners) {
      try {
        Stop-Process -Id $procId -Force -ErrorAction Stop
        Write-Host "Stopped PID $procId on port $port"
      }
      catch {
        Write-Host "Could not stop PID $procId on port ${port}: $($_.Exception.Message)" -ForegroundColor Yellow
      }
    }
  }
}

function Start-ServiceWindow {
  param(
    [string]$Name,
    [string]$WorkingDir,
    [string]$Command
  )

  Write-Host "Starting $Name..."
  Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Set-Location '$WorkingDir'; $Command" | Out-Null
}

$portsToReset = @(3000, 3001, 3012, 3013, 5001, 5002, 5003)
Stop-Ports -Ports $portsToReset

Start-ServiceWindow -Name "TrustGov" -WorkingDir "D:\hackathons\TrustGov" -Command "npm run dev"
Start-ServiceWindow -Name "IncomeTax (frontend+backend)" -WorkingDir "D:\hackathons\TrustGov\incometax_mock" -Command "npm start"
Start-ServiceWindow -Name "Passport (frontend+backend)" -WorkingDir "D:\hackathons\TrustGov\passport_mock" -Command "npm run dev"
Start-ServiceWindow -Name "Parivahan Backend" -WorkingDir "D:\hackathons\TrustGov\parivahan-clone\backend" -Command "node server.js"
Start-ServiceWindow -Name "Parivahan Frontend" -WorkingDir "D:\hackathons\TrustGov\parivahan-clone\frontend" -Command "npm run dev"

Write-Host "Waiting for services to initialize..."
Start-Sleep -Seconds 20

powershell -ExecutionPolicy Bypass -File "D:\hackathons\TrustGov\scripts\presentation-precheck.ps1"

if ($LASTEXITCODE -eq 0) {
  Start-Process "http://localhost:3000"
}
