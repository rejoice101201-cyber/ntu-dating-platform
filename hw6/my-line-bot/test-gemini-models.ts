// 測試可用的 Gemini 模型
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 常見的模型名稱列表
const modelNames = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro-latest',
  'gemini-1.0-pro',
  'gemini-pro',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

async function testModel(modelName: string): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('測試');
    return !!result.response.text();
  } catch (error: any) {
    if (error?.status === 404) {
      return false;
    }
    throw error;
  }
}

async function findAvailableModel() {
  console.log('測試可用的 Gemini 模型...\n');
  
  for (const modelName of modelNames) {
    try {
      console.log(`測試 ${modelName}...`);
      const available = await testModel(modelName);
      if (available) {
        console.log(`✅ ${modelName} 可用！\n`);
        return modelName;
      } else {
        console.log(`❌ ${modelName} 不可用\n`);
      }
    } catch (error: any) {
      console.log(`❌ ${modelName} 錯誤: ${error?.message}\n`);
    }
  }
  
  console.log('沒有找到可用的模型');
  return null;
}

findAvailableModel().then((model) => {
  if (model) {
    console.log(`\n建議使用的模型: ${model}`);
  }
});

