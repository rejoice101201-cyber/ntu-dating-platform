/**
 * 壓縮 Rich Menu 圖片腳本
 * 使用 sharp 庫壓縮圖片到符合 Line API 要求（最大 1MB）
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressImage() {
  const inputPath = path.resolve('./public/Adobe Express - file.jpg');
  const outputPath = path.resolve('./public/richmenu-compressed.jpg');

  if (!fs.existsSync(inputPath)) {
    console.error('❌ 找不到圖片檔案:', inputPath);
    process.exit(1);
  }

  const stats = fs.statSync(inputPath);
  console.log(`📊 原始檔案大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  if (stats.size <= 1024 * 1024) {
    console.log('✅ 圖片已經符合大小要求（小於 1MB）');
    return;
  }

  console.log('🔄 開始壓縮圖片...');

  try {
    // 讀取圖片資訊
    const metadata = await sharp(inputPath).metadata();
    console.log(`📐 原始尺寸: ${metadata.width} x ${metadata.height}`);

    // 壓縮圖片（品質 85，調整到符合 1MB 以下）
    let quality = 85;
    let outputBuffer;

    do {
      outputBuffer = await sharp(inputPath)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      if (outputBuffer.length <= 1024 * 1024) {
        break;
      }
      quality -= 5;
      console.log(`   嘗試品質 ${quality}... (${(outputBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    } while (quality > 50 && outputBuffer.length > 1024 * 1024);

    // 確保尺寸是 2500 x 1686（Line API 要求）
    // 如果尺寸不對，先調整尺寸再壓縮
    if (metadata.width !== 2500 || metadata.height !== 1686) {
      console.log(`   調整尺寸到 2500 x 1686...`);
      outputBuffer = await sharp(inputPath)
        .resize(2500, 1686, { fit: 'fill' })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
      
      // 如果調整尺寸後還是太大，降低品質
      if (outputBuffer.length > 1024 * 1024) {
        quality = 80;
        while (outputBuffer.length > 1024 * 1024 && quality > 50) {
          outputBuffer = await sharp(inputPath)
            .resize(2500, 1686, { fit: 'fill' })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();
          if (outputBuffer.length <= 1024 * 1024) break;
          quality -= 5;
          console.log(`   嘗試品質 ${quality}... (${(outputBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        }
      }
    } else if (outputBuffer.length > 1024 * 1024) {
      // 尺寸正確但檔案太大，降低品質
      console.log('   圖片仍然太大，降低品質...');
      quality = 80;
      while (outputBuffer.length > 1024 * 1024 && quality > 50) {
        outputBuffer = await sharp(inputPath)
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
        if (outputBuffer.length <= 1024 * 1024) break;
        quality -= 5;
        console.log(`   嘗試品質 ${quality}... (${(outputBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
      }
    }

    // 儲存壓縮後的圖片
    fs.writeFileSync(outputPath, outputBuffer);
    const outputStats = fs.statSync(outputPath);

    console.log(`✅ 壓縮完成！`);
    console.log(`   輸出檔案: ${outputPath}`);
    console.log(`   壓縮後大小: ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   壓縮率: ${((1 - outputStats.size / stats.size) * 100).toFixed(1)}%`);
    console.log(`\n📝 下一步：使用壓縮後的圖片創建 Rich Menu：`);
    console.log(`   RICH_MENU_IMAGE_PATH="./public/richmenu-compressed.jpg" npm run create-rich-menu`);

  } catch (error) {
    console.error('❌ 壓縮失敗:', error.message);
    process.exit(1);
  }
}

compressImage();

