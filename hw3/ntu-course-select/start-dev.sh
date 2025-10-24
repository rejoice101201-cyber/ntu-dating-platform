#!/bin/bash

# 進入項目目錄
cd /home/denny/下載/網路服務程式設計/wp1141/hw3/ntu-course-select

# 檢查端口5173是否被占用
if lsof -i :5173 > /dev/null 2>&1; then
    echo "端口5173被占用，正在終止舊進程..."
    # 找到並終止占用端口的Node.js進程
    PIDS=$(lsof -ti :5173)
    for PID in $PIDS; do
        if ps -p $PID -o comm= | grep -q node; then
            echo "終止進程 $PID"
            kill -9 $PID
        fi
    done
    sleep 2
fi

echo "啟動開發服務器..."
npm run dev
