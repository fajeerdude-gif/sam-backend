param(
  [string]$Template = '.env.example',
  [string]$Out = '.env'
)

if (-not (Test-Path $Template)) {
  Write-Error "Template file '$Template' not found."
  exit 1
}

if (Test-Path $Out) {
  Write-Host "$Out already exists. Aborting to avoid overwriting." -ForegroundColor Yellow
  exit 0
}

Get-Content $Template | ForEach-Object {
  # replace placeholders with empty values so user must fill them
  $_ -replace '<YOUR_MONGODB_URI_HERE>', '' -replace '<YOUR_JWT_SECRET_HERE>', ''
} | Set-Content $Out -Encoding utf8

Write-Host "Created $Out from $Template. Edit $Out and fill in real values." -ForegroundColor Green
