// 簡單的腳本服務測試
import { matchKeyword, getScriptResponse, handleScriptResponse } from './lib/services/scriptService';

console.log('=== 腳本服務測試 ===\n');

// 測試關鍵字匹配
const testCases = [
  { input: '地址在哪裡', expected: 'clinic_info' },
  { input: '有什麼服務', expected: 'service_info' },
  { input: '我想預約', expected: 'appointment' },
  { input: '付款方式', expected: 'payment' },
  { input: '術後照顧', expected: 'post_treatment' },
  { input: '你好', expected: 'greeting' },
  { input: '謝謝', expected: 'thanks' },
  { input: '再見', expected: 'goodbye' },
];

console.log('1. 關鍵字匹配測試:');
testCases.forEach(({ input, expected }) => {
  const result = matchKeyword(input);
  const status = result === expected ? '✅' : '❌';
  console.log(`${status} "${input}" -> ${result} (預期: ${expected})`);
});

console.log('\n2. 腳本回應測試:');
const responseTests = ['地址', '服務', '預約', '你好'];
responseTests.forEach((input) => {
  const response = handleScriptResponse(input);
  if (response) {
    const type = response.type;
    const preview = type === 'text' 
      ? (response as any).text.substring(0, 50) + '...'
      : 'Template Message';
    console.log(`✅ "${input}" -> ${type}: ${preview}`);
  } else {
    console.log(`❌ "${input}" -> 無回應`);
  }
});

console.log('\n測試完成！');

