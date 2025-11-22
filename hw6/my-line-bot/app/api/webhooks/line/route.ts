import { NextRequest, NextResponse } from 'next/server';
import getBot from '../../../../bot';

export async function POST(req: NextRequest) {
  try {
    // 在執行時取得 bot 實例
    const bot = getBot();
    
    const body = await req.text();
    const bodyJson = JSON.parse(body || '{}');
    
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

    // 處理請求（Bottender 會自動處理回應）
    await requestHandler(bodyJson, requestContext);

    // Bottender 會自動處理回應，這裡只需要返回 200
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    console.error('Webhook 處理錯誤:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

