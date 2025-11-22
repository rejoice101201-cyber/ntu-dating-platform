/**
 * 創建 Rich Menu 的腳本
 * 
 * 使用方式：
 * 1. 準備 Rich Menu 圖片（2500 x 1686 像素，JPEG 或 PNG，最大 1MB）
 * 2. 將圖片上傳到可公開訪問的 URL（或使用本地檔案路徑）
 * 3. 執行：npm run create-rich-menu
 * 
 * 或使用環境變數：
 * RICH_MENU_IMAGE_URL=https://example.com/richmenu.png npm run create-rich-menu
 */

// 載入環境變數（必須在最前面）
import * as dotenv from 'dotenv';
import * as path from 'path';

// 載入 .env.local（優先）
const envLocalPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envLocalPath, override: false });
// 也載入 .env（如果存在）
dotenv.config({ override: false });

// 確認環境變數已載入
if (!process.env.CHANNEL_ACCESS_TOKEN && !process.env.LINE_CHANNEL_ACCESS_TOKEN) {
  console.error('❌ 錯誤：無法載入環境變數');
  console.error('   請確認 .env.local 檔案存在且包含 CHANNEL_ACCESS_TOKEN 和 CHANNEL_SECRET');
  process.exit(1);
}

import { richMenuService } from '../lib/services/richMenuService';
import { createRichMenuConfig } from '../lib/bot/richMenuConfig';
import * as fs from 'fs';

async function createRichMenu() {
  try {
    console.log('🚀 開始創建 Rich Menu...\n');

    // 從環境變數或命令列參數取得圖片 URL 或路徑
    const imageUrl = process.env.RICH_MENU_IMAGE_URL;
    const imagePath = process.env.RICH_MENU_IMAGE_PATH;
    const locale = (process.env.RICH_MENU_LOCALE || 'zh-TW') as 'zh-TW' | 'en-US';
    const setAsDefault = process.env.RICH_MENU_SET_DEFAULT !== 'false';

    if (!imageUrl && !imagePath) {
      console.error('❌ 錯誤：請提供 Rich Menu 圖片');
      console.log('\n使用方式：');
      console.log('1. 使用圖片 URL：');
      console.log('   RICH_MENU_IMAGE_URL=https://example.com/richmenu.png npm run create-rich-menu');
      console.log('\n2. 使用本地圖片路徑：');
      console.log('   RICH_MENU_IMAGE_PATH=./richmenu.png npm run create-rich-menu');
      console.log('\n3. 可選參數：');
      console.log('   RICH_MENU_LOCALE=zh-TW (或 en-US)');
      console.log('   RICH_MENU_SET_DEFAULT=true (設為預設 Rich Menu，預設為 true)');
      process.exit(1);
    }

    // 創建 Rich Menu 配置
    console.log(`📋 創建 Rich Menu 配置（語系：${locale}）...`);
    const richMenuConfig = createRichMenuConfig(locale);
    console.log(`✅ Rich Menu 配置已創建，包含 ${richMenuConfig.areas.length} 個按鈕區域\n`);

    // 創建 Rich Menu
    console.log('📤 正在創建 Rich Menu...');
    const richMenuId = await richMenuService.createRichMenu(richMenuConfig);
    console.log(`✅ Rich Menu 創建成功！ID: ${richMenuId}\n`);

    // 上傳圖片
    if (imageUrl) {
      console.log(`📥 從 URL 上傳圖片：${imageUrl}...`);
      await richMenuService.uploadRichMenuImageFromUrl(richMenuId, imageUrl);
      console.log('✅ 圖片上傳成功！\n');
    } else if (imagePath) {
      console.log(`📥 從本地檔案上傳圖片：${imagePath}...`);
      const fullPath = path.resolve(imagePath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`圖片檔案不存在：${fullPath}`);
      }

      const imageBuffer = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

      await richMenuService.uploadRichMenuImage(richMenuId, imageBuffer, contentType);
      console.log('✅ 圖片上傳成功！\n');
    }

    // 設定為預設 Rich Menu
    if (setAsDefault) {
      console.log('🔧 設定為預設 Rich Menu...');
      await richMenuService.setDefaultRichMenu(richMenuId);
      console.log('✅ 已設定為預設 Rich Menu！\n');
      console.log('ℹ️  注意：預設 Rich Menu 的變更需要用戶重新開啟聊天才會生效。');
    }

    console.log('\n🎉 Rich Menu 創建完成！');
    console.log(`\nRich Menu ID: ${richMenuId}`);
    console.log(`語系: ${locale}`);
    console.log(`是否為預設: ${setAsDefault ? '是' : '否'}`);
    console.log('\n📝 下一步：');
    console.log('1. 在 Line 官方帳號中測試 Rich Menu');
    console.log('2. 用戶需要重新開啟聊天才能看到新的 Rich Menu');
    console.log('3. 如需刪除，可以使用 API：DELETE /api/admin/richmenu/' + richMenuId);

  } catch (error: any) {
    console.error('\n❌ 創建 Rich Menu 失敗：');
    console.error(error.message);
    if (error.statusCode) {
      console.error(`HTTP 狀態碼: ${error.statusCode}`);
    }
    if (error.originalError) {
      console.error('原始錯誤:', error.originalError);
    }
    process.exit(1);
  }
}

// 執行
createRichMenu();

