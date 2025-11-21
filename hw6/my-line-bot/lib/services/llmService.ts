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
  message?: string;
  error?: string;
}

export async function generateResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<LLMResponse> {
  try {
    // 使用正確的模型名稱（根據 Google Gemini API 文檔）
    // 嘗試 gemini-1.5-flash-latest，如果失敗會降級處理
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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

    // 設定超時（5 秒）
    const timeoutPromise = new Promise<LLMResponse>((_, reject) => {
      setTimeout(() => reject(new Error('LLM API timeout')), 5000);
    });

    const apiPromise = model.generateContent(prompt).then((result) => {
      const response = result.response;
      const text = response.text() || '抱歉，我無法產生回應。';
      return { success: true, message: text };
    }).catch((error) => {
      // 如果模型不存在，嘗試其他模型
      if (error?.status === 404 || error?.message?.includes('not found')) {
        console.warn('gemini-1.5-flash-latest 不可用，嘗試 gemini-1.5-pro-latest');
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
        return fallbackModel.generateContent(prompt).then((result) => {
          const response = result.response;
          const text = response.text() || '抱歉，我無法產生回應。';
          return { success: true, message: text };
        });
      }
      throw error;
    });

    const result = await Promise.race([apiPromise, timeoutPromise]);

    return result;
  } catch (error: any) {
    console.error('LLM API 錯誤:', error);

    // 處理 404 錯誤（模型不存在）
    if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')) {
      console.error('Gemini 模型不存在，請檢查模型名稱:', error);
      return {
        success: false,
        error: 'MODEL_NOT_FOUND',
        message: null, // 返回 null 讓 webhook 使用通用回應
      };
    }

    // 處理 429 錯誤（速率限制）
    if (error?.status === 429 || error?.message?.includes('429')) {
      return {
        success: false,
        error: 'RATE_LIMIT',
        message: '系統目前使用量較高，請稍後再試。如需緊急協助，請致電 02-2778-7178',
      };
    }

    // 處理超時
    if (error?.message?.includes('timeout')) {
      return {
        success: false,
        error: 'TIMEOUT',
        message: '回應時間過長，請稍後再試。如需協助，請致電 02-2778-7178',
      };
    }

    // 其他錯誤（API Key 錯誤、網路問題等）
    console.error('LLM API 未知錯誤:', error?.status, error?.message);
    return {
      success: false,
      error: 'UNKNOWN',
      message: null, // 返回 null 讓 webhook 使用通用回應
    };
  }
}

