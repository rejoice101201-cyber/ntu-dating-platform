import React, { useEffect, useState } from 'react';
import { diagnoseGoogleMaps, logDiagnostic } from '../utils/mapsDiagnostic';

export const DiagnosticPage: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // 檢查環境變數
    const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_JS_KEY;
    setApiKey(envApiKey || '');
    
    // 運行診斷
    const results = diagnoseGoogleMaps();
    setDiagnosticResults(results);
    
    // 在控制台顯示詳細診斷
    logDiagnostic();
  }, []);

  const testApiKey = () => {
    // 重新載入頁面以測試新的 API 金鑰
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Google Maps API 診斷工具</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">環境變數檢查</h2>
          <div className="space-y-2">
            <p><strong>VITE_GOOGLE_MAPS_JS_KEY:</strong></p>
            <code className="block bg-gray-100 p-2 rounded text-sm break-all">
              {apiKey || '未設置'}
            </code>
            <p className="text-sm text-gray-600">
              長度: {apiKey.length} 字符
            </p>
            {apiKey && apiKey !== 'your-google-maps-javascript-api-key-here' && (
              <p className="text-green-600 text-sm">✅ API 金鑰已設置</p>
            )}
            {apiKey === 'your-google-maps-javascript-api-key-here' && (
              <p className="text-red-600 text-sm">❌ 請設定真實的 API 金鑰</p>
            )}
          </div>
        </div>

        {diagnosticResults && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">診斷結果</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>API Key 設置: {diagnosticResults.apiKey ? '✅' : '❌'}</p>
                <p>Google Maps 載入: {diagnosticResults.googleMaps ? '✅' : '❌'}</p>
                <p>Map 構造函數: {diagnosticResults.mapConstructor ? '✅' : '❌'}</p>
                <p>Marker 構造函數: {diagnosticResults.markerConstructor ? '✅' : '❌'}</p>
              </div>
            </div>
            
            {diagnosticResults.errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">發現的問題:</h3>
                <ul className="text-red-700">
                  {diagnosticResults.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">解決步驟</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">1. 檢查 API 金鑰格式</h3>
              <p className="text-blue-700 text-sm">
                Google Maps API 金鑰應該是 39 個字符的字符串，格式類似：AIza****xxxx
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">2. 檢查 API 限制設定</h3>
              <p className="text-green-700 text-sm">
                在 Google Cloud Console 中，確保 API 金鑰的 HTTP referrer 限制包含：localhost:5173/*
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">3. 檢查 API 啟用狀態</h3>
              <p className="text-yellow-700 text-sm">
                確保已啟用 "Maps JavaScript API" 和 "Places API"
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">測試操作</h2>
          <button
            onClick={testApiKey}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新載入頁面測試
          </button>
        </div>
      </div>
    </div>
  );
};

