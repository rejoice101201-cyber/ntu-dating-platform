# Vercel Root Directory 設定位置指南

## 📍 Root Directory 設定位置

Root Directory 設定在 **Settings → Build and Deployment** 頁面，不在 General 頁面。

## 🎯 找到 Root Directory 的步驟

### 方法 1: 通過左側導航欄（推薦）

1. 在 Vercel Dashboard 中，點擊左側導航欄的 **Settings**
2. 在 Settings 左側子選單中，找到並點擊 **Build and Deployment**
3. 在 "Build and Deployment" 頁面中，找到 **Root Directory** 設定
4. 應該會看到一個輸入框，可能顯示為空或顯示當前值

### 方法 2: 直接訪問 URL

直接前往 Build and Deployment 設定頁面：
```
https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/build-and-deployment
```

## ⚙️ 設定 Root Directory

### 步驟 1: 找到 Root Directory 輸入框

在 "Build and Deployment" 頁面中，應該會看到：

**Root Directory**
- 描述：指定專案的根目錄路徑
- 輸入框：可能為空或顯示 `/`

### 步驟 2: 設定 Root Directory

1. 在 **Root Directory** 輸入框中輸入：`final-project`
   - **不要**輸入 `/final-project`（不要前導斜線）
   - **不要**輸入 `./final-project`（不要相對路徑符號）
   - **正確**：只輸入 `final-project`

2. 點擊 **Save** 按鈕（通常在頁面右上角或設定區塊的右側）

3. Vercel 會自動觸發新的部署

## 🔍 如果找不到 Root Directory 設定

### 情況 1: 在 "Build and Deployment" 頁面中找不到

可能的原因：
- Vercel 介面版本不同
- 需要滾動到頁面下方

**解決方法**：
1. 在 "Build and Deployment" 頁面中，向下滾動
2. 查找 "Build Settings" 或 "Deployment Settings" 區塊
3. Root Directory 應該在該區塊中

### 情況 2: 完全找不到 Root Directory 選項

**解決方法**：通過 Git 設定頁面設定

1. 前往：**Settings → Git**
2. 在 Git 設定頁面中，應該會看到 **Root Directory** 選項
3. 在那裡設定為 `final-project`

## 📋 完整的設定路徑

### 路徑 1: Build and Deployment（主要位置）
```
Settings → Build and Deployment → Root Directory
```

### 路徑 2: Git Settings（備用位置）
```
Settings → Git → Root Directory
```

## ✅ 驗證設定

設定完成後：

1. **檢查設定是否保存**
   - Root Directory 輸入框應該顯示：`final-project`
   - 頁面應該顯示 "Saved" 或類似訊息

2. **檢查是否觸發部署**
   - 前往 **Deployments** 頁面
   - 應該會看到新的部署開始（Building 狀態）
   - 如果沒有自動觸發，可以手動觸發部署

3. **檢查部署日誌**
   - 點擊新的部署
   - 查看 Build Logs
   - 應該不會出現 "Cannot find package.json" 錯誤

## 🚨 常見錯誤

### 錯誤 1: 輸入了 `/final-project`
**錯誤**：`/final-project`
**正確**：`final-project`

### 錯誤 2: 輸入了 `./final-project`
**錯誤**：`./final-project`
**正確**：`final-project`

### 錯誤 3: 輸入了完整路徑
**錯誤**：`/home/denny/下載/網路服務程式設計/wp1141/final-project`
**正確**：`final-project`

## 📝 重要提醒

- Root Directory 是相對於 Git repository 根目錄的路徑
- 因為您的專案在 `final-project/` 子目錄中，所以設定為 `final-project`
- 設定後，Vercel 會從 `final-project/` 目錄開始建置專案
- 這會讓 Vercel 找到 `final-project/package.json` 和所有專案文件

## 🎯 快速檢查清單

- [ ] 前往 Settings → Build and Deployment
- [ ] 找到 Root Directory 輸入框
- [ ] 輸入：`final-project`（沒有斜線）
- [ ] 點擊 Save
- [ ] 檢查是否觸發新部署
- [ ] 驗證部署成功

