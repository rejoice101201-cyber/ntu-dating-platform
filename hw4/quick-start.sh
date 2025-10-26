#!/bin/bash

# 咖啡廳探索應用快速啟動腳本
# 一鍵啟動前端和後端服務

echo "🚀 啟動咖啡廳探索應用..."
echo ""

# 檢查是否在正確的目錄
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "cafe-explorer-frontend" ]; then
    echo "❌ 錯誤：請在 hw4 根目錄中執行此腳本"
    echo "   當前目錄：$(pwd)"
    echo "   請執行：cd hw4 && ./quick-start.sh"
    exit 1
fi

# 檢查依賴是否已安裝
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安裝後端依賴..."
    cd backend && npm install && cd ..
fi

if [ ! -d "cafe-explorer-frontend/node_modules" ]; then
    echo "📦 安裝前端依賴..."
    cd cafe-explorer-frontend && npm install && cd ..
fi

# 檢查環境變數檔案
if [ ! -f "backend/.env" ]; then
    echo "⚠️  警告：後端缺少 .env 檔案"
    echo "   請參考 backend/README.md 建立環境變數檔案"
    echo "   需要設定：GOOGLE_SERVER_KEY, JWT_SECRET"
fi

if [ ! -f "cafe-explorer-frontend/.env" ]; then
    echo "⚠️  警告：前端缺少 .env 檔案"
    echo "   請參考 cafe-explorer-frontend/README.md 建立環境變數檔案"
    echo "   需要設定：VITE_GOOGLE_MAPS_JS_KEY"
fi

echo ""
echo "🔄 啟動服務器..."

# 清理可能被占用的端口
echo "🧹 清理端口..."
if command -v ./port-manager.sh >/dev/null 2>&1; then
    ./port-manager.sh free-all >/dev/null 2>&1
    echo "   ✅ 端口已清理"
else
    echo "   ⚠️  port-manager.sh 不存在，跳過端口清理"
fi

# 啟動後端
echo "📡 啟動後端服務器 (端口 3000)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待後端啟動
sleep 3

# 啟動前端
echo "🌐 啟動前端服務器 (端口 5173)..."
cd cafe-explorer-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服務器啟動完成！"
echo ""
echo "📋 服務器資訊："
echo "   🔗 前端: http://localhost:5173"
echo "   🔗 後端: http://localhost:3000"
echo "   📊 健康檢查: http://localhost:3000/health"
echo "   📊 效能監控: http://localhost:3000/api/performance"
echo ""
echo "💡 提示："
echo "   - 使用 Ctrl+C 停止所有服務器"
echo "   - 如果遇到端口衝突，請執行 ./port-manager.sh free-all"
echo "   - 確保已設定 Google Maps API 金鑰"
echo ""

# 等待用戶中斷
trap "echo ''; echo '🛑 停止服務器...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持腳本運行
wait
