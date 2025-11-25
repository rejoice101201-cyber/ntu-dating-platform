# Gemini API 診斷結果

## 執行時間
2025-11-20

## 診斷結果摘要

### ✅ 找到可用的模型！

**API 版本**: `v1beta`  
**模型名稱**: `gemini-2.0-flash-exp`

### 詳細測試結果

#### v1 API 版本
- ❌ 所有模型都返回 404（模型不存在）
- 包括：gemini-2.5-pro, gemini-2.5-flash, gemini-1.5-flash, gemini-1.5-pro 等

#### v1beta API 版本
- ✅ **gemini-2.0-flash-exp**: 可用！
- ⚠️ **gemini-2.5-pro**: 返回 429（配額用盡，但模型存在）
- ⚠️ **gemini-2.5-flash**: 返回 429（配額用盡，但模型存在）
- ❌ 其他模型返回 404

### 重要發現

1. **v1 API 版本不可用**
   - 所有測試的模型在 v1 版本都返回 404
   - 必須使用 v1beta API 版本

2. **gemini-2.0-flash-exp 可用**
   - 這是目前唯一確認可用的模型
   - 使用 v1beta API 版本
   - 回應正常（測試回應：你好！很高兴与你交流。有什么我可以帮助你的吗？）

3. **gemini-2.5 系列存在但配額用盡**
   - gemini-2.5-pro 和 gemini-2.5-flash 返回 429
   - 這表示模型存在，但當前配額已用盡
   - 可以保留在模型列表中，作為未來可用的選項

## 已完成的修正

### 1. 更新模型優先順序

```typescript
const modelsToTry = [
  'gemini-2.0-flash-exp',  // ✅ 已確認可用（v1beta）
  'gemini-2.5-pro',        // 存在但可能配額用盡（429）
  'gemini-2.5-flash',      // 存在但可能配額用盡（429）
  'gemini-1.5-flash',      // 備用
  'gemini-1.5-pro',        // 備用
  'gemini-1.0-pro',        // 備用
  'gemini-pro',            // 備用
];
```

### 2. 優先使用 v1beta API 版本

```typescript
const apiVersions = ['v1beta', 'v1'];
```

### 3. 改善錯誤處理

- 處理 400 FAILED_PRECONDITION（可能需要付費計劃）
- 處理 403 PERMISSION_DENIED（API Key 權限不足）
- 處理 429 RATE_LIMIT（配額用盡時嘗試其他模型）

## 下一步

1. ✅ 程式碼已更新並推送
2. ⏳ 等待 Vercel 部署完成
3. ⏳ 測試 Line Bot 的 LLM 回應
4. ⏳ 檢查 Function Logs 確認使用正確的模型

## 驗證方法

部署完成後，在 Line 中發送一個 LLM 問題（例如：「我最近皮膚很敏感，不知道適不適合做雷射？」），然後檢查 Vercel Function Logs：

應該看到：
```
嘗試使用模型: gemini-2.0-flash-exp
✅ 使用模型 gemini-2.0-flash-exp (v1beta) 成功
```

## 參考文件

- [Gemini API 故障排除指南](https://ai.google.dev/gemini-api/docs/troubleshooting?hl=zh-tw#check-api)
- [Gemini API 模型列表](https://ai.google.dev/gemini-api/docs/models/gemini)




