import { TextMessage, TemplateMessage } from '@line/bot-sdk';

// 關鍵字匹配表
const KEYWORD_MAP: Record<string, string[]> = {
  clinic_info: [
    '地址', '在哪裡', '位置', '地點', '在哪', '位置在哪', '診所在哪',
    '怎麼去', '如何前往', '交通', '捷運', '公車', '地鐵', '怎麼到', '如何到',
    '復興', '忠孝復興', '捷運站', '公車站', '站牌', '出口', '步行',
    '營業時間', '營業', '開門', '關門', '幾點', '什麼時候', '時間', '開診',
    '休診', '週一', '週二', '週三', '週四', '週五', '週六', '週日', '禮拜',
    '平日', '假日', '週末',
    '電話', '聯絡', '聯繫', '打給', '撥打', '號碼', '幾號',
  ],
  service_info: [
    '服務', '治療', '項目', '可以做什麼', '有什麼', '提供', '項目有哪些',
    '服務項目', '治療項目', '可以做', '有什麼服務',
    '雷射', '染料雷射', '光纖', '亮透淨', '果酸', '果酸換膚', '果酸保養',
    '換膚', '保養', '皮膚', '青春痘', '痘痘', '過敏', '診療', '看診',
    '醫學美容', '醫美', '美容', '皮膚科',
  ],
  appointment: [
    '預約', '掛號', '想約', '要約', '可以約', '什麼時候可以', '何時可以',
    '約診', '約時間', '安排', '排時間', '預約時間', '預約看診',
    '報到', '到診', '會到', '會去', '會來', '如期', '準時',
    '改期', '改時間', '換時間', '調整時間', '延後', '提前',
  ],
  payment: [
    '付款', '付費', '付錢', '費用', '多少錢', '價格', '價錢', '收費',
    '刷卡', '現金', '轉帳', '匯款', '信用卡', '付款方式', '怎麼付',
    '如何付款', '付費方式',
  ],
  cancel: [
    '取消', '改期', '沒到', '不能去', '臨時', '不去', '不去了',
    '取消預約', '取消看診', '取消治療', '無法前往', '不能前往',
    '有事', '有事情', '沒辦法', '無法',
  ],
  post_treatment: [
    '術後', '照顧', '注意事項', '恢復', '水泡', '腫脹', '瘀青',
    '術後照顧', '術後注意', '術後恢復', '治療後', '做完後',
    '注意', '保養', '護理', '怎麼照顧', '如何照顧', '怎麼辦',
    '不舒服', '紅腫', '發炎', '過敏反應',
  ],
  symptom: [
    '症狀', '問題', '狀況', '不舒服', '痛', '癢', '紅', '腫',
    '過敏', '敏感', '發炎', '長東西', '有問題', '怎麼了',
    '怎麼辦', '該怎麼辦', '需要', '建議',
  ],
  price: [
    '價格', '價錢', '費用', '多少錢', '收費', '計費', '怎麼算',
    '一次', '療程', '療程費用', '療程價格',
  ],
  coupon: [
    '折價券', '優惠', '折扣', '折抵', '抵用', '優惠券', '券',
    '有優惠', '有折扣', '有活動', '促銷',
  ],
  companion: [
    '陪同', '家屬', '家人', '朋友', '可以帶', '可以陪', '一起',
    '陪同人員', '陪同家屬',
  ],
  greeting: [
    '你好', '在嗎', '哈囉', 'hi', 'hello', '您好',
  ],
  thanks: [
    '謝謝', '感謝', '謝了', '不客氣',
  ],
  goodbye: [
    '再見', 'bye', '拜拜', '結束',
  ],
  help: [
    '幫助', 'help', '協助', '怎麼用', '如何使用',
  ],
};

