import { Request, Response, NextFunction } from 'express';

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
}

interface RequestMetrics {
  startTime: number;
  endTime?: number;
  responseTime?: number;
  isGoogleMapsRequest?: boolean;
  googleMapsTime?: number;
}

// Global performance metrics
const performanceMetrics: PerformanceMetrics = {
  requestCount: 0,
  totalResponseTime: 0,
  averageResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  errorCount: 0,
  googleMapsRequests: 0,
  googleMapsTotalTime: 0,
  googleMapsAverageTime: 0
};

// Store request metrics by request ID
const requestMetrics = new Map<string, RequestMetrics>();

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Store request metrics
  requestMetrics.set(requestId, {
    startTime,
    isGoogleMapsRequest: req.path.includes('/search') || req.path.includes('/places')
  });
  
  // Attach request ID to request object
  (req as any).requestId = requestId;
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Update request metrics
    const metrics = requestMetrics.get(requestId);
    if (metrics) {
      metrics.endTime = endTime;
      metrics.responseTime = responseTime;
      
      // Update global metrics
      performanceMetrics.requestCount++;
      performanceMetrics.totalResponseTime += responseTime;
      performanceMetrics.averageResponseTime = performanceMetrics.totalResponseTime / performanceMetrics.requestCount;
      performanceMetrics.minResponseTime = Math.min(performanceMetrics.minResponseTime, responseTime);
      performanceMetrics.maxResponseTime = Math.max(performanceMetrics.maxResponseTime, responseTime);
      
      // Update Google Maps specific metrics
      if (metrics.isGoogleMapsRequest) {
        performanceMetrics.googleMapsRequests++;
        performanceMetrics.googleMapsTotalTime += responseTime;
        performanceMetrics.googleMapsAverageTime = performanceMetrics.googleMapsTotalTime / performanceMetrics.googleMapsRequests;
      }
      
      // Log slow requests (> 2 seconds)
      if (responseTime > 2000) {
        console.warn(`🐌 Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`);
      }
      
      // Log Google Maps requests
      if (metrics.isGoogleMapsRequest) {
        console.log(`🗺️ Google Maps API request: ${req.method} ${req.path} - ${responseTime}ms`);
      }
    }
    
    // Clean up request metrics
    requestMetrics.delete(requestId);
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};

// Error tracking middleware
export const errorTracker = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body: any) {
    if (res.statusCode >= 400) {
      performanceMetrics.errorCount++;
      console.error(`❌ Error response: ${req.method} ${req.path} - ${res.statusCode}`);
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

// Get performance metrics endpoint
export const getPerformanceMetrics = (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const metrics = {
    ...performanceMetrics,
    uptime: Math.floor(uptime),
    memoryUsage: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024) // MB
    },
    timestamp: new Date().toISOString()
  };
  
  res.json(metrics);
};

// Reset performance metrics
export const resetPerformanceMetrics = (req: Request, res: Response) => {
  performanceMetrics.requestCount = 0;
  performanceMetrics.totalResponseTime = 0;
  performanceMetrics.averageResponseTime = 0;
  performanceMetrics.minResponseTime = Infinity;
  performanceMetrics.maxResponseTime = 0;
  performanceMetrics.errorCount = 0;
  performanceMetrics.googleMapsRequests = 0;
  performanceMetrics.googleMapsTotalTime = 0;
  performanceMetrics.googleMapsAverageTime = 0;
  
  requestMetrics.clear();
  
  res.json({ message: 'Performance metrics reset successfully' });
};

export default performanceMetrics;
