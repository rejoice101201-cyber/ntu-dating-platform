/**
 * 簡訊發送服務
 * 支援台灣本地簡訊服務（三竹、互聯網等）
 * 開發階段使用模擬模式
 */

interface SMSConfig {
  apiKey?: string;
  apiUrl?: string;
  senderId?: string;
  mockMode?: boolean;
}

/**
 * 取得簡訊服務配置
 */
function getSMSConfig(): SMSConfig {
  return {
    apiKey: process.env.SMS_API_KEY,
    apiUrl: process.env.SMS_API_URL,
    senderId: process.env.SMS_SENDER_ID,
    mockMode: process.env.SMS_MOCK_MODE === 'true' || !process.env.SMS_API_KEY,
  };
}

/**
 * 發送驗證碼簡訊
 * @param phoneNumber 手機號碼（台灣格式：09xxxxxxxx）
 * @param code 驗證碼
 * @returns 是否發送成功
 */
export async function sendVerificationCode(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  const config = getSMSConfig();

  // 驗證手機號碼格式（台灣手機號碼：09xxxxxxxx，10位數）
  if (!/^09\d{8}$/.test(phoneNumber)) {
    console.error(`❌ [SMS] 無效的手機號碼格式: ${phoneNumber}`);
    return false;
  }

  // 模擬模式（開發測試用）
  if (config.mockMode) {
    console.log(`📱 [SMS Mock] 發送驗證碼到 ${phoneNumber}: ${code}`);
    console.log(`📱 [SMS Mock] 簡訊內容: 您的驗證碼是 ${code}，有效期限為 5 分鐘。`);
    // 模擬發送延遲
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  }

  // 實際簡訊服務整合
  try {
    // TODO: 整合台灣本地簡訊服務 API
    // 範例：三竹簡訊 API
    // const response = await fetch(config.apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${config.apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     phone: phoneNumber,
    //     message: `您的驗證碼是 ${code}，有效期限為 5 分鐘。`,
    //     senderId: config.senderId,
    //   }),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`SMS API 錯誤: ${response.statusText}`);
    // }
    // 
    // const result = await response.json();
    // return result.success === true;

    console.log(`📱 [SMS] 發送驗證碼到 ${phoneNumber}: ${code}`);
    console.log(`⚠️ [SMS] 簡訊服務尚未整合，請設定 SMS_API_KEY 和 SMS_API_URL`);
    return false;
  } catch (error: any) {
    console.error('❌ [SMS] 發送簡訊失敗:', error);
    return false;
  }
}

/**
 * 格式化簡訊內容
 */
export function formatVerificationMessage(code: string, locale: 'zh-TW' | 'en-US' = 'zh-TW'): string {
  if (locale === 'zh-TW') {
    return `您的驗證碼是 ${code}，有效期限為 5 分鐘。請勿將驗證碼告知他人。`;
  } else {
    return `Your verification code is ${code}. It will expire in 5 minutes. Do not share this code with anyone.`;
  }
}









