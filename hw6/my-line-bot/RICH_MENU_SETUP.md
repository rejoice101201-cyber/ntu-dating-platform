# Rich Menu 設定指南

## 什麼是 Rich Menu？

Rich Menu 是顯示在 Line Bot 聊天室底部的選單，提供快速訪問常用功能的按鈕。根據您的截圖設計，我們已經實作了 8 個按鈕的 Rich Menu。

## 設定步驟

### 步驟 1：準備 Rich Menu 圖片

您需要準備一張 Rich Menu 圖片，規格如下：

- **尺寸**：2500 x 1686 像素（大型 Rich Menu）
- **格式**：JPEG 或 PNG
- **檔案大小**：最大 1 MB
- **內容**：根據您的截圖設計，包含 8 個按鈕區域（2行4列）

按鈕區域配置：
- 第1行：醫美查詢預約、果酸線上預約、青春痘特別門診、健保掛號
- 第2行：館別介紹、推薦好友、修改資料、嚴選產品

### 步驟 2：上傳圖片到可公開訪問的位置

您可以選擇以下方式之一：

1. **使用 Vercel 部署的圖片 URL**（推薦，最簡單）：
   - 圖片已放在 `public/richmenu-compressed.jpg`
   - 部署到 Vercel 後，可以直接使用：`https://your-app.vercel.app/richmenu-compressed.jpg`
   - 例如：`https://hw6-bot.vercel.app/richmenu-compressed.jpg`

2. **使用其他圖片 URL**：
   - 將圖片上傳到圖床服務（如 Imgur、Cloudinary 等）
   - 取得圖片的公開 URL

2. **使用本地檔案**：
   - 將圖片放在專案目錄中
   - 使用相對路徑（如 `./richmenu.png`）

### 步驟 3：創建 Rich Menu

#### 方法 1：使用腳本（推薦）

1. 使用部署後的圖片 URL（最簡單，推薦給同學使用）：
   ```bash
   # 替換為您的 Vercel 部署 URL
   RICH_MENU_IMAGE_URL=https://hw6-bot.vercel.app/richmenu-compressed.jpg npm run create-rich-menu
   ```

2. 或使用本地圖片：
   ```bash
   RICH_MENU_IMAGE_PATH=./public/richmenu-compressed.jpg npm run create-rich-menu
   ```

3. 如果需要壓縮自己的圖片：
   ```bash
   # 先壓縮圖片
   node scripts/compressImage.js
   # 然後使用壓縮後的圖片
   RICH_MENU_IMAGE_PATH=./public/richmenu-compressed.jpg npm run create-rich-menu
   ```

4. 可選參數：
   ```bash
   RICH_MENU_LOCALE=zh-TW \
   RICH_MENU_SET_DEFAULT=true \
   RICH_MENU_IMAGE_URL=https://example.com/richmenu.png \
   npm run create-rich-menu
   ```

#### 方法 2：使用 API

1. 使用 curl 或 Postman 調用 API：

   ```bash
   curl -X POST https://hw6-bot.vercel.app/api/admin/richmenu \
     -H "Content-Type: application/json" \
     -d '{
       "locale": "zh-TW",
       "imageUrl": "https://example.com/richmenu.png",
       "setAsDefault": true
     }'
   ```

2. 或使用 base64 編碼的圖片：

   ```bash
   curl -X POST https://hw6-bot.vercel.app/api/admin/richmenu \
     -H "Content-Type: application/json" \
     -d '{
       "locale": "zh-TW",
       "imageBuffer": "base64_encoded_image_data",
       "contentType": "image/png",
       "setAsDefault": true
     }'
   ```

### 步驟 4：驗證 Rich Menu

1. 在 Line 官方帳號中，重新開啟與 Bot 的聊天
2. 您應該能在聊天室底部看到 Rich Menu
3. 點擊各個按鈕測試功能

## 注意事項

1. **預設 Rich Menu 變更**：
   - 設定為預設 Rich Menu 後，變更需要用戶重新開啟聊天才會生效
   - 可能需要等待最多 1 分鐘

2. **Per-user Rich Menu**：
   - 如果為特定用戶設定了 Rich Menu，會優先顯示
   - 可以使用 API 為特定用戶連結 Rich Menu

3. **圖片要求**：
   - 圖片必須是可公開訪問的 URL
   - 如果使用本地檔案，需要確保在執行腳本時可以訪問

4. **多語系支援**：
   - 目前支援 `zh-TW`（繁體中文）和 `en-US`（英文）
   - 可以為不同語系創建不同的 Rich Menu

## 管理 Rich Menu

### 查看所有 Rich Menu

```bash
curl https://hw6-bot.vercel.app/api/admin/richmenu
```

### 設定預設 Rich Menu

```bash
curl -X POST https://hw6-bot.vercel.app/api/admin/richmenu/set-default \
  -H "Content-Type: application/json" \
  -d '{"richMenuId": "richmenu-xxx"}'
```

### 刪除 Rich Menu

```bash
curl -X DELETE https://hw6-bot.vercel.app/api/admin/richmenu/richmenu-xxx
```

## 疑難排解

### 問題：看不到 Rich Menu

1. **檢查是否已創建**：
   ```bash
   curl https://hw6-bot.vercel.app/api/admin/richmenu
   ```

2. **檢查是否設為預設**：
   回應中應該有 `defaultRichMenuId`

3. **重新開啟聊天**：
   - 關閉並重新開啟與 Bot 的聊天
   - 等待最多 1 分鐘

4. **檢查圖片 URL**：
   - 確保圖片 URL 是可公開訪問的
   - 使用瀏覽器直接訪問 URL 確認

### 問題：圖片上傳失敗

1. **檢查圖片規格**：
   - 尺寸必須是 2500 x 1686 像素
   - 檔案大小必須小於 1 MB
   - 格式必須是 JPEG 或 PNG

2. **檢查圖片 URL**：
   - URL 必須是可公開訪問的
   - 確保沒有 CORS 限制

### 問題：按鈕點擊沒有反應

1. **檢查 Vercel Logs**：
   - 查看是否有 postback 事件
   - 檢查是否有錯誤訊息

2. **檢查環境變數**：
   - 確保 `LINE_CHANNEL_ACCESS_TOKEN` 和 `LINE_CHANNEL_SECRET` 已正確設定

## 快速開始（給同學評分使用）

**最簡單的方式**：直接使用已部署的圖片 URL

```bash
# 替換為您的 Vercel 部署 URL
RICH_MENU_IMAGE_URL=https://hw6-bot.vercel.app/richmenu-compressed.jpg \
RICH_MENU_LOCALE=zh-TW \
RICH_MENU_SET_DEFAULT=true \
npm run create-rich-menu
```

**或者使用本地圖片**（如果已經下載專案）：

```bash
RICH_MENU_IMAGE_PATH=./public/richmenu-compressed.jpg \
RICH_MENU_LOCALE=zh-TW \
RICH_MENU_SET_DEFAULT=true \
npm run create-rich-menu
```

完成後，在 Line 中重新開啟與 Bot 的聊天，就能看到 Rich Menu 了！

**注意**：圖片 `public/richmenu-compressed.jpg` 已經包含在專案中，部署到 Vercel 後會自動可訪問。

