import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface HealthCheck {
  status: 'ok' | 'error';
  message?: string;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: HealthCheck;
    environment: HealthCheck;
  };
  uptime: number;
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthResponse['checks'] = {
    database: { status: 'error', message: 'Not checked' },
    environment: { status: 'error', message: 'Not checked' },
  };

  // 檢查必要的環境變數
  const requiredEnvVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'GEMINI_API_KEY',
  ];
  const missingEnvVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] && !process.env[envVar.replace('LINE_', '')]) {
      missingEnvVars.push(envVar);
    }
  }

  if (missingEnvVars.length === 0) {
    checks.environment = { status: 'ok' };
  } else {
    checks.environment = {
      status: 'error',
      message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
    };
  }

  // 檢查資料庫連接
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok' };
  } catch (error: any) {
    console.error('❌ [Health Check] 資料庫連接失敗:', error);
    checks.database = {
      status: 'error',
      message: error?.message || 'Database connection failed',
    };
  }

  // 判斷整體健康狀態
  const isHealthy =
    checks.database.status === 'ok' && checks.environment.status === 'ok';

  const response: HealthResponse = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    uptime: Date.now() - startTime,
  };

  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}



