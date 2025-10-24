interface PerformanceMetrics {
  requestCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorCount: number;
  googleMapsRequests: number;
  googleMapsTotalTime: number;
  googleMapsAverageTime: number;
  cacheHits: number;
  cacheMisses: number;
}

interface RequestMetrics {
  startTime: number;
  endTime?: number;
  responseTime?: number;
  isGoogleMapsRequest?: boolean;
  url: string;
  method: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    errorCount: 0,
    googleMapsRequests: 0,
    googleMapsTotalTime: 0,
    googleMapsAverageTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  private requestMetrics = new Map<string, RequestMetrics>();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start monitoring a request
  startRequest(url: string, method: string = 'GET'): string {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    this.requestMetrics.set(requestId, {
      startTime,
      url,
      method,
      isGoogleMapsRequest: url.includes('/search') || url.includes('/places')
    });
    
    return requestId;
  }

  // End monitoring a request
  endRequest(requestId: string, success: boolean = true): void {
    const metrics = this.requestMetrics.get(requestId);
    if (!metrics) return;

    const endTime = Date.now();
    const responseTime = endTime - metrics.startTime;
    
    metrics.endTime = endTime;
    metrics.responseTime = responseTime;
    
    // Update global metrics
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount;
    this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime);
    this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
    
    if (!success) {
      this.metrics.errorCount++;
    }
    
    // Update Google Maps specific metrics
    if (metrics.isGoogleMapsRequest) {
      this.metrics.googleMapsRequests++;
      this.metrics.googleMapsTotalTime += responseTime;
      this.metrics.googleMapsAverageTime = this.metrics.googleMapsTotalTime / this.metrics.googleMapsRequests;
    }
    
    // Log slow requests (> 2 seconds)
    if (responseTime > 2000) {
      console.warn(`🐌 Slow request detected: ${metrics.method} ${metrics.url} - ${responseTime}ms`);
    }
    
    // Log Google Maps requests
    if (metrics.isGoogleMapsRequest) {
      console.log(`🗺️ Google Maps API request: ${metrics.method} ${metrics.url} - ${responseTime}ms`);
    }
    
    // Clean up
    this.requestMetrics.delete(requestId);
  }

  // Cache management
  setCache(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) {
      this.metrics.cacheMisses++;
      return null;
    }
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }
    
    this.metrics.cacheHits++;
    return cached.data;
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics & { cacheSize: number; uptime: number } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      uptime: Date.now() - (window as any).performanceStartTime || 0
    };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      errorCount: 0,
      googleMapsRequests: 0,
      googleMapsTotalTime: 0,
      googleMapsAverageTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.requestMetrics.clear();
    this.cache.clear();
  }

  // Log performance summary
  logSummary(): void {
    const metrics = this.getMetrics();
    console.log('📊 Performance Summary:');
    console.log(`   Total Requests: ${metrics.requestCount}`);
    console.log(`   Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Min Response Time: ${metrics.minResponseTime === Infinity ? 'N/A' : metrics.minResponseTime}ms`);
    console.log(`   Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`   Error Count: ${metrics.errorCount}`);
    console.log(`   Google Maps Requests: ${metrics.googleMapsRequests}`);
    console.log(`   Google Maps Avg Time: ${metrics.googleMapsAverageTime.toFixed(2)}ms`);
    console.log(`   Cache Hit Rate: ${metrics.cacheHits + metrics.cacheMisses > 0 ? 
      ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2) : 0}%`);
    console.log(`   Cache Size: ${metrics.cacheSize} entries`);
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize performance start time
(window as any).performanceStartTime = Date.now();

// Auto-cleanup expired cache every 5 minutes
setInterval(() => {
  performanceMonitor.clearExpiredCache();
}, 300000);

// Log performance summary every 10 minutes
setInterval(() => {
  performanceMonitor.logSummary();
}, 600000);

export default performanceMonitor;
