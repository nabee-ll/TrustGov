Write-Host "=== TrustGov Local Verification ===" -ForegroundColor Cyan
Write-Host ""

$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
  Write-Host ".env not found at $envFile" -ForegroundColor Red
  exit 1
}

$envText = Get-Content $envFile -Raw
$fabricUrl = [regex]::Match($envText, 'FABRIC_SUBMIT_URL\s*=\s*"([^"]*)"').Groups[1].Value
$fabricKey = [regex]::Match($envText, 'FABRIC_SUBMIT_API_KEY\s*=\s*"([^"]*)"').Groups[1].Value

Write-Host "1) Health endpoint check" -ForegroundColor Yellow
node -e "fetch('http://localhost:3000/api/health').then(r=>r.json()).then(j=>console.log(JSON.stringify(j,null,2))).catch(e=>{console.error(e.message);process.exit(1);})"
if ($LASTEXITCODE -ne 0) {
  Write-Host "TrustGov server is not reachable on port 3000. Start it with npm run dev." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "2) Fabric URL in .env" -ForegroundColor Yellow
if ([string]::IsNullOrWhiteSpace($fabricUrl)) {
  Write-Host "FABRIC_SUBMIT_URL is missing in .env" -ForegroundColor Red
} else {
  Write-Host "FABRIC_SUBMIT_URL: $fabricUrl" -ForegroundColor Green
}

if (-not [string]::IsNullOrWhiteSpace($fabricUrl)) {
  Write-Host ""
  Write-Host "3) Bridge API test" -ForegroundColor Yellow
  $headers = @{}
  if (-not [string]::IsNullOrWhiteSpace($fabricKey)) {
    $headers['x-api-key'] = $fabricKey
  }

  $body = @{
    userId = 'TG-99999'
    serviceId = 'tax'
    timestamp = (Get-Date).ToString('o')
    hash = 'abc123'
  } | ConvertTo-Json

  try {
    $result = Invoke-RestMethod -Method Post -Uri $fabricUrl -Headers $headers -ContentType 'application/json' -Body $body
    $result | ConvertTo-Json -Depth 5
  } catch {
    Write-Host "Bridge API call failed: $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "4) Latest service_requests from MongoDB" -ForegroundColor Yellow
node -e "const { MongoClient } = require('mongodb'); require('dotenv').config(); (async()=>{ const c=new MongoClient(process.env.MONGO_URI); await c.connect(); const db=c.db(process.env.MONGO_DB_NAME||'trustgov'); const docs=await db.collection(process.env.SERVICE_REQUESTS_COLLECTION||'service_requests').find({}).sort({timestamp:-1}).limit(3).toArray(); console.log(JSON.stringify(docs,null,2)); await c.close(); })().catch(e=>{ console.error(e.message); process.exit(1); });"

Write-Host ""
Write-Host "Done. PASS when blockchainTxId in latest request is a real Fabric txId from your bridge response." -ForegroundColor Green
