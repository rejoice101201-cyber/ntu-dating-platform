import { NextResponse } from 'next/server';

// 測試端點：已遷移到 Bottender，請使用實際的 webhook 端點進行測試
export async function GET() {
  return NextResponse.json({
    status: 'info',
    message: '測試端點已遷移到 Bottender 架構。請使用 /api/webhooks/line 進行測試。',
    timestamp: new Date().toISOString(),
  });
}

