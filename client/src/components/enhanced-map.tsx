import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Truck, Package } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { getGoogleMapsLoader } from "@/lib/google-maps-loader";

interface EnhancedMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
}

export default function EnhancedMap({ 
  height = "h-96", 
  showDrivers = true, 
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation
}: EnhancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);
  const { data: config } = useConfig();

  const defaultCenter = { lat: 52.3676, lng: 4.9041 }; // Amsterdam center

  useEffect(() => {
    if (!config?.GOOGLE_MAPS_API_KEY) {
      setIsLoading(false);
      return;
    }

    getGoogleMapsLoader(config.GOOGLE_MAPS_API_KEY).then(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        try {
          const map = new google.maps.Map(mapRef.current, {
            center: userLocation || defaultCenter,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          mapInstanceRef.current = map;

          // Add pickup marker
          if (pickupLocation) {
            new google.maps.Marker({
              position: pickupLocation,
              map: map,
              title: "Ophaaladres",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#10b981",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3
              }
            });
          }

          // Add delivery marker
          if (deliveryLocation) {
            new google.maps.Marker({
              position: deliveryLocation,
              map: map,
              title: "Bezorgadres",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#3b82f6",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3
              }
            });
          }

          // Add driver marker
          if (driverLocation && showDrivers) {
            new google.maps.Marker({
              position: driverLocation,
              map: map,
              title: "Chauffeur locatie",
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: "#f59e0b",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2
              }
            });
          }

          // Add user location marker
          if (userLocation) {
            new google.maps.Marker({
              position: userLocation,
              map: map,
              title: "Mijn locatie",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: "#3b82f6",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3
              }
            });
          }

          // Draw route if both pickup and delivery locations exist
          if (pickupLocation && deliveryLocation) {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#3b82f6",
                strokeWeight: 4,
                strokeOpacity: 0.8
              }
            });

            directionsRenderer.setMap(map);

            directionsService.route({
              origin: pickupLocation,
              destination: deliveryLocation,
              travelMode: google.maps.TravelMode.DRIVING
            }, (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                directionsRenderer.setDirections(result);
              }
            });
          }

          setUseGoogleMaps(true);
          setIsLoading(false);
        } catch (error) {
          console.error("Google Maps initialization failed:", error);
          setUseGoogleMaps(false);
          setIsLoading(false);
        }
      }
    }).catch((error: any) => {
      console.error("Error loading Google Maps:", error);
      setUseGoogleMaps(false);
      setIsLoading(false);
    });
  }, [config?.GOOGLE_MAPS_API_KEY, userLocation, pickupLocation, deliveryLocation, driverLocation, showDrivers]);

  const handleCurrentLocation = () => {
    if (useGoogleMaps && navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstanceRef.current?.setCenter(pos);
          mapInstanceRef.current?.setZoom(15);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    }
  };

  // Fallback to enhanced mock map if Google Maps fails
  if (!useGoogleMaps && !isLoading) {
    return (
      <div className={`${height} relative overflow-hidden rounded-lg`}>
        {/* Enhanced Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-light via-blue-100 to-blue-200"></div>
        
        {/* Map Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Mock Streets */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
          <div className="absolute bottom-1/4 left-0 right-0 h-1 bg-gray-300 opacity-40"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-gray-300 opacity-40"></div>
          <div className="absolute top-0 bottom-0 right-1/3 w-2 bg-gray-300 opacity-60"></div>
        </div>

        {/* Mock Map Elements with better positioning */}
        <div className="absolute inset-0 p-4">
          {/* Delivery Markers */}
          {showDrivers && (
            <div className="absolute top-1/4 left-1/3 w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
              <Truck className="text-white text-sm" />
            </div>
          )}
          
          {showPackages && (
            <>
              <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Package className="text-white text-xs" />
              </div>
              <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="text-white text-xs" />
              </div>
            </>
          )}
          
          {/* User Location */}
          <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-brand-blue rounded-full border-4 border-white shadow-lg status-active"></div>
          </div>

          {/* Mock route line */}
          {pickupLocation && deliveryLocation && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 33% 25% Q 50% 40% 75% 50%"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="10,5"
                fill="none"
                className="animate-pulse opacity-70"
              />
            </svg>
          )}
        </div>

        {/* Current Location Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-50"
          onClick={handleCurrentLocation}
        >
          <Navigation className="text-blue-600 h-4 w-4" />
        </Button>

        {/* Map Info Overlay */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
          <p className="text-xs text-gray-600">Amsterdam Centrum</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Kaart laden...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Current Location Button */}
      {useGoogleMaps && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-50"
          onClick={handleCurrentLocation}
        >
          <Navigation className="text-blue-600 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}