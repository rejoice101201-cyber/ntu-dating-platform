# 最終修正說明

## 已完成的修正

### 1. 資料庫連接問題

**問題**：`DATABASE_URL` 環境變數可能格式不正確或未正確載入。

**解決方案**：
- 在 `lib/db/prisma.ts` 中加入自動 fallback 機制
- 如果 `DATABASE_URL` 不存在，自動使用 `POSTGRES_URL`
- 確保 Prisma 可以正確連接資料庫

**驗證**：
- 檢查 Vercel Function Logs，應該不再看到資料庫連接錯誤
- 如果仍有問題，請確認 `POSTGRES_URL` 格式正確

### 2. Gemini API 模型問題

**問題**：所有模型都返回 404 錯誤。

**解決方案**：
- 嘗試使用 `v1` 和 `v1beta` 兩個 API 版本
- 調整模型名稱優先順序（先嘗試不帶 `-latest` 的版本）
- 改善錯誤處理和日誌記錄

**驗證**：
- 檢查 Vercel Function Logs，應該看到：
  - `✅ 使用模型 XXX (v1) 成功` 或
  - `✅ 使用模型 XXX (v1beta) 成功`
- 如果所有模型都失敗，可能需要：
  1. 前往 [Google AI Studio](https://aistudio.google.com/) 查看實際可用的模型
  2. 檢查 API Key 權限
  3. 確認是否需要啟用付費計劃（根據故障排除指南，某些地區可能需要）

## 根據故障排除指南的建議

### 關於 404 錯誤

根據 Google 的故障排除指南：
- **404 NOT_FOUND**：請求的資源未找到
- 可能原因：
  1. 模型名稱不正確
  2. API 版本不支援該模型
  3. API Key 權限不足

### 關於 400 FAILED_PRECONDITION

根據故障排除指南：
- 如果看到 `FAILED_PRECONDITION` 錯誤，表示：
  - Gemini API 免費層級在您的地區不可用
  - 需要在 Google AI Studio 中啟用付費計劃

### 檢查步驟

1. **確認模型名稱**
   - 前往 [models page](https://ai.google.dev/gemini-api/docs/models/gemini)
   - 查看實際可用的模型列表

2. **檢查 API Key 權限**
   - 前往 [Google AI Studio](https://aistudio.google.com/)
   - 確認 API Key 有正確的權限

3. **檢查是否需要付費計劃**
   - 如果所有模型都返回 404 或 400 FAILED_PRECONDITION
   - 可能需要啟用付費計劃

## 目前 Bot 的狀態

即使有這些問題，Bot 仍可正常運作：
- ✅ **腳本回應功能正常**（關鍵字匹配）
- ✅ **降級回應功能正常**（友善的錯誤訊息）
- ⚠️ **LLM 回應暫時無法使用**（等待找出正確的模型名稱或啟用付費計劃）
- ⚠️ **資料庫功能暫時無法使用**（等待修正 DATABASE_URL）

## 下一步

1. **等待部署完成**（約 1-2 分鐘）
2. **測試 Line Bot**：
   - 腳本回應應該正常（例如：發送「地址」）
   - 檢查 Vercel Function Logs 查看 LLM 和資料庫狀態
3. **如果 LLM 仍有問題**：
   - 前往 Google AI Studio 查看實際可用的模型
   - 檢查是否需要啟用付費計劃
   - 或暫時使用腳本回應功能

## 需要協助？

如果問題仍然存在，請提供：
1. Vercel Function Logs 的完整錯誤訊息
2. Google AI Studio 中顯示的可用模型列表
3. API Key 權限設定截圖（隱藏敏感資訊）

