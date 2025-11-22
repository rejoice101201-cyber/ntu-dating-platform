// 全面測試 Gemini API - 根據官方文件
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error('❌ 請在 .env.local 中設定 GEMINI_API_KEY');
  process.exit(1);
}

// 根據官方文件，測試所有可能的模型和 API 版本
const apiVersions = ['v1', 'v1beta'];
const modelsToTest = [
  // 最新模型（根據搜尋結果，這些可能是最新的）
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-thinking-exp',
  // 1.5 系列
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  // 1.0 系列
  'gemini-1.0-pro',
  'gemini-1.0-pro-latest',
  // 舊版
  'gemini-pro',
];

async function testModel(apiVersion: string, modelName: string): Promise<{
  success: boolean;
  error?: string;
  status?: number;
  details?: any;
}> {
  try {
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${API_KEY}`;
    
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

    const data = await response.json();

    if (response.ok) {
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          details: {
            text: data.candidates[0].content.parts[0].text.substring(0, 50),
          }
        };
      }
      return { success: false, error: '回應格式不正確', details: data };
    } else {
      const errorMessage = data.error?.message || response.statusText;
      const errorCode = data.error?.code || data.error?.status;
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${errorMessage}`,
        details: {
          code: errorCode,
          message: errorMessage,
          fullError: data.error,
        }
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '未知錯誤',
    };
  }
}

async function main() {
  console.log('🔍 全面測試 Gemini API（根據官方文件）...\n');
  console.log(`API Key 前綴: ${API_KEY.substring(0, 10)}...\n`);
  console.log('參考文件: https://ai.google.dev/gemini-api/docs/troubleshooting?hl=zh-tw#check-api\n');

  let foundModel: { apiVersion: string; modelName: string; details?: any } | null = null;

  for (const apiVersion of apiVersions) {
    console.log(`\n📡 測試 API 版本: ${apiVersion}\n`);
    console.log('─'.repeat(60));
    
    for (const modelName of modelsToTest) {
      const fullName = `${apiVersion}/${modelName}`;
      process.stdout.write(`測試 ${fullName.padEnd(45)}... `);
      
      const result = await testModel(apiVersion, modelName);
      
      if (result.success) {
        console.log(`✅ 可用！`);
        console.log(`   回應預覽: ${result.details?.text}...\n`);
        foundModel = { apiVersion, modelName, details: result.details };
        break;
      } else {
        // 只顯示關鍵錯誤
        if (result.status === 404) {
          console.log(`❌ 404 (模型不存在)`);
        } else if (result.status === 403) {
          console.log(`❌ 403 (權限不足)`);
        } else if (result.status === 400) {
          const code = result.details?.code;
          if (code === 'FAILED_PRECONDITION') {
            console.log(`❌ 400 FAILED_PRECONDITION (可能需要付費計劃)`);
          } else {
            console.log(`❌ 400 ${code || 'INVALID_ARGUMENT'}`);
          }
        } else {
          console.log(`❌ ${result.error}`);
        }
      }
    }
    
    if (foundModel) {
      console.log('\n' + '─'.repeat(60));
      break;
    }
  }

  if (foundModel) {
    console.log(`\n🎉 找到可用的模型！\n`);
    console.log(`API 版本: ${foundModel.apiVersion}`);
    console.log(`模型名稱: ${foundModel.modelName}`);
    console.log(`\n📝 請更新 lib/services/llmService.ts：`);
    console.log(`\n1. 在 modelsToTry 陣列的最前面加入：`);
    console.log(`   '${foundModel.modelName}',`);
    console.log(`\n2. 確認使用 ${foundModel.apiVersion} API 版本`);
  } else {
    console.log('\n⚠️  沒有找到可用的模型\n');
    console.log('可能的原因（根據官方文件）：');
    console.log('1. ❌ 模型名稱不正確或已淘汰');
    console.log('2. ❌ API 版本不匹配');
    console.log('3. ❌ 區域限制（某些模型僅在特定區域可用）');
    console.log('4. ❌ 權限問題（API Key 沒有適當的存取權限）');
    console.log('5. ❌ 需要啟用付費計劃（某些地區的免費層級不可用）');
    console.log('\n建議步驟：');
    console.log('1. 前往 Google AI Studio 查看實際可用的模型列表');
    console.log('2. 檢查 API Key 權限設定');
    console.log('3. 確認是否需要啟用付費計劃');
    console.log('4. 檢查 Google Cloud Console 中的 API 啟用狀態');
    console.log('\n參考文件：');
    console.log('https://ai.google.dev/gemini-api/docs/troubleshooting?hl=zh-tw#check-api');
  }
}

main().catch(console.error);


