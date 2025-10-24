#!/usr/bin/env node

/**
 * 效能監控測試腳本
 * 測試前後端效能監控功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testPerformanceMonitoring() {
  console.log('🧪 開始效能監控測試...\n');

  try {
    // 1. 測試健康檢查
    console.log('1. 測試健康檢查...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 健康檢查通過:', healthResponse.data);

    // 2. 測試效能指標端點
    console.log('\n2. 測試效能指標端點...');
    const performanceResponse = await axios.get(`${BASE_URL}/api/performance`);
    console.log('✅ 效能指標獲取成功:');
    console.log('   - 請求數:', performanceResponse.data.requestCount);
    console.log('   - 平均響應時間:', performanceResponse.data.averageResponseTime + 'ms');
    console.log('   - 錯誤數:', performanceResponse.data.errorCount);
    console.log('   - Google Maps 請求數:', performanceResponse.data.googleMapsRequests);

    // 3. 模擬一些請求來測試監控
    console.log('\n3. 模擬請求測試監控...');
    
    // 發送多個請求
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(axios.get(`${BASE_URL}/health`));
    }
    
    await Promise.all(requests);
    console.log('✅ 發送了 5 個並行請求');

    // 4. 再次檢查效能指標
    console.log('\n4. 檢查更新後的效能指標...');
    const updatedPerformance = await axios.get(`${BASE_URL}/api/performance`);
    console.log('✅ 更新後的效能指標:');
    console.log('   - 請求數:', updatedPerformance.data.requestCount);
    console.log('   - 平均響應時間:', updatedPerformance.data.averageResponseTime + 'ms');
    console.log('   - 最小響應時間:', updatedPerformance.data.minResponseTime + 'ms');
    console.log('   - 最大響應時間:', updatedPerformance.data.maxResponseTime + 'ms');

    // 5. 測試重置功能
    console.log('\n5. 測試效能指標重置...');
    await axios.post(`${BASE_URL}/api/performance/reset`);
    console.log('✅ 效能指標已重置');

    // 6. 驗證重置結果
    const resetPerformance = await axios.get(`${BASE_URL}/api/performance`);
    console.log('✅ 重置後的效能指標:');
    console.log('   - 請求數:', resetPerformance.data.requestCount);
    console.log('   - 平均響應時間:', resetPerformance.data.averageResponseTime + 'ms');

    console.log('\n🎉 效能監控測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    if (error.response) {
      console.error('   響應狀態:', error.response.status);
      console.error('   響應數據:', error.response.data);
    }
    process.exit(1);
  }
}

// 檢查服務器是否運行
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 檢查服務器狀態...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ 服務器未運行，請先啟動後端服務器:');
    console.error('   cd backend && npm run dev');
    process.exit(1);
  }

  console.log('✅ 服務器正在運行');
  await testPerformanceMonitoring();
}

main().catch(console.error);
