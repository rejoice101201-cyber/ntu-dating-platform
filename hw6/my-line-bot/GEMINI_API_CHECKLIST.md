# Gemini API 設定檢查清單

## 從您的截圖看到的資訊

✅ **專案已建立**：Line AI Chatbot
✅ **專案 ID**：gen-lang-client-0897209649
✅ **API Key 數量**：1 key
✅ **Quota Tier**：Tier 1（免費層級）
✅ **創建日期**：Nov 18, 2025

## 需要確認的事項

### 1. 取得 API Key

1. 在 Google AI Studio 中，點擊專案 "Line AI Chatbot"
2. 進入專案後，點擊左側選單的 **"Get API key"** 或 **"API Keys"**
3. 如果已有 Key，點擊 **"1 key"** 查看
4. 複製 API Key（格式：`AIzaSy...`）

### 2. 檢查 API Key 權限

在 API Key 設定中確認：
- ✅ 已啟用 Gemini API
- ✅ 沒有 IP 限制（或包含 Vercel 的 IP）
- ✅ 沒有 HTTP referrer 限制

### 3. 確認 Vercel 環境變數

在 Vercel Dashboard 中確認：
1. 前往專案 `hw6-bot`
2. 進入 **Settings** → **Environment Variables**
3. 確認 `GEMINI_API_KEY` 已設定且值正確
4. 格式應該是：`AIzaSy...`（沒有空格或換行）

### 4. 測試 API Key

可以使用以下方式測試：

```bash
# 在本地測試（需要設定 .env.local）
cd my-line-bot
npx tsx test-gemini-models.ts
```

## 常見問題

### Q: Tier 1 配額足夠嗎？
A: Tier 1 是免費層級，通常有：
- 每分鐘 15 次請求（RPM）
- 每天 1,500 次請求（RPD）
- 對於測試和小規模使用應該足夠

### Q: 如何確認 API Key 是否有效？
A: 
1. 在 Google AI Studio 中測試
2. 或使用我們提供的測試腳本
3. 檢查 Vercel 的 Function Logs

### Q: 為什麼會出現 404 錯誤？
A: 可能原因：
1. 模型名稱不正確（已修正為 `gemini-1.5-flash`）
2. API Key 權限不足
3. API 版本問題

## 下一步

1. ✅ 確認 API Key 已複製
2. ✅ 確認 Vercel 環境變數已設定
3. ⏳ 等待部署完成後測試
4. ⏳ 如果仍有問題，檢查 Vercel Function Logs

