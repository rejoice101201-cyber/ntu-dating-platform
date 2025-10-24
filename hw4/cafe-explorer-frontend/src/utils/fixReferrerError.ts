// 修復 RefererNotAllowedMapError 的工具
export const checkReferrerError = () => {
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  console.log('🔍 當前網址分析:');
  console.log('================================');
  console.log('完整網址:', currentUrl);
  console.log('主機名:', hostname);
  console.log('端口:', port);
  console.log('協議:', window.location.protocol);
  
  // 檢查是否為 localhost
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  console.log('是否為本地開發:', isLocalhost ? '✅' : '❌');
  
  return {
    currentUrl,
    hostname,
    port,
    isLocalhost,
    needsAuthorization: isLocalhost
  };
};

// 生成 Google Cloud Console 設定建議
export const generateConsoleSetup = () => {
  const { hostname, port } = checkReferrerError();
  
  console.log('\n🔧 Google Cloud Console 設定建議:');
  console.log('================================');
  console.log('1. 前往: https://console.cloud.google.com/');
  console.log('2. 選擇你的專案');
  console.log('3. 前往: APIs & Services > Credentials');
  console.log('4. 編輯你的 Browser Key');
  console.log('5. 在 "Application restrictions" 中選擇 "HTTP referrers (web sites)"');
  console.log('6. 添加以下網址到允許清單:');
  console.log('');
  console.log(`   http://${hostname}:${port}/*`);
  console.log(`   http://127.0.0.1:${port}/*`);
  console.log('   http://localhost:5173/*');
  console.log('   http://localhost:5180/*');
  console.log('   http://127.0.0.1:5173/*');
  console.log('   http://127.0.0.1:5180/*');
  console.log('');
  console.log('7. 保存設定');
  console.log('8. 等待 1-5 分鐘讓設定生效');
  console.log('9. 清除瀏覽器緩存 (Ctrl + Shift + R)');
  console.log('10. 重新載入頁面');
};

// 檢查錯誤並提供解決方案
export const diagnoseReferrerError = () => {
  console.log('🚨 檢測到 RefererNotAllowedMapError');
  console.log('====================================');
  
  const analysis = checkReferrerError();
  generateConsoleSetup();
  
  console.log('\n💡 快速修復建議:');
  console.log('================');
  console.log('1. 立即前往 Google Cloud Console');
  console.log('2. 添加當前域名到允許清單');
  console.log('3. 等待幾分鐘後重新載入');
  console.log('4. 如果問題持續，嘗試重新生成 API Key');
  
  return analysis;
};

// 自動檢測並提供解決方案
export const autoFixReferrerError = () => {
  // 檢查是否有 RefererNotAllowedMapError
  const hasReferrerError = window.location.href.includes('localhost') || 
                          window.location.href.includes('127.0.0.1');
  
  if (hasReferrerError) {
    console.log('🔍 自動檢測到本地開發環境');
    diagnoseReferrerError();
  }
  
  return hasReferrerError;
};
