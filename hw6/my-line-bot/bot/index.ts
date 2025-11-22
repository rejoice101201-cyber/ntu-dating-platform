import { Bot, LineConnector } from 'bottender';
import App from '../lib/bot/router';

// 延遲初始化 bot，避免在 build 時因為缺少環境變數而失敗
let botInstance: any = null;

function getBot() {
  if (!botInstance) {
    // 建立 Line connector
    const line = new LineConnector({
      channelSecret: process.env.LINE_CHANNEL_SECRET || '',
      accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    });

    // 建立 Bot 實例
    botInstance = new Bot({
      connector: line,
    });

    // 設定事件處理器
    const appHandler = App();
    if (typeof appHandler === 'function') {
      botInstance.onEvent(appHandler);
    } else if (appHandler && 'then' in appHandler && typeof (appHandler as any).then === 'function') {
      (appHandler as Promise<any>).then((handler: any) => {
        if (typeof handler === 'function' && botInstance) {
          botInstance.onEvent(handler);
        }
      });
    }
  }
  return botInstance;
}

// 導出函數而不是立即執行，避免在 build 時初始化
export default getBot;

