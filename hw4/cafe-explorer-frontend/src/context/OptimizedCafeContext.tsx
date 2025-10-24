import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Cafe } from '../types/Cafe';
import { optimizedApi } from '../services/optimizedApi';
import type { Location, CreateLocationRequest, UpdateLocationRequest } from '../services/api';
import { useAuth } from './AuthContext';

interface CafeContextType {
  cafes: Cafe[];
  loading: boolean;
  error: string | null;
  addCafe: (cafe: Omit<Cafe, 'id'>) => Promise<boolean>;
  updateCafe: (id: string, updates: Partial<Cafe>) => Promise<boolean>;
  deleteCafe: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;
  refreshCafes: () => Promise<void>;
  searchPlaces: (query: string) => Promise<any[]>;
  searchNearby: (lat: number, lng: number, radius?: number) => Promise<any[]>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const useOptimizedCafes = () => {
  const context = useContext(CafeContext);
  if (context === undefined) {
    throw new Error('useOptimizedCafes must be used within a OptimizedCafeProvider');
  }
  return context;
};

interface CafeProviderProps {
  children: ReactNode;
}

// Convert backend Location to frontend Cafe format
const locationToCafe = (location: Location): Cafe => ({
  id: location.id,
  name: location.name,
  address: location.address || '',
  lat: location.lat,
  lng: location.lng,
  rating: location.rating || 0,
  notes: location.notes || '',
  isFavorite: location.is_favorite,
});

// Convert frontend Cafe to backend CreateLocationRequest format
const cafeToCreateRequest = (cafe: Omit<Cafe, 'id'>): CreateLocationRequest => ({
  name: cafe.name,
  lat: cafe.lat,
  lng: cafe.lng,
  address: cafe.address || undefined,
  rating: cafe.rating || undefined,
  notes: cafe.notes || undefined,
});

// Convert frontend Cafe to backend UpdateLocationRequest format
const cafeToUpdateRequest = (cafe: Partial<Cafe>): UpdateLocationRequest => ({
  name: cafe.name,
  lat: cafe.lat,
  lng: cafe.lng,
  address: cafe.address,
  rating: cafe.rating,
  notes: cafe.notes,
});

export const OptimizedCafeProvider: React.FC<CafeProviderProps> = ({ children }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  // Load cafes with caching
  const loadCafes = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading cafes with optimized API...');
      const response = await optimizedApi.getLocations();
      
      if (response.fromCache) {
        console.log('📦 Loaded cafes from cache');
      } else {
        console.log('🌐 Loaded cafes from server');
      }
      
      const cafeList = response.data.map(locationToCafe);
      setCafes(cafeList);
      console.log(`✅ Loaded ${cafeList.length} cafes`);
    } catch (err: any) {
      console.error('❌ Failed to load cafes:', err);
      setError(err.response?.data?.message || 'Failed to load cafes');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Add cafe with cache invalidation
  const addCafe = async (newCafe: Omit<Cafe, 'id'>): Promise<boolean> => {
    try {
      console.log('🔍 Creating cafe with optimized API:', newCafe);
      const createRequest = cafeToCreateRequest(newCafe);
      const response = await optimizedApi.createLocation(createRequest);
      
      const newCafeWithId = locationToCafe(response.data);
      setCafes(prev => [...prev, newCafeWithId]);
      console.log('✅ Cafe created successfully:', newCafeWithId.name);
      return true;
    } catch (err: any) {
      console.error('❌ Failed to create cafe:', err);
      setError(err.response?.data?.message || 'Failed to create cafe');
      return false;
    }
  };

  // Update cafe with cache invalidation
  const updateCafe = async (id: string, updates: Partial<Cafe>): Promise<boolean> => {
    try {
      console.log('🔄 Updating cafe with optimized API:', id, updates);
      const updateRequest = cafeToUpdateRequest(updates);
      const response = await optimizedApi.updateLocation(id, updateRequest);
      
      const updatedCafe = locationToCafe(response.data);
      setCafes(prev => prev.map(cafe => cafe.id === id ? updatedCafe : cafe));
      console.log('✅ Cafe updated successfully:', updatedCafe.name);
      return true;
    } catch (err: any) {
      console.error('❌ Failed to update cafe:', err);
      setError(err.response?.data?.message || 'Failed to update cafe');
      return false;
    }
  };

  // Delete cafe with cache invalidation
  const deleteCafe = async (id: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting cafe with optimized API:', id);
      await optimizedApi.deleteLocation(id);
      
      setCafes(prev => prev.filter(cafe => cafe.id !== id));
      console.log('✅ Cafe deleted successfully');
      return true;
    } catch (err: any) {
      console.error('❌ Failed to delete cafe:', err);
      setError(err.response?.data?.message || 'Failed to delete cafe');
      return false;
    }
  };

  // Toggle favorite with cache invalidation
  const toggleFavorite = async (id: string): Promise<boolean> => {
    try {
      console.log('🔄 Toggling favorite with optimized API:', id);
      const response = await optimizedApi.toggleFavorite(id);
      
      const updatedCafe = locationToCafe(response.data);
      setCafes(prev => prev.map(cafe => cafe.id === id ? updatedCafe : cafe));
      console.log('✅ Favorite toggled successfully:', updatedCafe.name, updatedCafe.isFavorite);
      return true;
    } catch (err: any) {
      console.error('❌ Failed to toggle favorite:', err);
      setError(err.response?.data?.message || 'Failed to toggle favorite');
      return false;
    }
  };

  // Search places with debouncing
  const searchPlaces = async (query: string): Promise<any[]> => {
    try {
      console.log('🔍 Searching places with optimized API:', query);
      const response = await optimizedApi.searchPlaces(query);
      
      if (response.fromCache) {
        console.log('📦 Places search result from cache');
      } else {
        console.log('🌐 Places search result from server');
      }
      
      return response.data;
    } catch (err: any) {
      console.error('❌ Failed to search places:', err);
      setError(err.response?.data?.message || 'Failed to search places');
      return [];
    }
  };

  // Search nearby with caching
  const searchNearby = async (lat: number, lng: number, radius: number = 1000): Promise<any[]> => {
    try {
      console.log('📍 Searching nearby with optimized API:', { lat, lng, radius });
      const response = await optimizedApi.searchNearby(lat, lng, radius);
      
      if (response.fromCache) {
        console.log('📦 Nearby search result from cache');
      } else {
        console.log('🌐 Nearby search result from server');
      }
      
      return response.data;
    } catch (err: any) {
      console.error('❌ Failed to search nearby:', err);
      setError(err.response?.data?.message || 'Failed to search nearby');
      return [];
    }
  };

  // Refresh cafes (force reload from server)
  const refreshCafes = async (): Promise<void> => {
    // Clear cache for locations
    optimizedApi.clearCacheByPattern('locations');
    await loadCafes();
  };

  // Load cafes when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      loadCafes();
    } else {
      setCafes([]);
      setError(null);
    }
  }, [isLoggedIn, loadCafes]);

  const value: CafeContextType = {
    cafes,
    loading,
    error,
    addCafe,
    updateCafe,
    deleteCafe,
    toggleFavorite,
    refreshCafes,
    searchPlaces,
    searchNearby,
  };

  return (
    <CafeContext.Provider value={value}>
      {children}
    </CafeContext.Provider>
  );
};
