# 端口管理指南

## 🎯 固定端口配置

你的專案現在使用固定端口，避免端口衝突：

- **前端**: `http://localhost:5194` (固定)
- **後端**: `http://localhost:3000` (固定)

## 🔧 端口管理工具

### 1. 檢查端口狀態
```bash
./port-manager.sh check
```

### 2. 釋放主要端口
```bash
./port-manager.sh free
```

### 3. 釋放所有相關端口
```bash
./port-manager.sh free-all
```

## 🚀 啟動應用

### 方法 1: 使用啟動腳本（推薦）
```bash
./start-dev.sh
```

### 方法 2: 手動啟動
```bash
# 後端
cd backend && npm run dev

# 前端（新終端）
cd cafe-explorer-frontend && npm run dev
```

## ⚠️ 端口衝突解決方案

### 如果端口 5194 被占用：

1. **檢查占用進程**:
   ```bash
   lsof -i :5194
   ```

2. **釋放端口**:
   ```bash
   ./port-manager.sh free
   ```

3. **重新啟動**:
   ```bash
   ./start-dev.sh
   ```

### 如果端口 3000 被占用：

1. **檢查後端進程**:
   ```bash
   ps aux | grep "ts-node src/index.ts"
   ```

2. **停止後端**:
   ```bash
   pkill -f "ts-node src/index.ts"
   ```

3. **重新啟動**:
   ```bash
   cd backend && npm run dev
   ```

## 📋 Vite 配置說明

前端已配置 `strictPort: true`，這意味著：
- ✅ 如果端口 5194 可用，直接使用
- ❌ 如果端口被占用，會報錯而不自動切換到其他端口
- 🔧 需要手動釋放端口後重新啟動

## 🎯 最佳實踐

1. **正確停止服務器**: 使用 `Ctrl+C` 而不是直接關閉終端
2. **定期清理**: 使用 `./port-manager.sh free-all` 清理所有端口
3. **檢查狀態**: 使用 `./port-manager.sh check` 檢查端口狀態
4. **使用啟動腳本**: `./start-dev.sh` 會自動處理端口衝突

## 🔍 故障排除

### 問題: "Port 5194 is in use"
**解決方案**:
```bash
./port-manager.sh free
./start-dev.sh
```

### 問題: CORS 錯誤
**解決方案**: 後端已配置多個端口，包括 5194、5173-5175 等

### 問題: 前端無法連接後端
**檢查**:
1. 後端是否在端口 3000 運行
2. 前端是否在端口 5194 運行
3. CORS 配置是否正確

## 📞 服務器資訊

- 🔗 **前端**: http://localhost:5194
- 🔗 **後端**: http://localhost:3000
- 📊 **健康檢查**: http://localhost:3000/health
- 🔐 **API 資訊**: http://localhost:3000/
