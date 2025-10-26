import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';
import { useAuth } from '../context/AuthContext';

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
  const { isLoggedIn } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Reset visibility when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      setIsVisible(false);
      setAutoRefresh(false);
    }
  }, [isLoggedIn]);

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
    if (isVisible && isLoggedIn) {
      fetchMetrics();
      
      if (autoRefresh) {
        const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
      }
    }
  }, [isVisible, autoRefresh, isLoggedIn]);

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

  // Only render if user is logged in
  if (!isLoggedIn) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 z-50 flex items-center font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Performance Monitor
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl p-6 w-96 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Performance Dashboard</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
              autoRefresh 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            {autoRefresh ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600 mr-1"></div>
                Auto
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Manual
              </div>
            )}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
          <div className="flex gap-3 pt-3">
            <button
              onClick={fetchMetrics}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={resetMetrics}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
