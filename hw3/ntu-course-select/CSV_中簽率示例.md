# CSV 中簽率欄位添加指南

## 📋 如何在 CSV 檔案中添加中簽率

### 方法 1: 添加新欄位 `lottery_rate`
在 CSV 標題行添加 `lottery_rate` 欄位，並在每行數據中添加對應的中簽率值（0-100）：

```csv
yyse,ser_no,co_chg,dpt_code,year,cou_code,class,credit,tlec,tlab,forh,sel_code,cou_cname,cou_ename,tea_seq,tea_code,tea_cname,tea_ename,clsrom_1,clsrom_2,clsrom_3,clsrom_4,clsrom_5,clsrom_6,st1,day1,st2,day2,st3,day3,st4,day4,st5,day5,st6,day6,limit,tno,eno,co_select,sno,mark,co_rep,co_tp,co_gmark,co_eng,grpno,initsel,outside,pre_course,dpt_abbr,cou_teacno,chgitem,engmark,lottery_rate
1002,,1,1020,1,000 10002,,3,3,0,1,3,國文領域下,Chinese (2),,,,,博雅101,,,,,,,567,,,,,,,,,,,,1,0,,0,,0,1,,1,0,0,0,,Common,1002,,,85
1002,,1,1030,1,000 10002,,3,3,0,1,3,國文領域下,Chinese (2),,,,,,,,,,,,,,,,,,,,678,,,,100,0,,0,參閱共同必修科目表,0,1,,1,0,0,,,Common,1002,,,75
```

### 方法 2: 使用中文欄位名 `中簽率`
```csv
yyse,ser_no,co_chg,dpt_code,year,cou_code,class,credit,tlec,tlab,forh,sel_code,cou_cname,cou_ename,tea_seq,tea_code,tea_cname,tea_ename,clsrom_1,clsrom_2,clsrom_3,clsrom_4,clsrom_5,clsrom_6,st1,day1,st2,day2,st3,day3,st4,day4,st5,day5,st6,day6,limit,tno,eno,co_select,sno,mark,co_rep,co_tp,co_gmark,co_eng,grpno,initsel,outside,pre_course,dpt_abbr,cou_teacno,chgitem,engmark,中簽率
1002,,1,1020,1,000 10002,,3,3,0,1,3,國文領域下,Chinese (2),,,,,博雅101,,,,,,,567,,,,,,,,,,,,1,0,,0,,0,1,,1,0,0,0,,Common,1002,,,85
1002,,1,1030,1,000 10002,,3,3,0,1,3,國文領域下,Chinese (2),,,,,,,,,,,,,,,,,,,,678,,,,100,0,,0,參閱共同必修科目表,0,1,,1,0,0,,,Common,1002,,,75
```

## 🎯 中簽率數值說明

- **0-20**: 非常難中籤（熱門課程）
- **21-40**: 較難中籤
- **41-60**: 中等機率
- **61-80**: 較容易中籤
- **81-100**: 很容易中籤（冷門課程）

## 🔧 程式邏輯

程式會按以下優先順序讀取中簽率：

1. **優先**: `lottery_rate` 欄位
2. **備選**: `中簽率` 欄位
3. **計算**: 基於 `limit` 和 `co_select` 計算
4. **隨機**: 20-80% 隨機值

## 📊 抽籤結果

- 抽中的課程會自動加入最終選課結果
- 系統會檢查時間衝突
- 按優先級順序進行抽籤
