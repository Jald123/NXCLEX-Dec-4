# Set the Node.js path
$nodePath = "C:\Users\haldhaher\Desktop\nclex-ngn-platform\nodejs\node-v20.11.0-win-x64"
$env:PATH = "$nodePath;$env:PATH"

Write-Host "Starting Admin Dashboard on port 3000..." -ForegroundColor Green
Write-Host "Starting Student Portal on port 3001..." -ForegroundColor Green
Write-Host ""

# Start Admin Dashboard in background
$adminJob = Start-Job -ScriptBlock {
    param($nodePath, $projectPath)
    $env:PATH = "$nodePath;$env:PATH"
    Set-Location "$projectPath\apps\admin-dashboard"
    & "$nodePath\npm.cmd" run dev
} -ArgumentList $nodePath, "C:\Users\haldhaher\Desktop\nclex-ngn-platform"

# Wait a moment
Start-Sleep -Seconds 2

# Start Student Portal in background  
$studentJob = Start-Job -ScriptBlock {
    param($nodePath, $projectPath)
    $env:PATH = "$nodePath;$env:PATH"
    Set-Location "$projectPath\apps\student-portal"
    & "$nodePath\npm.cmd" run dev
} -ArgumentList $nodePath, "C:\Users\haldhaher\Desktop\nclex-ngn-platform"

Write-Host "Servers starting..." -ForegroundColor Yellow
Write-Host "Admin Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Student Portal: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Monitor the jobs
try {
    while ($true) {
        $adminOutput = Receive-Job -Job $adminJob -ErrorAction SilentlyContinue
        $studentOutput = Receive-Job -Job $studentJob -ErrorAction SilentlyContinue
        
        if ($adminOutput) { Write-Host "[ADMIN] $adminOutput" }
        if ($studentOutput) { Write-Host "[STUDENT] $studentOutput" }
        
        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host "`nStopping servers..." -ForegroundColor Red
    Stop-Job -Job $adminJob, $studentJob
    Remove-Job -Job $adminJob, $studentJob
}
