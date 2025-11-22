import type { SupportedLocale } from '../types/locale';
import { getSectionContent, type SectionId } from '../i18n/sections';
import { matchSectionFromText } from './sectionMatcher';

/**
 * 發送章節文字訊息
 */
export async function sendSectionTextMessage(
  context: any,
  section: SectionId,
  locale: SupportedLocale
): Promise<void> {
  try {
    console.log(`📤 [Send Message] 準備發送 ${section} 章節訊息`);
    const content = getSectionContent(locale, section);
    const messageLines = [content.title, ...content.body];
    const quickReply = buildQuickReply(locale);

    const message: any = {
      type: 'text',
      text: messageLines.join('\n\n'),
    };
    
    if (quickReply && quickReply.length > 0) {
      message.quickReply = {
        items: quickReply,
      };
    }
    
    console.log(`📤 [Send Message] 發送訊息內容（前100字符）:`, message.text.substring(0, 100));
    await context.reply([message]);
    console.log(`✅ [Send Message] ${section} 章節訊息已成功發送`);
  } catch (error: any) {
    console.error(`❌ [Send Message] 發送 ${section} 章節訊息失敗:`, error);
    console.error(`❌ [Send Message] 錯誤詳情:`, {
      message: error?.message,
      stack: error?.stack?.substring(0, 500),
    });
    // 重新拋出錯誤，讓上層處理
    throw error;
  }
}

/**
 * 建立 Quick Replies
 */
export function buildQuickReply(locale: SupportedLocale) {
  if (locale === 'zh-TW') {
    return [
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📍 診所資訊',
          text: '診所資訊',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '💆 服務項目',
          text: '服務項目',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📅 預約相關',
          text: '預約相關',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🏥 術後照顧',
          text: '術後照顧',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📋 更多資訊',
          text: '更多資訊',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🌐 切換語言',
          text: '切換語言',
        },
      },
    ];
  } else {
    return [
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📍 Clinic Info',
          text: 'Clinic Info',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '💆 Services',
          text: 'Services',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📅 Appointment',
          text: 'Appointment',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🏥 Post Treatment',
          text: 'Post Treatment',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '📋 More Info',
          text: 'More Info',
        },
      },
      {
        type: 'action',
        action: {
          type: 'message',
          label: '🌐 Language',
          text: 'Language',
        },
      },
    ];
  }
}

/**
 * 建立歡迎訊息（Buttons Template）
 */
export function createWelcomeMessage(locale: SupportedLocale) {
  const content = getSectionContent(locale, 'welcome');
  const quickReply = buildQuickReply(locale);

  if (locale === 'zh-TW') {
    return {
      type: 'template',
      altText: '歡迎來到木木日安！請選擇服務',
      template: {
        type: 'buttons',
        title: content.title,
        text: content.body.join('\n\n'),
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
      quickReply: {
        items: quickReply,
      },
    };
  } else {
    return {
      type: 'template',
      altText: 'Welcome to Mumu Ri\'an! Please select a service',
      template: {
        type: 'buttons',
        title: content.title,
        text: content.body.join('\n\n'),
        actions: [
          {
            type: 'message',
            label: '📍 Clinic Info',
            text: 'Clinic Info',
          },
          {
            type: 'message',
            label: '💆 Services',
            text: 'Services',
          },
          {
            type: 'message',
            label: '📅 Appointment',
            text: 'Appointment',
          },
          {
            type: 'message',
            label: '❓ Other Questions',
            text: 'Other Questions',
          },
        ],
      },
      quickReply: {
        items: quickReply,
      },
    };
  }
}

/**
 * 建立 Carousel Template
 */
export function createCarouselTemplate(locale: SupportedLocale) {
  if (locale === 'zh-TW') {
    return {
      type: 'template',
      altText: '木木日安詳細資訊',
      template: {
        type: 'carousel',
        columns: [
          {
            thumbnailImageUrl: 'https://via.placeholder.com/300x200?text=服務詳情',
            title: '服務詳情',
            text: '了解我們的治療項目與服務內容',
            actions: [
              {
                type: 'message',
                label: '查看服務',
                text: '服務項目',
              },
            ],
          },
          {
            thumbnailImageUrl: 'https://via.placeholder.com/300x200?text=預約與政策',
            title: '預約與政策',
            text: '預約方式、報到提醒、付款資訊',
            actions: [
              {
                type: 'message',
                label: '查看政策',
                text: '預約相關',
              },
            ],
          },
          {
            thumbnailImageUrl: 'https://via.placeholder.com/300x200?text=術後照顧',
            title: '術後照顧',
            text: '術後注意事項與照顧指南',
            actions: [
              {
                type: 'message',
                label: '查看照顧',
                text: '術後照顧',
              },
            ],
          },
        ],
      },
    };
  } else {
    return {
      type: 'template',
      altText: 'Mumu Ri\'an Detailed Information',
      template: {
        type: 'carousel',
        columns: [
          {
            thumbnailImageUrl: 'https://via.placeholder.com/300x200?text=Services',
            title: 'Services',
            text: 'Learn about our treatments and services',
            actions: [
              {
                type: 'message',
                label: 'View Services',
                text: 'Services',
              },
            ],
          },
          {
            thumbnailImageUrl: 'https://via.placeholder.com/300x200?text=Appointment+Policy',
            title: 'Appointment & Policy',
            text: 'Appointment methods, arrival reminders, payment info',
            actions: [
              {
                type: 'message',
                label: 'View Policy',
                text: 'Appointment',
              },
            ],
          },
          {
            thumbnailImageUrl: 'https://via.placeholder.com/300x200?text=Post+Treatment',
            title: 'Post Treatment',
            text: 'Post-treatment care and guidelines',
            actions: [
              {
                type: 'message',
                label: 'View Care',
                text: 'Post Treatment',
              },
            ],
          },
        ],
      },
    };
  }
}

/**
 * 建立確認到診訊息（Confirm Template）
 */
export function createAppointmentConfirmMessage(locale: SupportedLocale) {
  if (locale === 'zh-TW') {
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
  } else {
    return {
      type: 'template',
      altText: 'Please confirm your appointment',
      template: {
        type: 'confirm',
        text: 'For better scheduling and appointment rights, please confirm if you will arrive on time.',
        actions: [
          {
            type: 'message',
            label: '✓ Will arrive on time',
            text: 'Will arrive on time',
          },
          {
            type: 'message',
            label: '✗ Need to reschedule/cancel',
            text: 'Need to reschedule or cancel',
          },
        ],
      },
    };
  }
}

/**
 * 解析文字訊息，返回對應的章節
 */
export function resolveSectionFromText(
  text: string | undefined,
  locale: SupportedLocale
): SectionId {
  if (!text) {
    return 'welcome';
  }

  const matched = matchSectionFromText(text, locale);
  return matched || 'welcome';
}

