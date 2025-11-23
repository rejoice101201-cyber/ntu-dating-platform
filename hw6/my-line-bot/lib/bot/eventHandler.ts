import type { LineContext } from 'bottender';
import type { SupportedLocale } from '../types/locale';
import type { SectionId } from '../i18n/sections';
import { getUserLocale, setUserLocale } from '../i18n/utils';
import { getSectionContent } from '../i18n/sections';
import { sendSectionTextMessage, createWelcomeMessage, createCarouselTemplate, resolveSectionFromText, createProductsCarousel } from './scriptService';
import { matchSectionFromText } from './sectionMatcher';
import { generateResponse } from '../services/llmService';
import { checkRateLimit } from '../services/rateLimitService';
import {
  getOrCreateConversation,
  saveMessage,
  saveEventWithMetadata,
  getConversationHistory,
  updateConversationState,
} from '../services/conversationService';
import { richMenuService } from '../services/richMenuService';
import { getContentService } from '../services/contentService';

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

  // 處理圖片訊息
  if (context.event.isImage) {
    await handleImageMessage(context, userId, locale);
    return;
  }

  // 處理影片訊息
  if (context.event.isVideo) {
    await handleVideoMessage(context, userId, locale);
    return;
  }

  // 處理音訊訊息
  if (context.event.isAudio) {
    await handleAudioMessage(context, userId, locale);
    return;
  }

  // 處理位置訊息
  if (context.event.isLocation) {
    await handleLocationMessage(context, userId, locale);
    return;
  }

  // 處理貼圖訊息
  if (context.event.isSticker) {
    await handleStickerMessage(context, userId, locale);
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

    // 嘗試連結 Rich Menu 到用戶
    try {
      // 先取得預設 Rich Menu ID，如果沒有則跳過
      const defaultRichMenuId = await richMenuService.getDefaultRichMenuId();
      if (defaultRichMenuId) {
        await richMenuService.linkRichMenuToUser(userId, defaultRichMenuId);
        console.log('✅ [Welcome] Rich Menu 已連結到用戶');
      } else {
        console.log('ℹ️ [Welcome] 沒有預設 Rich Menu，跳過連結');
      }
    } catch (richMenuError) {
      console.warn('⚠️ [Welcome] 連結 Rich Menu 失敗（不影響歡迎訊息）:', richMenuError);
    }

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
    console.log('💾 [Database] 嘗試連接資料庫...');
    conversation = await getOrCreateConversation(userId);
    dbAvailable = true;
    console.log('✅ [Database] 資料庫連接成功，conversationId:', conversation.id);

    // 儲存使用者訊息（包含完整 metadata）
    const messageStartTime = Date.now();
    console.log('💾 [Database] 開始儲存使用者訊息...');
    const savedMessage = await saveEventWithMetadata(
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
    console.log('✅ [Database] 使用者訊息已儲存，messageId:', savedMessage.id);
  } catch (dbError) {
    console.error('❌ [Database] 資料庫連接失敗，將使用降級模式:', dbError);
    console.error('❌ [Database] 錯誤詳情:', {
      message: (dbError as any)?.message,
      code: (dbError as any)?.code,
      stack: (dbError as any)?.stack?.substring(0, 500),
    });
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
  console.log('🔍 [Text Message] 開始匹配章節...');
  const section = resolveSectionFromText(text, locale);
  const matchedSection = matchSectionFromText(text, locale);
  console.log('🔍 [Text Message] 匹配結果:', { section, matchedSection, text: text?.substring(0, 50) });

  // 如果沒有匹配到任何章節，直接使用 LLM
  if (!matchedSection) {
    console.log('💬 [Text Message] 未匹配到章節，使用 LLM 處理');
    try {
      await handleLLMResponse(context, userId, text, locale, conversation, dbAvailable);
    } catch (llmError: any) {
      console.error('❌ [Text Message] LLM 處理失敗:', llmError);
      // 即使 LLM 失敗，也要發送一個基本的回覆
      const fallbackText = locale === 'zh-TW'
        ? '抱歉，我目前無法處理您的問題。請稍後再試，或致電 02-2778-7178 與我們聯繫。'
        : 'Sorry, I cannot process your question at the moment. Please try again later or call 02-2778-7178.';
      try {
        await context.sendText(fallbackText);
        console.log('✅ [Text Message] 已發送降級回覆');
      } catch (sendError) {
        console.error('❌ [Text Message] 發送降級回覆也失敗:', sendError);
      }
    }
    return;
  }

  // 如果是 schedule 章節，發送 Carousel
  if (section === 'schedule') {
    console.log('📋 [Schedule] 發送 schedule 章節訊息和 Carousel');
    try {
      await sendSectionTextMessage(context, section, locale);
      const carousel = createCarouselTemplate(locale);
      await context.reply([carousel as any]);
      console.log('✅ [Schedule] Schedule 訊息和 Carousel 已成功發送');
    
    if (dbAvailable && conversation) {
      try {
        console.log('💾 [Database] 開始儲存 schedule 回應...');
        const savedResponse = await saveEventWithMetadata(
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
        console.log('✅ [Database] Schedule 回應已儲存，messageId:', savedResponse.id);
        await updateConversationState(conversation.id, 'menu_selection');
        console.log('✅ [Database] 對話狀態已更新為 menu_selection');
      } catch (saveError) {
        console.error('❌ [Database] 儲存 schedule 回應失敗:', saveError);
        console.error('❌ [Database] 錯誤詳情:', {
          message: (saveError as any)?.message,
          code: (saveError as any)?.code,
          stack: (saveError as any)?.stack?.substring(0, 500),
        });
      }
    } else {
      console.warn('⚠️ [Database] 資料庫不可用，無法儲存 schedule 回應');
    }
    } catch (scheduleError: any) {
      console.error('❌ [Schedule] 發送 schedule 訊息失敗:', scheduleError);
      console.error('❌ [Schedule] 錯誤詳情:', {
        message: scheduleError?.message,
        stack: scheduleError?.stack?.substring(0, 500),
      });
      // 嘗試發送一個簡單的回覆
      try {
        const fallbackText = locale === 'zh-TW'
          ? '抱歉，系統暫時無法回應。請稍後再試，或致電 02-2778-7178。'
          : 'Sorry, the system is temporarily unavailable. Please try again later or call 02-2778-7178.';
        await context.sendText(fallbackText);
        console.log('✅ [Schedule] 已發送降級回覆');
      } catch (fallbackError) {
        console.error('❌ [Schedule] 發送降級回覆也失敗:', fallbackError);
      }
    }
    return;
  }

  // 發送章節訊息
  try {
    console.log(`📋 [Section] 發送 ${section} 章節訊息`);
    await sendSectionTextMessage(context, section, locale);
    console.log(`✅ [Section] ${section} 章節訊息已成功發送`);

    if (dbAvailable && conversation) {
      try {
        console.log('💾 [Database] 開始儲存章節回應...');
        const content = getSectionContent(locale, section);
        const responseText = [content.title, ...content.body].join('\n\n');
        const savedResponse = await saveEventWithMetadata(
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
        console.log('✅ [Database] 章節回應已儲存，messageId:', savedResponse.id);
        await updateConversationState(conversation.id, section as any);
        console.log(`✅ [Database] 對話狀態已更新為 ${section}`);
      } catch (saveError) {
        console.error('❌ [Database] 儲存章節回應失敗:', saveError);
        console.error('❌ [Database] 錯誤詳情:', {
          message: (saveError as any)?.message,
          code: (saveError as any)?.code,
          stack: (saveError as any)?.stack?.substring(0, 500),
        });
      }
    } else {
      console.warn('⚠️ [Database] 資料庫不可用，無法儲存章節回應');
    }
  } catch (error: any) {
    console.error('❌ [Section] 發送章節訊息錯誤:', error);
    console.error('❌ [Section] 錯誤詳情:', {
      message: error?.message,
      stack: error?.stack?.substring(0, 500),
    });
    
    // 如果腳本無法處理，嘗試使用 LLM
    try {
      await handleLLMResponse(context, userId, text, locale, conversation, dbAvailable);
    } catch (llmError: any) {
      console.error('❌ [Section] LLM 處理也失敗:', llmError);
      // 最後的降級回覆
      try {
        const fallbackText = locale === 'zh-TW'
          ? '抱歉，系統暫時無法處理您的問題。請稍後再試，或致電 02-2778-7178 與我們聯繫。'
          : 'Sorry, the system cannot process your question at the moment. Please try again later or call 02-2778-7178.';
        await context.sendText(fallbackText);
        console.log('✅ [Section] 已發送最終降級回覆');
      } catch (fallbackError) {
        console.error('❌ [Section] 發送最終降級回覆也失敗:', fallbackError);
      }
    }
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
 * 處理 Postback 事件（包括 Rich Menu 按鈕點擊）
 */
async function handlePostbackEvent(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  const postbackData = context.event.postback?.data || '';
  const displayText = context.event.postback?.displayText;

  // 解析 postback data
  const params = new URLSearchParams(postbackData);
  const action = params.get('action');
  const type = params.get('type');

  console.log('📱 [Postback] 收到 Postback 事件:', { action, type, postbackData, displayText });

  // 儲存到資料庫
  let conversation: any = null;
  try {
    conversation = await getOrCreateConversation(userId);
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'postback',
      displayText || `點擊：${postbackData}`,
      'user',
      {
        lineMessageId: context.event.message?.id,
        eventType: 'postback',
        source: {
          type: context.event.source?.type || 'user',
          userId,
        },
        replyToken: context.event.replyToken,
        processingStatus: 'success',
        postbackData,
        action,
        type,
        rawEvent: context.event,
      }
    );
  } catch (dbError) {
    console.warn('⚠️ [Postback] 儲存 Postback 失敗:', dbError);
  }

  // 根據 action 處理不同的按鈕點擊
  if (action === 'appointment') {
    await handleAppointmentPostback(context, userId, locale, type || '', conversation);
  } else if (action === 'clinic_info') {
    await sendSectionTextMessage(context, 'clinic_info', locale);
    if (conversation) {
      try {
        const content = getSectionContent(locale, 'clinic_info');
        const responseText = [content.title, ...content.body].join('\n\n');
        await saveEventWithMetadata(
          conversation.id,
          userId,
          'text',
          responseText,
          'assistant',
          {
            eventType: 'rich_menu_response',
            source: { type: 'user', userId },
            processingStatus: 'success',
            postbackAction: action,
          }
        );
      } catch (e) {
        console.warn('儲存回應失敗:', e);
      }
    }
  } else if (action === 'refer_friend') {
    await handleReferFriend(context, userId, locale, conversation);
  } else if (action === 'edit_profile') {
    await handleEditProfile(context, userId, locale, conversation);
  } else if (action === 'products') {
    await handleProducts(context, userId, locale, conversation);
  } else {
    // 未知的 action，發送預設回應
    console.warn('⚠️ [Postback] 未知的 action:', action);
    const fallbackText = locale === 'zh-TW'
      ? '感謝您的點擊！如需協助，請致電 02-2778-7178'
      : 'Thank you for clicking! For assistance, please call 02-2778-7178';
    await context.sendText(fallbackText);
  }
}

/**
 * 處理預約相關的 Postback
 */
async function handleAppointmentPostback(
  context: LineContext,
  userId: string,
  locale: SupportedLocale,
  appointmentType: string,
  conversation: any
): Promise<void> {
  console.log('📅 [Appointment] 處理預約 Postback:', { appointmentType, locale });

  let responseText = '';
  
  if (appointmentType === 'medical_aesthetics') {
    responseText = locale === 'zh-TW'
      ? '📅 醫美查詢預約\n\n木木日安目前預約方式為電話預約，請直接致電 02-2778-7178\n\n營業時間：\n週一至週五：09:00-18:00\n週六：09:00-12:00\n\n我們的工作人員會為您安排最適合的看診時間。'
      : '📅 Medical Aesthetics Appointment\n\nMumu Ri\'an currently accepts phone appointments. Please call 02-2778-7178 directly.\n\nBusiness Hours:\nMonday to Friday: 09:00-18:00\nSaturday: 09:00-12:00\n\nOur staff will arrange the most suitable appointment time for you.';
  } else if (appointmentType === 'peel') {
    responseText = locale === 'zh-TW'
      ? '📅 果酸線上預約\n\n木木日安目前預約方式為電話預約，請直接致電 02-2778-7178\n\n營業時間：\n週一至週五：09:00-18:00\n週六：09:00-12:00\n\n我們的工作人員會為您安排最適合的看診時間。'
      : '📅 Peel Online Appointment\n\nMumu Ri\'an currently accepts phone appointments. Please call 02-2778-7178 directly.\n\nBusiness Hours:\nMonday to Friday: 09:00-18:00\nSaturday: 09:00-12:00\n\nOur staff will arrange the most suitable appointment time for you.';
  } else if (appointmentType === 'acne') {
    responseText = locale === 'zh-TW'
      ? '📅 青春痘特別門診線上預約\n\n木木日安目前預約方式為電話預約，請直接致電 02-2778-7178\n\n營業時間：\n週一至週五：09:00-18:00\n週六：09:00-12:00\n\n我們的工作人員會為您安排最適合的看診時間。'
      : '📅 Acne Special Clinic Online Appointment\n\nMumu Ri\'an currently accepts phone appointments. Please call 02-2778-7178 directly.\n\nBusiness Hours:\nMonday to Friday: 09:00-18:00\nSaturday: 09:00-12:00\n\nOur staff will arrange the most suitable appointment time for you.';
  } else if (appointmentType === 'insurance') {
    responseText = locale === 'zh-TW'
      ? '📅 健保掛號\n\n木木日安目前預約方式為電話預約，請直接致電 02-2778-7178\n\n營業時間：\n週一至週五：09:00-18:00\n週六：09:00-12:00\n\n我們的工作人員會為您安排最適合的看診時間。'
      : '📅 Health Insurance Registration\n\nMumu Ri\'an currently accepts phone appointments. Please call 02-2778-7178 directly.\n\nBusiness Hours:\nMonday to Friday: 09:00-18:00\nSaturday: 09:00-12:00\n\nOur staff will arrange the most suitable appointment time for you.';
  } else {
    // 使用通用的預約訊息
    await sendSectionTextMessage(context, 'appointment', locale);
    if (conversation) {
      try {
        const content = getSectionContent(locale, 'appointment');
        responseText = [content.title, ...content.body].join('\n\n');
        await saveEventWithMetadata(
          conversation.id,
          userId,
          'text',
          responseText,
          'assistant',
          {
            eventType: 'rich_menu_response',
            source: { type: 'user', userId },
            processingStatus: 'success',
            postbackAction: 'appointment',
            appointmentType,
          }
        );
      } catch (e) {
        console.warn('儲存回應失敗:', e);
      }
    }
    return;
  }

  // 發送回應
  await context.sendText(responseText);

  // 儲存回應到資料庫
  if (conversation) {
    try {
      await saveEventWithMetadata(
        conversation.id,
        userId,
        'text',
        responseText,
        'assistant',
        {
          eventType: 'rich_menu_response',
          source: { type: 'user', userId },
          processingStatus: 'success',
          postbackAction: 'appointment',
          appointmentType,
        }
      );
    } catch (e) {
      console.warn('儲存回應失敗:', e);
    }
  }
}

/**
 * 處理推薦好友功能
 */
async function handleReferFriend(
  context: LineContext,
  userId: string,
  locale: SupportedLocale,
  conversation: any
): Promise<void> {
  console.log('👥 [ReferFriend] 處理推薦好友');
  
  const responseText = locale === 'zh-TW'
    ? '👥 推薦好友\n\n感謝您對木木日安的支持！\n\n推薦好友加入我們的官方帳號，一起體驗優質的醫學美容服務。\n\n您可以分享我們的官方帳號給親朋好友，讓他們也能享受專業的皮膚科診療服務。\n\n木木日安祝福您！💙'
    : '👥 Refer Friend\n\nThank you for your support of Mumu Ri\'an!\n\nRecommend our official account to your friends and family to experience our quality medical beauty services.\n\nYou can share our official account with your loved ones so they can also enjoy professional dermatology services.\n\nBest regards from Mumu Ri\'an! 💙';

  await context.sendText(responseText);

  if (conversation) {
    try {
      await saveEventWithMetadata(
        conversation.id,
        userId,
        'text',
        responseText,
        'assistant',
        {
          eventType: 'rich_menu_response',
          source: { type: 'user', userId },
          processingStatus: 'success',
          postbackAction: 'refer_friend',
        }
      );
    } catch (e) {
      console.warn('儲存回應失敗:', e);
    }
  }
}

/**
 * 處理修改資料功能
 */
async function handleEditProfile(
  context: LineContext,
  userId: string,
  locale: SupportedLocale,
  conversation: any
): Promise<void> {
  console.log('✏️ [EditProfile] 處理修改資料');
  
  const responseText = locale === 'zh-TW'
    ? '✏️ 修改資料\n\n目前資料修改功能正在開發中。\n\n如需更新您的個人資料，請致電 02-2778-7178 與我們聯繫，我們的工作人員會協助您處理。\n\n感謝您的理解！'
    : '✏️ Edit Profile\n\nThe profile editing feature is currently under development.\n\nIf you need to update your personal information, please call 02-2778-7178 to contact us, and our staff will assist you.\n\nThank you for your understanding!';

  await context.sendText(responseText);

  if (conversation) {
    try {
      await saveEventWithMetadata(
        conversation.id,
        userId,
        'text',
        responseText,
        'assistant',
        {
          eventType: 'rich_menu_response',
          source: { type: 'user', userId },
          processingStatus: 'success',
          postbackAction: 'edit_profile',
        }
      );
    } catch (e) {
      console.warn('儲存回應失敗:', e);
    }
  }
}

/**
 * 處理嚴選產品功能
 */
async function handleProducts(
  context: LineContext,
  userId: string,
  locale: SupportedLocale,
  conversation: any
): Promise<void> {
  console.log('🛍️ [Products] 處理嚴選產品');
  
  try {
    // 建立 Flex Message Carousel
    const productsCarousel = createProductsCarousel(locale);
    
    // 發送 Flex Message
    await context.send(productsCarousel as any);
    console.log('✅ [Products] Flex Message 已發送');

    // 儲存到資料庫
    if (conversation) {
      try {
        await saveEventWithMetadata(
          conversation.id,
          userId,
          'flex',
          '嚴選產品 Flex Message',
          'assistant',
          {
            eventType: 'rich_menu_response',
            source: { type: 'user', userId },
            processingStatus: 'success',
            postbackAction: 'products',
            messageType: 'flex',
            flexMessage: productsCarousel,
          }
        );
      } catch (e) {
        console.warn('儲存回應失敗:', e);
      }
    }
  } catch (error: any) {
    console.error('❌ [Products] 發送 Flex Message 失敗:', error);
    
    // 降級方案：發送文字回覆
    const fallbackText = locale === 'zh-TW'
      ? '🛍️ 嚴選產品\n\n木木日安提供多種嚴選的醫學美容產品，包括：\n\n• 專業保養品\n• 術後修護產品\n• 皮膚保養諮詢\n\n如需了解詳細產品資訊，請致電 02-2778-7178 或預約看診，讓我們的專業團隊為您推薦最適合的產品。\n\n木木日安祝福您！💙'
      : '🛍️ Selected Products\n\nMumu Ri\'an offers a variety of carefully selected medical beauty products, including:\n\n• Professional skincare products\n• Post-treatment repair products\n• Skin care consultation\n\nFor detailed product information, please call 02-2778-7178 or schedule an appointment, and our professional team will recommend the most suitable products for you.\n\nBest regards from Mumu Ri\'an! 💙';

    try {
      await context.sendText(fallbackText);
      
      if (conversation) {
        try {
          await saveEventWithMetadata(
            conversation.id,
            userId,
            'text',
            fallbackText,
            'assistant',
            {
              eventType: 'rich_menu_response',
              source: { type: 'user', userId },
              processingStatus: 'error',
              postbackAction: 'products',
              error: error?.message,
            }
          );
        } catch (e) {
          console.warn('儲存降級回應失敗:', e);
        }
      }
    } catch (sendError) {
      console.error('❌ [Products] 發送降級文字回覆也失敗:', sendError);
    }
  }
}

/**
 * 處理圖片訊息
 */
async function handleImageMessage(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  const startTime = Date.now();
  const message = context.event.message as any;
  const imageId = message?.id;
  const previewImageUrl = message?.previewImageUrl;
  const originalContentUrl = message?.originalContentUrl;

  console.log('🖼️ [Image Message]', {
    userId: userId.substring(0, 20) + '...',
    imageId,
    timestamp: new Date().toISOString(),
  });

  let conversation: any = null;
  try {
    conversation = await getOrCreateConversation(userId);
    
    // 儲存圖片訊息到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'image',
      '圖片訊息',
      'user',
      {
        lineMessageId: imageId,
        eventType: 'message',
        source: {
          type: context.event.source?.type || 'user',
          userId,
        },
        replyToken: context.event.replyToken,
        processingStatus: 'success',
        imageId,
        previewImageUrl,
        originalContentUrl,
        rawEvent: context.event,
      }
    );

    // 可選：下載圖片內容進行分析
    let imageAnalysis = '';
    try {
      if (imageId) {
        const contentService = getContentService();
        const imageBuffer = await contentService.downloadImage(imageId);
        console.log('✅ [Image] 圖片下載成功，大小:', imageBuffer.length);
        
        // 這裡可以整合圖片分析 API（如 Google Vision API、Gemini Vision 等）
        // 目前先提供基本回覆
        imageAnalysis = locale === 'zh-TW'
          ? '我已收到您的圖片。'
          : 'I have received your image.';
      }
    } catch (downloadError: any) {
      console.warn('⚠️ [Image] 下載圖片失敗（不影響回覆）:', downloadError);
      // 下載失敗不影響基本回覆
    }

    // 發送回覆
    const responseText = locale === 'zh-TW'
      ? `感謝您分享圖片！${imageAnalysis}\n\n目前我主要協助處理文字訊息，如需協助請致電 02-2778-7178`
      : `Thank you for sharing the image! ${imageAnalysis}\n\nI mainly assist with text messages. For assistance, please call 02-2778-7178`;

    await context.sendText(responseText);

    // 儲存回覆到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'text',
      responseText,
      'assistant',
      {
        eventType: 'image_response',
        source: { type: 'user', userId },
        processingTime: Date.now() - startTime,
        processingStatus: 'success',
      }
    );
  } catch (error: any) {
    console.error('❌ [Image] 處理圖片訊息失敗:', error);
    // 確保即使出錯也發送回覆
    try {
      const fallbackText = locale === 'zh-TW'
        ? '感謝您分享圖片！如需協助，請致電 02-2778-7178'
        : 'Thank you for sharing the image! For assistance, please call 02-2778-7178';
      await context.sendText(fallbackText);
    } catch (sendError) {
      console.error('❌ [Image] 發送回覆失敗:', sendError);
    }
  }
}

/**
 * 處理影片訊息
 */
async function handleVideoMessage(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  const startTime = Date.now();
  const message = context.event.message as any;
  const videoId = message?.id;
  const previewImageUrl = message?.previewImageUrl;
  const originalContentUrl = message?.originalContentUrl;
  const duration = message?.duration;

  console.log('🎥 [Video Message]', {
    userId: userId.substring(0, 20) + '...',
    videoId,
    duration,
    timestamp: new Date().toISOString(),
  });

  let conversation: any = null;
  try {
    conversation = await getOrCreateConversation(userId);
    
    // 儲存影片訊息到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'video',
      '影片訊息',
      'user',
      {
        lineMessageId: videoId,
        eventType: 'message',
        source: {
          type: context.event.source?.type || 'user',
          userId,
        },
        replyToken: context.event.replyToken,
        processingStatus: 'success',
        videoId,
        previewImageUrl,
        originalContentUrl,
        duration,
        rawEvent: context.event,
      }
    );

    // 可選：下載影片內容進行分析
    try {
      if (videoId) {
        const contentService = getContentService();
        const videoBuffer = await contentService.downloadVideo(videoId);
        console.log('✅ [Video] 影片下載成功，大小:', videoBuffer.length);
      }
    } catch (downloadError: any) {
      console.warn('⚠️ [Video] 下載影片失敗（不影響回覆）:', downloadError);
    }

    // 發送回覆
    const responseText = locale === 'zh-TW'
      ? '感謝您分享影片！目前我主要協助處理文字訊息，如需協助請致電 02-2778-7178'
      : 'Thank you for sharing the video! I mainly assist with text messages. For assistance, please call 02-2778-7178';

    await context.sendText(responseText);

    // 儲存回覆到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'text',
      responseText,
      'assistant',
      {
        eventType: 'video_response',
        source: { type: 'user', userId },
        processingTime: Date.now() - startTime,
        processingStatus: 'success',
      }
    );
  } catch (error: any) {
    console.error('❌ [Video] 處理影片訊息失敗:', error);
    try {
      const fallbackText = locale === 'zh-TW'
        ? '感謝您分享影片！如需協助，請致電 02-2778-7178'
        : 'Thank you for sharing the video! For assistance, please call 02-2778-7178';
      await context.sendText(fallbackText);
    } catch (sendError) {
      console.error('❌ [Video] 發送回覆失敗:', sendError);
    }
  }
}

