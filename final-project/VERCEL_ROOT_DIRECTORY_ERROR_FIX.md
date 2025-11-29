# Vercel Root Directory 錯誤修復指南

## 🚨 錯誤訊息

```
Invalid request: should NOT have additional property `rootDirectory`. 
Please remove it.
```

## 🔍 問題原因

這個錯誤表示：
- **Root Directory 不應該在重新部署請求中傳遞**
- Root Directory 應該在**專案設定**中設定，而不是在部署時傳遞
- 重新部署（Redeploy）功能不支援動態設定 Root Directory

## ✅ 正確的設定方法

### 方法 1: 通過 Vercel Dashboard 設定（推薦）

#### 步驟 1: 前往 Build and Deployment 設定

1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/build-and-deployment
2. 找到 **Root Directory** 設定
3. 輸入：`final-project`
4. 點擊 **Save**

#### 步驟 2: 通過 Git 設定（備用）

1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/git
2. 找到 **Root Directory** 設定
3. 輸入：`final-project`
4. 點擊 **Save**

### 方法 2: 檢查 vercel.json（如果存在）

如果專案中有 `vercel.json` 文件，**不要**在其中設定 `rootDirectory`。

**錯誤的 vercel.json**：
```json
{
  "rootDirectory": "final-project",  // ❌ 不要這樣設定
  "buildCommand": "npm run build"
}
```

**正確的 vercel.json**：
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

Root Directory 應該在 Vercel Dashboard 中設定，而不是在 `vercel.json` 中。

## 🛠️ 修復步驟

### 步驟 1: 取消重新部署

1. 在 Redeploy 模態視窗中，點擊 **Cancel**
2. 不要嘗試通過 Redeploy 功能設定 Root Directory

### 步驟 2: 在專案設定中設定 Root Directory

1. **前往 Build and Deployment 設定**：
   - https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/build-and-deployment
   
2. **找到 Root Directory 輸入框**
   - 可能在頁面下方，需要滾動
   - 或查找 "Build Settings" 區塊

3. **設定 Root Directory**
   - 輸入：`final-project`（沒有斜線）
   - 點擊 **Save**

4. **確認設定已保存**
   - 頁面應該顯示 "Saved" 或類似訊息
   - Root Directory 輸入框應該顯示 `final-project`

### 步驟 3: 觸發新部署

設定完成後，有兩種方式觸發部署：

#### 方式 A: 推送新的 commit（推薦）

```bash
cd "/home/denny/下載/網路服務程式設計/wp1141/final-project"
git commit --allow-empty -m "觸發部署：Root Directory 已設定"
git push ntu-dating main
```

這會觸發自動部署，Vercel 會使用專案設定中的 Root Directory。

#### 方式 B: 手動創建部署

1. 前往：https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/deployments
2. 點擊 **Create Deployment**
3. **不要**在部署選項中設定 Root Directory
4. 選擇 Branch：`main`
5. 點擊 **Deploy**

Vercel 會自動使用專案設定中的 Root Directory。

## 📋 檢查清單

### 專案設定檢查
- [ ] 前往 Settings → Build and Deployment
- [ ] Root Directory 設定為：`final-project`
- [ ] 點擊 Save 並確認已保存

### 驗證設定
- [ ] 推送新的 commit 測試自動部署
- [ ] 檢查 Deployments 頁面是否有新部署
- [ ] 確認部署成功（沒有 "Cannot find package.json" 錯誤）

## 🚫 不要做的事

1. **不要在 Redeploy 時設定 Root Directory**
   - Redeploy 功能不支援這個參數
   - 會導致錯誤訊息

2. **不要在 vercel.json 中設定 rootDirectory**
   - 這不是正確的設定方式
   - 應該在 Vercel Dashboard 中設定

3. **不要在部署請求中傳遞 rootDirectory**
   - 部署 API 不接受這個參數
   - 應該使用專案設定中的值

## ✅ 正確的工作流程

1. **在 Vercel Dashboard 中設定 Root Directory**（一次設定）
   - Settings → Build and Deployment → Root Directory: `final-project`

2. **推送代碼到 GitHub**（觸發自動部署）
   - Vercel 會自動使用專案設定中的 Root Directory

3. **如果需要重新部署**
   - 使用 Redeploy 功能（會使用專案設定）
   - 或推送新的 commit

## 🎯 快速修復

1. **取消當前的 Redeploy 操作**
   - 點擊 Cancel

2. **前往專案設定**
   - https://vercel.com/socialmedias-projects-bc8a18b0/ntu-dating-platform/settings/build-and-deployment

3. **設定 Root Directory**
   - 輸入：`final-project`
   - 保存

4. **觸發新部署**
   - 推送新的 commit 或手動創建部署

## 📝 重要提醒

- **Root Directory 是專案級別的設定**，不是部署級別的
- 設定一次後，所有後續部署都會使用這個設定
- 不需要在每次部署時重新設定
- Redeploy 功能會自動使用專案設定中的 Root Directory

