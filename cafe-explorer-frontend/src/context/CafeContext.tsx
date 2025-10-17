import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Cafe } from '../types/Cafe';

interface CafeContextType {
  cafes: Cafe[];
  addCafe: (cafe: Omit<Cafe, 'id'>) => void;
  updateCafe: (id: string, updates: Partial<Cafe>) => void;
  deleteCafe: (id: string) => void;
  toggleFavorite: (id: string) => void;
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

// Fake data for cafes
const initialCafes: Cafe[] = [
  {
    id: '1',
    name: 'Starbucks',
    address: '台北市信義區信義路五段7號',
    lat: 25.0330,
    lng: 121.5654,
    rating: 4,
    notes: 'Good coffee and comfortable seating',
    isFavorite: false,
  },
  {
    id: '2',
    name: '路易莎咖啡',
    address: '台北市大安區敦化南路二段216號',
    lat: 25.0260,
    lng: 121.5440,
    rating: 5,
    notes: 'Excellent atmosphere for studying',
    isFavorite: true,
  },
  {
    id: '3',
    name: '85度C',
    address: '台北市中山區南京東路二段100號',
    lat: 25.0520,
    lng: 121.5250,
    rating: 3,
    notes: 'Quick service, decent coffee',
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Cama咖啡',
    address: '台北市松山區八德路四段138號',
    lat: 25.0430,
    lng: 121.5780,
    rating: 4,
    notes: 'Great for morning coffee runs',
    isFavorite: false,
  },
  {
    id: '5',
    name: '丹堤咖啡',
    address: '台北市萬華區西門町成都路10號',
    lat: 25.0420,
    lng: 121.5080,
    rating: 3,
    notes: 'Classic Taiwanese coffee chain',
    isFavorite: true,
  },
  {
    id: '6',
    name: '伯朗咖啡',
    address: '台北市內湖區瑞光路188號',
    lat: 25.0700,
    lng: 121.6100,
    rating: 4,
    notes: 'Good for business meetings',
    isFavorite: false,
  },
  {
    id: '7',
    name: '怡客咖啡',
    address: '台北市士林區中正路115號',
    lat: 25.0880,
    lng: 121.5250,
    rating: 3,
    notes: 'Local favorite with friendly staff',
    isFavorite: false,
  },
  {
    id: '8',
    name: '西雅圖咖啡',
    address: '台北市文山區木新路三段123號',
    lat: 24.9880,
    lng: 121.5680,
    rating: 4,
    notes: 'Cozy atmosphere, good for reading',
    isFavorite: true,
  },
];

export const CafeProvider: React.FC<CafeProviderProps> = ({ children }) => {
  const [cafes, setCafes] = useState<Cafe[]>(initialCafes);

  const addCafe = (newCafe: Omit<Cafe, 'id'>) => {
    const cafe: Cafe = {
      ...newCafe,
      id: Date.now().toString(),
    };
    setCafes(prev => [...prev, cafe]);
  };

  const updateCafe = (id: string, updates: Partial<Cafe>) => {
    setCafes(prev =>
      prev.map(cafe =>
        cafe.id === id ? { ...cafe, ...updates } : cafe
      )
    );
  };

  const deleteCafe = (id: string) => {
    setCafes(prev => prev.filter(cafe => cafe.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setCafes(prev =>
      prev.map(cafe =>
        cafe.id === id ? { ...cafe, isFavorite: !cafe.isFavorite } : cafe
      )
    );
  };

  const value: CafeContextType = {
    cafes,
    addCafe,
    updateCafe,
    deleteCafe,
    toggleFavorite,
  };

  return (
    <CafeContext.Provider value={value}>
      {children}
    </CafeContext.Provider>
  );
};
