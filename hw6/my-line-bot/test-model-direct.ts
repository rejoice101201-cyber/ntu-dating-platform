// 直接測試模型名稱（使用 REST API）
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error('❌ 請在 .env.local 中設定 GEMINI_API_KEY');
  process.exit(1);
}

// 測試的模型列表（根據 Google AI Studio 常見的模型名稱）
const modelsToTest = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro-latest',
  'gemini-1.0-pro',
  'gemini-pro',
];

async function testModel(modelName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: '你好'
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return { success: true };
      }
      return { success: false, error: '回應格式不正確' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorData.error?.message || response.statusText}` 
      };
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || '未知錯誤' 
    };
  }
}

async function main() {
  console.log('🔍 測試 Gemini API 模型名稱...\n');
  console.log(`API Key 前綴: ${API_KEY.substring(0, 10)}...\n`);

  let foundModel = null;

  for (const modelName of modelsToTest) {
    console.log(`測試 ${modelName}...`);
    const result = await testModel(modelName);
    
    if (result.success) {
      console.log(`✅ ${modelName} 可用！\n`);
      foundModel = modelName;
      break;
    } else {
      console.log(`❌ ${modelName} 失敗: ${result.error}\n`);
    }
  }

  if (foundModel) {
    console.log(`\n🎉 找到可用的模型: ${foundModel}`);
    console.log(`\n請在 lib/services/llmService.ts 中使用此模型名稱。`);
    console.log(`\n建議更新程式碼：`);
    console.log(`  const model = genAI.getGenerativeModel({ model: '${foundModel}' });`);
  } else {
    console.log('\n⚠️  沒有找到可用的模型');
    console.log('\n可能的原因：');
    console.log('1. API Key 無效或權限不足');
    console.log('2. 所有測試的模型名稱都不正確');
    console.log('3. API 配額已用完');
    console.log('\n建議：');
    console.log('1. 前往 Google AI Studio 查看可用的模型列表');
    console.log('2. 檢查 API Key 權限設定');
    console.log('3. 查看 Google AI Studio 的使用統計');
  }
}

main().catch(console.error);

