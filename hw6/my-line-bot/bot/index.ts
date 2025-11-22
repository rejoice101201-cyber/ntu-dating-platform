import { Bot, LineConnector } from 'bottender';
import App from '../lib/bot/router';

// 延遲初始化 bot，避免在 build 時因為缺少環境變數而失敗
let botInstance: any = null;

function getBot() {
  if (!botInstance) {
    try {
      // 檢查環境變數
      if (!process.env.LINE_CHANNEL_SECRET || !process.env.LINE_CHANNEL_ACCESS_TOKEN) {
        console.error('❌ 缺少必要的環境變數: LINE_CHANNEL_SECRET 或 LINE_CHANNEL_ACCESS_TOKEN');
        throw new Error('Missing required environment variables');
      }

      // 建立 Line connector
      const line = new LineConnector({
        channelSecret: process.env.LINE_CHANNEL_SECRET,
        accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
      });

      // 建立 Bot 實例
      botInstance = new Bot({
        connector: line,
      });

      // 設定事件處理器
      const appHandler = App();
      if (typeof appHandler === 'function') {
        botInstance.onEvent(appHandler);
        console.log('✅ Bot 事件處理器已設定');
      } else if (appHandler && 'then' in appHandler && typeof (appHandler as any).then === 'function') {
        (appHandler as Promise<any>).then((handler: any) => {
          if (typeof handler === 'function' && botInstance) {
            botInstance.onEvent(handler);
            console.log('✅ Bot 事件處理器已設定（非同步）');
          }
        }).catch((err: any) => {
          console.error('❌ 設定事件處理器時發生錯誤:', err);
        });
      } else {
        console.warn('⚠️ App handler 不是函數，Bot 可能無法處理事件');
      }
    } catch (error: any) {
      console.error('❌ Bot 初始化錯誤:', error);
      console.error('錯誤堆疊:', error?.stack);
      // 不拋出錯誤，讓 webhook 可以返回 200
      return null;
    }
  }
  return botInstance;
}

// 導出函數而不是立即執行，避免在 build 時初始化
export default getBot;

