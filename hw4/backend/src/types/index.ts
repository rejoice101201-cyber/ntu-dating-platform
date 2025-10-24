export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  notes?: string;
  is_favorite: boolean;
  user_id: number;
  created_at: string;
}

export interface CreateLocationRequest {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  lat?: number;
  lng?: number;
  address?: string;
  rating?: number;
  notes?: string;
  is_favorite?: boolean;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export interface SearchPlacesRequest {
  query: string;
  lat: number;
  lng: number;
  radius?: number;
}

export interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
  address: string;
  place_id: string;
  rating?: number;
}
