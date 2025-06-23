import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";

interface GoogleMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
}

export default function GoogleMap({ 
  height = "h-96", 
  showDrivers = true, 
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultCenter = { lat: 52.3676, lng: 4.9041 }; // Amsterdam center

  useEffect(() => {
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key not configured");
      setIsLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["maps", "marker"]
    });

    loader.load().then(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: userLocation || defaultCenter,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Add markers based on props
        if (pickupLocation) {
          new google.maps.Marker({
            position: pickupLocation,
            map: map,
            title: "Ophaaladres",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#22c55e",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2
            }
          });
        }

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
              strokeWeight: 2
            }
          });
        }

        if (driverLocation && showDrivers) {
          new google.maps.Marker({
            position: driverLocation,
            map: map,
            title: "Chauffeur",
            icon: {
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
                  <path d="M16 10l-3 3v5l-2-2v-3l-3-3h8z" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(30, 30),
              anchor: new google.maps.Point(15, 15)
            }
          });
        }

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

        setIsLoading(false);
      }
    }).catch((error) => {
      console.error("Error loading Google Maps:", error);
      setError("Failed to load Google Maps");
      setIsLoading(false);
    });
  }, [userLocation, pickupLocation, deliveryLocation, driverLocation, showDrivers]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
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

  if (error) {
    return (
      <div className={`${height} relative bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center`}>
        <div className="text-center p-6">
          <p className="text-gray-600 mb-2">Kaart niet beschikbaar</p>
          <p className="text-sm text-gray-500">{error}</p>
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
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-50"
        onClick={handleCurrentLocation}
      >
        <Navigation className="text-blue-600 h-4 w-4" />
      </Button>
    </div>
  );
}