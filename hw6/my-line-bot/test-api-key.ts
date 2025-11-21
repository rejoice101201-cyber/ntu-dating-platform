// 測試 Gemini API Key 是否有效
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// 載入環境變數
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY 未設定！');
  console.log('請在 .env.local 中設定 GEMINI_API_KEY');
  process.exit(1);
}

console.log('✅ API Key 已載入（前 10 字元）:', apiKey.substring(0, 10) + '...');
console.log('測試 API Key...\n');

const genAI = new GoogleGenerativeAI(apiKey);

// 測試的模型列表
const modelsToTest = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro',
];

async function testModel(modelName: string) {
  try {
    console.log(`測試模型: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('你好');
    const response = result.response;
    const text = response.text();
    
    if (text) {
      console.log(`✅ ${modelName} 可用！`);
      console.log(`回應預覽: ${text.substring(0, 50)}...\n`);
      return { success: true, model: modelName, response: text };
    } else {
      console.log(`❌ ${modelName} 無回應\n`);
      return { success: false, model: modelName };
    }
  } catch (error: any) {
    if (error?.status === 404) {
      console.log(`❌ ${modelName} 不存在 (404)\n`);
    } else if (error?.status === 403) {
      console.log(`❌ ${modelName} 權限不足 (403) - 請檢查 API Key 權限\n`);
    } else if (error?.status === 401) {
      console.log(`❌ ${modelName} API Key 無效 (401) - 請檢查 API Key 是否正確\n`);
    } else {
      console.log(`❌ ${modelName} 錯誤: ${error?.message || error}\n`);
    }
    return { success: false, model: modelName, error: error?.message };
  }
}

async function main() {
  console.log('開始測試 Gemini API...\n');
  
  const results = [];
  for (const model of modelsToTest) {
    const result = await testModel(model);
    results.push(result);
    
    // 如果找到可用的模型，可以提前結束
    if (result.success) {
      console.log(`\n🎉 找到可用的模型: ${result.model}`);
      console.log('建議在 lib/services/llmService.ts 中使用此模型名稱。');
      break;
    }
  }
  
  const successful = results.find(r => r.success);
  if (!successful) {
    console.log('\n⚠️  沒有找到可用的模型');
    console.log('可能的原因：');
    console.log('1. API Key 無效或權限不足');
    console.log('2. 模型名稱不正確');
    console.log('3. API 配額已用完');
    console.log('\n請檢查：');
    console.log('- API Key 是否正確設定');
    console.log('- API Key 是否有 Gemini API 權限');
    console.log('- Quota 是否還有剩餘');
  }
}

main().catch(console.error);

