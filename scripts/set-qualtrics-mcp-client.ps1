[CmdletBinding()]
param(
  [string]$OutPath = ""
)

$ErrorActionPreference = 'Stop'

$scriptDir = if ($PSScriptRoot) {
  $PSScriptRoot
} elseif ($MyInvocation.MyCommand.Path) {
  Split-Path -Parent $MyInvocation.MyCommand.Path
} else {
  (Get-Location).Path
}

if (-not $OutPath) {
  $OutPath = Join-Path $scriptDir "..\.vscode\qualtrics-mcp-client.local.json"
}

function ConvertFrom-SecureStringPlainText {
  param([Security.SecureString]$Secure)

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

$clientId = (Read-Host "Qualtrics OAuth Client ID").Trim()
if (-not $clientId) {
  throw "Client ID is required."
}

$clientSecretSecure = Read-Host "Qualtrics OAuth Client Secret" -AsSecureString
$clientSecret = (ConvertFrom-SecureStringPlainText -Secure $clientSecretSecure).Trim()
if (-not $clientSecret) {
  throw "Client Secret is required."
}

$payload = [ordered]@{
  client_id     = $clientId
  client_secret = $clientSecret
}

$dir = Split-Path -Parent $OutPath
if (-not (Test-Path $dir)) {
  New-Item -ItemType Directory -Path $dir | Out-Null
}

# Write UTF-8 (no BOM) JSON.
$json = ($payload | ConvertTo-Json -Depth 4)
[System.IO.File]::WriteAllText($OutPath, $json, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "✅ Wrote credentials file: $OutPath"
Write-Host "(This file is gitignored.)"
