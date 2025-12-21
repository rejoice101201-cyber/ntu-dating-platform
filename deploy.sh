#!/bin/bash

# 部署腳本 - 推送到 GitHub 觸發 Vercel 部署

cd "$(dirname "$0")"

echo "🚀 開始部署流程..."
echo ""

# 檢查 git 狀態
echo "📋 檢查 Git 狀態..."
git status --short

echo ""
echo "📦 添加所有更改..."
git add -A

echo ""
echo "💾 提交更改..."
git commit -m "fix: 補齊 Prisma schema 並修復 Vercel 構建問題

- 新增 DailyTopic, Topic, Post, PostLike, Favorite models
- 修復 /api/posts 的 topicId/boardId 更新邏輯
- 優化構建腳本添加 SKIP_ENV_VALIDATION" || echo "⚠️  沒有更改需要提交"

echo ""
echo "📤 推送到 GitHub..."
git push origin main

echo ""
echo "✅ 完成！Vercel 應該會自動檢測到新的推送並開始部署。"
echo "   請前往 Vercel Dashboard 查看部署狀態："
echo "   https://vercel.com/dashboard"

