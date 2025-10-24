#!/bin/bash

# 咖啡廳探索應用開發環境啟動腳本
# 固定端口：前端 5173，後端 3000

echo "🚀 啟動咖啡廳探索應用開發環境..."
echo ""

# 檢查端口 5173 是否被占用
if lsof -i :5173 > /dev/null 2>&1; then
    echo "⚠️  端口 5173 被占用，正在釋放..."
    PIDS=$(lsof -ti :5173)
    for pid in $PIDS; do
        echo "   殺死進程 PID: $pid"
        kill -9 $pid 2>/dev/null
    done
    sleep 2
    echo "✅ 端口 5173 已釋放"
fi

# 檢查後端是否已在運行
if pgrep -f "ts-node src/index.ts" > /dev/null; then
    echo "✅ 後端服務器已在運行 (端口 3000)"
else
    echo "🔄 啟動後端服務器..."
    cd backend
    npm run dev &
    cd ..
    sleep 3
    echo "✅ 後端服務器已啟動 (端口 3000)"
fi

echo ""
echo "📋 服務器資訊："
echo "   🔗 前端: http://localhost:5173"
echo "   🔗 後端: http://localhost:3000"
echo "   📊 健康檢查: http://localhost:3000/health"
echo "   📊 效能監控: http://localhost:3000/api/performance"
echo ""
echo "💡 提示："
echo "   - 前端會自動在端口 5173 啟動"
echo "   - 如果端口被占用，請手動停止其他服務"
echo "   - 使用 Ctrl+C 停止服務器"
echo "   - 右下角有效能監控儀表板"
echo ""

# 啟動前端
echo "🔄 啟動前端服務器..."
cd cafe-explorer-frontend
npm run dev