// 腳本回應內容
const SCRIPT_RESPONSES: Record<string, string> = {
  clinic_info: `📍 木木日安【復興館】

地址：台北市大安區復興南路一段81號

電話：02-2778-7178

營業時間：
週一至週五：09:00-18:00
週六：09:00-12:00
週日：休診

🚇 交通資訊：
捷運：忠孝復興站5號出口，步行3分鐘

🚌 公車站牌：
捷運忠孝復興站／微風廣場／市民復興路口

如需預約，請致電 02-2778-7178`,

  service_info: `💆 木木日安服務項目

• 染料雷射
  （建議1個月進行一次，需多次治療）

• 光纖亮透淨雷射

• 果酸保養／果酸換膚

• 一般皮膚科診療

• 青春痘治療

• 皮膚過敏診斷

• 皮膚保養諮詢

如需了解詳細資訊或預約，請致電 02-2778-7178`,

  appointment: `📅 預約服務

木木日安目前預約方式為電話預約，請直接致電 02-2778-7178

營業時間：
週一至週五：09:00-18:00
週六：09:00-12:00

我們的工作人員會為您安排最適合的看診時間。`,

  appointment_policy: `📌 小小提醒：木木日安謝謝您給予我們為您服務的機會

1. 為了良好時間排程，請準時報到時間。
報到延遲會相繼延誤醫師與工作人員下診，若延遲超過10分鐘以上，
可能會取消當日治療，請謹慎時間並與診所端保持聯繫。

2. 付款方式：僅限現金（尚無提供刷卡、匯款服務）

3. 館內為維護隱私與靜謐，接待空間僅限接待治療者本人，
陪同家屬請就近至附近咖啡館或是百貨散步逛街。

木木日安祝福您`,

  cancel_policy: `⚠️ 重要提醒：

臨時取消或當日治療未到診兩次，會取消線上預約資格，請謹慎時間排程。

如需改期或取消，請直接致電 02-2778-7178 與我們聯繫。

感謝您的配合！`,

  post_treatment: `♦ 醫師建議：

染料雷射 / 1個月進行一次 / 需多次治療

♦ 提醒您：

術後可能會有輕微局部腫脹、瘀青、水泡、或皮膚不整，是暫時性的反應，約2-3週逐漸緩解。

水泡的照顧方式請參考術後注意事項。

術後照顧上有任何問題，隨時與我們聯繫，我會盡力協助您！

診所電話：02-2778-7178`,

  price: `關於治療費用，會因個人狀況和選擇的療程而有所不同。
建議您預約看診，讓醫師評估後提供詳細的費用說明。

如需預約，請致電 02-2778-7178`,

  coupon: `木木日安會不定期推出優惠活動和折價券。
詳細優惠資訊請致電 02-2778-7178 或關注我們的官方帳號。

治療當日請出示折價券訊息，提供核對查詢。
本券限本人使用，無法轉讓。`,

  companion: `館內為維護隱私與靜謐，接待空間僅限接待治療者本人，陪同家屬請就近至附近咖啡館或是百貨散步逛街。

感謝您的配合與理解！`,

  greeting: `您好！我是木木日安的智能客服助手，可以協助您了解診所資訊、服務項目、預約相關問題。

請選擇您需要的服務：`,

  thanks: `不客氣！如有其他問題，隨時歡迎詢問。
木木日安祝福您！💙`,

  goodbye: `感謝您使用木木日安服務！
如有任何問題，隨時歡迎回來詢問。
木木日安祝福您！💙`,

  help: `我是木木日安的智能客服，可以協助您：
• 了解診所資訊（地址、電話、營業時間）
• 了解服務項目
• 預約相關問題
• 其他皮膚相關問題

請選擇您需要的服務：`,
};

// 匹配關鍵字
export function matchKeyword(message: string): string | null {
  const normalizedMessage = message.toLowerCase().trim();

  // 檢查每個類別
  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return null;
}

// 取得腳本回應
export function getScriptResponse(category: string): string | null {
  return SCRIPT_RESPONSES[category] || null;
}

// 建立歡迎訊息（Buttons Template）
export function createWelcomeMessage(): TemplateMessage {
  return {
    type: 'template',
    altText: '歡迎來到木木日安！請選擇服務',
    template: {
      type: 'buttons',
      title: '👋 歡迎來到木木日安醫學美容！',
      text: '我是您的智能客服助手，可以協助您了解診所資訊、服務項目、預約相關問題。',
      actions: [
        {
          type: 'message',
          label: '📍 診所資訊',
          text: '診所資訊',
        },
        {
          type: 'message',
          label: '💆 服務項目',
          text: '服務項目',
        },
        {
          type: 'message',
          label: '📅 預約相關',
          text: '預約相關',
        },
        {
          type: 'message',
          label: '❓ 其他問題',
          text: '其他問題',
        },
      ],
    },
  };
}

// 建立確認到診訊息（Confirm Template）
export function createAppointmentConfirmMessage(): TemplateMessage {
  return {
    type: 'template',
    altText: '請確認是否如期到診',
    template: {
      type: 'confirm',
      text: '為了良好時間排程以及預約權益，請您協助回覆是否如期到診。',
      actions: [
        {
          type: 'message',
          label: '✓ 會如期到診',
          text: '會如期到診',
        },
        {
          type: 'message',
          label: '✗ 需要改期/取消',
          text: '需要改期或取消',
        },
      ],
    },
  };
}

// 處理腳本回應
export function handleScriptResponse(message: string): TextMessage | TemplateMessage | null {
  // 檢查是否為空白或無意義訊息
  if (message.trim().length < 2) {
    return {
      type: 'text',
      text: '抱歉，我沒有理解您的問題。\n請選擇以下服務，或重新描述您的問題：',
    };
  }

  // 匹配關鍵字
  const category = matchKeyword(message);

  if (category) {
    // 特殊處理：問候語返回歡迎訊息
    if (category === 'greeting' || category === 'help') {
      return createWelcomeMessage();
    }

    // 取得腳本回應
    const response = getScriptResponse(category);
    if (response) {
      return {
        type: 'text',
        text: response,
      };
    }
  }

  return null;
}

