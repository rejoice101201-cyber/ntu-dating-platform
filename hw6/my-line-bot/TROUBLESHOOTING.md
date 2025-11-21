# 問題排查指南

## 問題 1：資料庫連接失敗

### 錯誤訊息
```
Can't reach database server at `7d7558baf8e6b111883181a3d4eb6400f32f7508c6e363ab2397427:5432`
```

### 原因
`DATABASE_URL` 環境變數格式不正確或未設定。

### 解決步驟

1. **前往 Vercel Dashboard**
   - 進入專案 `hw6-bot`
   - Settings → Environment Variables

2. **檢查 `DATABASE_URL`**
   - 如果不存在，需要新增
   - 如果存在但格式不正確，需要修正

3. **新增或修正 `DATABASE_URL`**
   - 方法 1：複製 `POSTGRES_URL`
     - 找到 `POSTGRES_URL` 環境變數
     - 點擊右側的 `...` → `Duplicate`
     - 將新變數名稱改為 `DATABASE_URL`
     - 值保持與 `POSTGRES_URL` 相同
     - Environment: 選擇 `All Environments`
     - 點擊 `Save`
   
   - 方法 2：手動新增
     - 點擊 `Add New`
     - Key: `DATABASE_URL`
     - Value: 貼上與 `POSTGRES_URL` 相同的值
     - Environment: `All Environments`
     - 點擊 `Save`

4. **確認格式**
   - `DATABASE_URL` 應該是完整的連接字串，格式類似：
     ```
     postgres://username:password@host:port/database?sslmode=require
     ```
   - 確保值中沒有多餘的空格或換行符

5. **重新部署**
   - 設定完成後，Vercel 會自動觸發重新部署
   - 或手動前往 Deployments → 點擊最新部署的 `...` → `Redeploy`

### 驗證
部署完成後，檢查 Function Logs：
- 前往 Deployments → 最新的部署
- 點擊 Functions → `/api/webhook`
- 查看 Logs，應該不再有資料庫連接錯誤

---

## 問題 2：所有 Gemini 模型都不可用

### 錯誤訊息
```
所有 Gemini 模型都不可用
```

### 原因
所有測試的模型名稱都返回 404，表示模型名稱不正確。

### 解決步驟

#### 方法 1：在 Google AI Studio 中查看可用模型

1. 前往 [Google AI Studio](https://aistudio.google.com/)
2. 點擊左側選單的 **"Get code"** 或 **"API"**
3. 查看可用的模型列表
4. 記下可用的模型名稱

#### 方法 2：使用本地測試腳本

```bash
cd my-line-bot
npx tsx test-model-direct.ts
```

這個腳本會測試所有常見的模型名稱，並告訴您哪個可用。

#### 方法 3：檢查 API Key 權限

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 確認已啟用 "Generative Language API"
3. 檢查 API Key 的權限設定

### 暫時解決方案

如果 Gemini API 暫時無法使用：
- ✅ **腳本回應功能正常**（關鍵字匹配）
- ✅ **降級回應功能正常**（友善的錯誤訊息）
- ❌ **LLM 回應功能暫時無法使用**

Bot 會自動使用降級模式，使用者仍可獲得基本的客服回應。

---

## 問題 3：如何驗證修正是否成功

### 檢查資料庫連接

1. 發送一個 Line 訊息（例如：「地址」）
2. 檢查 Vercel Function Logs
3. 應該不再看到資料庫連接錯誤

### 檢查 LLM 回應

1. 發送一個 LLM 問題（例如：「我最近皮膚很敏感，不知道適不適合做雷射？」）
2. 檢查 Vercel Function Logs
3. 應該看到：
   - `✅ 使用模型 XXX 成功`（如果找到可用模型）
   - 或 `所有 Gemini 模型都無法使用`（如果所有模型都失敗）

---

## 常見問題

### Q: 資料庫連接失敗會影響 Bot 功能嗎？

A: 不會。Bot 已實作降級模式：
- ✅ 腳本回應功能正常（不依賴資料庫）
- ✅ LLM 回應功能正常（不依賴資料庫）
- ❌ 對話歷史無法儲存
- ❌ 速率限制無法運作

### Q: Gemini API 失敗會影響 Bot 功能嗎？

A: 部分影響：
- ✅ 腳本回應功能正常
- ✅ 降級回應功能正常（友善的錯誤訊息）
- ❌ LLM 回應功能暫時無法使用

### Q: 如何確認環境變數是否正確設定？

A: 檢查 Vercel Function Logs：
- 如果看到 `Environment variable not found: XXX`，表示環境變數未設定
- 如果看到連接錯誤，可能是格式不正確

---

## 需要協助？

如果以上步驟都無法解決問題，請提供：
1. Vercel Function Logs 的完整錯誤訊息
2. 環境變數設定截圖（隱藏敏感資訊）
3. Google AI Studio 中顯示的可用模型列表

