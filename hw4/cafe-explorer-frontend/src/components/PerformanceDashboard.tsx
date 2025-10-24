import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorCount: number;
  googleMapsRequests: number;
  googleMapsAverageTime: number;
  cacheHits: number;
  cacheMisses: number;
  cacheSize: number;
  uptime: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMetrics = async () => {
    try {
      // Get frontend metrics
      const frontendMetrics = performanceMonitor.getMetrics();
      
      // Get backend metrics
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/performance`);
      await response.json();
      
      // Combine metrics
      const combinedMetrics: PerformanceMetrics = {
        requestCount: frontendMetrics.requestCount,
        averageResponseTime: frontendMetrics.averageResponseTime,
        minResponseTime: frontendMetrics.minResponseTime,
        maxResponseTime: frontendMetrics.maxResponseTime,
        errorCount: frontendMetrics.errorCount,
        googleMapsRequests: frontendMetrics.googleMapsRequests,
        googleMapsAverageTime: frontendMetrics.googleMapsAverageTime,
        cacheHits: frontendMetrics.cacheHits,
        cacheMisses: frontendMetrics.cacheMisses,
        cacheSize: frontendMetrics.cacheSize,
        uptime: frontendMetrics.uptime
      };
      
      setMetrics(combinedMetrics);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchMetrics();
      
      if (autoRefresh) {
        const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
      }
    }
  }, [isVisible, autoRefresh]);

  const resetMetrics = async () => {
    try {
      performanceMonitor.resetMetrics();
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/performance/reset`, {
        method: 'POST'
      });
      fetchMetrics();
    } catch (error) {
      console.error('Failed to reset metrics:', error);
    }
  };

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getCacheHitRate = (): number => {
    if (!metrics) return 0;
    const total = metrics.cacheHits + metrics.cacheMisses;
    return total > 0 ? (metrics.cacheHits / total) * 100 : 0;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        📊 Performance
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Performance Dashboard</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2 py-1 text-xs rounded ${
              autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {metrics && (
        <div className="space-y-3 text-sm">
          {/* Request Statistics */}
          <div className="border-b pb-2">
            <h4 className="font-medium text-gray-700 mb-2">Request Statistics</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600">Total Requests:</span>
                <span className="ml-1 font-mono">{metrics.requestCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Errors:</span>
                <span className={`ml-1 font-mono ${metrics.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.errorCount}
                </span>
              </div>
            </div>
          </div>

          {/* Response Time */}
          <div className="border-b pb-2">
            <h4 className="font-medium text-gray-700 mb-2">Response Time</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className={`font-mono ${getPerformanceColor(metrics.averageResponseTime, { good: 500, warning: 1000 })}`}>
                  {metrics.averageResponseTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min:</span>
                <span className="font-mono text-green-600">
                  {metrics.minResponseTime === Infinity ? 'N/A' : `${metrics.minResponseTime}ms`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max:</span>
                <span className={`font-mono ${getPerformanceColor(metrics.maxResponseTime, { good: 2000, warning: 5000 })}`}>
                  {metrics.maxResponseTime}ms
                </span>
              </div>
            </div>
          </div>

          {/* Google Maps Performance */}
          <div className="border-b pb-2">
            <h4 className="font-medium text-gray-700 mb-2">Google Maps API</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Requests:</span>
                <span className="font-mono">{metrics.googleMapsRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Time:</span>
                <span className={`font-mono ${getPerformanceColor(metrics.googleMapsAverageTime, { good: 1000, warning: 2000 })}`}>
                  {metrics.googleMapsAverageTime.toFixed(0)}ms
                </span>
              </div>
            </div>
          </div>

          {/* Cache Performance */}
          <div className="border-b pb-2">
            <h4 className="font-medium text-gray-700 mb-2">Cache Performance</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Hit Rate:</span>
                <span className={`font-mono ${getPerformanceColor(100 - getCacheHitRate(), { good: 20, warning: 50 })}`}>
                  {getCacheHitRate().toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Size:</span>
                <span className="font-mono">{metrics.cacheSize} entries</span>
              </div>
            </div>
          </div>

          {/* Uptime */}
          <div className="pb-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-mono text-blue-600">{formatUptime(metrics.uptime)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={fetchMetrics}
              className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={resetMetrics}
              className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
