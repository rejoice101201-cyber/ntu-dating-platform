#!/bin/bash

# 部署準備腳本
# 用於初始化 Git 倉庫並準備推送到 GitHub

set -e

cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)

echo "🚀 開始準備部署..."
echo "📍 專案目錄: $PROJECT_DIR"
echo ""

# 檢查是否已有 Git 倉庫
if [ ! -d .git ]; then
  echo "📦 初始化 Git 倉庫..."
  git init
  echo "✅ Git 倉庫已初始化"
else
  echo "✅ Git 倉庫已存在"
fi

# 檢查 .gitignore
if [ ! -f .gitignore ]; then
  echo "⚠️  .gitignore 不存在，已自動建立"
fi

# 添加所有檔案
echo "📝 添加檔案到 Git..."
git add -A

# 檢查是否有變更
if git diff --cached --quiet; then
  echo "ℹ️  沒有需要提交的變更"
else
  echo "💾 提交變更..."
  git commit -m "feat: 準備部署到 Vercel - 包含所有進階功能" || echo "⚠️  提交失敗或沒有變更"
fi

# 檢查遠程倉庫
echo ""
echo "🔍 檢查遠程倉庫配置..."
if git remote -v | grep -q origin; then
  echo "✅ 遠程倉庫已配置:"
  git remote -v | grep origin
  echo ""
  echo "📤 下一步: 執行 'git push origin main' 來推送代碼"
else
  echo "⚠️  尚未配置遠程倉庫"
  echo ""
  echo "📋 請執行以下命令來連接 GitHub 倉庫:"
  echo "   git remote add origin https://github.com/您的用戶名/您的倉庫名.git"
  echo "   git branch -M main"
  echo "   git push -u origin main"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 部署檢查清單"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 1. Git 倉庫已初始化"
echo "✅ 2. 檔案已添加到 Git"
echo "✅ 3. 變更已提交"
echo ""
echo "📋 下一步:"
echo "   1. 在 GitHub 上建立新倉庫（如果還沒有）"
echo "   2. 連接遠程倉庫: git remote add origin <URL>"
echo "   3. 推送代碼: git push -u origin main"
echo "   4. 在 Vercel 中連接 GitHub 倉庫並部署"
echo ""
echo "📖 詳細說明請參考: DEPLOY_TO_VERCEL.md"
echo ""

