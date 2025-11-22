import type { LineContext } from 'bottender';
import type { SupportedLocale } from '../types/locale';
import type { SectionId } from '../i18n/sections';
import { getUserLocale, setUserLocale } from '../i18n/utils';
import { getSectionContent } from '../i18n/sections';
import { sendSectionTextMessage, createWelcomeMessage, createCarouselTemplate, resolveSectionFromText } from './scriptService';
import { generateResponse } from '../services/llmService';
import { checkRateLimit } from '../services/rateLimitService';
import {
  getOrCreateConversation,
  saveMessage,
  saveEventWithMetadata,
  getConversationHistory,
  updateConversationState,
} from '../services/conversationService';

/**
 * 處理 Line 事件
 */
export async function handleLineEvent(context: LineContext): Promise<void> {
  const startTime = Date.now();
  const userId = context.event.source?.userId;
  const eventType = context.event.type;
  const timestamp = new Date().toISOString();
  
  // 詳細日誌記錄
  console.log('📨 [Webhook Event]', {
    timestamp,
    eventType,
    userId: userId?.substring(0, 20) + '...',
    hasText: context.event.isText,
    text: context.event.isText ? context.event.text?.substring(0, 50) : undefined,
  });

  if (!userId) {
    console.error('❌ [Webhook Event] No user ID in event');
    return;
  }

  const locale = await getUserLocale(userId);
  const text = context.event.isText ? context.event.text : undefined;

  // 處理 Follow/Join 事件
  if (context.event.isFollow || context.event.isJoin) {
    await sendWelcomeMessage(context, userId, locale);
    return;
  }

  // 處理 Postback 事件
  if (context.event.isPostback) {
    await handlePostbackEvent(context, userId, locale);
    return;
  }

  // 處理文字訊息
  if (context.event.isText) {
    await handleTextMessage(context, userId, text, locale);
    return;
  }

  // 處理其他訊息類型
  if (context.event.isMessage) {
    await handleOtherMessage(context, userId, locale);
    return;
  }
}

/**
 * 發送歡迎訊息
 */
async function sendWelcomeMessage(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  try {
    const welcomeMessage = createWelcomeMessage(locale);
    await context.reply([welcomeMessage as any]);

    // 儲存到資料庫
    try {
      const conversation = await getOrCreateConversation(userId);
      await saveMessage(
        conversation.id,
        userId,
        'template',
        '歡迎訊息',
        'system',
        undefined,
        welcomeMessage
      );
      await updateConversationState(conversation.id, 'greeting');
    } catch (dbError) {
      console.warn('資料庫連接失敗，歡迎訊息已發送但未儲存:', dbError);
    }
  } catch (error) {
    console.error('處理 Follow 事件錯誤:', error);
  }
}

/**
 * 處理文字訊息
 */
