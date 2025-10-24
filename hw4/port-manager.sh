#!/bin/bash

# 端口管理腳本
# 用於檢查和釋放被占用的端口

echo "🔍 端口管理工具"
echo "================"

# 檢查常用端口
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo "❌ 端口 $port 被占用:"
        lsof -i :$port
        return 1
    else
        echo "✅ 端口 $port 可用"
        return 0
    fi
}

# 釋放端口
free_port() {
    local port=$1
    echo "🔧 正在釋放端口 $port..."
    PIDS=$(lsof -ti :$port)
    if [ -n "$PIDS" ]; then
        for pid in $PIDS; do
            echo "   殺死進程 PID: $pid"
            kill -9 $pid 2>/dev/null
        done
        sleep 1
        if lsof -i :$port > /dev/null 2>&1; then
            echo "❌ 無法釋放端口 $port"
            return 1
        else
            echo "✅ 端口 $port 已釋放"
            return 0
        fi
    else
        echo "✅ 端口 $port 未被占用"
        return 0
    fi
}

# 主菜單
case "$1" in
    "check")
        echo "檢查端口狀態..."
        check_port 3000  # 後端
        check_port 5194  # 前端
        ;;
    "free")
        echo "釋放端口..."
        free_port 3000
        free_port 5194
        ;;
    "free-all")
        echo "釋放所有相關端口..."
        for port in 3000 5173 5174 5175 5180 5183 5194; do
            free_port $port
        done
        ;;
    *)
        echo "用法: $0 {check|free|free-all}"
        echo ""
        echo "  check     - 檢查端口狀態"
        echo "  free      - 釋放主要端口 (3000, 5194)"
        echo "  free-all  - 釋放所有相關端口"
        echo ""
        echo "範例:"
        echo "  $0 check"
        echo "  $0 free"
        echo "  $0 free-all"
        ;;
esac
