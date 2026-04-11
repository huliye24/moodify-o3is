#!/bin/bash
# ============================================
# Moodify 阿里云服务器端自动拉取脚本
# 放置位置: /root/auto-pull.sh
# 使用方法: ./auto-pull.sh
# ============================================

REPO_URL="https://github.com/huliye24/moodify.git"
REPO_PATH="/www/wwwroot/moodify"
BRANCH="main"

echo "========================================"
echo "  Moodify 自动拉取脚本"
echo "========================================"
echo "仓库: $REPO_URL"
echo "路径: $REPO_PATH"
echo ""

# 进入项目目录
cd $REPO_PATH || {
    echo "错误: 无法进入目录 $REPO_PATH"
    echo "正在克隆仓库..."
    mkdir -p $REPO_PATH
    cd $REPO_PATH
    git clone $REPO_URL $REPO_PATH
}

echo "[1/3] 切换到项目目录..."
cd $REPO_PATH
pwd

echo ""
echo "[2/3] 拉取最新代码..."
git fetch --all
git reset --hard origin/$BRANCH

echo ""
echo "[3/3] 安装依赖（如果需要）..."
if [ -f "package.json" ]; then
    npm install
fi

if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
fi

echo ""
echo "========================================"
echo "  拉取完成！"
echo "========================================"
echo ""
echo "项目路径: $REPO_PATH"
echo "最近更新:"
ls -lt $REPO_PATH | head -5
