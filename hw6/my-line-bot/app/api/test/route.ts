import { NextResponse } from 'next/server';
import { matchKeyword, handleScriptResponse } from '@/lib/services/scriptService';

// 測試端點：驗證腳本服務功能
export async function GET() {
  const testCases = [
    { input: '地址在哪裡', expected: 'clinic_info' },
    { input: '有什麼服務', expected: 'service_info' },
    { input: '我想預約', expected: 'appointment' },
    { input: '你好', expected: 'greeting' },
  ];

  const results = testCases.map(({ input, expected }) => {
    const matched = matchKeyword(input);
    const response = handleScriptResponse(input);
    return {
      input,
      expected,
      matched,
      hasResponse: !!response,
      responseType: response?.type || null,
      passed: matched === expected && !!response,
    };
  });

  const allPassed = results.every((r) => r.passed);

  return NextResponse.json({
    status: allPassed ? 'success' : 'partial',
    message: allPassed
      ? '所有測試通過'
      : '部分測試失敗',
    results,
    timestamp: new Date().toISOString(),
  });
}

