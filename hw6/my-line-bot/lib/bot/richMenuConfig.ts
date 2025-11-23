import type { SupportedLocale } from '../types/locale';

/**
 * Rich Menu 區域配置
 * 根據截圖設計：2行4列，共8個按鈕
 * 尺寸：2500 x 1686 像素（大型 Rich Menu）
 */
export interface RichMenuArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: 'postback' | 'message' | 'uri';
    data?: string;
    text?: string;
    label?: string;
    uri?: string;
    displayText?: string;
  };
}

/**
 * Rich Menu 按鈕配置
 * 對應截圖中的8個按鈕
 */
export interface RichMenuButton {
  id: string;
  label: {
    'zh-TW': string;
    'en-US': string;
  };
  action: {
    type: 'postback' | 'message' | 'uri';
    data?: string;
    text?: string;
    displayText?: string;
    uri?: string;
    label?: string;
  };
}

/**
 * Rich Menu 按鈕定義
 */
export const richMenuButtons: RichMenuButton[] = [
  {
    id: 'medical_aesthetics_appointment',
    label: {
      'zh-TW': '復興 醫美 查詢 預約',
      'en-US': 'Medical Aesthetics Appointment',
    },
    action: {
      type: 'postback',
      data: 'action=appointment&type=medical_aesthetics',
      displayText: '醫美查詢預約',
    },
  },
  {
    id: 'peel_appointment',
    label: {
      'zh-TW': '復興 果酸 線上 預約',
      'en-US': 'Peel Online Appointment',
    },
    action: {
      type: 'uri',
      uri: 'https://www.leyancloud.com.tw/#/login?clinicCode=88198082',
      label: '果酸線上預約',
    },
  },
  {
    id: 'acne_appointment',
    label: {
      'zh-TW': '復興 青春痘特別門診 線上 預約',
      'en-US': 'Acne Special Clinic Online Appointment',
    },
    action: {
      type: 'uri',
      uri: 'https://www.leyancloud.com.tw/#/login?clinicCode=88198082',
      label: '青春痘特別門診線上預約',
    },
  },
  {
    id: 'insurance_appointment',
    label: {
      'zh-TW': '復興 健保 健保 掛號',
      'en-US': 'Health Insurance Registration',
    },
    action: {
      type: 'uri',
      uri: 'https://www.muskin.com.tw/contact/#beauty4',
      label: '健保掛號',
    },
  },
  {
    id: 'clinic_info',
    label: {
      'zh-TW': '館別 介紹',
      'en-US': 'Clinic Introduction',
    },
    action: {
      type: 'uri',
      uri: 'https://www.muskin.com.tw/building/',
      label: '館別介紹',
    },
  },
  {
    id: 'refer_friend',
    label: {
      'zh-TW': '推薦 好友',
      'en-US': 'Refer Friend',
    },
    action: {
      type: 'postback',
      data: 'action=refer_friend',
      displayText: '推薦好友',
    },
  },
  {
    id: 'edit_profile',
    label: {
      'zh-TW': '修改 資料',
      'en-US': 'Edit Profile',
    },
    action: {
      type: 'postback',
      data: 'action=edit_profile',
      displayText: '修改資料',
    },
  },
  {
    id: 'products',
    label: {
      'zh-TW': '嚴選 產品',
      'en-US': 'Selected Products',
    },
    action: {
      type: 'postback',
      data: 'action=products',
      displayText: '嚴選產品',
    },
  },
];

/**
 * 計算 Rich Menu 區域座標
 * 2行4列布局，每個區域大小：625 x 843 像素
 */
function calculateAreaBounds(row: number, col: number): { x: number; y: number; width: number; height: number } {
  const areaWidth = 625;
  const areaHeight = 843;
  const x = col * areaWidth;
  const y = row * areaHeight;
  return { x, y, width: areaWidth, height: areaHeight };
}

/**
 * 建立 Rich Menu 配置物件
 * @param locale 語系
 * @returns Rich Menu 配置物件（用於 Line Messaging API）
 */
export function createRichMenuConfig(locale: SupportedLocale = 'zh-TW'): any {
  const areas: RichMenuArea[] = richMenuButtons.map((button, index) => {
    const row = Math.floor(index / 4); // 0 或 1
    const col = index % 4; // 0, 1, 2, 或 3
    const bounds = calculateAreaBounds(row, col);

    // 處理不同類型的 action
    const action: any = { ...button.action };
    
    if (button.action.type === 'uri') {
      // URI action 需要 label
      action.label = button.action.label || button.label[locale];
    } else if (button.action.type === 'postback') {
      // Postback action 需要 displayText
      action.displayText = button.action.displayText || button.label[locale];
    }

    return {
      bounds,
      action,
    };
  });

  return {
    size: {
      width: 2500,
      height: 1686,
    },
    selected: false,
    name: `Mumu Ri'an Rich Menu (${locale})`,
    chatBarText: locale === 'zh-TW' ? '點我選服務▼' : 'Select Service▼',
    areas,
  };
}

/**
 * 根據按鈕 ID 取得按鈕配置
 */
export function getRichMenuButtonById(buttonId: string): RichMenuButton | undefined {
  return richMenuButtons.find(button => button.id === buttonId);
}

/**
 * 根據 postback data 取得按鈕配置
 */
export function getRichMenuButtonByPostbackData(postbackData: string): RichMenuButton | undefined {
  const params = new URLSearchParams(postbackData);
  const action = params.get('action');
  const type = params.get('type');

  if (!action) return undefined;

  // 根據 action 和 type 找到對應的按鈕
  if (action === 'appointment' && type) {
    const buttonIdMap: Record<string, string> = {
      medical_aesthetics: 'medical_aesthetics_appointment',
      peel: 'peel_appointment',
      acne: 'acne_appointment',
      insurance: 'insurance_appointment',
    };
    const buttonId = buttonIdMap[type];
    return buttonId ? getRichMenuButtonById(buttonId) : undefined;
  }

  const buttonIdMap: Record<string, string> = {
    clinic_info: 'clinic_info',
    refer_friend: 'refer_friend',
    edit_profile: 'edit_profile',
    products: 'products',
  };

  const buttonId = buttonIdMap[action];
  return buttonId ? getRichMenuButtonById(buttonId) : undefined;
}


