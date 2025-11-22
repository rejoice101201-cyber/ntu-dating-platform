import type { SupportedLocale } from '../types/locale';

function getSystemPrompt(locale: SupportedLocale): string {
  if (locale === 'en-US') {
    return `You are a professional AI customer service assistant for "Mumu Ri'an Medical Beauty Clinic (Fuxing Branch)".

[Important Principles]
1. Cannot provide medical diagnosis or treatment advice
2. When encountering specific symptoms, must recommend scheduling an appointment (Phone: 02-2778-7178)
3. Friendly, professional, and empathetic tone
4. Concise and clear answers (maximum 200 words)
5. Guide users to use menu functions or call the clinic when appropriate

[Clinic Information]
- Name: Mumu Ri'an Medical Beauty (Fuxing Branch)
- Address: No. 81, Section 1, Fuxing South Road, Da'an District, Taipei City
- Phone: 02-2778-7178
- Business Hours: Monday to Friday 09:00-18:00, Saturday 09:00-12:00 (Closed on Sunday)
- Transportation: MRT Zhongxiao Fuxing Station Exit 5, 3 minutes walk

[Services]
- Dye Laser (Recommended once a month, multiple treatments required)
- Fiber Brightening Laser
- AHA Treatment / AHA Peeling
- General Dermatology
- Acne Treatment
- Skin Allergy Diagnosis
- Skin Care Consultation

[Important Policies]
- Payment Method: Cash only (no credit card or bank transfer services available)
- Arrival delay of more than 10 minutes may result in cancellation of the day's treatment
- Two instances of last-minute cancellation or no-show will result in cancellation of online appointment eligibility
- To maintain privacy and tranquility, the reception area is limited to the patient only

[Response Style]
- Use English
- Friendly but professional tone (refer to "Thank you for giving us the opportunity to serve you" tone)
- Use emojis appropriately (🔔📌♦, but not excessive)
- Provide next step suggestions at the end (e.g., For appointments, please call 02-2778-7178)

[Post-Treatment Care Information]
Post-treatment may include mild local swelling, bruising, blisters, or skin irregularities, which are temporary reactions that gradually improve within 2-3 weeks.
If you have any questions about post-treatment care, please contact the clinic directly.`;
  }

  // Default to Traditional Chinese
  return `你是「木木日安醫學美容診所（復興館）」的專業 AI 客服助手。

【重要原則】
1. 不能提供醫療診斷或治療建議
2. 遇到具體症狀，必須建議預約看診（電話：02-2778-7178）
3. 語氣友善、專業、有同理心
4. 回答簡潔明確（最多 200 字）
5. 適時引導使用者使用選單功能或致電診所

【診所資訊】
- 名稱：木木日安醫學美容（復興館）
- 地址：台北市大安區復興南路一段81號
- 電話：02-2778-7178
- 營業時間：週一至週五 09:00-18:00，週六 09:00-12:00（週日休診）
- 交通：捷運忠孝復興站5號出口，步行3分鐘

【服務項目】
- 染料雷射（建議1個月進行一次，需多次治療）
- 光纖亮透淨雷射
- 果酸保養／果酸換膚
- 一般皮膚科診療
- 青春痘治療
- 皮膚過敏診斷
- 皮膚保養諮詢

【重要政策】
- 付款方式：僅限現金（尚無提供刷卡、匯款服務）
- 報到延遲超過10分鐘以上，可能會取消當日治療
- 臨時取消或當日治療未到診兩次，會取消線上預約資格
- 館內為維護隱私與靜謐，接待空間僅限接待治療者本人

【回應風格】
- 使用繁體中文
- 語氣親切但不失專業（參考「木木日安謝謝您給予我們為您服務的機會」的語調）
- 適時使用表情符號（🔔📌♦等，但不過度）
- 結尾可提供下一步建議（如：如需預約請致電 02-2778-7178）

【術後照顧資訊】
術後可能會有輕微局部腫脹、瘀青、水泡、或皮膚不整，是暫時性的反應，約2-3週逐漸緩解。
如有術後照顧問題，建議直接聯繫診所。`;
}

