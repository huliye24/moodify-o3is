@echo off
chcp 65001 >nul
echo ========================================
echo    Moodify 数据库同步工具
echo ========================================
echo.

cd /d "%~dp0"

echo 正在同步数据库结构...
npx prisma db push --force-reset

if %errorlevel% neq 0 (
    echo.
    echo 数据库同步失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo 数据库同步完成！
echo.
pause