<!-- f17e2bd7-6ff0-4761-9c6e-cec07cdcdb57 cf5a5f01-0a8b-446d-9624-6021e82cd43d -->
# 修復 OAuth 按鈕點擊無反應問題

## 問題

點擊 "Sign up with Google" 按鈕後，`onClick` 事件沒有觸發，控制台沒有任何日誌，頁面也沒有反應。

## 修復步驟

### 1. 添加按鈕狀態檢查日誌

- 在 `useEffect` 中記錄 `loading` 狀態的變化
- 在按鈕渲染時添加 `useRef` 來檢查按鈕是否正確渲染
- 記錄按鈕的 `disabled` 狀態

### 2. 添加多種事件監聽器

- 添加 `onMouseDown` 事件作為備用
- 添加 `onPointerDown` 事件
- 添加 `onTouchStart` 事件（移動設備）
- 每個事件都添加獨立的日誌

### 3. 添加全局錯誤處理器

- 在組件中添加 `useEffect` 來設置 `window.onerror` 處理器
- 捕獲可能阻止執行的 JavaScript 錯誤
- 記錄所有錯誤到控制台

### 4. 檢查按鈕可訪問性

- 確認按鈕沒有被其他元素覆蓋
- 添加 `pointer-events` 檢查
- 確保按鈕在 DOM 中正確渲染

### 5. 添加按鈕引用檢查

- 使用 `useRef` 來引用按鈕元素
- 在 `useEffect` 中檢查按鈕是否在 DOM 中
- 記錄按鈕的實際狀態

## 文件修改

- `app/auth/signin/page.tsx`: 添加所有調試功能

## 預期結果

- 點擊按鈕時控制台會顯示詳細的調試日誌
- 如果按鈕被禁用，會顯示原因
- 如果有 JavaScript 錯誤，會被捕獲並記錄
- 可以確認事件是否被正確觸發

### To-dos

- [x] Refactor BackButtonHandler to use useRef for tracking internal navigation state instead of global window variable
- [x] Update PostDetail back button handler to use a more reliable method to signal internal navigation
- [x] Test that browser back button still shows logout modal while in-app back button does not
- [x] 更新 PostCard 以顯示 Repost 標記