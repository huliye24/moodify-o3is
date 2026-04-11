@echo off
chcp 65001 >nul
title Moodify - 情绪的潮汐

echo.
echo ========================================
echo   🎵 Moodify 播放器启动中...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [2/3] 检查依赖...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [提示] 正在安装 Flask...
    pip install flask flask-cors
)

echo [3/3] 启动服务器...
echo.
echo ========================================
echo   服务器地址: http://127.0.0.1:5000
echo   浏览器打开: moodify_web\index.html
echo ========================================
echo.

start "" "..\moodify_web\index.html"

python server.py

pause
