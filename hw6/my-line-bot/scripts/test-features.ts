#!/usr/bin/env tsx

/**
 * 測試腳本：驗證進階功能
 * 使用方法: npm run test-features [BASE_URL]
 * 例如: npm run test-features https://hw6-bot.vercel.app
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testHealthCheck(): Promise<void> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 測試 1: 健康檢查端點 (/api/health)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const contentType = response.headers.get('content-type');
    
    // 檢查回應類型
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      results.push({
        name: '健康檢查請求',
        passed: false,
        message: `回應不是 JSON 格式 (Content-Type: ${contentType || 'unknown'})`,
        details: text.substring(0, 200),
      });
      return;
    }
    
    const data = await response.json();

    // 檢查 HTTP 狀態碼
    if (response.status === 200 || response.status === 503) {
      results.push({
        name: '健康檢查 HTTP 狀態碼',
        passed: true,
        message: `狀態碼: ${response.status}`,
      });

      // 檢查回應格式
      if (data.status && data.checks && data.timestamp) {
        results.push({
          name: '健康檢查回應格式',
          passed: true,
          message: '回應格式正確',
        });

        // 檢查健康狀態
        console.log(`✅ 系統狀態: ${data.status}`);
        console.log(`📊 檢查結果:`);
        console.log(`   - 資料庫: ${data.checks.database.status}`);
        console.log(`   - 環境變數: ${data.checks.environment.status}`);
        console.log(`   - 回應時間: ${data.uptime}ms`);

        if (data.status === 'healthy') {
          results.push({
            name: '系統健康狀態',
            passed: true,
            message: '系統運行正常',
          });
        } else {
          results.push({
            name: '系統健康狀態',
            passed: false,
            message: '系統狀態異常',
            details: data.checks,
          });
        }
      } else {
        results.push({
          name: '健康檢查回應格式',
          passed: false,
          message: '回應格式不正確',
          details: data,
        });
      }
    } else {
      results.push({
        name: '健康檢查 HTTP 狀態碼',
        passed: false,
        message: `意外的狀態碼: ${response.status}`,
      });
    }
  } catch (error: any) {
    // 檢查是否是 JSON 解析錯誤
    if (error.message && error.message.includes('JSON')) {
      results.push({
        name: '健康檢查請求',
        passed: false,
        message: `回應不是有效的 JSON 格式（可能是 404 或路由未部署）`,
        details: error.message,
      });
    } else {
      results.push({
        name: '健康檢查請求',
        passed: false,
        message: `請求失敗: ${error.message}`,
      });
    }
  }
}

async function testPerformanceStats(): Promise<void> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 測試 2: 效能監控統計 (/api/admin/stats)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await response.json();

    if (response.status === 200) {
      results.push({
        name: '統計 API HTTP 狀態碼',
        passed: true,
        message: '狀態碼: 200',
      });

      // 檢查是否有 performance 欄位
      if (data.performance) {
        results.push({
          name: '效能統計數據存在',
          passed: true,
          message: '包含 performance 欄位',
        });

        console.log('✅ 效能統計數據:');
        console.log(`   - 平均回應時間: ${data.performance.avgResponseTime}ms`);
        console.log(`   - 慢查詢數量: ${data.performance.slowQueries}`);
        console.log(`   - 樣本數量: ${data.performance.sampleSize}`);
        console.log(`   - 回應時間陣列長度: ${data.performance.recentResponseTimes?.length || 0}`);

        // 檢查效能數據格式
        if (
          typeof data.performance.avgResponseTime === 'number' &&
          typeof data.performance.slowQueries === 'number' &&
          typeof data.performance.sampleSize === 'number'
        ) {
          results.push({
            name: '效能統計數據格式',
            passed: true,
            message: '數據格式正確',
          });
        } else {
          results.push({
            name: '效能統計數據格式',
            passed: false,
            message: '數據格式不正確',
            details: data.performance,
          });
        }
      } else {
        results.push({
          name: '效能統計數據存在',
          passed: false,
          message: '回應中沒有 performance 欄位（可能需要重新部署）',
          details: {
            availableKeys: Object.keys(data),
            note: '請確認 Vercel 已部署最新代碼，包含 performance 欄位的更新',
          },
        });
        console.log('⚠️  注意：stats API 缺少 performance 欄位');
        console.log('   可用的欄位:', Object.keys(data).join(', '));
        console.log('   建議：檢查 Vercel 部署是否包含最新的代碼更新');
      }
    } else {
      results.push({
        name: '統計 API HTTP 狀態碼',
        passed: false,
        message: `狀態碼: ${response.status}`,
        details: data,
      });
    }
  } catch (error: any) {
    results.push({
      name: '統計 API 請求',
      passed: false,
      message: `請求失敗: ${error.message}`,
    });
  }
}

async function testContentSearch(): Promise<void> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 測試 3: 內容搜尋功能 (/api/admin/messages?search=關鍵字)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const searchKeywords = ['預約', '地址', '服務', 'hello'];

  for (const keyword of searchKeywords) {
    try {
      const url = `${BASE_URL}/api/admin/messages?search=${encodeURIComponent(keyword)}&limit=5`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.status === 200) {
        console.log(`\n🔍 搜尋關鍵字: "${keyword}"`);
        console.log(`   ✅ 找到 ${data.total} 筆匹配訊息（顯示 ${data.messages?.length || 0} 筆）`);

        if (data.messages && data.messages.length > 0) {
          const firstMessage = data.messages[0];
          console.log(`   📝 範例訊息: ${firstMessage.content?.substring(0, 50)}...`);

          results.push({
            name: `內容搜尋 - "${keyword}"`,
            passed: true,
            message: `找到 ${data.total} 筆匹配訊息`,
          });
        } else {
          results.push({
            name: `內容搜尋 - "${keyword}"`,
            passed: true,
            message: '搜尋功能正常，但沒有匹配的訊息',
          });
        }

        // 檢查回應格式
        if (data.messages && typeof data.total === 'number') {
          results.push({
            name: `搜尋回應格式 - "${keyword}"`,
            passed: true,
            message: '回應格式正確',
          });
        }
      } else {
        results.push({
          name: `內容搜尋 - "${keyword}"`,
          passed: false,
          message: `HTTP 狀態碼: ${response.status}`,
          details: data,
        });
      }
    } catch (error: any) {
      results.push({
        name: `內容搜尋 - "${keyword}"`,
        passed: false,
        message: `請求失敗: ${error.message}`,
      });
    }
  }
}

async function main() {
  console.log('🧪 開始測試進階功能...');
  console.log(`📍 測試目標: ${BASE_URL}`);
  console.log('');

  await testHealthCheck();
  await testPerformanceStats();
  await testContentSearch();

  // 顯示測試結果摘要
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 測試結果摘要');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.details && !result.passed) {
      console.log(`   詳情:`, JSON.stringify(result.details, null, 2));
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 通過: ${passed} | ❌ 失敗: ${failed} | 📊 總計: ${results.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ 測試腳本執行失敗:', error);
  process.exit(1);
});

