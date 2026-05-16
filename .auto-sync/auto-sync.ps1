param([switch]$Once)
$ErrorActionPreference = "Continue"

$repoPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$remoteUrl = "https://github.com/ldcennanhu/teacher-site.git"
$logDir = $PSScriptRoot
$logFile = Join-Path $logDir "sync.log"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Write-Log {
  param([string]$Message)
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $logFile -Value "[$stamp] $Message"
}

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  $output = & git -c "safe.directory=$repoPath" -C $repoPath @GitArgs 2>&1
  $code = $LASTEXITCODE
  if ($output) {
    Write-Log (($output | Out-String).Trim())
  }
  return $code
}

function Ensure-RemoteHistory {
  & git -c "safe.directory=$repoPath" -C $repoPath rev-parse --verify origin/main *> $null
  if ($LASTEXITCODE -eq 0) {
    return $true
  }

  Write-Log "First setup: fetching repository history from GitHub."
  $tempPath = Join-Path $env:TEMP ("teacher-site-bootstrap-" + [guid]::NewGuid().ToString("N"))
  & git clone $remoteUrl $tempPath *> $null
  if ($LASTEXITCODE -ne 0) {
    Write-Log "Cannot clone GitHub repository. Check network and GitHub login."
    return $false
  }

  $gitPath = Join-Path $repoPath ".git"
  $resolvedRepo = (Resolve-Path $repoPath).Path
  if (-not $resolvedRepo.EndsWith("teacher-site")) {
    Write-Log "Safety check failed. Git metadata was not replaced."
    return $false
  }

  if (Test-Path -LiteralPath $gitPath) {
    Remove-Item -LiteralPath $gitPath -Recurse -Force
  }
  Copy-Item -LiteralPath (Join-Path $tempPath ".git") -Destination $gitPath -Recurse -Force
  Remove-Item -LiteralPath $tempPath -Recurse -Force

  Invoke-Git "config" "user.name" "ldcennanhu" | Out-Null
  Invoke-Git "config" "user.email" "ldcennanhu@users.noreply.github.com" | Out-Null
  Write-Log "First setup complete. Repository history is connected."
  return $true
}

function Sync-Repository {
  Write-Log "Checking website changes."

  if (-not (Ensure-RemoteHistory)) {
    return
  }

  Invoke-Git "config" "user.name" "ldcennanhu" | Out-Null
  Invoke-Git "config" "user.email" "ldcennanhu@users.noreply.github.com" | Out-Null

  Invoke-Git "add" "-A" | Out-Null
  $staged = & git -c "safe.directory=$repoPath" -C $repoPath diff --cached --name-only

  if ($staged) {
    $message = "Auto sync website update " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    $commitCode = Invoke-Git "commit" "-m" $message
    if ($commitCode -ne 0) {
    Write-Log "Commit failed. This sync round stopped."
      return
    }
  } else {
    Write-Log "No new changes to commit."
  }

  Invoke-Git "pull" "--rebase" "origin" "main" | Out-Null
  $pushCode = Invoke-Git "push" "origin" "main"

  if ($pushCode -eq 0) {
    Write-Log "Sync complete. Changes pushed to GitHub."
  } else {
    Write-Log "Push failed. Please check GitHub login or network connection."
  }
}

if ($Once) {
  Write-Log "Manual one-time sync started: $repoPath"
  Sync-Repository
  exit
}

Write-Log "Auto sync service started: $repoPath"

$pending = $true
$lastChange = Get-Date
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$action = {
  $path = $Event.SourceEventArgs.FullPath
  if ($path -match "\\.git\\") { return }
  if ($path -match "\\.auto-sync\\.*\.log$") { return }
  $script:pending = $true
  $script:lastChange = Get-Date
}

Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Created -Action $action | Out-Null
Register-ObjectEvent $watcher Deleted -Action $action | Out-Null
Register-ObjectEvent $watcher Renamed -Action $action | Out-Null

while ($true) {
  Start-Sleep -Seconds 5
  if ($pending -and ((Get-Date) - $lastChange).TotalSeconds -ge 20) {
    $pending = $false
    Sync-Repository
  }
}
