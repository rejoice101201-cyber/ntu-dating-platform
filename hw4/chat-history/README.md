# Chat History 匯出指南

本目錄用於存放開發過程中的 Cursor chat history，記錄完整的開發歷程和問題解決過程。

## 如何匯出 Cursor Chat History

### 方法一：使用 Cursor 內建功能

1. **打開 Cursor 側邊欄**
   - 點擊左側邊欄的 "Chat" 圖標 💬
   - 或使用快捷鍵 `Cmd+L` (Mac) / `Ctrl+L` (Windows/Linux)

2. **匯出對話記錄**
   - 在 Chat 面板中，點擊右上角的 "..." 菜單
   - 選擇 "Export Chat" 或 "匯出對話"
   - 選擇匯出格式為 "Markdown"

3. **保存文件**
   - 將匯出的文件保存到此目錄 (`chat-history/`)
   - 建議命名為 `chat-history-YYYY-MM-DD.md`

### 方法二：手動複製

如果無法使用匯出功能：

1. **選擇對話內容**
   - 在 Chat 面板中選擇要匯出的對話
   - 使用 `Cmd+A` (Mac) / `Ctrl+A` (Windows/Linux) 全選

2. **複製內容**
   - 使用 `Cmd+C` (Mac) / `Ctrl+C` (Windows/Linux) 複製

3. **創建文件**
   - 在此目錄創建新的 `.md` 文件
   - 貼上複製的內容

## 文件命名規範

建議使用以下命名格式：

- `chat-history-2024-01-15.md` - 按日期命名
- `chat-history-phase1.md` - 按開發階段命名
- `chat-history-debugging.md` - 按內容類型命名

## 注意事項

⚠️ **重要**：匯出前請確保已清理敏感資訊：

- API Keys 和 Secrets
- 個人資料和密碼
- 內部 IP 地址
- 資料庫連接字串
- 其他敏感配置信息

## 清理指南

匯出後，請檢查並清理以下內容：

1. **API Keys**
   - 格式：`AIzaSy...` → `AIza****...`
   - 保留前4位和後4位，中間用 `****` 替代

2. **JWT Secrets**
   - 格式：`your_secret_key_here` → `your_jwt_secret_***`

3. **Email 地址**
   - 格式：`user@example.com` → `u***@example.com`

4. **IP 地址**
   - 格式：`192.168.1.100` → `192.168.x.x`

5. **完整環境變數值**
   - 移除所有 `.env` 文件的完整內容引用

## 範例清理

### 清理前：
```bash
GOOGLE_SERVER_KEY=AIzaSyACcmnotGpFN4BAZMvB5AHWn34DKw7_W_w
JWT_SECRET=my_super_secret_jwt_key_12345
```

### 清理後：
```bash
GOOGLE_SERVER_KEY=AIza****7_W_w
JWT_SECRET=your_jwt_secret_***
```

## 提交前檢查

在提交到 Git 前，請確認：

- [ ] 所有 API Keys 已遮罩
- [ ] 所有 Secrets 已遮罩  
- [ ] 個人資料已遮罩
- [ ] 內部地址已遮罩
- [ ] 沒有完整的環境變數值
- [ ] 文件格式正確 (Markdown)

完成清理後，這些文件將記錄完整的開發過程，同時保護敏感資訊安全。
