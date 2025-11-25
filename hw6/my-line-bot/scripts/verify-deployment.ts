#!/usr/bin/env tsx

/**
 * 驗證部署狀態腳本
 * 檢查關鍵檔案是否存在於代碼庫中
 */

import { existsSync } from 'fs';
import { join } from 'path';

const requiredFiles = [
  'app/api/health/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/messages/route.ts',
  'lib/bot/eventHandler.ts',
];

console.log('🔍 檢查關鍵檔案是否存在...\n');

let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = join(process.cwd(), file);
  const exists = existsSync(filePath);
  
  if (exists) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 檔案不存在！`);
    allFilesExist = false;
  }
}

console.log('');

if (allFilesExist) {
  console.log('✅ 所有關鍵檔案都存在');
  console.log('');
  console.log('📋 下一步：');
  console.log('1. 確認所有檔案已提交到 Git:');
  console.log('   git add -A');
  console.log('   git commit -m "feat: 確保所有進階功能代碼已提交"');
  console.log('   git push origin main');
  console.log('');
  console.log('2. 等待 Vercel 自動部署（通常需要 1-2 分鐘）');
  console.log('');
  console.log('3. 部署完成後重新執行測試:');
  console.log('   npm run test-features https://hw6-bot.vercel.app');
} else {
  console.log('❌ 有檔案缺失，請檢查！');
  process.exit(1);
}



