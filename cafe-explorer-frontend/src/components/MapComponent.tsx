import React, { useEffect, useRef, useState } from 'react';
import type { Cafe } from '../types/Cafe';
import { loadGoogleMaps, isGoogleMapsLoaded } from '../utils/googleMapsLoader';
import { logDiagnostic } from '../utils/mapsDiagnostic';
import { autoFixReferrerError } from '../utils/fixReferrerError';

interface MapComponentProps {
  cafes: Cafe[];
  onCafeClick?: (cafe: Cafe) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  cafes,
  onCafeClick,
  onMapClick,
  center = { lat: 25.0330, lng: 121.5654 }, // Default to Taipei
  zoom = 12,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    // 先檢查 Referrer 錯誤
    autoFixReferrerError();
    
    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true);
        // 載入成功後運行診斷
        setTimeout(() => logDiagnostic(), 1000);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);
        setIsLoaded(false);
        // 載入失敗後也運行診斷
        logDiagnostic();
      });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // 確保 Google Maps API 完全載入
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.warn('Google Maps API not fully loaded yet');
      return;
    }

    try {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;

      // Add click listener to map
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && onMapClick) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onMapClick(lat, lng);
        }
      });
    } catch (error) {
      console.error('Error creating Google Map:', error);
      return;
    }
  }, [isLoaded, center, zoom, onMapClick]);

  // Update markers when cafes change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // 確保 Google Maps API 完全載入
    if (!window.google || !window.google.maps || !window.google.maps.Marker) {
      console.warn('Google Maps API not fully loaded for markers');
      return;
    }

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      cafes.forEach(cafe => {
        const marker = new google.maps.Marker({
          position: { lat: cafe.lat, lng: cafe.lng },
          map: mapInstanceRef.current,
          title: cafe.name,
          icon: {
            url: cafe.isFavorite ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            `) : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="blue" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
          },
        });

      // Add click listener to marker
      marker.addListener('click', () => {
        if (onCafeClick) {
          onCafeClick(cafe);
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-lg">${cafe.name}</h3>
            <p class="text-sm text-gray-600">${cafe.address}</p>
            <div class="flex items-center mt-1">
              <span class="text-yellow-400">${'★'.repeat(cafe.rating)}${'☆'.repeat(5 - cafe.rating)}</span>
              <span class="ml-2 text-sm">(${cafe.rating}/5)</span>
            </div>
            ${cafe.notes ? `<p class="text-sm mt-1">${cafe.notes}</p>` : ''}
          </div>
        `,
      });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error creating markers:', error);
    }
  }, [isLoaded, cafes, onCafeClick]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure to set VITE_GOOGLE_MAPS_JS_KEY in your .env file
          </p>
          <p className="text-xs text-gray-400 mt-1">
            If this takes too long, check your internet connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};