export interface LLMResponse {
  success: boolean;
  message?: string | null; // 允許 message 為 null
  error?: string;
  model?: string; // 使用的模型名稱
  latency?: number; // 回應時間（毫秒）
  tokens?: {
    input?: number;
    output?: number;
  };
}

// 使用 REST API 直接調用 Gemini（更可靠）
async function callGeminiREST(modelName: string, prompt: string): Promise<LLMResponse> {
  const startTime = Date.now();
  const API_KEY = process.env.GEMINI_API_KEY || '';
  if (!API_KEY) {
    return { success: false, error: 'NO_API_KEY', message: null };
  }

  try {
    // 根據診斷腳本測試結果，v1beta 是唯一可用的 API 版本
    // v1 版本的所有模型都返回 404
    // 優先使用 v1beta，如果失敗再嘗試 v1（雖然不太可能成功）
    const apiVersions = ['v1beta', 'v1'];
    let lastError: any = null;
    
    for (const apiVersion of apiVersions) {
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
                text: prompt
              }]
            }]
          }),
          // 設定超時
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const status = response.status;
          const errorMessage = errorData.error?.message || response.statusText;
          const errorCode = errorData.error?.code || errorData.error?.status;
          
          // 如果是 404，嘗試下一個 API 版本或模型
          if (status === 404) {
            console.warn(`模型 ${modelName} 在 ${apiVersion} 不可用 (404)`);
            console.warn('可能原因：模型名稱不正確、API 版本不匹配、或區域限制');
            lastError = { status, error: 'MODEL_NOT_FOUND', details: errorData };
            continue;
          }
          
          if (status === 429) {
            // 429 表示配額用盡，但模型存在
            // 可以嘗試其他模型（如果有的話）
            console.warn(`模型 ${modelName} 配額用盡 (429)，嘗試下一個模型...`);
            if (apiVersion === 'v1beta' && modelName.includes('2.5')) {
              // 如果是 2.5 系列配額用盡，繼續嘗試其他模型
              lastError = { status, error: 'RATE_LIMIT', message: '配額用盡' };
              continue;
            }
            return {
              success: false,
              error: 'RATE_LIMIT',
              message: '系統目前使用量較高，請稍後再試。如需緊急協助，請致電 02-2778-7178',
            };
          }
          
          // 處理 400 FAILED_PRECONDITION（根據官方文件）
          if (status === 400 && errorCode === 'FAILED_PRECONDITION') {
            console.error('⚠️  根據官方文件，可能需要啟用付費計劃');
            return {
              success: false,
              error: 'BILLING_REQUIRED',
              message: 'Gemini API 免費層級在您的地區不可用，請在 Google AI Studio 中啟用付費計劃。參考：https://ai.google.dev/gemini-api/docs/troubleshooting?hl=zh-tw#check-api',
            };
          }
          
          // 處理 403 PERMISSION_DENIED（根據官方文件）
          if (status === 403 && errorCode === 'PERMISSION_DENIED') {
            console.error('⚠️  API Key 權限不足');
            return {
              success: false,
              error: 'PERMISSION_DENIED',
              message: 'API Key 沒有必要的權限，請檢查 Google Cloud Console 中的 API 啟用狀態。參考：https://ai.google.dev/gemini-api/docs/troubleshooting?hl=zh-tw#check-api',
            };
          }

          console.error(`Gemini API 錯誤 (${status}):`, errorMessage);
          lastError = { status, error: 'API_ERROR', message: errorMessage };
          continue;
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const text = data.candidates[0].content.parts[0].text;
          const latency = Date.now() - startTime;
          console.log(`✅ 使用模型 ${modelName} (${apiVersion}) 成功，耗時 ${latency}ms`);
          
          // 提取 token 使用資訊（如果有的話）
          const usage = data.usageMetadata || {};
          
          return { 
            success: true, 
            message: text,
            model: modelName,
            latency,
            tokens: {
              input: usage.promptTokenCount,
              output: usage.candidatesTokenCount,
            },
          };
        }

        lastError = { error: 'INVALID_RESPONSE' };
        continue;
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
          return {
            success: false,
            error: 'TIMEOUT',
            message: '回應時間過長，請稍後再試。如需協助，請致電 02-2778-7178',
          };
        }
        lastError = fetchError;
        continue;
      }
    }
    
    // 所有 API 版本都失敗
    if (lastError?.error === 'MODEL_NOT_FOUND') {
      return { success: false, error: 'MODEL_NOT_FOUND', message: null };
    }
    
    console.error('Gemini REST API 所有版本都失敗:', lastError);
    return { success: false, error: 'API_ERROR', message: null };
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        success: false,
        error: 'TIMEOUT',
        message: '回應時間過長，請稍後再試。如需協助，請致電 02-2778-7178',
      };
    }
    
    console.error('Gemini REST API 錯誤:', error);
    return { success: false, error: 'UNKNOWN', message: null };
  }
}

