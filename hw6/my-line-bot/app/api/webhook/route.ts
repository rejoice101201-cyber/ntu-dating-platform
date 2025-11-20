import { NextRequest, NextResponse } from 'next/server';
import { Client, WebhookEvent, TextMessage } from '@line/bot-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

// Line Bot 配置
const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET || '',
});

// Google Gemini 配置
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 驗證 Line 簽章
function validateSignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// 處理 POST 請求（Line Webhook）
export async function POST(req: NextRequest) {
  try {
    // 取得原始請求體（用於簽章驗證）
    const body = await req.text();
    const signature = req.headers.get('x-line-signature') || '';
    const channelSecret = process.env.CHANNEL_SECRET || '';

    // 如果沒有簽章，可能是驗證請求，直接返回 200
    if (!signature || !channelSecret) {
      console.log('Missing signature or channel secret');
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // 驗證簽章
    if (!validateSignature(body, signature, channelSecret)) {
      console.error('Invalid signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    // 解析事件
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
    }

    const events: WebhookEvent[] = parsedBody.events || [];

    // 如果沒有事件（可能是驗證請求），直接返回 200
    if (!events || events.length === 0) {
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // 處理每個事件
    for (const event of events) {
      // 只處理文字訊息
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;
        const replyToken = event.replyToken;

        try {
          // 呼叫 Google Gemini API
          const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
          
          const prompt = `你是一個友善的 AI 助手，請用繁體中文回答問題。\n\n使用者問題：${userMessage}`;
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const aiResponse = response.text() || '抱歉，我無法產生回應。';

          // 回覆訊息給使用者
          const message: TextMessage = {
            type: 'text',
            text: aiResponse,
          };

          await client.replyMessage(replyToken, message);
        } catch (error) {
          console.error('Gemini API 錯誤:', error);
          // 發生錯誤時回覆預設訊息
          const errorMessage: TextMessage = {
            type: 'text',
            text: '抱歉，處理您的訊息時發生錯誤，請稍後再試。',
          };
          await client.replyMessage(replyToken, errorMessage);
        }
      }
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('Webhook 處理錯誤:', error);
    // 即使發生錯誤，也返回 200 以避免 Line 重試
    return NextResponse.json({ message: 'OK' }, { status: 200 });
  }
}

// 處理 GET 請求（健康檢查）
export async function GET() {
  return NextResponse.json({ 
    message: 'Line Bot Webhook is running',
    timestamp: new Date().toISOString(),
  }, { status: 200 });
}

