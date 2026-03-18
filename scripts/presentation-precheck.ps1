$ErrorActionPreference = 'Stop'

$targets = @(
  @{ Name = 'TrustGov App'; Url = 'http://localhost:3000' },
  @{ Name = 'IncomeTax Frontend'; Url = 'http://localhost:3001' },
  @{ Name = 'IncomeTax API Health'; Url = 'http://localhost:5001/api/health' },
  @{ Name = 'Passport Frontend'; Url = 'http://localhost:3012' },
  @{ Name = 'Passport API Health'; Url = 'http://localhost:5002/api/health' },
  @{ Name = 'Parivahan Frontend'; Url = 'http://localhost:3013' },
  @{ Name = 'Parivahan API'; Url = 'http://localhost:5003/api/health' }
)

$results = @()
$failed = $false

foreach ($target in $targets) {
  try {
    $response = Invoke-WebRequest -Uri $target.Url -UseBasicParsing -TimeoutSec 8
    $ok = ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
    $results += [PSCustomObject]@{
      Service = $target.Name
      Url = $target.Url
      Status = $response.StatusCode
      Healthy = if ($ok) { 'YES' } else { 'NO' }
    }
    if (-not $ok) { $failed = $true }
  }
  catch {
    $results += [PSCustomObject]@{
      Service = $target.Name
      Url = $target.Url
      Status = 'ERR'
      Healthy = 'NO'
    }
    $failed = $true
  }
}

$results | Format-Table -AutoSize

if ($failed) {
  Write-Host "\nPresentation precheck failed. Restart broken services before presenting." -ForegroundColor Red
  exit 1
}

Write-Host "\nPresentation precheck passed. All core services are reachable." -ForegroundColor Green
