import { Client, TextMessage, TemplateMessage, Message } from '@line/bot-sdk';

const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET || '',
});

/**
 * 回覆訊息給使用者
 */
export async function replyMessage(replyToken: string, message: TextMessage | TemplateMessage): Promise<void> {
  try {
    await client.replyMessage(replyToken, message);
  } catch (error) {
    console.error('Line API 錯誤:', error);
    throw error;
  }
}

/**
 * 推送訊息給使用者（不需要 replyToken）
 */
export async function pushMessage(lineUserId: string, message: TextMessage | TemplateMessage): Promise<void> {
  try {
    await client.pushMessage(lineUserId, message);
  } catch (error) {
    console.error('Line Push API 錯誤:', error);
    throw error;
  }
}

export { client };

