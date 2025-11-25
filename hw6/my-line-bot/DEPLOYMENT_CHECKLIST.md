# 部署檢查清單

## 測試結果問題分析

根據測試結果，發現兩個問題：

### ❌ 問題 1: 健康檢查端點返回 HTML（404）
- **錯誤**: `回應不是 JSON 格式 (Content-Type: text/html; charset=utf-8)`
- **原因**: `/api/health` 路由可能沒有正確部署到 Vercel
- **狀態**: 本地代碼已包含 `app/api/health/route.ts`

### ❌ 問題 2: 效能統計缺少 performance 欄位
- **錯誤**: `回應中沒有 performance 欄位`
- **原因**: Vercel 上部署的版本可能還沒有包含最新的代碼更新
- **狀態**: 本地代碼已包含 `performance` 欄位（`app/api/admin/stats/route.ts` 第 77-82 行）

### ✅ 內容搜尋功能
- **狀態**: 所有搜尋測試通過 ✅

## 解決步驟

### 步驟 1: 確認所有檔案已提交

```bash
cd /home/denny/下載/網路服務程式設計/wp1141/hw6/my-line-bot
git status
git add -A
git commit -m "feat: 確保所有進階功能代碼已提交"
git push origin main
```

### 步驟 2: 檢查 Vercel 部署狀態

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇 `hw6-bot` 專案
3. 檢查最新的部署狀態
4. 確認部署日誌中沒有錯誤

### 步驟 3: 等待部署完成

- Vercel 通常會在推送後 1-2 分鐘內自動部署
- 可以在 Vercel Dashboard 查看部署進度

### 步驟 4: 重新測試

部署完成後，執行：

```bash
npm run test-features https://hw6-bot.vercel.app
```

## 預期修正後的結果

修正後，測試應該顯示：

1. ✅ 健康檢查端點正常返回 JSON
   - 狀態碼: 200 或 503
   - Content-Type: application/json
   - 包含 `status`, `checks`, `timestamp` 欄位

2. ✅ 效能統計包含 `performance` 欄位
   - `avgResponseTime`: 平均回應時間
   - `slowQueries`: 慢查詢數量
   - `recentResponseTimes`: 最近回應時間陣列
   - `sampleSize`: 樣本數量

3. ✅ 內容搜尋功能正常（已通過）

## 手動驗證（使用 Node.js）

如果 `curl` 不可用，可以使用 Node.js 驗證：

```bash
# 使用測試腳本驗證
npm run test-features https://hw6-bot.vercel.app

# 或使用驗證腳本
npx tsx scripts/verify-deployment.ts
```

## 如果問題仍然存在

如果重新部署後問題仍然存在，請檢查：

1. **Vercel 構建日誌**：確認構建過程中沒有錯誤
2. **環境變數**：確認所有必要的環境變數都已設定
3. **路由配置**：確認 `vercel.json` 沒有阻擋 API 路由
4. **Next.js 版本**：確認 Next.js 版本支援 App Router

## 相關檔案

- `app/api/health/route.ts` - 健康檢查端點
- `app/api/admin/stats/route.ts` - 統計 API（包含 performance 欄位）
- `app/api/admin/messages/route.ts` - 訊息 API（包含 search 參數）
- `scripts/test-features.ts` - 測試腳本
- `scripts/verify-deployment.ts` - 部署驗證腳本

