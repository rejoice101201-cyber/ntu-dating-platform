import type { SupportedLocale } from '../types/locale';
import { getSectionContent, type SectionId } from '../i18n/sections';
import { matchSectionFromText, type MatchableSectionId } from './sectionMatcher';

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
  // 如果匹配到 'products'，返回 'welcome'（因為 products 會在 eventHandler 中特殊處理）
  if (matched === 'products') {
    return 'welcome';
  }
  return (matched as SectionId) || 'welcome';
}

/**
 * 建立嚴選產品 Flex Message Carousel
 */
export function createProductsCarousel(locale: SupportedLocale = 'zh-TW') {
  const altText = locale === 'zh-TW' ? '嚴選產品' : 'Selected Products';
  
  return {
    type: 'flex',
    altText,
    contents: {
      type: 'carousel',
      contents: [
        {
          type: 'bubble',
          hero: {
            type: 'image',
            size: 'full',
            aspectRatio: '20:19',
            aspectMode: 'cover',
            url: 'https://cdn-next.cybassets.com/media/W1siZiIsIjIzODQzL3Byb2R1Y3RzLzM5MDI5NjEyLzE3MTYzNDE5MzNfZGMxN2NiZDA3MTJhNTVmZTEyYzIuanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=f985a7a2896bb024',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '溫和舒服洗面乳',
                wrap: true,
                weight: 'bold',
                size: 'xl',
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'text',
                    text: 'NT$420',
                    wrap: true,
                    weight: 'bold',
                    size: 'xl',
                    flex: 0,
                  },
                ],
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                action: {
                  type: 'uri',
                  label: 'Buy now',
                  uri: 'https://shop.muskin.com.tw/products/acne_cleanser',
                },
              },
            ],
          },
        },
        {
          type: 'bubble',
          hero: {
            type: 'image',
            size: 'full',
            aspectRatio: '20:19',
            aspectMode: 'cover',
            url: 'https://cdn-next.cybassets.com/media/W1siZiIsIjIzODQzL3Byb2R1Y3RzLzM5MzA0OTUxLzE2Nzg3NzMwNjdfNzNhYjY4ZmNhMzU4MzhjMmIwNzMuanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=5b3de1b8c6d72d83',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '果酸保養',
                wrap: true,
                weight: 'bold',
                size: 'xl',
              },
              {
                type: 'box',
                layout: 'baseline',
                flex: 1,
                contents: [
                  {
                    type: 'text',
                    text: 'NT$900',
                    wrap: true,
                    weight: 'bold',
                    size: 'xl',
                    flex: 0,
                  },
                ],
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                flex: 2,
                style: 'primary',
                color: '#aaaaaa',
                action: {
                  type: 'uri',
                  label: 'Buy now',
                  uri: 'https://shop.muskin.com.tw/products/retinoid_gel',
                },
              },
            ],
          },
        },
        {
          type: 'bubble',
          hero: {
            type: 'image',
            size: 'full',
            aspectRatio: '20:19',
            aspectMode: 'cover',
            url: 'https://cdn-next.cybassets.com/media/W1siZiIsIjIzODQzL3Byb2R1Y3RzLzM5MzA0OTQ0LzE3MjcxMDM5NjBfOWYyODQ3M2QzNzBmODFhMDE1MWYuanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=092d45f4451a1d59',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '抗荳蔓肌膚｜淨荳凝露',
                wrap: true,
                weight: 'bold',
                size: 'xl',
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'text',
                    text: 'NT$790',
                    wrap: true,
                    weight: 'bold',
                    size: 'xl',
                    flex: 0,
                  },
                ],
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                action: {
                  type: 'uri',
                  label: 'Buy now',
                  uri: 'https://shop.muskin.com.tw',
                },
              },
            ],
          },
        },
        {
          type: 'bubble',
          hero: {
            type: 'image',
            size: 'full',
            aspectRatio: '20:19',
            aspectMode: 'cover',
            url: 'https://cdn-next.cybassets.com/media/W1siZiIsIjIzODQzL3Byb2R1Y3RzLzM5MzA0ODA0LzE3MjcxMTkzMzFfMzhkNGU0YjIyMTAwM2Y1NjgxMDYuanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=4333d8a914f12bd5',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '敏弱肌專用乳液 50ml',
                wrap: true,
                weight: 'bold',
                size: 'xl',
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'text',
                    text: 'NT$790',
                    wrap: true,
                    weight: 'bold',
                    size: 'xl',
                    flex: 0,
                  },
                ],
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                action: {
                  type: 'uri',
                  label: 'Buy now',
                  uri: 'https://shop.muskin.com.tw',
                },
              },
            ],
          },
        },
        {
          type: 'bubble',
          hero: {
            type: 'image',
            size: 'full',
            aspectRatio: '20:19',
            aspectMode: 'cover',
            url: 'https://cdn-next.cybassets.com/media/W1siZiIsIjIzODQzL3Byb2R1Y3RzLzM5MzA0OTU3LzE2Nzg3NzMwMzBfMjg0YzlmMWY1ZjFkYWRmNmQxZDQuanBlZyJdLFsicCIsInRodW1iIiwiNjAweDYwMCJdXQ.jpeg?sha=d303b4cd755f1257',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '玻尿酸保濕保水',
                wrap: true,
                weight: 'bold',
                size: 'xl',
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'text',
                    text: 'NT$980',
                    wrap: true,
                    weight: 'bold',
                    size: 'xl',
                    flex: 0,
                  },
                ],
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                action: {
                  type: 'uri',
                  label: 'Buy now',
                  uri: 'https://shop.muskin.com.tw',
                },
              },
            ],
          },
        },
        {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                flex: 1,
                gravity: 'center',
                action: {
                  type: 'uri',
                  label: 'See more',
                  uri: 'https://shop.muskin.com.tw',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