/**
 * 處理音訊訊息
 */
async function handleAudioMessage(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  const startTime = Date.now();
  const message = context.event.message as any;
  const audioId = message?.id;
  const duration = message?.duration;

  console.log('🎵 [Audio Message]', {
    userId: userId.substring(0, 20) + '...',
    audioId,
    duration,
    timestamp: new Date().toISOString(),
  });

  let conversation: any = null;
  try {
    conversation = await getOrCreateConversation(userId);
    
    // 儲存音訊訊息到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'audio',
      '語音訊息',
      'user',
      {
        lineMessageId: audioId,
        eventType: 'message',
        source: {
          type: context.event.source?.type || 'user',
          userId,
        },
        replyToken: context.event.replyToken,
        processingStatus: 'success',
        audioId,
        duration,
        rawEvent: context.event,
      }
    );

    // 可選：下載音訊內容進行分析
    try {
      if (audioId) {
        const contentService = getContentService();
        const audioBuffer = await contentService.downloadAudio(audioId);
        console.log('✅ [Audio] 音訊下載成功，大小:', audioBuffer.length);
        // 這裡可以整合語音轉文字 API（如 Google Speech-to-Text）
      }
    } catch (downloadError: any) {
      console.warn('⚠️ [Audio] 下載音訊失敗（不影響回覆）:', downloadError);
    }

    // 發送回覆
    const responseText = locale === 'zh-TW'
      ? '收到您的語音訊息！目前我主要協助處理文字訊息，如需協助請致電 02-2778-7178'
      : 'I received your voice message! I mainly assist with text messages. For assistance, please call 02-2778-7178';

    await context.sendText(responseText);

    // 儲存回覆到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'text',
      responseText,
      'assistant',
      {
        eventType: 'audio_response',
        source: { type: 'user', userId },
        processingTime: Date.now() - startTime,
        processingStatus: 'success',
      }
    );
  } catch (error: any) {
    console.error('❌ [Audio] 處理音訊訊息失敗:', error);
    try {
      const fallbackText = locale === 'zh-TW'
        ? '收到您的語音訊息！如需協助，請致電 02-2778-7178'
        : 'I received your voice message! For assistance, please call 02-2778-7178';
      await context.sendText(fallbackText);
    } catch (sendError) {
      console.error('❌ [Audio] 發送回覆失敗:', sendError);
    }
  }
}

