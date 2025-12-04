import { useEffect, useState } from "react";
import { MapPin, Plus, Minus, Navigation, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SimpleLocationIQMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
}

export default function SimpleLocationIQMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false
}: SimpleLocationIQMapProps) {
  const [zoom, setZoom] = useState(13);
  const [apiKey, setApiKey] = useState<string>('');
  const [mapUrl, setMapUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Amsterdam center
  const center = { lat: 52.3676, lng: 4.9041 };

  // Fetch API key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/locationiq-key');
        if (response.ok) {
          const data = await response.json();
          if (data.key) {
            setApiKey(data.key);
          } else {
            setError('Geen API key beschikbaar');
          }
        }
      } catch (error) {
        setError('API key ophalen mislukt');
      }
    };
    
    fetchApiKey();
  }, []);

  // Generate map URL when apiKey is available
  useEffect(() => {
    if (!apiKey) return;

    try {
      // Simple LocationIQ static map URL (correct format based on documentation)
      const size = 640; // Safe size for LocationIQ free tier
      const url = `https://maps.locationiq.com/v3/static/map?key=${apiKey}&center=${center.lat},${center.lng}&zoom=${zoom}&size=${size}x${size}&format=png`;
      
      setMapUrl(url);
      setLoading(false);
      setError(null);
      
    } catch (error) {
      setError('URL genereren mislukt');
      setLoading(false);
    }
  }, [apiKey, zoom]);

  // Handle image load errors
  const handleImageError = () => {
    setError('Kaart laden mislukt');
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 8));
  };

  // Show error state
  if (error) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center" style={{ height }}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-600 mb-1">{error}</div>
          <div className="text-xs text-gray-500">Amsterdam kaart</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100" style={{ height }}>
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <div className="text-sm text-gray-600">LocationIQ kaart laden...</div>
          </div>
        </div>
      )}
      
      {/* Map image */}
      {mapUrl && (
        <img 
          src={mapUrl}
          alt="Amsterdam Map via LocationIQ"
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* Custom markers overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* User location */}
        {userLocation && (
          <div 
            className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: '40%', 
              top: '60%',
              pointerEvents: 'auto'
            }}
            title="Jouw locatie"
          >
            <span className="text-white text-xs">🏠</span>
          </div>
        )}
        
        {/* Pickup location */}
        {pickupLocation && (
          <div 
            className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: '30%', 
              top: '40%',
              pointerEvents: 'auto'
            }}
            title="Ophaallocatie"
          >
            <span className="text-white text-xs">📦</span>
          </div>
        )}
        
        {/* Delivery location */}
        {deliveryLocation && (
          <div 
            className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: '70%', 
              top: '70%',
              pointerEvents: 'auto'
            }}
            title="Bezorglocatie"
          >
            <span className="text-white text-xs">🎯</span>
          </div>
        )}
        
        {/* Driver location */}
        {driverLocation && (
          <div 
            className={`absolute w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 ${enableRealTimeTracking ? 'animate-pulse' : ''}`}
            style={{ 
              left: '50%', 
              top: '50%',
              pointerEvents: 'auto'
            }}
            title="Chauffeur"
          >
            <span className="text-white text-xs">🚐</span>
          </div>
        )}
        
        {/* Mock drivers */}
        {showDrivers && (
          <>
            <div 
              className="absolute w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: '25%', top: '30%' }}
              title="Beschikbare chauffeur"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: '80%', top: '45%' }}
              title="Beschikbare chauffeur"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
          </>
        )}
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md hover:bg-gray-50"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md hover:bg-gray-50"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md hover:bg-gray-50"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-xs z-30">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Jouw locatie</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Ophalen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Bezorgen</span>
          </div>
          {showDrivers && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Chauffeurs</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time indicator */}
      {enableRealTimeTracking && (
        <div className="absolute top-4 left-4 z-30">
          <Badge className="bg-green-500 text-white animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
            Live tracking
          </Badge>
        </div>
      )}

      {/* LocationIQ attribution */}
      <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded z-30">
        © LocationIQ | OpenStreetMap
      </div>

      {/* Map Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/90 px-3 py-1 rounded-full text-xs text-gray-700">
          Amsterdam • Zoom: {zoom} • LocationIQ
        </div>
      </div>
    </div>
  );
}