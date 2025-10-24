# 🚀 快速啟動指南

## 一鍵啟動（推薦）

### 方法 1: 使用 npm 命令
```bash
npm start
# 或
npm run dev
```

### 方法 2: 使用腳本
```bash
./quick-start.sh
```

### 方法 3: 使用原始腳本
```bash
./start-dev.sh
```

## 🔧 其他有用命令

### 停止所有服務器
```bash
npm run stop
```

### 清理端口
```bash
npm run clean
```

### 只啟動後端
```bash
npm run backend
```

### 只啟動前端
```bash
npm run frontend
```

## 📋 服務器資訊

啟動成功後，你可以訪問：

- 🔗 **前端**: http://localhost:5194
- 🔗 **後端**: http://localhost:3000
- 📊 **健康檢查**: http://localhost:3000/health
- 🔐 **API 資訊**: http://localhost:3000/

## ⚠️ 注意事項

1. **第一次啟動**：可能需要安裝依賴
   ```bash
   cd backend && npm install
   cd ../cafe-explorer-frontend && npm install
   ```

2. **端口衝突**：如果遇到端口被占用
   ```bash
   npm run clean  # 清理所有端口
   npm start      # 重新啟動
   ```

3. **停止服務器**：使用 `Ctrl+C` 或 `npm run stop`

## 🎯 最佳實踐

- 使用 `npm start` 一鍵啟動整個應用
- 使用 `npm run stop` 停止所有服務器
- 遇到問題時使用 `npm run clean` 清理端口
