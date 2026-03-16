param(
  [string]$Region = "us-east-1"
)

Write-Host "=== Friend Laptop Fabric Probe ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1) AWS identity" -ForegroundColor Yellow
try {
  aws sts get-caller-identity
} catch {
  Write-Host "AWS CLI not configured or not available." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "2) Managed Blockchain networks in region: $Region" -ForegroundColor Yellow
$networksRaw = aws managedblockchain list-networks --region $Region 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host $networksRaw -ForegroundColor Red
  Write-Host ""
  Write-Host "If AccessDenied appears, attach Managed Blockchain read permissions to this IAM user." -ForegroundColor DarkYellow
} else {
  Write-Host $networksRaw
}

Write-Host ""
Write-Host "3) Local IPv4 addresses" -ForegroundColor Yellow
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.InterfaceAlias -notlike "*Loopback*" } |
  Select-Object InterfaceAlias, IPAddress |
  Format-Table -AutoSize

Write-Host ""
Write-Host "4) Node.js listening ports" -ForegroundColor Yellow
$nodePids = (Get-Process node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
if (-not $nodePids) {
  Write-Host "No Node server is running right now." -ForegroundColor DarkYellow
} else {
  Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $nodePids -contains $_.OwningProcess } |
    Select-Object LocalAddress, LocalPort, OwningProcess |
    Sort-Object LocalPort |
    Format-Table -AutoSize
}

Write-Host ""
Write-Host "5) Search current folder for likely submit route" -ForegroundColor Yellow
Get-ChildItem -Recurse -Include *.ts,*.js -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
  Select-String -Pattern "submit-integrity|app.post\(|router.post\(|fabric-network|managedblockchain" -CaseSensitive:$false |
  Select-Object -First 40 Path, LineNumber, Line |
  Format-Table -Wrap -AutoSize

Write-Host ""
Write-Host "Done. Provide these to your TrustGov laptop:" -ForegroundColor Green
Write-Host "- Friend IPv4" -ForegroundColor Green
Write-Host "- Bridge Port" -ForegroundColor Green
Write-Host "- Bridge Path (example /submit-integrity)" -ForegroundColor Green
Write-Host "- AWS Region where network exists" -ForegroundColor Green
