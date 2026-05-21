# Install Apache Maven locally in the project root for this Spring Boot backend.
# Run this from PowerShell in the project folder.

$projectRoot = "C:\Users\Andrew Dizon\Personal-Finance-Budget-Tracker"
Set-Location $projectRoot

$mavenVersion = "3.9.9"
$mavenZip = Join-Path $projectRoot "apache-maven-$mavenVersion-bin.zip"
$mavenDir = Join-Path $projectRoot "apache-maven-$mavenVersion"

if (Test-Path $mavenDir) {
    Write-Host "Apache Maven is already installed at $mavenDir"
    exit 0
}

if (-not (Test-Path $mavenZip)) {
    Write-Host "Downloading Apache Maven $mavenVersion..."
    Invoke-WebRequest -Uri "https://dlcdn.apache.org/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip" -OutFile $mavenZip
}

Write-Host "Extracting Maven..."
Expand-Archive -Path $mavenZip -DestinationPath $projectRoot -Force

Write-Host "Cleaning up..."
Remove-Item $mavenZip -Force

Write-Host "Apache Maven installed at $mavenDir"
Write-Host "Then run .\run-backend.ps1 to start the backend."
