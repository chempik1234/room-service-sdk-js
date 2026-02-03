@echo off
REM Build script for generating protobuf JavaScript files on Windows

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set ROOM_SERVICE_PATH=%PROJECT_ROOT%\..\RoomService
set OUTPUT_DIR=%PROJECT_ROOT%\generated\room_service

echo Building protobuf files...
echo RoomService path: %ROOM_SERVICE_PATH%
echo Output directory: %OUTPUT_DIR%

REM Create output directory if it doesn't exist
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Check if protoc is installed
where protoc >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: protoc is not installed.
    echo Please install Protocol Buffers compiler from:
    echo https://github.com/protocolbuffers/protobuf/releases
    exit /b 1
)

REM Generate protobuf files
echo Generating JavaScript protobuf files...
protoc ^
    -I "%ROOM_SERVICE_PATH%\api" ^
    --js_out=import_style=commonjs,binary:"%OUTPUT_DIR%" ^
    --grpc_out=grpc_js:"%OUTPUT_DIR%" ^
    "%ROOM_SERVICE_PATH%\api\room_service\room_service.proto"

if %ERRORLEVEL% neq 0 (
    echo Error: protoc generation failed
    exit /b 1
)

echo.
echo Protobuf files generated successfully!
echo.
echo Generated files:
dir /b "%OUTPUT_DIR%"

echo.
echo Done!
endlocal
