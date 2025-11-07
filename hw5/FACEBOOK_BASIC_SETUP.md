# Facebook 應用程式基本設定填寫指南

## 必須填寫的欄位（根據錯誤訊息）

### 1. 應用程式圖示（1024 x 1024）⭐ 必須

**要求**：
- 尺寸：1024 x 1024 像素
- 格式：PNG 或 JPG
- 必須是正方形

**如何準備**：
1. 創建或找一個 1024x1024 的圖片
2. 可以是你的 logo 或應用程式圖示
3. 上傳到 Facebook

**臨時解決方案**：
- 可以使用任何 1024x1024 的圖片（即使是占位圖）
- 之後可以隨時更換

### 2. 隱私政策網址 ⭐ 必須

**要求**：
- 必須是可公開訪問的網址
- 必須包含隱私政策內容

**開發環境解決方案**：

#### 選項 A：使用 GitHub Pages（推薦）
1. 創建一個簡單的隱私政策頁面
2. 上傳到 GitHub Pages 或任何免費託管服務
3. 使用該 URL

#### 選項 B：創建本地隱私政策頁面
在你的 Next.js 專案中創建一個隱私政策頁面：

```bash
# 創建頁面
touch app/privacy/page.tsx
```

然後在 Facebook 設定中使用：
```
http://localhost:3000/privacy
```

**注意**：如果使用 localhost，Facebook 可能無法驗證，建議使用公開 URL。

#### 選項 C：使用範本生成器
- 使用線上隱私政策生成器（如 [Privacy Policy Generator](https://www.privacypolicygenerator.info/)）
- 生成後上傳到 GitHub Pages 或其他免費託管服務

### 3. 用戶資料刪除 ⭐ 必須

**要求**：
- 提供用戶如何刪除其資料的說明
- 可以是網址或文字說明

**解決方案**：

#### 選項 A：提供網址
創建一個資料刪除說明頁面（類似隱私政策）

#### 選項 B：提供文字說明
在「資料刪除指示網址」欄位中，可以填寫：
```
用戶可以透過應用程式設定頁面刪除帳戶，或發送郵件至 denny101201@hotmail.com 請求刪除資料。
```

### 4. 類別 ⭐ 必須

**要求**：
- 選擇應用程式的類別

**建議選擇**：
- **社群** 或 **Social**
- **其他** 或 **Other**

## 可選但建議填寫的欄位

### 服務條款網址（建議）

類似隱私政策，可以：
- 創建一個服務條款頁面
- 或使用線上生成器
- 或暫時留空（如果 Facebook 允許）

### 命名空間（可選）

- 如果不需要 Facebook 的特定功能，可以留空
- 通常用於 Facebook Canvas 應用程式

### 應用程式網域（可選）

- 可以填寫：`localhost`（開發環境）
- 或留空

## 快速填寫建議（開發環境）

### 最小必要填寫：

1. **應用程式圖示**：
   - 上傳任何 1024x1024 的圖片（可以是占位圖）

2. **隱私政策網址**：
   - 使用 GitHub Pages 或類似服務
   - 或創建一個簡單的 HTML 頁面上傳

3. **用戶資料刪除**：
   - 填寫文字說明：
     ```
     用戶可以透過應用程式刪除帳戶，或聯絡 denny101201@hotmail.com 請求刪除資料。
     ```

4. **類別**：
   - 選擇「社群」或「其他」

## 創建隱私政策頁面的快速方法

如果你想要在專案中創建隱私政策頁面：

```typescript
// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">隱私政策</h1>
      <div className="space-y-4">
        <p>最後更新日期：{new Date().toLocaleDateString('zh-TW')}</p>
        <section>
          <h2 className="text-2xl font-semibold mb-2">資料收集</h2>
          <p>我們收集您透過 OAuth 登入提供的資料，包括姓名、電子郵件和頭像。</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">資料使用</h2>
          <p>您的資料僅用於提供服務和改善用戶體驗。</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">資料刪除</h2>
          <p>您可以隨時透過應用程式刪除帳戶，或聯絡 denny101201@hotmail.com 請求刪除資料。</p>
        </section>
      </div>
    </div>
  )
}
```

然後在 Facebook 設定中使用：
```
http://localhost:3000/privacy
```

**注意**：如果 Facebook 需要驗證網址，localhost 可能無法通過。建議使用公開 URL。

## 總結

**必須填寫**：
1. ✅ 應用程式圖示（1024x1024）
2. ✅ 隱私政策網址
3. ✅ 用戶資料刪除
4. ✅ 類別

**已經填寫**（不需要修改）：
- ✅ 顯示名稱：X-platform
- ✅ 聯絡電子郵件：denny101201@hotmail.com
- ✅ 網站網址：http://localhost:3000/

**可選**：
- 服務條款網址
- 命名空間
- 應用程式網域
- GDPR 相關資料（如果在歐盟營業）

## 填寫完成後

1. 點擊「儲存變更」
2. 等待幾分鐘讓設定生效
3. 再次嘗試 Facebook 登入