/**
 * 處理位置訊息
 */
async function handleLocationMessage(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  const startTime = Date.now();
  const message = context.event.message as any;
  const latitude = message?.latitude;
  const longitude = message?.longitude;
  const address = message?.address;
  const title = message?.title;

  console.log('📍 [Location Message]', {
    userId: userId.substring(0, 20) + '...',
    latitude,
    longitude,
    address,
    title,
    timestamp: new Date().toISOString(),
  });

  let conversation: any = null;
  try {
    conversation = await getOrCreateConversation(userId);
    
    // 儲存位置訊息到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'location',
      title || address || '位置訊息',
      'user',
      {
        lineMessageId: message?.id,
        eventType: 'message',
        source: {
          type: context.event.source?.type || 'user',
          userId,
        },
        replyToken: context.event.replyToken,
        processingStatus: 'success',
        latitude,
        longitude,
        address,
        title,
        rawEvent: context.event,
      }
    );

    // 發送回覆
    const responseText = locale === 'zh-TW'
      ? '收到您的位置資訊！📍 如需預約或查詢診所資訊，請致電 02-2778-7178'
      : 'I received your location! 📍 For appointments or clinic information, please call 02-2778-7178';

    await context.sendText(responseText);

    // 儲存回覆到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'text',
      responseText,
      'assistant',
      {
        eventType: 'location_response',
        source: { type: 'user', userId },
        processingTime: Date.now() - startTime,
        processingStatus: 'success',
      }
    );
  } catch (error: any) {
    console.error('❌ [Location] 處理位置訊息失敗:', error);
    try {
      const fallbackText = locale === 'zh-TW'
        ? '收到您的位置資訊！如需協助，請致電 02-2778-7178'
        : 'I received your location! For assistance, please call 02-2778-7178';
      await context.sendText(fallbackText);
    } catch (sendError) {
      console.error('❌ [Location] 發送回覆失敗:', sendError);
    }
  }
}

