// 兼容舊的 webhook 路徑，重定向到新的路徑
import { NextRequest, NextResponse } from 'next/server';
import getBot from '../../../../bot';

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const timestamp = new Date().toISOString();
  
  console.log(`\n🔵 [Webhook Request ${requestId}] (Legacy Path)`, {
    timestamp,
    method: req.method,
    path: '/api/webhook/line',
  });

  // Line 要求必須返回 200，即使發生錯誤也要返回 200
  try {
    // 檢查環境變數（支援兩種命名方式）
    const channelSecret = process.env.LINE_CHANNEL_SECRET || process.env.CHANNEL_SECRET;
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.CHANNEL_ACCESS_TOKEN;

    if (!channelSecret || !accessToken) {
      console.error('❌ 缺少必要的環境變數:');
      console.error('   需要設定: LINE_CHANNEL_SECRET 或 CHANNEL_SECRET');
      console.error('   需要設定: LINE_CHANNEL_ACCESS_TOKEN 或 CHANNEL_ACCESS_TOKEN');
      // 仍然返回 200，避免 Line 重試
      return NextResponse.json({ error: 'Configuration error' }, { status: 200 });
    }

    // 在執行時取得 bot 實例
    const bot = getBot();
    
    if (!bot) {
      console.error('❌ Bot 實例初始化失敗');
      return NextResponse.json({ error: 'Bot initialization failed' }, { status: 200 });
    }
    
    const body = await req.text();
    let bodyJson: any = {};
    
    try {
      bodyJson = JSON.parse(body || '{}');
      console.log(`📥 [Webhook Request ${requestId}] Received body:`, {
        events: bodyJson.events?.length || 0,
        destination: bodyJson.destination,
      });
    } catch (parseError) {
      console.error(`❌ [Webhook Request ${requestId}] JSON 解析錯誤:`, parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 200 });
    }
    
    // 建立請求上下文（Bottender 1.5.5 需要手動構建）
    const requestContext = {
      method: req.method,
      path: '/api/webhook/line',
      query: {},
      params: {},
      headers: Object.fromEntries(req.headers.entries()),
      rawBody: body,
      body: bodyJson,
      url: req.url,
    };

    // 取得 request handler
    const requestHandler = bot.createRequestHandler();

    if (!requestHandler) {
      console.error('❌ Request handler 無法建立');
      return NextResponse.json({ error: 'Handler creation failed' }, { status: 200 });
    }

    // 處理請求（Bottender 會自動處理回應）
    await requestHandler(bodyJson, requestContext);

    console.log(`✅ [Webhook Request ${requestId}] Successfully processed`);
    
    // 成功處理，返回 200
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
      message: 'Line Bot Webhook is running (legacy path)',
      note: 'This is a compatibility route. Please update to /api/webhooks/line',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

