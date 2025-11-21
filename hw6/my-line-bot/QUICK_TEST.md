# 快速測試指南

## 伺服器狀態

開發伺服器應該已經在背景啟動，請檢查：
- http://localhost:3000
- 或 http://localhost:3001（如果 3000 被占用）

## 測試步驟

### 1. 測試健康檢查端點

在瀏覽器開啟：
```
http://localhost:3000/api/webhook
```

**預期結果**：
```json
{
  "message": "Line Bot Webhook is running",
  "timestamp": "2024-11-21T..."
}
```

### 2. 測試腳本服務

在瀏覽器開啟：
```
http://localhost:3000/api/test
```

**預期結果**：
```json
{
  "status": "success",
  "message": "所有測試通過",
  "results": [
    {
      "input": "地址在哪裡",
      "expected": "clinic_info",
      "matched": "clinic_info",
      "hasResponse": true,
      "responseType": "text",
      "passed": true
    },
    ...
  ]
}
```

### 3. 測試首頁

在瀏覽器開啟：
```
http://localhost:3000
```

應該會看到 Line Bot 的首頁。

## 如果伺服器沒有啟動

手動啟動：
```bash
cd my-line-bot
npm run dev
```

## 檢查伺服器日誌

如果伺服器在背景運行，查看終端輸出確認：
- ✓ Compiled successfully
- Local: http://localhost:3000
- 沒有錯誤訊息

## 常見問題

### Port 被占用
```bash
# 查找占用端口的進程
lsof -i :3000
# 或
lsof -i :3001

# 終止進程
kill -9 <PID>
```

### Lock 檔案問題
```bash
rm -rf .next/dev/lock
```

### 環境變數問題
確認 `.env.local` 檔案存在且包含必要的變數（即使資料庫還沒設定，腳本服務和健康檢查應該也能運作）。

