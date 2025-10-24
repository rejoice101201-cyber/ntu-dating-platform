#!/bin/bash

# 一鍵啟動腳本 - 同時啟動後端和前端

echo "🚀 一鍵啟動咖啡廳探索應用..."
echo ""

# 停止現有的服務器
echo "🔄 停止現有服務器..."
pkill -f "ts-node src/index.ts" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# 釋放端口
echo "🔧 釋放端口..."
./port-manager.sh free > /dev/null 2>&1

# 啟動後端（背景運行）
echo "🔄 啟動後端服務器..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待後端啟動
echo "⏳ 等待後端啟動..."
sleep 5

# 檢查後端是否成功啟動
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ 後端服務器已啟動 (PID: $BACKEND_PID)"
else
    echo "❌ 後端啟動失敗"
    exit 1
fi

# 啟動前端（前台運行）
echo "🔄 啟動前端服務器..."
cd cafe-explorer-frontend
npm run dev