async function handleTextMessage(
  context: LineContext,
  userId: string,
  text: string | undefined,
  locale: SupportedLocale
): Promise<void> {
  const startTime = Date.now();
  console.log('💬 [Text Message]', {
    userId: userId.substring(0, 20) + '...',
    text: text?.substring(0, 100),
    locale,
    timestamp: new Date().toISOString(),
  });

  if (!text) {
    console.warn('⚠️ [Text Message] Empty text, returning');
    return;
  }

  // 檢查語言切換
  const lowerText = text.toLowerCase();
  if (lowerText.includes('language') || text.includes('語言') || text.includes('切換語言')) {
    await sendLanguageSelection(context, userId, locale);
    return;
  }

  // 檢查是否為語系選擇
  if (lowerText.includes('english') || lowerText === 'en' || text.includes('英文')) {
    setUserLocale(userId, 'en-US');
    await context.sendText('Language changed to English.');
    // 更新資料庫中的語系偏好
    try {
      const conversation = await getOrCreateConversation(userId);
      await updateConversationState(conversation.id, 'idle', { locale: 'en-US' });
    } catch (e) {
      console.warn('更新語系偏好失敗:', e);
    }
    return;
  }
  if (lowerText.includes('chinese') || lowerText.includes('中文') || text.includes('繁體')) {
    setUserLocale(userId, 'zh-TW');
    await context.sendText('語言已切換為繁體中文。');
    // 更新資料庫中的語系偏好
    try {
      const conversation = await getOrCreateConversation(userId);
      await updateConversationState(conversation.id, 'idle', { locale: 'zh-TW' });
    } catch (e) {
      console.warn('更新語系偏好失敗:', e);
    }
    return;
  }

  let conversation: any = null;
  let dbAvailable = false;

  // 嘗試連接資料庫
  try {
    conversation = await getOrCreateConversation(userId);
    dbAvailable = true;

    // 儲存使用者訊息（包含完整 metadata）
    const messageStartTime = Date.now();
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'text',
      text,
      'user',
      {
        lineMessageId: context.event.message?.id,
        eventType: 'message',
        source: {
          type: context.event.source?.type || 'user',
          userId,
          groupId: context.event.source?.type === 'group' ? (context.event.source as any).groupId : undefined,
          roomId: context.event.source?.type === 'room' ? (context.event.source as any).roomId : undefined,
        },
        replyToken: context.event.replyToken,
        processingTime: Date.now() - messageStartTime,
        processingStatus: 'success',
        rawEvent: context.event,
      }
    );
  } catch (dbError) {
    console.warn('資料庫連接失敗，將使用降級模式:', dbError);
    dbAvailable = false;
  }

  // 檢查速率限制
  if (dbAvailable) {
    try {
      const rateLimit = await checkRateLimit(userId);
      if (!rateLimit.allowed) {
        const fallbackText = locale === 'zh-TW'
          ? '抱歉，您發送訊息的頻率過高，請稍後再試。如需緊急協助，請致電 02-2778-7178'
          : 'Sorry, you are sending messages too frequently. Please try again later. For urgent assistance, please call 02-2778-7178';
        await context.sendText(fallbackText);
        if (conversation) {
          try {
            await saveMessage(conversation.id, userId, 'text', fallbackText, 'assistant');
          } catch (e) {
            console.warn('儲存訊息失敗:', e);
          }
        }
        return;
      }
    } catch (rateLimitError) {
      console.warn('速率限制檢查失敗:', rateLimitError);
    }
  }

  // 匹配章節
  const section = resolveSectionFromText(text, locale);

  // 如果是 schedule 章節，發送 Carousel
  if (section === 'schedule') {
    await sendSectionTextMessage(context, section, locale);
    const carousel = createCarouselTemplate(locale);
    await context.reply([carousel as any]);
    
    if (dbAvailable && conversation) {
      try {
        await saveEventWithMetadata(
          conversation.id,
          userId,
          'template',
          '更多資訊 Carousel',
          'assistant',
          {
            eventType: 'carousel',
            source: {
              type: context.event.source?.type || 'user',
              userId,
            },
            processingStatus: 'success',
          }
        );
        await updateConversationState(conversation.id, 'menu_selection');
      } catch (saveError) {
        console.warn('儲存回應失敗:', saveError);
      }
    }
    return;
  }

  // 發送章節訊息
  try {
    await sendSectionTextMessage(context, section, locale);

    if (dbAvailable && conversation) {
      try {
        const content = getSectionContent(locale, section);
        const responseText = [content.title, ...content.body].join('\n\n');
        await saveEventWithMetadata(
          conversation.id,
          userId,
          'text',
          responseText,
          'assistant',
          {
            eventType: 'section_response',
            source: {
              type: context.event.source?.type || 'user',
              userId,
            },
            processingStatus: 'success',
            sectionId: section,
          }
        );
        await updateConversationState(conversation.id, section as any);
      } catch (saveError) {
        console.warn('儲存回應失敗:', saveError);
      }
    }
  } catch (error) {
    console.error('發送章節訊息錯誤:', error);
    
    // 如果腳本無法處理，使用 LLM
    await handleLLMResponse(context, userId, text, locale, conversation, dbAvailable);
  }
}

/**
 * 處理 LLM 回應（當腳本無法處理時）
 */
