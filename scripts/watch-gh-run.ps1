param(
  [Parameter(Mandatory = $true)]
  [string]$Repo,

  [Parameter(Mandatory = $true)]
  [long]$RunId,

  [int]$IntervalSeconds = 15,
  [int]$MaxMinutes = 20
)

$ErrorActionPreference = 'Stop'

$runUrl = "https://github.com/$Repo/actions/runs/$RunId"
Write-Host "Watching GitHub Actions run $RunId"
Write-Host $runUrl

$maxIterations = [Math]::Ceiling(($MaxMinutes * 60) / $IntervalSeconds)

for ($i = 0; $i -lt $maxIterations; $i++) {
  $run = gh api "repos/$Repo/actions/runs/$RunId" | ConvertFrom-Json
  $ts = Get-Date -Format 'HH:mm:ss'
  Write-Host "$ts status=$($run.status) conclusion=$($run.conclusion)"

  if ($run.status -eq 'completed') {
    if ($run.conclusion -eq 'success') {
      Write-Host 'Run succeeded'
      exit 0
    }

    Write-Error "Run failed: $($run.conclusion)"
    exit 1
  }

  Start-Sleep -Seconds $IntervalSeconds
}

Write-Error "Timed out after $MaxMinutes minutes. Check: $runUrl"
exit 2
