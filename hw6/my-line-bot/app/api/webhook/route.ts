import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent, TextMessage } from '@line/bot-sdk';
import crypto from 'crypto';
import { replyMessage } from '@/lib/services/lineService';
import { handleScriptResponse, createWelcomeMessage } from '@/lib/services/scriptService';
import { generateResponse } from '@/lib/services/llmService';
import { checkRateLimit } from '@/lib/services/rateLimitService';
import {
  getOrCreateConversation,
  saveMessage,
  getConversationHistory,
  updateConversationState,
  endConversation,
} from '@/lib/services/conversationService';

// 驗證 Line 簽章
function validateSignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');
  return hash === signature;
}

// 處理文字訊息
async function handleTextMessage(event: WebhookEvent) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const userMessage = event.message.text;
  const replyToken = event.replyToken;
  const lineUserId = event.source.userId || '';

  if (!lineUserId) {
    console.error('No user ID in event');
    return;
  }

  let conversation: any = null;
  let dbAvailable = false;

  // 嘗試連接資料庫（但不阻塞回應）
  try {
    conversation = await getOrCreateConversation(lineUserId);
    dbAvailable = true;
    
    // 儲存使用者訊息
    await saveMessage(
      conversation.id,
      lineUserId,
      'text',
      userMessage,
      'user',
      event.message.id,
      event
    );
  } catch (dbError) {
    console.warn('資料庫連接失敗，將使用降級模式:', dbError);
    dbAvailable = false;
  }

  // 檢查速率限制（如果資料庫可用）
  if (dbAvailable) {
    try {
      const rateLimit = await checkRateLimit(lineUserId);
      if (!rateLimit.allowed) {
        // 超過速率限制，使用腳本回應
        const fallbackMessage: TextMessage = {
          type: 'text',
          text: '抱歉，您發送訊息的頻率過高，請稍後再試。如需緊急協助，請致電 02-2778-7178',
        };
        await replyMessage(replyToken, fallbackMessage);
        if (conversation) {
          try {
            await saveMessage(conversation.id, lineUserId, 'text', fallbackMessage.text, 'assistant');
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

  // 嘗試使用腳本回應（優先，不依賴資料庫）
  const scriptResponse = handleScriptResponse(userMessage);

  if (scriptResponse) {
    try {
      // 使用腳本回應
      await replyMessage(replyToken, scriptResponse);
      
      // 如果資料庫可用，儲存回應
      if (dbAvailable && conversation) {
        try {
          const responseText = scriptResponse.type === 'text' ? scriptResponse.text : '選單訊息';
          await saveMessage(conversation.id, lineUserId, scriptResponse.type, responseText, 'assistant', undefined, scriptResponse);

          // 更新對話狀態
          if (userMessage.includes('再見') || userMessage.includes('bye') || userMessage.includes('拜拜')) {
            await endConversation(conversation.id);
          } else if (userMessage.includes('你好') || userMessage.includes('在嗎')) {
            await updateConversationState(conversation.id, 'greeting');
          } else {
            await updateConversationState(conversation.id, 'menu_selection');
          }
        } catch (saveError) {
          console.warn('儲存回應失敗:', saveError);
        }
      }
      return;
    } catch (replyError) {
      console.error('回覆訊息錯誤:', replyError);
      throw replyError;
    }
  }

  // 腳本無法處理，使用 LLM
  try {
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (dbAvailable && conversation) {
      try {
        conversationHistory = await getConversationHistory(conversation.id, 3);
      } catch (historyError) {
        console.warn('取得對話歷史失敗:', historyError);
      }
    }

    const llmResponse = await generateResponse(userMessage, conversationHistory);

    if (llmResponse.success && llmResponse.message) {
      // LLM 成功回應
      const message: TextMessage = {
        type: 'text',
        text: llmResponse.message,
      };
      await replyMessage(replyToken, message);
      
      if (dbAvailable && conversation) {
        try {
          await saveMessage(conversation.id, lineUserId, 'text', llmResponse.message, 'assistant');
          await updateConversationState(conversation.id, 'symptom_consultation');
        } catch (saveError) {
          console.warn('儲存 LLM 回應失敗:', saveError);
        }
      }
    } else {
      // LLM 失敗，降級到腳本回應
      const fallbackMessage: TextMessage = {
        type: 'text',
        text: llmResponse.message || '抱歉，系統暫時無法處理您的問題。請致電 02-2778-7178 與我們聯繫。',
      };
      await replyMessage(replyToken, fallbackMessage);
      
      if (dbAvailable && conversation) {
        try {
          await saveMessage(conversation.id, lineUserId, 'text', fallbackMessage.text, 'assistant');
        } catch (saveError) {
          console.warn('儲存降級回應失敗:', saveError);
        }
      }
    }
  } catch (llmError) {
    console.error('LLM 處理錯誤:', llmError);
    // LLM 失敗，使用預設腳本回應
    const fallbackMessage: TextMessage = {
      type: 'text',
      text: '抱歉，系統暫時無法處理您的問題。請致電 02-2778-7178 與我們聯繫。',
    };
    try {
      await replyMessage(replyToken, fallbackMessage);
    } catch (replyError) {
      console.error('回覆降級訊息錯誤:', replyError);
      throw replyError;
    }
  }
}

// 處理 Follow 事件（使用者加入好友）
async function handleFollowEvent(event: WebhookEvent) {
  if (event.type !== 'follow') {
    return;
  }

  const lineUserId = event.source.userId || '';
  if (!lineUserId) {
    return;
  }

  try {
    // 發送歡迎訊息（不依賴資料庫）
    const welcomeMessage = createWelcomeMessage();
    await replyMessage(event.replyToken, welcomeMessage);
    
    // 如果資料庫可用，儲存記錄
    try {
      const conversation = await getOrCreateConversation(lineUserId);
      await saveMessage(
        conversation.id,
        lineUserId,
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

// 處理其他事件類型（圖片、貼圖等）
async function handleOtherMessage(event: WebhookEvent) {
  if (event.type !== 'message') {
    return;
  }

  const replyToken = event.replyToken;
  const lineUserId = event.source.userId || '';

  if (!lineUserId) {
    return;
  }

  try {
    // 回覆提示訊息（不依賴資料庫）
    const message: TextMessage = {
      type: 'text',
      text: '抱歉，我目前只能處理文字訊息。如需協助，請用文字描述您的問題。',
    };
    await replyMessage(replyToken, message);
    
    // 如果資料庫可用，儲存記錄
    try {
      const conversation = await getOrCreateConversation(lineUserId);
      await saveMessage(
        conversation.id,
        lineUserId,
        event.message.type,
        `收到 ${event.message.type} 訊息`,
        'user',
        'id' in event.message ? event.message.id : undefined,
        event
      );
      await saveMessage(conversation.id, lineUserId, 'text', message.text, 'assistant');
    } catch (dbError) {
      console.warn('資料庫連接失敗，訊息已回覆但未儲存:', dbError);
    }
  } catch (error) {
    console.error('處理其他訊息錯誤:', error);
  }
}

// 處理 POST 請求（Line Webhook）
export async function POST(req: NextRequest) {
  try {
    // 取得原始請求體（用於簽章驗證）
    const body = await req.text();
    const signature = req.headers.get('x-line-signature') || '';
    const channelSecret = process.env.CHANNEL_SECRET || '';

    // 如果沒有簽章，可能是驗證請求，直接返回 200
    if (!signature || !channelSecret) {
      console.log('Missing signature or channel secret');
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // 驗證簽章
    if (!validateSignature(body, signature, channelSecret)) {
      console.error('Invalid signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    // 解析事件
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
    }

    const events: WebhookEvent[] = parsedBody.events || [];

    // 如果沒有事件（可能是驗證請求），直接返回 200
    if (!events || events.length === 0) {
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // 處理每個事件
    for (const event of events) {
      // 處理 Follow 事件（使用者加入好友）
      if (event.type === 'follow') {
        await handleFollowEvent(event);
        continue;
      }

      // 處理文字訊息
      if (event.type === 'message' && event.message.type === 'text') {
        await handleTextMessage(event);
        continue;
      }

      // 處理其他訊息類型
      if (event.type === 'message') {
        await handleOtherMessage(event);
        continue;
      }
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Webhook 處理錯誤:', error);
    // 即使發生錯誤，也返回 200 以避免 Line 重試
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  }
}

// 處理 GET 請求（健康檢查）
export async function GET() {
  return NextResponse.json(
    {
      message: 'Line Bot Webhook is running',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