async function handleLLMResponse(
  context: LineContext,
  userId: string,
  text: string,
  locale: SupportedLocale,
  conversation: any,
  dbAvailable: boolean
): Promise<void> {
  const llmStartTime = Date.now();
  try {
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (dbAvailable && conversation) {
      try {
        conversationHistory = await getConversationHistory(conversation.id, 3);
      } catch (historyError) {
        console.warn('取得對話歷史失敗:', historyError);
      }
    }

    const llmResponse = await generateResponse(text, conversationHistory, locale);
    const llmLatency = llmResponse.latency || (Date.now() - llmStartTime);

    if (llmResponse.success && llmResponse.message) {
      await context.sendText(llmResponse.message);

      if (dbAvailable && conversation) {
        try {
          await saveEventWithMetadata(
            conversation.id,
            userId,
            'text',
            llmResponse.message,
            'assistant',
            {
              eventType: 'llm_response',
              source: {
                type: context.event.source?.type || 'user',
                userId,
              },
              processingTime: llmLatency,
              processingStatus: 'success',
              llmDetails: {
                model: llmResponse.model || 'unknown',
                latency: llmResponse.latency || llmLatency,
                tokens: llmResponse.tokens,
                success: true,
              },
            }
          );
          await updateConversationState(conversation.id, 'symptom_consultation');
        } catch (saveError) {
          console.warn('儲存 LLM 回應失敗:', saveError);
        }
      }
    } else {
      // LLM 失敗，使用友善的降級回應
      const fallbackText = llmResponse.message || (locale === 'zh-TW'
        ? `您好！我是木木日安的智能客服助手。

關於您的問題，我目前無法提供詳細的 AI 回應，但我可以協助您：

• 了解診所資訊（地址、電話、營業時間）
• 了解服務項目
• 預約相關問題

如需更詳細的協助，請致電 02-2778-7178 與我們聯繫，我們的工作人員會很樂意為您服務！

木木日安祝福您！💙`
        : `Hello! I am Mumu Ri'an's intelligent customer service assistant.

Regarding your question, I cannot provide a detailed AI response at the moment, but I can help you with:

• Clinic information (address, phone, business hours)
• Service information
• Appointment-related questions

For more detailed assistance, please call 02-2778-7178 to contact us. Our staff will be happy to serve you!

Best regards from Mumu Ri'an! 💙`);

      await context.sendText(fallbackText);

      if (dbAvailable && conversation) {
        try {
          await saveEventWithMetadata(
            conversation.id,
            userId,
            'text',
            fallbackText,
            'assistant',
            {
              eventType: 'llm_fallback',
              source: {
                type: context.event.source?.type || 'user',
                userId,
              },
              processingTime: llmLatency,
              processingStatus: 'error',
              llmDetails: {
                model: llmResponse.model,
                latency: llmResponse.latency || llmLatency,
                success: false,
                error: llmResponse.error || 'LLM response failed',
              },
            }
          );
        } catch (saveError) {
          console.warn('儲存降級回應失敗:', saveError);
        }
      }
    }
  } catch (llmError: any) {
    const llmLatency = Date.now() - llmStartTime;
    console.error('LLM 處理錯誤:', llmError);
    const errorText = locale === 'zh-TW'
      ? '抱歉，系統暫時無法處理您的問題。請致電 02-2778-7178 與我們聯繫。'
      : 'Sorry, the system is temporarily unable to process your question. Please call 02-2778-7178 to contact us.';
    await context.sendText(errorText);
    
    // 儲存錯誤記錄
    if (dbAvailable && conversation) {
      try {
        await saveEventWithMetadata(
          conversation.id,
          userId,
          'text',
          errorText,
          'assistant',
          {
            eventType: 'llm_error',
            source: {
              type: context.event.source?.type || 'user',
              userId,
            },
            processingTime: llmLatency,
            processingStatus: 'error',
            errorLog: {
              message: llmError?.message || 'Unknown LLM error',
              stack: llmError?.stack,
              timestamp: new Date().toISOString(),
            },
            llmDetails: {
              success: false,
              error: llmError?.message || 'Unknown error',
            },
          }
        );
      } catch (saveError) {
        console.warn('儲存錯誤記錄失敗:', saveError);
      }
    }
  }
}

/**
 * 處理 Postback 事件
 */
