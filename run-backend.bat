@echo off
set "PROJECT_ROOT=C:\Users\Andrew Dizon\Personal-Finance-Budget-Tracker"
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
set "LOCAL_MAVEN=%PROJECT_ROOT%\apache-maven-3.9.9\bin\mvn.cmd"
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d "%PROJECT_ROOT%"

echo Using Java from %JAVA_HOME%
"%JAVA_HOME%\bin\java.exe" -version

if exist "%LOCAL_MAVEN%" (
  echo Using local Maven wrapper at %LOCAL_MAVEN%
  call "%LOCAL_MAVEN%" -v
  if errorlevel 1 (
    echo Local Maven failed to execute.
    exit /b 1
  )
  echo Starting Spring Boot application with H2 profile...
  call "%LOCAL_MAVEN%" spring-boot:run -DskipTests -Dspring.profiles.active=h2
  exit /b %ERRORLEVEL%
)

mvn -v
if errorlevel 1 (
  echo Maven is not installed or not on PATH.
  echo Run install-maven.ps1 to download a local Maven installation, or install Maven globally and retry.
  exit /b 1
)

echo Starting Spring Boot application with H2 profile...
mvn spring-boot:run -DskipTests -Dspring.profiles.active=h2
