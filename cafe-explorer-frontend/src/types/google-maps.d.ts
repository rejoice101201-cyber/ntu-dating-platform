// Google Maps 類型聲明
declare global {
  interface Window {
    google: typeof google;
  }
  
  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options: MapOptions);
        addListener(eventName: string, handler: Function): void;
      }
      
      class Marker {
        constructor(options: MarkerOptions);
        addListener(eventName: string, handler: Function): void;
        setMap(map: Map | null): void;
      }
      
      class InfoWindow {
        constructor(options: InfoWindowOptions);
        open(map: Map, marker: Marker): void;
      }
      
      class Size {
        constructor(width: number, height: number);
      }
      
      interface MapOptions {
        center: LatLngLiteral;
        zoom: number;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        fullscreenControl?: boolean;
      }
      
      interface MarkerOptions {
        position: LatLngLiteral;
        map: Map;
        title?: string;
        icon?: string | Icon;
      }
      
      interface InfoWindowOptions {
        content: string;
      }
      
      interface Icon {
        url: string;
        scaledSize: Size;
      }
      
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
      
      interface MapMouseEvent {
        latLng: LatLng | null;
      }
      
      class LatLng {
        lat(): number;
        lng(): number;
      }
    }
  }
}

export {};
