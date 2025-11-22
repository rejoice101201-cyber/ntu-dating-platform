# Bottender 遷移後部署指南

## ✅ 已完成的工作

1. **遷移到 Bottender 框架**
   - 從 `@line/bot-sdk` 遷移到 `bottender@1.5.5`
   - 建立新的 webhook 路由：`/api/webhooks/line`
   - 實作多語系支援（繁體中文 + 英文）

2. **優化功能**
   - 關鍵字匹配系統（章節式組織）
   - Quick Replies 設計
   - Carousel Template 展示服務項目
   - 保留所有現有功能（資料庫、LLM、速率限制）

## 🚀 部署到 Vercel 的步驟

### 1. 確認環境變數

在 Vercel 專案設定中，確認以下環境變數已設定：

```
LINE_CHANNEL_ACCESS_TOKEN=你的_ACCESS_TOKEN
LINE_CHANNEL_SECRET=你的_CHANNEL_SECRET
GEMINI_API_KEY=你的_GEMINI_API_KEY
DATABASE_URL=你的_DATABASE_URL
POSTGRES_URL=你的_POSTGRES_URL（如果 DATABASE_URL 不存在）
```

**重要**：確保 `LINE_CHANNEL_ACCESS_TOKEN` 和 `LINE_CHANNEL_SECRET` 使用正確的環境變數名稱（與 `bottender.config.js` 中的一致）。

### 2. 更新 Line Webhook URL

在 **Line Developers Console** 中：

1. 前往你的 Messaging API Channel
2. 進入 **Messaging API** 設定頁面
3. 更新 **Webhook URL** 為：
   ```
   https://你的-vercel-網址.vercel.app/api/webhooks/line
   ```
   ⚠️ **注意**：路徑已從 `/api/webhook` 改為 `/api/webhooks/line`

4. 點擊 **Verify** 測試連線
5. 啟用 **Use webhook**

### 3. 確認 Vercel 部署

1. 前往 Vercel Dashboard
2. 確認最新的部署已完成
3. 檢查部署日誌，確認：
   - ✅ Prisma Client 已生成
   - ✅ 資料庫表已建立
   - ✅ Next.js 建置成功

### 4. 測試 Bot

1. 在 Line 中發送訊息給你的 Bot
2. 測試以下功能：
   - ✅ 歡迎訊息（Follow 事件）
   - ✅ 關鍵字匹配（例如：發送「地址」、「服務」）
   - ✅ Quick Replies
   - ✅ Carousel Template（發送「更多資訊」）
   - ✅ 語言切換（發送「切換語言」）
   - ✅ LLM 回應（發送任意問題）

## 📝 重要變更

### Webhook 路徑變更
- **舊路徑**：`/api/webhook`
- **新路徑**：`/api/webhooks/line`

### 環境變數名稱
Bottender 使用以下環境變數（與舊版本相同）：
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

### 程式碼結構
- Bot 邏輯：`bot/index.ts`
- 事件處理：`lib/bot/eventHandler.ts`
- 路由：`lib/bot/router.ts`
- 腳本服務：`lib/bot/scriptService.ts`
- 多語系內容：`lib/i18n/sections.ts`

## 🔍 故障排除

### 問題：Bot 沒有回應

1. **檢查 Webhook URL**
   - 確認 Line Developers Console 中的 Webhook URL 正確
   - 確認已啟用 "Use webhook"

2. **檢查環境變數**
   - 在 Vercel Dashboard 中確認所有環境變數已設定
   - 確認變數名稱正確（大小寫敏感）

3. **檢查 Vercel 日誌**
   - 前往 Vercel Dashboard → Deployments → 最新部署 → Logs
   - 查看是否有錯誤訊息

### 問題：建置失敗

1. **Prisma 錯誤**
   - 確認 `DATABASE_URL` 已設定
   - 確認資料庫連接正常

2. **Bottender 錯誤**
   - 確認 `LINE_CHANNEL_ACCESS_TOKEN` 和 `LINE_CHANNEL_SECRET` 已設定
   - 確認 `bottender.config.js` 配置正確

### 問題：Bot 回應但功能異常

1. **檢查資料庫連接**
   - 確認 `DATABASE_URL` 正確
   - 確認資料庫表已建立（`prisma db push` 應在 build 時自動執行）

2. **檢查 LLM 服務**
   - 確認 `GEMINI_API_KEY` 已設定
   - 查看 Vercel 日誌中的 LLM 錯誤訊息

## 📚 相關文件

- [Bottender 官方文件](https://bottender.js.org/)
- [Line Messaging API 文件](https://developers.line.biz/en/docs/messaging-api/)
- [Vercel 部署文件](https://vercel.com/docs)

## 🎉 完成！

部署完成後，你的 Line Bot 應該可以正常運作，並支援：
- ✅ 多語系（繁體中文 + 英文）
- ✅ 關鍵字匹配
- ✅ Quick Replies
- ✅ Carousel Template
- ✅ LLM 智能回應
- ✅ 資料庫儲存對話記錄

