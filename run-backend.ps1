# Run the Spring Boot backend for Personal Finance Budget Tracker
# Usage: Right-click and Run with PowerShell, or execute in PowerShell from the project root.

$projectRoot = "C:\Users\Andrew Dizon\Personal-Finance-Budget-Tracker"
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$localMaven = Join-Path $projectRoot "apache-maven-3.9.9\bin\mvn.cmd"
$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

Set-Location $projectRoot

Write-Host "Using Java from: $javaHome"
& "${javaHome}\bin\java.exe" -version

if (Test-Path $localMaven) {
    Write-Host "Using local Maven at: $localMaven"
    & $localMaven -v
    & $localMaven spring-boot:run -DskipTests
    exit $LASTEXITCODE
}

$mvnCmd = "mvn"
try {
    & $mvnCmd -v | Out-Null
} catch {
    Write-Host "Maven is not found on PATH."
    Write-Host "Run install-maven.ps1 to download a local Maven installation, or install Maven globally." 
    exit 1
}

Write-Host "Starting Spring Boot application with H2 profile..."
& $mvnCmd spring-boot:run -DskipTests -Dspring.profiles.active=h2
