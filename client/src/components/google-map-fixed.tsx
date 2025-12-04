import { useEffect, useRef, useState } from "react";
import { useConfig } from "@/hooks/use-config";

interface GoogleMapFixedProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function GoogleMapFixed({ 
  height = "h-96", 
  showDrivers = true, 
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation
}: GoogleMapFixedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: config } = useConfig();
  const GOOGLE_MAPS_API_KEY = config?.GOOGLE_MAPS_API_KEY;

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      const mapOptions = {
        zoom: 14,
        center: userLocation || pickupLocation || { lat: 52.3676, lng: 4.9041 }, // Amsterdam
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      };

      const googleMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(googleMap);

      // Add markers
      if (pickupLocation) {
        new window.google.maps.Marker({
          position: pickupLocation,
          map: googleMap,
          title: "Ophaallocatie",
          icon: {
            url: "data:image/svg+xml," + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#10b981" stroke="white" stroke-width="2"/>
                <rect x="11" y="11" width="10" height="10" rx="2" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });
      }

      if (deliveryLocation) {
        new window.google.maps.Marker({
          position: deliveryLocation,
          map: googleMap,
          title: "Bezorglocatie",
          icon: {
            url: "data:image/svg+xml," + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="white" stroke-width="2"/>
                <circle cx="16" cy="13" r="4" fill="white"/>
                <path d="M16 20 L12 26 L20 26 Z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });
      }

      if (driverLocation && showDrivers) {
        new window.google.maps.Marker({
          position: driverLocation,
          map: googleMap,
          title: "Chauffeur",
          icon: {
            url: "data:image/svg+xml," + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#f59e0b" stroke="white" stroke-width="2"/>
                <rect x="8" y="12" width="16" height="8" rx="2" fill="white"/>
                <circle cx="11" cy="22" r="2" fill="white"/>
                <circle cx="21" cy="22" r="2" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });
      }

      // Add route if both locations exist
      if (pickupLocation && deliveryLocation) {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#3b82f6",
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });

        directionsRenderer.setMap(googleMap);

        directionsService.route({
          origin: pickupLocation,
          destination: deliveryLocation,
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result: any, status: any) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Fout bij laden van kaart");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key niet gevonden");
      setIsLoading(false);
      return;
    }

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create script tag
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeMap();
      };
      
      script.onerror = () => {
        setError("Google Maps kon niet worden geladen");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [GOOGLE_MAPS_API_KEY]);

  if (error) {
    return (
      <div className={`${height} flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-200`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <div className="text-sm text-gray-600">{error}</div>
          <div className="text-xs text-gray-500 mt-2">
            Controleer je Google Maps API configuratie
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${height} flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-200`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-sm text-gray-600 mt-2">Google Maps laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} relative overflow-hidden rounded-lg border-2 border-gray-200`}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => map?.setZoom((map?.getZoom() || 14) + 1)}
            className="w-8 h-8 bg-white hover:bg-gray-50 border rounded flex items-center justify-center text-sm font-medium"
          >
            +
          </button>
          <button
            onClick={() => map?.setZoom((map?.getZoom() || 14) - 1)}
            className="w-8 h-8 bg-white hover:bg-gray-50 border rounded flex items-center justify-center text-sm font-medium"
          >
            −
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-700">Google Maps Actief</span>
        </div>
      </div>
    </div>
  );
}