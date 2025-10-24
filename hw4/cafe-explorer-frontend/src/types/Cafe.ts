export interface Cafe {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  notes: string;
  isFavorite?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
}
