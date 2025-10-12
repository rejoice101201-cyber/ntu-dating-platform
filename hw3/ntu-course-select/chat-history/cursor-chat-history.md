# Cursor Chat History - NTU Course Selection System

## Project Overview
This chat history documents the development of a comprehensive NTU course selection system built with React, TypeScript, and Material UI.

## Key Prompts and Requirements

### Initial Setup and Design
- "白畫面" - Initial debugging of white screen issue
- "修復問題" - General problem fixing requests
- "回到最近比較沒問題的版本" - Reverting to stable versions

### UI/UX Improvements
- "課程資訊的material UI不能因為toggle list裡面字串長短改變表格大小，應該以最常字串的寬度為固定尺寸，展開時部會改變整體尺寸"
- "之前實現過的麵包屑那個功能也加回來"
- "首頁 > 選課結果 > 最終結果 > 課表，我只有點擊首頁才有導航，其他選課結果和最終結果都沒反應，每一個頁面的按鈕都應該是正常的"
- "選課流程的四個方框請用一種,aterial ui增加互動效果，並填滿整個下面空白的區塊，放大四個區塊也行，反正不用留白，修改二階選課的文字錯誤，最下面應該改成：公佈二階結果"

### Navigation and Functionality
- "關於右上角選課結果按鈕，如果目前沒有選課結果，當按鈕被點擊，請跳出尚未完成選課，請選課，的彈出視窗"
- "右上角的課程資訊按鈕，目前是用點擊一下打開toggle list在點擊一下關閉，改成處碰到按鈕範圍自動開啟，離開toggle list範圍自動關閉，就比較方便"
- "把 選課頁面 換成是選課面主頁"
- "把麵包屑導航刪掉，並做適當優化處理"
- "課程資訊的觸碰按鈕打開選單功能不夠靈敏，流程應該是觸碰按鈕（沒有點擊），就可以滑鼠移動到選單，不會因為離開按鈕就觸發關閉，接著直到滑鼠離開選單才自動關閉選單"

### Course Selection Logic
- "如果一門課程都沒選中，就跳出提示請使用者再回到主畫面選一次"
- "主頁下方選課結果確認的按鈕邏輯同右上方選課結果，如果還沒有結果跳出通知"
- "http://localhost:5173/results這個頁面應該要給予所有100％的課程清單讓使用者選擇"
- "每一頁左上角臺大課程網的位置固定，不能讓人發現他有移動"
- "課程資訊、選課結果、我的收藏，每一頁的這三個按鈕功能都要像主頁這樣完整，目前只有主頁這三個按鈕是正常的，所以你要去檢查它頁的這三個程式碼，應該都要與第一頁完全相同"

### Course Classification System
- "檢查我為什麼無法npm run dev"
- "根據資料集得到的分類資訊，選擇一定不會分類錯誤且對使用者有幫助的類別，在選課網首頁建立分類器純前端UI by material UI必須兼具美觀與相容性及實用性，同時不能出現使用起來不合理的情形。"

### Lottery System Implementation
- "中籤率的部份，我想修改成分為0～100％常態分佈於這100％範圍內的數據中，所有邏輯均無須修改，只須調整中簽率的部份，讓他是常態分佈，並且在課程資訊上面標注每一門課的中簽率，讓使用者可以知道，也可以在不影響使用設計的情形下，於分類器中新增一個中簽率的分類。最後，課程分類器這個名稱不顯示在首頁上，請刪除。以及選課結果的課表頁面，提醒使用者部份課程抽中但是沒有修課時間的提示下方，列出這些有抽中的課程工使用者查看。"

### Performance Optimization
- "觀察我的CONSOLE我覺得吃太多效能，會讓使用者等太久，幫我優化"
- "VirtualizedCourseList.tsx:2 Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/react-window.js?v=0c10e0ed' does not provide an export named 'FixedSizeList'"
- "點擊中籤率的篩選按鈕，載入課程失敗"
- "The Content Security Policy (CSP) prevents the evaluation of arbitrary strings as JavaScript"
- "還是跑很久，無法看到完整的課程清單"
- "目前的操作方式很不自然，我想這些懶加載的設定應該是自動完成，而且課程也沒有鄭去被顯示，看來邏輯設計上有很大的問題，需要考慮相容性"

### Data Display Issues
- "雖然課程都跑完了，但是我只看到一門課，這問題超級嚴重，請找出畫面只顯示一門課程的原因並直接做改善"
- "還是只能看到篩選後的一門課程，看來有潛在問題代解決"
- "問題還是存在，我傳console log給你"
- "畫面中這樣顯示是正常的？不是的話請修改"
- "改進去重邏輯: 使用更強的唯一標識符組合、增強課程顯示: 添加系所信息幫助區分課程、修復系所分布: 過濾空值，添加篩選後分布"
- "不是這些原因，再嘗試別的方向看看"
- "初始問題: 只顯示1門課程、根本原因: 批次處理邏輯和篩選條件問題"
- "還是沒解決"

### Priority System and Course Placement
- "我看console log並沒顯示我有更動志願序，結果仍然是沒被調整"
- "問題解決了，我發現普通化學乙下有2學分，但是在課表上只有一個時段，是神麼原因，應該找到後修正"
- "法文一下是3學分，但是卻只有顯示1學分於課表"
- "請改善"
- "不接受普通化學丙這樣部份放置1/3的情形發生，只能允許全部放置，不然就衝堂，按照志願序刪除"

### Final UI Enhancement
- "很好，以修正"
- "幫我在這張圖的按鈕旁邊增加icon讓使用者一目了然這個按鈕的功能，不要加入我的最愛後不知道愛心是我的最愛"

## Technical Implementation Notes

### Key Features Implemented
1. **Course Classification System**: Material UI-based classifier with credit, department, course type, and lottery probability filters
2. **Lottery System**: Normal distribution-based probability assignment with priority-based conflict resolution
3. **Performance Optimization**: Lazy loading, batch processing, and virtualization for large datasets
4. **Strict Course Placement**: All-or-nothing placement strategy to prevent partial course scheduling
5. **Navigation Icons**: Added intuitive icons (Info, Assignment, Favorite) to all navigation buttons
6. **Responsive Design**: Consistent navigation and functionality across all pages

### Technologies Used
- React 18 with TypeScript
- Material UI (MUI) for components
- React Router for navigation
- Context API for state management
- Custom CSV parsing and data processing
- Seeded random number generation for consistent time assignment

### Performance Optimizations
- Batch processing for CSV data loading
- Virtualization for large course lists
- Memoization for React components
- Lazy loading with automatic progression
- Efficient state management with Context API

## Final Status
All requested features have been implemented and tested. The system provides a comprehensive course selection experience with intuitive navigation, efficient data processing, and robust conflict resolution.
