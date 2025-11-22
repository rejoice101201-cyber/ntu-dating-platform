import { Client } from '@line/bot-sdk';

/**
 * Rich Menu 服務
 * 使用 Line Messaging API 管理 Rich Menu
 */
export class RichMenuService {
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
      console.error('❌ 缺少必要的環境變數：');
      console.error('   需要以下其中一組：');
      console.error('   - LINE_CHANNEL_ACCESS_TOKEN 和 LINE_CHANNEL_SECRET');
      console.error('   - CHANNEL_ACCESS_TOKEN 和 CHANNEL_SECRET');
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET are required');
    }

    this.client = new Client({
      channelAccessToken,
      channelSecret,
    });
  }

  /**
   * 創建 Rich Menu
   * @param richMenuObject Rich Menu 配置物件
   * @returns Rich Menu ID
   */
  async createRichMenu(richMenuObject: any): Promise<string> {
    try {
      console.log('📋 [RichMenu] 創建 Rich Menu...');
      const richMenuId = await this.client.createRichMenu(richMenuObject);
      console.log('✅ [RichMenu] Rich Menu 創建成功，ID:', richMenuId);
      return richMenuId;
    } catch (error: any) {
      console.error('❌ [RichMenu] 創建 Rich Menu 失敗:', error);
      throw error;
    }
  }

  /**
   * 上傳 Rich Menu 圖片
   * @param richMenuId Rich Menu ID
   * @param imageBuffer 圖片 Buffer
   * @param contentType 圖片類型 (image/jpeg 或 image/png)
   */
  async uploadRichMenuImage(
    richMenuId: string,
    imageBuffer: Buffer,
    contentType: 'image/jpeg' | 'image/png' = 'image/png'
  ): Promise<void> {
    try {
      console.log('📤 [RichMenu] 上傳 Rich Menu 圖片...', { richMenuId, contentType, size: imageBuffer.length });
      await this.client.setRichMenuImage(richMenuId, imageBuffer, contentType);
      console.log('✅ [RichMenu] Rich Menu 圖片上傳成功');
    } catch (error: any) {
      console.error('❌ [RichMenu] 上傳 Rich Menu 圖片失敗:', error);
      throw error;
    }
  }

  /**
   * 從 URL 下載圖片並上傳
   * @param richMenuId Rich Menu ID
   * @param imageUrl 圖片 URL
   */
  async uploadRichMenuImageFromUrl(richMenuId: string, imageUrl: string): Promise<void> {
    try {
      console.log('📥 [RichMenu] 從 URL 下載圖片...', { richMenuId, imageUrl });
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 根據 URL 判斷圖片類型
      const contentType = imageUrl.toLowerCase().endsWith('.jpg') || imageUrl.toLowerCase().endsWith('.jpeg')
        ? 'image/jpeg'
        : 'image/png';

      await this.uploadRichMenuImage(richMenuId, buffer, contentType);
    } catch (error: any) {
      console.error('❌ [RichMenu] 從 URL 上傳圖片失敗:', error);
      throw error;
    }
  }

  /**
   * 設定預設 Rich Menu（所有用戶可見）
   * @param richMenuId Rich Menu ID
   */
  async setDefaultRichMenu(richMenuId: string): Promise<void> {
    try {
      console.log('🔧 [RichMenu] 設定預設 Rich Menu...', { richMenuId });
      await this.client.setDefaultRichMenu(richMenuId);
      console.log('✅ [RichMenu] 預設 Rich Menu 設定成功');
    } catch (error: any) {
      console.error('❌ [RichMenu] 設定預設 Rich Menu 失敗:', error);
      throw error;
    }
  }

  /**
   * 連結 Rich Menu 到特定用戶（Per-user Rich Menu）
   * @param userId 用戶 ID
   * @param richMenuId Rich Menu ID
   */
  async linkRichMenuToUser(userId: string, richMenuId: string): Promise<void> {
    try {
      console.log('🔗 [RichMenu] 連結 Rich Menu 到用戶...', { userId: userId.substring(0, 20) + '...', richMenuId });
      await this.client.linkRichMenuToUser(userId, richMenuId);
      console.log('✅ [RichMenu] Rich Menu 連結到用戶成功');
    } catch (error: any) {
      console.error('❌ [RichMenu] 連結 Rich Menu 到用戶失敗:', error);
      throw error;
    }
  }

  /**
   * 取消連結用戶的 Rich Menu
   * @param userId 用戶 ID
   */
  async unlinkRichMenuFromUser(userId: string): Promise<void> {
    try {
      console.log('🔓 [RichMenu] 取消連結用戶的 Rich Menu...', { userId: userId.substring(0, 20) + '...' });
      await this.client.unlinkRichMenuFromUser(userId);
      console.log('✅ [RichMenu] 取消連結 Rich Menu 成功');
    } catch (error: any) {
      console.error('❌ [RichMenu] 取消連結 Rich Menu 失敗:', error);
      throw error;
    }
  }

  /**
   * 取得用戶的 Rich Menu ID
   * @param userId 用戶 ID
   * @returns Rich Menu ID 或 null
   */
  async getRichMenuIdOfUser(userId: string): Promise<string | null> {
    try {
      const richMenuId = await this.client.getRichMenuIdOfUser(userId);
      return richMenuId || null;
    } catch (error: any) {
      // 如果用戶沒有 Rich Menu，會返回 404
      if (error.statusCode === 404) {
        return null;
      }
      console.error('❌ [RichMenu] 取得用戶 Rich Menu ID 失敗:', error);
      throw error;
    }
  }

  /**
   * 取得所有 Rich Menu 列表
   * @returns Rich Menu 列表
   */
  async getRichMenuList(): Promise<any[]> {
    try {
      console.log('📋 [RichMenu] 取得 Rich Menu 列表...');
      const richMenus = await this.client.getRichMenuList();
      console.log('✅ [RichMenu] 取得 Rich Menu 列表成功，數量:', Array.isArray(richMenus) ? richMenus.length : 0);
      return Array.isArray(richMenus) ? richMenus : [];
    } catch (error: any) {
      console.error('❌ [RichMenu] 取得 Rich Menu 列表失敗:', error);
      throw error;
    }
  }

  /**
   * 取得 Rich Menu 資訊
   * @param richMenuId Rich Menu ID
   * @returns Rich Menu 資訊
   */
  async getRichMenu(richMenuId: string): Promise<any> {
    try {
      console.log('📋 [RichMenu] 取得 Rich Menu 資訊...', { richMenuId });
      const response = await this.client.getRichMenu(richMenuId);
      console.log('✅ [RichMenu] 取得 Rich Menu 資訊成功');
      return response;
    } catch (error: any) {
      console.error('❌ [RichMenu] 取得 Rich Menu 資訊失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除 Rich Menu
   * @param richMenuId Rich Menu ID
   */
  async deleteRichMenu(richMenuId: string): Promise<void> {
    try {
      console.log('🗑️ [RichMenu] 刪除 Rich Menu...', { richMenuId });
      await this.client.deleteRichMenu(richMenuId);
      console.log('✅ [RichMenu] Rich Menu 刪除成功');
    } catch (error: any) {
      console.error('❌ [RichMenu] 刪除 Rich Menu 失敗:', error);
      throw error;
    }
  }

  /**
   * 取得預設 Rich Menu ID
   * @returns Rich Menu ID 或 null
   */
  async getDefaultRichMenuId(): Promise<string | null> {
    try {
      const richMenuId = await this.client.getDefaultRichMenuId();
      return richMenuId || null;
    } catch (error: any) {
      // 如果沒有預設 Rich Menu，會返回 404
      if (error.statusCode === 404) {
        return null;
      }
      console.error('❌ [RichMenu] 取得預設 Rich Menu ID 失敗:', error);
      throw error;
    }
  }
}

// 導出單例實例（延遲初始化）
let _richMenuServiceInstance: RichMenuService | null = null;

export function getRichMenuService(): RichMenuService {
  if (!_richMenuServiceInstance) {
    _richMenuServiceInstance = new RichMenuService();
  }
  return _richMenuServiceInstance;
}

// 為了向後兼容，也導出一個 getter
export const richMenuService = new Proxy({} as RichMenuService, {
  get(_target, prop) {
    return getRichMenuService()[prop as keyof RichMenuService];
  }
});

