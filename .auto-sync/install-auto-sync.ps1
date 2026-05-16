$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "auto-sync.ps1"
$taskName = "TeacherSiteAutoSync"
$powershell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

$action = New-ScheduledTaskAction -Execute $powershell -Argument $arguments
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Days 30)

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Auto sync teacher site to GitHub" -Force | Out-Null

Start-ScheduledTask -TaskName $taskName
Write-Host "Done: teacher-site will auto sync to GitHub after Windows login."
