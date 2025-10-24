import axios, { type AxiosResponse } from 'axios';
import { performanceMonitor } from '../utils/performanceMonitor';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Cache configuration
const CACHE_TTL = {
  PLACES_SEARCH: 300000, // 5 minutes
  NEARBY_SEARCH: 600000, // 10 minutes
  LOCATIONS: 60000, // 1 minute
  DEFAULT: 300000 // 5 minutes
};

interface ApiResponse<T> {
  data: T;
  fromCache: boolean;
  responseTime: number;
}

class OptimizedApiService {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Generic request method with performance monitoring and caching
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<ApiResponse<T>> {
    const requestId = performanceMonitor.startRequest(url, method);
    const startTime = Date.now();

    try {
      // Check cache for GET requests
      if (method === 'GET' && cacheKey) {
        const cached = performanceMonitor.getCache(cacheKey);
        if (cached) {
          performanceMonitor.endRequest(requestId, true);
          return {
            data: cached,
            fromCache: true,
            responseTime: Date.now() - startTime
          };
        }
      }

      // Make actual request
      const response: AxiosResponse<T> = await axios({
        method,
        url: `${this.baseURL}${url}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });

      const responseTime = Date.now() - startTime;
      performanceMonitor.endRequest(requestId, true);

      // Cache successful GET requests
      if (method === 'GET' && cacheKey && response.status === 200) {
        performanceMonitor.setCache(cacheKey, response.data, cacheTTL || CACHE_TTL.DEFAULT);
      }

      return {
        data: response.data,
        fromCache: false,
        responseTime
      };

    } catch (error: any) {
      performanceMonitor.endRequest(requestId, false);
      throw error;
    }
  }

  // Debounced search method
  private createDebouncedSearch<T>(
    searchFn: (query: string) => Promise<ApiResponse<T>>,
    delay: number = 300
  ) {
    return debounce(async (query: string, callback: (result: ApiResponse<T>) => void) => {
      try {
        const result = await searchFn(query);
        callback(result);
      } catch (error) {
        console.error('Debounced search error:', error);
      }
    }, delay);
  }

  // Places search with debouncing
  searchPlaces = (query: string): Promise<ApiResponse<any>> => {
    const cacheKey = `places_search_${query}`;
    return this.request('GET', `/api/search/places?query=${encodeURIComponent(query)}`, undefined, cacheKey, CACHE_TTL.PLACES_SEARCH);
  };

  // Debounced places search
  debouncedSearchPlaces = this.createDebouncedSearch(
    (query: string) => this.searchPlaces(query),
    300
  );

  // Nearby search with caching
  searchNearby = (lat: number, lng: number, radius: number = 1000): Promise<ApiResponse<any>> => {
    const cacheKey = `nearby_search_${lat}_${lng}_${radius}`;
    return this.request('GET', `/api/search/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, undefined, cacheKey, CACHE_TTL.NEARBY_SEARCH);
  };

  // Debounced nearby search
  debouncedSearchNearby = this.createDebouncedSearch(
    (query: string) => {
      const [lat, lng] = query.split(',').map(Number);
      return this.searchNearby(lat, lng);
    },
    500
  );

  // Locations CRUD with caching
  getLocations = (): Promise<ApiResponse<any[]>> => {
    const cacheKey = 'locations_all';
    return this.request('GET', '/api/locations', undefined, cacheKey, CACHE_TTL.LOCATIONS);
  };

  createLocation = (data: any): Promise<ApiResponse<any>> => {
    // Invalidate locations cache
    performanceMonitor.setCache('locations_all', null, 0);
    return this.request('POST', '/api/locations', data);
  };

  updateLocation = (id: string, data: any): Promise<ApiResponse<any>> => {
    // Invalidate locations cache
    performanceMonitor.setCache('locations_all', null, 0);
    return this.request('PUT', `/api/locations/${id}`, data);
  };

  deleteLocation = (id: string): Promise<ApiResponse<any>> => {
    // Invalidate locations cache
    performanceMonitor.setCache('locations_all', null, 0);
    return this.request('DELETE', `/api/locations/${id}`);
  };

  toggleFavorite = (id: string): Promise<ApiResponse<any>> => {
    // Invalidate locations cache
    performanceMonitor.setCache('locations_all', null, 0);
    return this.request('PATCH', `/api/locations/${id}/favorite`);
  };

  // Auth methods (no caching)
  login = (data: { email: string; password: string }): Promise<ApiResponse<any>> => {
    return this.request('POST', '/auth/login', data);
  };

  register = (data: { email: string; password: string }): Promise<ApiResponse<any>> => {
    return this.request('POST', '/auth/register', data);
  };

  // Performance monitoring methods
  getPerformanceMetrics = (): any => {
    return performanceMonitor.getMetrics();
  };

  resetPerformanceMetrics = (): void => {
    performanceMonitor.resetMetrics();
  };

  logPerformanceSummary = (): void => {
    performanceMonitor.logSummary();
  };

  // Cache management
  clearCache = (): void => {
    performanceMonitor.resetMetrics();
  };

  clearCacheByPattern = (_pattern: string): void => {
    // This would require extending the cache implementation
    // For now, we'll clear all cache
    this.clearCache();
  };
}

// Create singleton instance
export const optimizedApi = new OptimizedApiService();

// Export types
export type { ApiResponse };

export default optimizedApi;