export async function generateResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  locale: SupportedLocale = 'zh-TW'
): Promise<LLMResponse> {
  // 嘗試的模型列表（按優先順序）
  // 根據診斷腳本測試結果，已確認可用的模型
  const modelsToTry = [
    'gemini-2.0-flash-exp',  // ✅ 已確認可用（v1beta）
    'gemini-2.5-pro',        // 存在但可能配額用盡（429）
    'gemini-2.5-flash',      // 存在但可能配額用盡（429）
    'gemini-1.5-flash',      // 備用
    'gemini-1.5-pro',        // 備用
    'gemini-1.0-pro',        // 備用
    'gemini-pro',            // 備用
  ];

  const systemPrompt = getSystemPrompt(locale);

  // 構建對話歷史
  const historyText = conversationHistory
    .slice(-3) // 只取最近 3 輪
    .map((msg) => `${msg.role === 'user' ? (locale === 'en-US' ? 'User' : '使用者') : (locale === 'en-US' ? 'Assistant' : '助手')}: ${msg.content}`)
    .join('\n');

  const prompt = locale === 'en-US'
    ? `${systemPrompt}

User Question: ${userMessage}

${historyText ? `Conversation History (Last 3 turns):\n${historyText}\n` : ''}

Please provide a professional and friendly response based on the above information.
If the question involves appointments, rescheduling, or cancellation, please remind about relevant policies.
If the question involves specific symptoms, please recommend scheduling an appointment.`
    : `${systemPrompt}

使用者問題：${userMessage}

${historyText ? `對話歷史（最近 3 輪）：\n${historyText}\n` : ''}

請根據以上資訊，提供專業且友善的回應。
如果問題涉及預約、改期、取消，請提醒相關政策。
如果問題涉及具體症狀，請建議預約看診。`;

  // 嘗試每個模型（使用 REST API）
  for (const modelName of modelsToTry) {
    try {
      console.log(`嘗試使用模型: ${modelName}`);
      const result = await callGeminiREST(modelName, prompt);
      
      if (result.success && result.message) {
        console.log(`✅ 使用模型 ${modelName} 成功`);
        return result;
      }
      
      // 如果是 404，繼續嘗試下一個模型
      if (result.error === 'MODEL_NOT_FOUND') {
        console.warn(`模型 ${modelName} 不可用 (404)，嘗試下一個模型...`);
        continue;
      }
      
      // 其他錯誤（429, timeout 等）直接返回
      if (result.error === 'RATE_LIMIT' || result.error === 'TIMEOUT') {
        return result;
      }
      
      // 其他錯誤也繼續嘗試
      console.warn(`模型 ${modelName} 發生錯誤，嘗試下一個模型...`);
      continue;
    } catch (error: any) {
      console.warn(`模型 ${modelName} 異常:`, error);
      continue;
    }
  }

  // 所有模型都失敗
  console.error('所有 Gemini 模型都無法使用。');
  return {
    success: false,
    error: 'MODEL_NOT_FOUND',
    message: null, // 返回 null 讓 webhook 使用通用回應
  };
}