async function handlePostbackEvent(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  const postbackData = context.event.postback?.data || '';

  // 解析 postback data
  const params = new URLSearchParams(postbackData);
  const action = params.get('action');
  const type = params.get('type');

  // 根據 action 處理不同的按鈕點擊
  // 這裡可以擴展處理 Rich Menu 的 postback
  console.log('Postback received:', { action, type, postbackData });

  // 儲存到資料庫
  try {
    const conversation = await getOrCreateConversation(userId);
    await saveMessage(
      conversation.id,
      userId,
      'postback',
      `點擊：${postbackData}`,
      'user',
      undefined,
      { action, type, postbackData }
    );
  } catch (dbError) {
    console.warn('儲存 Postback 失敗:', dbError);
  }
}

/**
 * 處理其他訊息類型
 */
async function handleOtherMessage(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  const startTime = Date.now();
  const messageType = context.event.message?.type || 'unknown';
  const messageText = locale === 'zh-TW'
    ? '抱歉，我目前只能處理文字訊息。如需協助，請用文字描述您的問題。'
    : 'Sorry, I can only process text messages at the moment. Please describe your question in text.';

  console.log('📎 [Other Message]', {
    userId: userId.substring(0, 20) + '...',
    messageType,
    timestamp: new Date().toISOString(),
  });

  try {
    await context.sendText(messageText);
    const processingTime = Date.now() - startTime;

    // 儲存到資料庫
    try {
      const conversation = await getOrCreateConversation(userId);
      await saveEventWithMetadata(
        conversation.id,
        userId,
        messageType,
        `收到 ${messageType} 訊息`,
        'user',
        {
          lineMessageId: 'id' in (context.event.message || {}) ? (context.event.message as any).id : undefined,
          eventType: 'message',
          source: {
            type: context.event.source?.type || 'user',
            userId,
          },
          replyToken: context.event.replyToken,
          processingTime,
          processingStatus: 'success',
          rawEvent: context.event,
        }
      );
      await saveEventWithMetadata(
        conversation.id,
        userId,
        'text',
        messageText,
        'assistant',
        {
          eventType: 'response',
          source: {
            type: context.event.source?.type || 'user',
            userId,
          },
          processingTime: Date.now() - startTime - processingTime,
          processingStatus: 'success',
        }
      );
    } catch (dbError) {
      console.warn('資料庫連接失敗，訊息已回覆但未儲存:', dbError);
    }
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('處理其他訊息錯誤:', error);
    
    // 儲存錯誤記錄
    try {
      const conversation = await getOrCreateConversation(userId);
      await saveEventWithMetadata(
        conversation.id,
        userId,
        messageType,
        `收到 ${messageType} 訊息（處理失敗）`,
        'user',
        {
          eventType: 'message',
          source: {
            type: context.event.source?.type || 'user',
            userId,
          },
          processingTime,
          processingStatus: 'error',
          errorLog: {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            timestamp: new Date().toISOString(),
          },
          rawEvent: context.event,
        }
      );
    } catch (dbError) {
      console.warn('儲存錯誤記錄失敗:', dbError);
    }
  }
}

/**
 * 發送語言選擇訊息
 */
async function sendLanguageSelection(
  context: LineContext,
  userId: string,
  currentLocale: SupportedLocale
): Promise<void> {
  const startTime = Date.now();
  const quickReply = [
    {
      type: 'action',
      action: {
        type: 'message',
        label: currentLocale === 'zh-TW' ? '繁體中文 ✅' : '繁體中文',
        text: '繁體中文',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: currentLocale === 'en-US' ? 'English ✅' : 'English',
        text: 'English',
      },
    },
  ];

  const messageText = currentLocale === 'zh-TW'
    ? '請選擇語言 / Please select language:'
    : 'Please select language / 請選擇語言:';

  await context.reply([
    {
      type: 'text',
      text: messageText,
      quickReply: {
        items: quickReply,
      },
    } as any,
  ]);

  // 儲存語言選擇訊息
  const processingTime = Date.now() - startTime;
  try {
    const conversation = await getOrCreateConversation(userId);
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'text',
      messageText,
      'assistant',
      {
        eventType: 'language_selection',
        source: {
          type: context.event.source?.type || 'user',
          userId,
        },
        processingTime,
        processingStatus: 'success',
      }
    );
  } catch (e) {
    console.warn('儲存語言選擇訊息失敗:', e);
  }
}

