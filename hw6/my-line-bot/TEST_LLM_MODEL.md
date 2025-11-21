# 測試 LLM 模型名稱

## 問題

從 Google AI Studio 的統計圖表可以看到：
- ✅ API Key 正在使用（有 6 次請求）
- ❌ 所有請求都返回 404（模型不存在）

## 解決方案

我已經更新了程式碼，現在會自動嘗試多個模型名稱：

1. `gemini-1.5-flash-latest` (最新版本)
2. `gemini-1.5-pro-latest`
3. `gemini-1.5-flash`
4. `gemini-1.5-pro`
5. `gemini-1.0-pro-latest`
6. `gemini-1.0-pro`
7. `gemini-pro`

## 測試方法

### 方法 1：本地測試（推薦）

在本地執行測試腳本，找出可用的模型：

```bash
cd my-line-bot
npx tsx test-model-direct.ts
```

這個腳本會：
- 測試所有常見的模型名稱
- 告訴您哪個模型可用
- 如果找到可用模型，會顯示建議的程式碼更新

### 方法 2：等待部署後測試

1. 等待 Vercel 部署完成（約 1-2 分鐘）
2. 在 Line 中發送一個 LLM 問題（例如：「我最近皮膚很敏感，不知道適不適合做雷射？」）
3. 檢查 Vercel Function Logs：
   - 前往 Vercel Dashboard → 專案 `hw6-bot`
   - 點擊 **Deployments** → 最新的部署
   - 點擊 **Functions** → `/api/webhook`
   - 查看 Logs，應該會看到類似：
     ```
     嘗試使用模型: gemini-1.5-flash-latest
     模型 gemini-1.5-flash-latest 不可用 (404)，嘗試下一個模型...
     嘗試使用模型: gemini-1.5-pro-latest
     ✅ 使用模型 gemini-1.5-pro-latest 成功
     ```

### 方法 3：在 Google AI Studio 中查看

1. 前往 [Google AI Studio](https://aistudio.google.com/)
2. 點擊左側選單的 **"Get code"** 或 **"API"**
3. 查看可用的模型列表
4. 或直接測試模型名稱

## 如果所有模型都失敗

如果所有模型都返回 404，可能的原因：

1. **API Key 權限不足**
   - 檢查 Google Cloud Console 中的 API 權限
   - 確認已啟用 "Generative Language API"

2. **模型名稱格式不正確**
   - 可能需要使用不同的格式（例如：`models/gemini-1.5-flash`）
   - 或需要特定的 API 版本

3. **API 配額問題**
   - 檢查 Google AI Studio 中的配額設定

## 下一步

1. ✅ 程式碼已更新並推送
2. ⏳ 等待 Vercel 部署完成
3. ⏳ 測試 LLM 回應
4. ⏳ 如果仍有問題，執行本地測試腳本找出可用模型

