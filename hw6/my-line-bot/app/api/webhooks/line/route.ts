import { NextRequest, NextResponse } from 'next/server';
import getBot from '../../../../bot';

export async function POST(req: NextRequest) {
  // Line 要求必須返回 200，即使發生錯誤也要返回 200
  try {
    // 檢查環境變數
    if (!process.env.LINE_CHANNEL_SECRET || !process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      console.error('❌ 缺少必要的環境變數: LINE_CHANNEL_SECRET 或 LINE_CHANNEL_ACCESS_TOKEN');
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
    } catch (parseError) {
      console.error('❌ JSON 解析錯誤:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 200 });
    }
    
    // 建立請求上下文
    const requestContext = {
      method: req.method,
      path: '/api/webhooks/line',
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

    // 成功處理，返回 200
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    // 即使發生錯誤，也要返回 200（Line 要求）
    console.error('❌ Webhook 處理錯誤:', error);
    console.error('錯誤堆疊:', error?.stack);
    
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

