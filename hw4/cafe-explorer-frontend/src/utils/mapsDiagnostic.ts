// Google Maps API 診斷工具
export const diagnoseGoogleMaps = () => {
  const results = {
    apiKey: false,
    googleMaps: false,
    mapConstructor: false,
    markerConstructor: false,
    errors: [] as string[]
  };

  // 檢查 API Key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_JS_KEY;
  if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
    results.apiKey = true;
  } else {
    results.errors.push('❌ API Key 未設置或無效');
  }

  // 檢查 Google Maps 是否載入
  if (typeof window !== 'undefined' && window.google) {
    results.googleMaps = true;
  } else {
    results.errors.push('❌ Google Maps API 未載入');
  }

  // 檢查 Map 構造函數
  if (typeof window !== 'undefined' && window.google?.maps?.Map) {
    results.mapConstructor = true;
  } else {
    results.errors.push('❌ google.maps.Map 不可用');
  }

  // 檢查 Marker 構造函數
  if (typeof window !== 'undefined' && window.google?.maps?.Marker) {
    results.markerConstructor = true;
  } else {
    results.errors.push('❌ google.maps.Marker 不可用');
  }

  return results;
};

// 在控制台顯示診斷結果
export const logDiagnostic = () => {
  const results = diagnoseGoogleMaps();
  
  console.log('🔍 Google Maps API 診斷結果:');
  console.log('================================');
  console.log('API Key 設置:', results.apiKey ? '✅' : '❌');
  console.log('Google Maps 載入:', results.googleMaps ? '✅' : '❌');
  console.log('Map 構造函數:', results.mapConstructor ? '✅' : '❌');
  console.log('Marker 構造函數:', results.markerConstructor ? '✅' : '❌');
  
  if (results.errors.length > 0) {
    console.log('\n🚨 發現問題:');
    results.errors.forEach(error => console.log(error));
  } else {
    console.log('\n🎉 所有檢查通過！');
  }

  return results;
};

// 檢查 API Key 格式
export const validateApiKey = (key: string): boolean => {
  // Google Maps API Key 通常是 39 個字符的字符串
  return !!(key && key.length === 39 && /^[A-Za-z0-9_-]+$/.test(key));
};

// 檢查當前 URL 是否在允許清單中
export const checkReferrer = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // 檢查是否為 localhost 或 127.0.0.1
  return hostname === 'localhost' || hostname === '127.0.0.1';
};
