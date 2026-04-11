# PowerShell Script to Set CORS for Firebase Storage
# Run this in PowerShell (Admin mode)

$bucketName = "ai-integrated-rice-assistant.firebasestorage.app"
$corsConfig = @"
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-upload-url", "x-goog-upload-protocol", "x-firebase-storage-version"]
  }
]
"@

$corsConfig | Out-File -FilePath cors.json -Encoding utf8

Write-Host "✅ CORS configuration saved to cors.json" -ForegroundColor Green
Write-Host ""
Write-Host "Now you need gsutil to apply this." -ForegroundColor Yellow
Write-Host "Download from: https://cloud.google.com/sdk/docs/install-sdk#windows" -ForegroundColor Yellow
Write-Host ""
Write-Host "After installing gsutil, run:" -ForegroundColor Cyan
Write-Host "gsutil cors set cors.json gs://$bucketName" -ForegroundColor Cyan
