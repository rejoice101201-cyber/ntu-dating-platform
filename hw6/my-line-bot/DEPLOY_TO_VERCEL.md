# 部署到 Vercel 指南

## 問題診斷

根據您的情況，Vercel 上沒有部署，這可能是因為：

1. **Git 倉庫未初始化**：專案可能還沒有初始化 Git 倉庫
2. **代碼未推送到 GitHub**：即使有 Git 倉庫，代碼可能還沒有推送到遠程倉庫
3. **Vercel 未連接到 GitHub**：Vercel 專案可能沒有連接到正確的 GitHub 倉庫

## 解決步驟

### 步驟 1: 初始化 Git 倉庫（如果尚未初始化）

```bash
cd /home/denny/下載/網路服務程式設計/wp1141/hw6/my-line-bot
git init
git add -A
git commit -m "feat: 初始提交 - 包含所有進階功能"
```

### 步驟 2: 連接到 GitHub 倉庫

#### 選項 A: 使用現有的 GitHub 倉庫

如果您已經有 GitHub 倉庫，連接它：

```bash
git remote add origin https://github.com/您的用戶名/您的倉庫名.git
git branch -M main
git push -u origin main
```

#### 選項 B: 建立新的 GitHub 倉庫

1. 前往 [GitHub](https://github.com/new) 建立新倉庫
2. 複製倉庫 URL
3. 執行：

```bash
git remote add origin https://github.com/您的用戶名/您的倉庫名.git
git branch -M main
git push -u origin main
```

### 步驟 3: 在 Vercel 中連接 GitHub 倉庫

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New Project"
3. 選擇您的 GitHub 倉庫
4. 配置專案設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: `my-line-bot`（如果倉庫在子目錄中）
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. 添加環境變數：
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `GEMINI_API_KEY`
   - `DATABASE_URL`
   - `POSTGRES_URL`（如果需要）
6. 點擊 "Deploy"

### 步驟 4: 驗證部署

部署完成後，執行測試：

```bash
npm run test-features https://hw6-bot.vercel.app
```

## 快速部署腳本

執行以下命令來快速準備部署：

```bash
cd /home/denny/下載/網路服務程式設計/wp1141/hw6/my-line-bot

# 初始化 Git（如果尚未初始化）
if [ ! -d .git ]; then
  git init
  git add -A
  git commit -m "feat: 初始提交 - 包含所有進階功能"
  echo "✅ Git 倉庫已初始化"
else
  git add -A
  git commit -m "feat: 更新代碼 - 包含所有進階功能"
  echo "✅ 代碼已提交"
fi

# 檢查遠程倉庫
if git remote -v | grep -q origin; then
  echo "✅ 遠程倉庫已配置"
  echo "執行 'git push origin main' 來推送代碼"
else
  echo "⚠️  尚未配置遠程倉庫"
  echo "請執行: git remote add origin <您的GitHub倉庫URL>"
fi
```

## 重要檔案檢查清單

確保以下檔案存在：

- ✅ `app/api/health/route.ts` - 健康檢查端點
- ✅ `app/api/admin/stats/route.ts` - 統計 API（包含 performance 欄位）
- ✅ `app/api/admin/messages/route.ts` - 訊息 API（包含 search 參數）
- ✅ `lib/bot/eventHandler.ts` - 事件處理器（包含效能追蹤）
- ✅ `vercel.json` - Vercel 配置
- ✅ `package.json` - 專案配置
- ✅ `.gitignore` - Git 忽略檔案

## 常見問題

### Q: 如何確認代碼已推送到 GitHub？

A: 執行 `git log --oneline -5` 查看提交歷史，然後在 GitHub 上檢查倉庫。

### Q: Vercel 部署失敗怎麼辦？

A: 檢查 Vercel 部署日誌，常見問題：
- 環境變數未設定
- 構建命令錯誤
- 依賴安裝失敗

### Q: 如何更新已部署的專案？

A: 推送代碼到 GitHub 後，Vercel 會自動觸發重新部署。

## 下一步

1. 初始化 Git 倉庫並提交代碼
2. 推送到 GitHub
3. 在 Vercel 中連接 GitHub 倉庫
4. 配置環境變數
5. 部署並測試