/**
 * 處理貼圖訊息
 */
async function handleStickerMessage(
  context: LineContext,
  userId: string,
  locale: SupportedLocale
): Promise<void> {
  const startTime = Date.now();
  const message = context.event.message as any;
  const packageId = message?.packageId;
  const stickerId = message?.stickerId;

  console.log('😊 [Sticker Message]', {
    userId: userId.substring(0, 20) + '...',
    packageId,
    stickerId,
    timestamp: new Date().toISOString(),
  });

  let conversation: any = null;
  try {
    conversation = await getOrCreateConversation(userId);
    
    // 儲存貼圖訊息到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'sticker',
      `貼圖 ${packageId}/${stickerId}`,
      'user',
      {
        lineMessageId: message?.id,
        eventType: 'message',
        source: {
          type: context.event.source?.type || 'user',
          userId,
        },
        replyToken: context.event.replyToken,
        processingStatus: 'success',
        packageId,
        stickerId,
        rawEvent: context.event,
      }
    );

    // 發送回覆
    const responseText = locale === 'zh-TW'
      ? '收到您的貼圖！😊 如需協助，請直接輸入文字訊息或致電 02-2778-7178'
      : 'I received your sticker! 😊 For assistance, please send a text message or call 02-2778-7178';

    await context.sendText(responseText);

    // 儲存回覆到資料庫
    await saveEventWithMetadata(
      conversation.id,
      userId,
      'text',
      responseText,
      'assistant',
      {
        eventType: 'sticker_response',
        source: { type: 'user', userId },
        processingTime: Date.now() - startTime,
        processingStatus: 'success',
      }
    );
  } catch (error: any) {
    console.error('❌ [Sticker] 處理貼圖訊息失敗:', error);
    try {
      const fallbackText = locale === 'zh-TW'
        ? '收到您的貼圖！如需協助，請致電 02-2778-7178'
        : 'I received your sticker! For assistance, please call 02-2778-7178';
      await context.sendText(fallbackText);
    } catch (sendError) {
      console.error('❌ [Sticker] 發送回覆失敗:', sendError);
    }
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

