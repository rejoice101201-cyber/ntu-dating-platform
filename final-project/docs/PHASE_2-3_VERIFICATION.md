# Phase 2-3 實作驗證與問題排查

## Phase 2: 每日主題貼文 ✅ 已實作

### 實作內容確認

1. **每日主題區塊顯示**（`app/w/page.tsx` 第 257-276 行）
   - ✅ 條件渲染：`{dailyTopic && (...)}`
   - ✅ 顯示「今日話題」標題
   - ✅ 顯示主題內容
   - ✅ 顯示回應數量

2. **主題發文選項**（`app/w/page.tsx` 第 281-297 行）
   - ✅ 條件渲染：`{dailyTopic && (...)}`
   - ✅ Checkbox 勾選「針對今日話題發文」
   - ✅ 動態 placeholder 文字

3. **自動生成每日主題**（`app/api/daily-topics/route.ts`）
   - ✅ 使用 Gemini API 自動生成
   - ✅ 如果今天沒有主題，GET 時自動生成
   - ✅ 有 fallback 機制（如果 Gemini 失敗）

### 為什麼圖片中沒有顯示？

**原因：** 今天還沒有建立主題，且自動生成功能可能還沒部署

**解決方案：**
1. 設定 `GEMINI_API_KEY` 環境變數
2. 重新部署後，第一次訪問 `/w` 頁面時會自動生成主題
3. 或手動建立：`POST /api/daily-topics` with `{ "title": "你的話題" }`

## Phase 3: 配對解鎖姓名/聊天室 ✅ 已實作

### 實作內容確認

1. **姓名隱藏機制**（`app/api/posts/route.ts` 第 77-116 行）
   - ✅ 檢查配對狀態（雙向檢查 Match 表）
   - ✅ 未配對時：`author.name = null`
   - ✅ 已配對時：`author.name = 真實姓名`
   - ✅ 自己的貼文：直接顯示姓名

2. **前端顯示邏輯**（`app/w/page.tsx` 第 378-385 行）
   - ✅ 未配對時：顯示 "????" 和提示文字
   - ✅ 已配對時：顯示真實姓名

3. **配對/聊天按鈕**（`app/w/page.tsx` 第 392-412 行）
   - ✅ 條件：`post.authorId !== user?.id`（不是自己的貼文）
   - ✅ 已配對：顯示「聊天」按鈕（藍色）
   - ✅ 未配對：顯示「想要配對」按鈕（橘色）

### 為什麼圖片中沒有顯示按鈕？

**可能原因：**
1. **這是用戶自己的貼文**（最可能）
   - 程式碼：`{post.authorId !== user?.id && (...)}`
   - 如果是自己的貼文，不會顯示按鈕（這是正確的行為）

2. **user 狀態沒有正確載入**
   - 檢查 `useAuthStore` 是否正確初始化
   - 檢查 `user?.id` 是否有值

3. **配對狀態檢查有問題**
   - 檢查 API 回傳的 `isMatched` 和 `matchId` 是否正確

### 測試步驟

1. **測試 Phase 2：**
   ```bash
   # 檢查環境變數
   echo $GEMINI_API_KEY
   
   # 訪問 /w 頁面，應該會自動生成主題
   # 或手動建立：
   curl -X POST /api/daily-topics \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "測試話題"}'
   ```

2. **測試 Phase 3：**
   - 用帳號 A 發一篇貼文
   - 用帳號 B 登入，查看帳號 A 的貼文
   - 應該看到 "????" 和「想要配對」按鈕
   - 點擊「想要配對」
   - 用帳號 A 也點擊「想要配對」
   - 應該看到真實姓名和「聊天」按鈕

## 環境變數設定

需要在 Vercel 設定：
- `GEMINI_API_KEY` - Gemini API 金鑰（用於自動生成每日主題）

## 下一步

1. ✅ 已實作 Gemini 自動生成每日主題
2. ⚠️ 需要確認 Phase 3 按鈕顯示問題（可能是自己的貼文，這是正常的）
3. 🔄 可以繼續實作 Phase 4（每日配對上限）
