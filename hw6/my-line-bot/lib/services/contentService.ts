import { Client } from '@line/bot-sdk';
import { Readable } from 'stream';

/**
 * Content API 服務
 * 用於下載 Line 用戶上傳的圖片、影片、音訊等內容
 */
export class ContentService {
  private client: Client;

  constructor() {
    // 支援多種環境變數名稱
    const channelAccessToken = 
      process.env.LINE_CHANNEL_ACCESS_TOKEN || 
      process.env.CHANNEL_ACCESS_TOKEN || 
      '';
    const channelSecret = 
      process.env.LINE_CHANNEL_SECRET || 
      process.env.CHANNEL_SECRET || 
      '';

    if (!channelAccessToken || !channelSecret) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET are required');
    }

    this.client = new Client({
      channelAccessToken,
      channelSecret,
    });
  }

  /**
   * 取得訊息內容為 ReadableStream
   * @param messageId 訊息 ID
   * @returns ReadableStream
   */
  async getContentAsStream(messageId: string): Promise<Readable> {
    try {
      console.log('📥 [Content] 下載內容...', { messageId });
      const stream = await this.client.getMessageContent(messageId);
      console.log('✅ [Content] 內容下載成功');
      return stream;
    } catch (error: any) {
      console.error('❌ [Content] 下載內容失敗:', error);
      throw error;
    }
  }

  /**
   * 取得訊息內容為 Buffer
   * @param messageId 訊息 ID
   * @returns Buffer
   */
  async getContentAsBuffer(messageId: string): Promise<Buffer> {
    try {
      console.log('📥 [Content] 下載內容為 Buffer...', { messageId });
      const stream = await this.getContentAsStream(messageId);
      
      const chunks: Buffer[] = [];
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        stream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          console.log('✅ [Content] 內容轉換為 Buffer 成功，大小:', buffer.length);
          resolve(buffer);
        });
        stream.on('error', (error) => {
          console.error('❌ [Content] Stream 錯誤:', error);
          reject(error);
        });
      });
    } catch (error: any) {
      console.error('❌ [Content] 取得 Buffer 失敗:', error);
      throw error;
    }
  }

  /**
   * 下載圖片內容
   * @param messageId 圖片訊息 ID
   * @returns Buffer
   */
  async downloadImage(messageId: string): Promise<Buffer> {
    return this.getContentAsBuffer(messageId);
  }

  /**
   * 下載影片內容
   * @param messageId 影片訊息 ID
   * @returns Buffer
   */
  async downloadVideo(messageId: string): Promise<Buffer> {
    return this.getContentAsBuffer(messageId);
  }

  /**
   * 下載音訊內容
   * @param messageId 音訊訊息 ID
   * @returns Buffer
   */
  async downloadAudio(messageId: string): Promise<Buffer> {
    return this.getContentAsBuffer(messageId);
  }
}

// 導出單例實例（延遲初始化）
let _contentServiceInstance: ContentService | null = null;

export function getContentService(): ContentService {
  if (!_contentServiceInstance) {
    _contentServiceInstance = new ContentService();
  }
  return _contentServiceInstance;
}

// 為了向後兼容，也導出一個 getter
export const contentService = new Proxy({} as ContentService, {
  get(_target, prop) {
    return getContentService()[prop as keyof ContentService];
  }
});

