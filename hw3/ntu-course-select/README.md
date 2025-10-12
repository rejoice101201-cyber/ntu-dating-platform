# 臺大課程選課系統 (NTU Course Selection System)

一個基於 React + TypeScript 的臺大課程選課系統，提供完整的選課流程體驗。

## 🚀 功能特色

### 📚 課程管理
- **課程搜尋**: 支援關鍵字搜尋課程名稱、教師、課程代碼
- **課程分類器**: 按學分數、系所、課程類型、中籤率篩選課程
- **我的收藏**: 收藏感興趣的課程，支援拖拽排序志願序

### 🎲 選課系統
- **抽籤模擬**: 基於常態分佈的中籤率系統
- **志願序管理**: 支援拖拽和手動調整課程優先順序
- **衝突處理**: 智能處理時間衝突，按志願序自動解決

### 📅 課表顯示
- **視覺化課表**: 週間課表顯示，清楚標示時間、教室、教師
- **衝突提醒**: 顯示無法安排時間的課程
- **完整資訊**: 顯示課程名稱、教師、教室、學分數

### 🎨 用戶體驗
- **直觀導航**: 圖標化導航按鈕，一目了然
- **響應式設計**: 適配各種螢幕尺寸
- **性能優化**: 懶加載、虛擬化列表，流暢體驗

## 🛠️ 技術棧

- **前端框架**: React 18 + TypeScript
- **UI 組件**: Material UI (MUI)
- **路由管理**: React Router
- **狀態管理**: React Context API
- **構建工具**: Vite
- **字體**: Roboto

## 📦 安裝與執行

### 環境要求
- Node.js 16+ 
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd ntu-course-select
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **準備課程資料**
   - 將 NTU 課程 CSV 檔案放置於 `public/data/hw3-ntucourse-data-1002.csv`
   - 或修改 `src/pages/CourseResults.tsx` 中的檔案路徑

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

5. **開啟瀏覽器**
   - 訪問 `http://localhost:5173`
   - 開始使用選課系統！

## 🔧 常見安裝問題與解決辦法

### macOS 用戶

#### 問題 1: 權限錯誤 (EACCES)
```bash
Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
```

**解決辦法:**
```bash
# 方法 1: 使用 nvm 管理 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 方法 2: 修改 npm 預設目錄
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 問題 2: Python 版本問題
```bash
gyp ERR! stack Error: Can't find Python executable "python"
```

**解決辦法:**
```bash
# 安裝 Xcode Command Line Tools
xcode-select --install

# 或使用 Homebrew 安裝 Python
brew install python
```

#### 問題 3: 端口被占用
```bash
Error: Port 5173 is already in use
```

**解決辦法:**
```bash
# 查找占用端口的進程
lsof -ti:5173

# 終止進程
kill -9 $(lsof -ti:5173)

# 或使用不同端口
npm run dev -- --port 3000
```

### Linux 用戶

#### 問題 1: 缺少建構工具
```bash
gyp ERR! stack Error: Can't find Python executable "python"
```

**解決辦法:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install build-essential python3 python3-pip

# CentOS/RHEL/Fedora
sudo yum groupinstall "Development Tools"
sudo yum install python3 python3-pip

# 或使用 dnf (較新版本)
sudo dnf groupinstall "Development Tools"
sudo dnf install python3 python3-pip
```

#### 問題 2: Node.js 版本過舊
```bash
You are using Node.js 14.x.x, but this project requires Node.js 16+
```

**解決辦法:**
```bash
# 使用 NodeSource 安裝最新版本
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 問題 3: 記憶體不足
```bash
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```

**解決辦法:**
```bash
# 增加 Node.js 記憶體限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# 或永久設定
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc
source ~/.bashrc
```

#### 問題 4: 檔案權限問題
```bash
Error: EACCES: permission denied, open '/path/to/file'
```

**解決辦法:**
```bash
# 修改專案目錄權限
sudo chown -R $USER:$USER /path/to/ntu-course-select
chmod -R 755 /path/to/ntu-course-select

# 或使用 npm 的 --unsafe-perm 選項
npm install --unsafe-perm
```

### 通用問題

#### 問題 1: npm 安裝速度慢
**解決辦法:**
```bash
# 使用淘寶鏡像
npm config set registry https://registry.npmmirror.com

# 或使用 yarn
npm install -g yarn
yarn install
```

#### 問題 2: 依賴版本衝突
```bash
npm ERR! peer dep missing
```

**解決辦法:**
```bash
# 清理快取並重新安裝
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 或使用 --legacy-peer-deps
npm install --legacy-peer-deps
```

#### 問題 3: 瀏覽器無法訪問
**解決辦法:**
```bash
# 檢查防火牆設定
sudo ufw allow 5173

# 或使用網路介面
npm run dev -- --host 0.0.0.0
```

### 驗證安裝

安裝完成後，執行以下命令驗證：

```bash
# 檢查 Node.js 版本
node --version  # 應該 >= 16.0.0

# 檢查 npm 版本
npm --version

# 檢查專案依賴
npm list --depth=0

# 測試開發伺服器
npm run dev
```

如果遇到其他問題，請檢查：
1. 網路連線是否正常
2. 磁碟空間是否充足
3. 系統時間是否正確
4. 防毒軟體是否阻擋

## 📁 專案結構

```
src/
├── components/          # UI 組件
│   ├── ui/             # 基礎 UI 組件
│   ├── CourseInfoMenu.tsx
│   ├── VirtualizedCourseList.tsx
│   └── ...
├── context/            # React Context
│   └── CourseContext.tsx
├── hooks/              # 自定義 Hooks
│   └── useCourseData.ts
├── pages/              # 頁面組件
│   ├── Home.tsx        # 首頁
│   ├── CourseResults.tsx # 課程搜尋結果
│   ├── Favorites.tsx   # 我的收藏
│   ├── Selection.tsx   # 選課系統
│   ├── PrioritySorting.tsx # 志願序排序
│   └── Schedule.tsx    # 課表顯示
├── types/              # TypeScript 類型定義
│   └── course.ts
├── utils/              # 工具函數
│   ├── timeUtils.ts
│   └── simpleTimeAssigner.ts
└── App.tsx             # 主應用組件

public/
└── data/
    └── hw3-ntucourse-data-1002.csv  # 課程資料
```

## 🎯 使用流程

1. **瀏覽課程**: 在首頁使用分類器篩選課程
2. **搜尋課程**: 在課程搜尋頁面輸入關鍵字查找
3. **收藏課程**: 點擊愛心圖標收藏感興趣的課程
4. **設定志願序**: 在收藏頁面拖拽調整課程優先順序
5. **開始選課**: 進入選課系統進行抽籤模擬
6. **查看結果**: 查看最終課表和選課結果

## 🔧 開發說明

### 主要功能實現

- **課程資料處理**: 自定義 CSV 解析器，支援大量資料的批次處理
- **時間分配**: 基於學分數的隨機時間分配算法
- **衝突解決**: 按志願序的智能衝突處理機制
- **性能優化**: 虛擬化列表、懶加載、記憶化組件

### 自定義配置

- 修改 `src/utils/simpleTimeAssigner.ts` 調整時間分配邏輯
- 修改 `src/context/CourseContext.tsx` 調整狀態管理
- 修改 `src/pages/Home.tsx` 調整分類器選項

## 📝 注意事項

- 課程資料需要符合特定的 CSV 格式
- 中籤率基於常態分佈生成，確保真實性
- 系統支援最多 20 門課程的志願序設定
- 時間衝突會按志願序自動解決

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個專案！

## 📄 授權

本專案僅供學習使用。
