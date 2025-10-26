import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Cafe } from '../types/Cafe';
import { locationsAPI } from '../services/api';
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
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const useCafes = () => {
  const context = useContext(CafeContext);
  if (context === undefined) {
    throw new Error('useCafes must be used within a CafeProvider');
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
  rating: location.rating || 5, // 默認評分為 5 星
  notes: location.notes || '',
  isFavorite: location.is_favorite,
});

// Convert frontend Cafe to backend CreateLocationRequest format
const cafeToCreateRequest = (cafe: Omit<Cafe, 'id'>): CreateLocationRequest => ({
  name: cafe.name,
  lat: cafe.lat,
  lng: cafe.lng,
  address: cafe.address && cafe.address.trim() ? cafe.address : undefined,
  rating: cafe.rating && cafe.rating >= 1 && cafe.rating <= 5 ? cafe.rating : undefined,
  notes: cafe.notes && cafe.notes.trim() ? cafe.notes : undefined,
});

// Convert frontend Cafe updates to backend UpdateLocationRequest format
const cafeToUpdateRequest = (updates: Partial<Cafe>): UpdateLocationRequest => ({
  name: updates.name,
  lat: updates.lat,
  lng: updates.lng,
  address: updates.address !== undefined ? (updates.address && updates.address.trim() ? updates.address : undefined) : undefined,
  rating: updates.rating !== undefined ? (updates.rating >= 1 && updates.rating <= 5 ? updates.rating : undefined) : undefined,
  notes: updates.notes !== undefined ? (updates.notes && updates.notes.trim() ? updates.notes : undefined) : undefined,
  is_favorite: updates.isFavorite,
});

export const CafeProvider: React.FC<CafeProviderProps> = ({ children }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  // Load cafes when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      refreshCafes();
    } else {
      setCafes([]);
    }
  }, [isLoggedIn]);

  const refreshCafes = async (): Promise<void> => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const locations = await locationsAPI.getAll();
      const cafeList = locations.map(locationToCafe);
      setCafes(cafeList);
    } catch (err: any) {
      console.error('Failed to load cafes:', err);
      setError(err.response?.data?.message || 'Failed to load cafes');
    } finally {
      setLoading(false);
    }
  };

  const addCafe = async (newCafe: Omit<Cafe, 'id'>): Promise<boolean> => {
    if (!isLoggedIn) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const createRequest = cafeToCreateRequest(newCafe);
      console.log('🔍 Creating cafe with data:', createRequest);
      const location = await locationsAPI.create(createRequest);
      const cafe = locationToCafe(location);
      setCafes(prev => [...prev, cafe]);
      return true;
    } catch (err: any) {
      console.error('Failed to add cafe:', err);
      setError(err.response?.data?.message || 'Failed to add cafe');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCafe = async (id: string, updates: Partial<Cafe>): Promise<boolean> => {
    if (!isLoggedIn) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const updateRequest = cafeToUpdateRequest(updates);
      const location = await locationsAPI.update(parseInt(id), updateRequest);
      const cafe = locationToCafe(location);
      setCafes(prev => prev.map(c => c.id === id ? cafe : c));
      return true;
    } catch (err: any) {
      console.error('Failed to update cafe:', err);
      setError(err.response?.data?.message || 'Failed to update cafe');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCafe = async (id: string): Promise<boolean> => {
    if (!isLoggedIn) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await locationsAPI.delete(parseInt(id));
      setCafes(prev => prev.filter(cafe => cafe.id !== id));
      return true;
    } catch (err: any) {
      console.error('Failed to delete cafe:', err);
      setError(err.response?.data?.message || 'Failed to delete cafe');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string): Promise<boolean> => {
    if (!isLoggedIn) return false;
    
    console.log('🔄 切換收藏狀態，咖啡廳 ID:', id);
    setLoading(true);
    setError(null);
    
    try {
      const location = await locationsAPI.toggleFavorite(id);
      console.log('✅ 收藏切換成功:', location);
      const cafe = locationToCafe(location);
      setCafes(prev => prev.map(c => c.id === id ? cafe : c));
      return true;
    } catch (err: any) {
      console.error('❌ 收藏切換失敗:', err);
      console.error('錯誤詳情:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to toggle favorite');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: CafeContextType = {
    cafes,
    loading,
    error,
    addCafe,
    updateCafe,
    deleteCafe,
    toggleFavorite,
    refreshCafes,
  };

  return (
    <CafeContext.Provider value={value}>
      {children}
    </CafeContext.Provider>
  );
};
