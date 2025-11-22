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

1. **使用圖片 URL**（推薦）：
   - 將圖片上傳到圖床服務（如 Imgur、Cloudinary 等）
   - 或上傳到您的 Vercel 專案的 `public` 資料夾
   - 取得圖片的公開 URL

2. **使用本地檔案**：
   - 將圖片放在專案目錄中
   - 使用相對路徑（如 `./richmenu.png`）

### 步驟 3：創建 Rich Menu

#### 方法 1：使用腳本（推薦）

1. 安裝依賴（如果還沒有）：
   ```bash
   npm install tsx --save-dev
   ```

2. 使用圖片 URL 創建：
   ```bash
   RICH_MENU_IMAGE_URL=https://example.com/richmenu.png npm run create-rich-menu
   ```

3. 或使用本地圖片：
   ```bash
   RICH_MENU_IMAGE_PATH=./richmenu.png npm run create-rich-menu
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

## 快速開始

如果您已經有 Rich Menu 圖片，最快的方式是：

```bash
# 1. 將圖片上傳到圖床，取得 URL
# 2. 執行以下命令（替換為您的圖片 URL）
RICH_MENU_IMAGE_URL=https://your-image-url.com/richmenu.png npm run create-rich-menu
```

完成後，在 Line 中重新開啟與 Bot 的聊天，就能看到 Rich Menu 了！

