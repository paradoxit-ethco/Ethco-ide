@echo off
cd /d "%~dp0"
call npx vite build
if %errorlevel% neq 0 goto err
"node_modules\electron\dist\electron.exe" .
if %errorlevel% neq 0 goto err
goto end
:err
echo.
echo Build or launch failed. Check above for errors.
pause
:end
