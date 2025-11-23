import type { SupportedLocale } from '../types/locale';
import type { SectionId } from '../i18n/sections';

// 關鍵字匹配表（支援多語系，包含 products 和 edit_profile）
export type MatchableSectionId = SectionId | 'products' | 'edit_profile';

const normalizedKeywords: Record<MatchableSectionId, Record<SupportedLocale, string[]>> = {
  welcome: {
    'zh-TW': ['hi', 'hello', 'hey', 'help', '開始', '你好', '嗨', '助教', '在嗎', '哈囉', '您好'],
    'en-US': ['hi', 'hello', 'hey', 'help', 'start', 'begin', 'greeting'],
  },
  clinic_info: {
    'zh-TW': [
      '地址', '在哪裡', '位置', '地點', '在哪', '位置在哪', '診所在哪',
      '怎麼去', '如何前往', '交通', '捷運', '公車', '地鐵', '怎麼到', '如何到',
      '復興', '忠孝復興', '捷運站', '公車站', '站牌', '出口', '步行',
      '營業時間', '營業', '開門', '關門', '幾點', '什麼時候', '時間', '開診',
      '休診', '週一', '週二', '週三', '週四', '週五', '週六', '週日', '禮拜',
      '平日', '假日', '週末',
      '電話', '聯絡', '聯繫', '打給', '撥打', '號碼', '幾號',
    ],
    'en-US': [
      'address', 'location', 'where', 'directions', 'how to get', 'transportation',
      'mrt', 'metro', 'subway', 'bus', 'station', 'exit', 'walk',
      'hours', 'business hours', 'open', 'close', 'time', 'when',
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
      'weekday', 'weekend', 'holiday',
      'phone', 'contact', 'call', 'number', 'telephone',
    ],
  },
  service_info: {
    'zh-TW': [
      '服務', '治療', '項目', '可以做什麼', '有什麼', '提供', '項目有哪些',
      '服務項目', '治療項目', '可以做', '有什麼服務',
      '雷射', '染料雷射', '光纖', '亮透淨', '果酸', '果酸換膚', '果酸保養',
      '換膚', '保養', '皮膚', '青春痘', '痘痘', '過敏', '診療', '看診',
      '醫學美容', '醫美', '美容', '皮膚科',
    ],
    'en-US': [
      'service', 'services', 'treatment', 'treatments', 'what', 'offer', 'provide',
      'laser', 'dye laser', 'fiber', 'brightening', 'aha', 'peel', 'peeling',
      'skin', 'acne', 'allergy', 'dermatology', 'beauty', 'medical beauty',
    ],
  },
  appointment: {
    'zh-TW': [
      '預約', '掛號', '想約', '要約', '可以約', '什麼時候可以', '何時可以',
      '約診', '約時間', '安排', '排時間', '預約時間', '預約看診',
      '報到', '到診', '會到', '會去', '會來', '如期', '準時',
      '改期', '改時間', '換時間', '調整時間', '延後', '提前',
    ],
    'en-US': [
      'appointment', 'book', 'schedule', 'reserve', 'reservation', 'when',
      'arrange', 'arrival', 'arrive', 'on time', 'punctual',
      'reschedule', 'change time', 'postpone', 'advance',
    ],
  },
  appointment_policy: {
    'zh-TW': ['政策', '規定', '規則', '提醒', '注意事項', '報到', '準時', '付款', '現金'],
    'en-US': ['policy', 'rule', 'rules', 'reminder', 'notice', 'arrival', 'punctual', 'payment', 'cash'],
  },
  cancel_policy: {
    'zh-TW': ['取消', '改期', '沒到', '不能去', '臨時', '不去', '不去了', '取消預約', '取消看診', '取消治療', '無法前往', '不能前往', '有事', '有事情', '沒辦法', '無法'],
    'en-US': ['cancel', 'cancellation', 'no show', 'cannot go', 'unable', 'reschedule', 'change'],
  },
  post_treatment: {
    'zh-TW': [
      '術後', '照顧', '注意事項', '恢復', '水泡', '腫脹', '瘀青',
      '術後照顧', '術後注意', '術後恢復', '治療後', '做完後',
      '注意', '保養', '護理', '怎麼照顧', '如何照顧', '怎麼辦',
      '不舒服', '紅腫', '發炎', '過敏反應',
    ],
    'en-US': [
      'post', 'treatment', 'care', 'after', 'recovery', 'blister', 'swelling', 'bruise',
      'post treatment', 'aftercare', 'how to care', 'uncomfortable', 'red', 'inflammation',
    ],
  },
  price: {
    'zh-TW': ['價格', '價錢', '費用', '多少錢', '收費', '計費', '怎麼算', '一次', '療程', '療程費用', '療程價格'],
    'en-US': ['price', 'pricing', 'cost', 'fee', 'fees', 'how much', 'charge', 'treatment cost'],
  },
  coupon: {
    'zh-TW': ['折價券', '優惠', '折扣', '折抵', '抵用', '優惠券', '券', '有優惠', '有折扣', '有活動', '促銷'],
    'en-US': ['coupon', 'discount', 'promotion', 'promo', 'offer', 'deal', 'special'],
  },
  companion: {
    'zh-TW': ['陪同', '家屬', '家人', '朋友', '可以帶', '可以陪', '一起', '陪同人員', '陪同家屬'],
    'en-US': ['companion', 'family', 'friend', 'bring', 'accompany', 'together', 'guest'],
  },
  faq: {
    'zh-TW': ['幫助', 'help', '協助', '怎麼用', '如何使用', '常見問題', '問題'],
    'en-US': ['help', 'assist', 'how to use', 'faq', 'question', 'questions'],
  },
  symptom_consultation: {
    'zh-TW': ['症狀', '問題', '狀況', '不舒服', '痛', '癢', '紅', '腫', '過敏', '敏感', '發炎', '長東西', '有問題', '怎麼了', '怎麼辦', '該怎麼辦', '需要', '建議'],
    'en-US': ['symptom', 'symptoms', 'problem', 'issue', 'uncomfortable', 'pain', 'itch', 'red', 'swell', 'allergy', 'sensitive', 'inflammation', 'need', 'advice'],
  },
  schedule: {
    'zh-TW': ['更多', '更多資訊', '更多內容', '詳細', '深入', 'schedule', '時程', '行程'],
    'en-US': ['more', 'more info', 'more information', 'detailed', 'deep dive', 'schedule', 'timeline'],
  },
  products: {
    'zh-TW': ['嚴選產品', '產品', '商品', '保養品', '購買', '買', '購物', 'shop', 'store', '產品資訊', '商品資訊'],
    'en-US': ['products', 'product', 'shop', 'store', 'buy', 'purchase', 'items', 'merchandise'],
  },
  edit_profile: {
    'zh-TW': ['修改資料', '修改', '資料', '帳號設定', '個人資料', '設定', '帳號', '個人資訊', '修改手機', '綁定手機'],
    'en-US': ['edit profile', 'edit', 'profile', 'account settings', 'settings', 'account', 'personal info', 'bind phone', 'phone binding'],
  },
};

/**
 * 正規化文字
 */
function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * 從文字匹配章節
 */
export function matchSectionFromText(
  text: string | undefined,
  locale: SupportedLocale
): MatchableSectionId | undefined {
  if (!text) {
    return undefined;
  }

  const normalized = normalizeText(text);

  // 檢查每個章節的關鍵字
  for (const [section, keywords] of Object.entries(normalizedKeywords)) {
    const localeKeywords = keywords[locale];
    if (localeKeywords.some((keyword) => normalized.includes(keyword))) {
      return section as MatchableSectionId;
    }
  }

  return undefined;
}

