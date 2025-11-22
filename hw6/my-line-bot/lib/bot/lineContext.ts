import { Client } from '@line/bot-sdk';
import type { LineContext } from 'bottender';

/**
 * 創建 Bottender 兼容的 LineContext
 * 用於在直接使用 Line SDK 時保持與現有事件處理器的兼容性
 */
export function createLineContext(event: any, client: Client): LineContext {
  // 創建一個模擬的 Bottender context
  const context: any = {
    event: {
      ...event,
      isText: event.type === 'message' && event.message?.type === 'text',
      isFollow: event.type === 'follow',
      isJoin: event.type === 'join',
      isPostback: event.type === 'postback',
      isMessage: event.type === 'message',
      text: event.type === 'message' && event.message?.type === 'text' ? event.message.text : undefined,
      source: event.source,
      replyToken: event.replyToken,
      message: event.message,
      postback: event.postback,
    },
    reply: async (messages: any[]) => {
      if (!event.replyToken) {
        console.warn('⚠️ [LineContext] 沒有 replyToken，無法回覆');
        return;
      }
      try {
        // 如果 messages 是數組，取第一個；如果是單個對象，直接使用
        const messageToSend = Array.isArray(messages) ? messages[0] : messages;
        await client.replyMessage(event.replyToken, messageToSend);
        console.log('✅ [LineContext] 回覆訊息已發送');
      } catch (error: any) {
        console.error('❌ [LineContext] 發送回覆失敗:', error);
        console.error('❌ [LineContext] 錯誤詳情:', {
          message: error?.message,
          statusCode: error?.statusCode,
          originalError: error?.originalError,
        });
        throw error;
      }
    },
    sendText: async (text: string) => {
      if (!event.replyToken) {
        console.warn('⚠️ [LineContext] 沒有 replyToken，無法發送文字');
        return;
      }
      try {
        await client.replyMessage(event.replyToken, { type: 'text', text });
        console.log('✅ [LineContext] 文字訊息已發送:', text.substring(0, 50));
      } catch (error: any) {
        console.error('❌ [LineContext] 發送文字失敗:', error);
        console.error('❌ [LineContext] 錯誤詳情:', {
          message: error?.message,
          statusCode: error?.statusCode,
          originalError: error?.originalError,
        });
        throw error;
      }
    },
    send: async (message: any) => {
      if (!event.replyToken) {
        console.warn('⚠️ [LineContext] 沒有 replyToken，無法發送訊息');
        return;
      }
      try {
        await client.replyMessage(event.replyToken, message);
        console.log('✅ [LineContext] 訊息已發送');
      } catch (error: any) {
        console.error('❌ [LineContext] 發送訊息失敗:', error);
        console.error('❌ [LineContext] 錯誤詳情:', {
          message: error?.message,
          statusCode: error?.statusCode,
          originalError: error?.originalError,
        });
        throw error;
      }
    },
  };

  return context as LineContext;
}

