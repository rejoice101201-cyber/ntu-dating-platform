import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `你是「木木日安醫學美容診所（復興館）」的專業 AI 客服助手。

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

export interface LLMResponse {
  success: boolean;
  message?: string | null; // 允許 message 為 null
  error?: string;
}

export async function generateResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<LLMResponse> {
  // 嘗試的模型列表（按優先順序）
  // 根據 Google AI Studio，常見的模型名稱包括：
  const modelsToTry = [
    'gemini-1.5-flash-latest',  // 最新版本（最可能可用）
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro-latest',
    'gemini-1.0-pro',
    'gemini-pro',
  ];

  // 構建對話歷史
  const historyText = conversationHistory
    .slice(-3) // 只取最近 3 輪
    .map((msg) => `${msg.role === 'user' ? '使用者' : '助手'}: ${msg.content}`)
    .join('\n');

  const prompt = `${SYSTEM_PROMPT}

使用者問題：${userMessage}

${historyText ? `對話歷史（最近 3 輪）：\n${historyText}\n` : ''}

請根據以上資訊，提供專業且友善的回應。
如果問題涉及預約、改期、取消，請提醒相關政策。
如果問題涉及具體症狀，請建議預約看診。`;

  // 嘗試每個模型
  for (const modelName of modelsToTry) {
    try {
      console.log(`嘗試使用模型: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // 設定超時（5 秒）
      const timeoutPromise = new Promise<LLMResponse>((_, reject) => {
        setTimeout(() => reject(new Error('LLM API timeout')), 5000);
      });

      const apiPromise = model.generateContent(prompt).then((result) => {
        const response = result.response;
        const text = response.text() || '抱歉，我無法產生回應。';
        console.log(`✅ 使用模型 ${modelName} 成功`);
        return { success: true, message: text };
      });

      const result = await Promise.race([apiPromise, timeoutPromise]);
      return result; // 成功，返回結果

    } catch (error: any) {
      // 如果是 404 錯誤（模型不存在），嘗試下一個模型
      if (error?.status === 404 || error?.message?.includes('not found') || error?.message?.includes('404')) {
        console.warn(`模型 ${modelName} 不可用 (404)，嘗試下一個模型...`);
        continue; // 繼續嘗試下一個模型
      }

      // 如果是其他錯誤（429, timeout 等），直接返回錯誤
      console.error(`模型 ${modelName} 錯誤:`, error);

      if (error?.status === 429 || error?.message?.includes('429')) {
        return {
          success: false,
          error: 'RATE_LIMIT',
          message: '系統目前使用量較高，請稍後再試。如需緊急協助，請致電 02-2778-7178',
        };
      }

      if (error?.message?.includes('timeout')) {
        return {
          success: false,
          error: 'TIMEOUT',
          message: '回應時間過長，請稍後再試。如需協助，請致電 02-2778-7178',
        };
      }

      // 其他錯誤也繼續嘗試下一個模型
      console.warn(`模型 ${modelName} 發生錯誤，嘗試下一個模型...`);
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
