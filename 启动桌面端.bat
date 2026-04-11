@echo off
chcp 65001 >nul
title Moodify 桌面端

echo.
echo    ██████╗ ███████╗███╗   ██╗ ██████╗ ██╗   ██╗███████╗███████╗
echo    ██╔══██╗██╔════╝████╗  ██║██╔════╝ ██║   ██║██╔════╝██╔════╝
echo    ██████╔╝█████╗  ██╔██╗ ██║██║  ███╗██║   ██║█████╗  ███████╗
echo    ██╔══██╗██╔══╝  ██║╚██╗██║██║   ██║██║   ██║██╔══╝  ╚════██║
echo    ██║  ██║███████╗██║ ╚████║╚██████╔╝╚██████╔╝███████╗███████║
echo    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
echo.
echo    情绪的潮汐，终将抵达彼岸
echo.

REM 获取当前脚本所在目录
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM 检查 Electron 是否安装
where electron >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Electron，请先安装 Node.js 和 Electron
    echo.
    echo 安装步骤：
    echo   1. 安装 Node.js: https://nodejs.org/
    echo   2. 运行: npm install
    echo   3. 再次运行此脚本
    echo.
    pause
    exit /b 1
)

REM 检查桌面端主文件
if not exist "desktop\main.js" (
    echo [错误] 未找到 desktop\main.js
    pause
    exit /b 1
)

echo [启动中] 正在启动 Moodify 桌面端...
echo.

REM 启动 Electron
electron desktop\main.js

REM 如果 Electron 退出，显示提示
if %errorlevel% neq 0 (
    echo.
    echo [提示] Moodify 已关闭
)

pause
