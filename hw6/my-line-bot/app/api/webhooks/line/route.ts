import { NextRequest, NextResponse } from 'next/server';
import { Client, middleware, MiddlewareConfig } from '@line/bot-sdk';
import { handleLineEvent } from '../../../../lib/bot/eventHandler';
import { createLineContext } from '../../../../lib/bot/lineContext';
import crypto from 'crypto';

// Line 配置
function getLineConfig(): MiddlewareConfig {
  const channelSecret = process.env.LINE_CHANNEL_SECRET || process.env.CHANNEL_SECRET || '';
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.CHANNEL_ACCESS_TOKEN || '';
  
  return {
    channelSecret,
    channelAccessToken,
  };
}

// 驗證 Line 簽名
function validateSignature(body: string, signature: string, channelSecret: string): boolean {
  if (!signature || !channelSecret) {
    return false;
  }
  
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const timestamp = new Date().toISOString();
  
  console.log(`\n🔵 [Webhook Request ${requestId}]`, {
    timestamp,
    method: req.method,
    path: '/api/webhooks/line',
    url: req.url,
  });

  // Line 要求必須返回 200，即使發生錯誤也要返回 200
  try {
    const config = getLineConfig();
    
    if (!config.channelSecret || !config.channelAccessToken) {
      console.error(`❌ [Webhook Request ${requestId}] 缺少必要的環境變數`);
      return NextResponse.json({ error: 'Configuration error' }, { status: 200 });
    }

    const body = await req.text();
    const signature = req.headers.get('x-line-signature') || '';

    // 驗證簽名
    if (!validateSignature(body, signature, config.channelSecret)) {
      console.error(`❌ [Webhook Request ${requestId}] 簽名驗證失敗`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 200 });
    }

    let bodyJson: any = {};
    try {
      bodyJson = JSON.parse(body || '{}');
      console.log(`📥 [Webhook Request ${requestId}] Received body:`, {
        events: bodyJson.events?.length || 0,
        destination: bodyJson.destination,
        eventTypes: bodyJson.events?.map((e: any) => e.type),
      });
    } catch (parseError) {
      console.error(`❌ [Webhook Request ${requestId}] JSON 解析錯誤:`, parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 200 });
    }

    // 創建 Line Client
    const client = new Client({
      channelAccessToken: config.channelAccessToken,
      channelSecret: config.channelSecret,
    });

    // 處理每個事件
    if (bodyJson.events && Array.isArray(bodyJson.events)) {
      for (const event of bodyJson.events) {
        try {
          console.log(`📨 [Event ${requestId}] 處理事件:`, {
            type: event.type,
            userId: event.source?.userId?.substring(0, 20) + '...',
            replyToken: event.replyToken ? 'present' : 'missing',
          });

          // 創建 Bottender 兼容的 context
          const context = createLineContext(event, client);
          
          // 調用事件處理器
          await handleLineEvent(context);
          
          console.log(`✅ [Event ${requestId}] 事件處理成功:`, event.type);
        } catch (eventError: any) {
          console.error(`❌ [Event ${requestId}] 處理事件失敗:`, eventError);
          console.error(`❌ [Event ${requestId}] 錯誤詳情:`, {
            message: eventError?.message,
            stack: eventError?.stack?.substring(0, 500),
          });
          // 繼續處理下一個事件，不中斷整個請求
        }
      }
    }

    console.log(`✅ [Webhook Request ${requestId}] Successfully processed`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    // 即使發生錯誤，也要返回 200（Line 要求）
    console.error(`❌ [Webhook Request ${requestId}] Webhook 處理錯誤:`, error);
    console.error(`❌ [Webhook Request ${requestId}] 錯誤堆疊:`, error?.stack);
    
    // 返回 200 而不是 500，避免 Line 重試
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error?.message || 'Unknown error'
    }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Line Bot Webhook is running',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
