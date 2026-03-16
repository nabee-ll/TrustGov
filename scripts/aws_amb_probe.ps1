param(
  [string[]]$Regions = @('us-east-1', 'ap-southeast-1', 'eu-west-1', 'ap-south-1')
)

Write-Host "=== AWS Managed Blockchain Probe ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1) Active AWS identity" -ForegroundColor Yellow
aws sts get-caller-identity
if ($LASTEXITCODE -ne 0) {
  Write-Host "AWS credentials are not configured correctly. Run: aws configure" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "2) Checking networks by region" -ForegroundColor Yellow

foreach ($region in $Regions) {
  Write-Host "\n--- Region: $region ---" -ForegroundColor DarkCyan
  $output = aws managedblockchain list-networks --region $region 2>&1

  if ($LASTEXITCODE -ne 0) {
    Write-Host $output -ForegroundColor DarkYellow
    continue
  }

  try {
    $parsed = $output | ConvertFrom-Json
    if (-not $parsed.Networks -or $parsed.Networks.Count -eq 0) {
      Write-Host "No networks found in this region."
      continue
    }

    foreach ($network in $parsed.Networks) {
      Write-Host ("NetworkId: {0} | Name: {1} | Status: {2} | Framework: {3}" -f $network.Id, $network.Name, $network.Status, $network.Framework)
      $detail = aws managedblockchain get-network --region $region --network-id $network.Id 2>&1
      if ($LASTEXITCODE -eq 0) {
        $detailObj = $detail | ConvertFrom-Json
        if ($detailObj.Network.FrameworkAttributes.Fabric) {
          $fabric = $detailObj.Network.FrameworkAttributes.Fabric
          Write-Host ("  Fabric Edition: {0}" -f $fabric.Edition)
        }
      }
    }
  } catch {
    Write-Host $output
  }
}

Write-Host "\nDone." -ForegroundColor Green
Write-Host "If you find a target network, set AWS_REGION and AMB_NETWORK_ID in .env accordingly." -ForegroundColor Green
