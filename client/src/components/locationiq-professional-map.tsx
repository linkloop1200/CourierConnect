import { useEffect, useRef, useState } from "react";
import { MapPin, Plus, Minus, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LocationIQProfessionalMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
  showHeatMap?: boolean;
  showRouteOptimization?: boolean;
}

export default function LocationIQProfessionalMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false,
  showHeatMap = false,
  showRouteOptimization = false
}: LocationIQProfessionalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(13);
  const [apiKey, setApiKey] = useState<string>('');
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Amsterdam center coordinates
  const center = { lat: 52.3676, lng: 4.9041 };

  // Fetch LocationIQ API key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/locationiq-key');
        if (response.ok) {
          const data = await response.json();
          console.log('API key loaded:', data.key ? 'Yes' : 'No');
          if (data.key && data.key.length > 0) {
            setApiKey(data.key);
          } else {
            setError('Lege API key ontvangen');
          }
        } else {
          setError('API key niet beschikbaar');
        }
      } catch (error) {
        console.error('API key fetch error:', error);
        setError('Kan API key niet ophalen');
      }
    };
    
    fetchApiKey();
  }, []);

  // Load LocationIQ static map
  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const loadMap = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate optimal size (max 1280x1280 for LocationIQ)
        const container = mapRef.current;
        if (!container) return;

        const width = Math.min(container.clientWidth, 1280);
        const height = Math.min(container.clientHeight, 1280);
        
        // Correct LocationIQ static map API format
        const mapUrl = `https://staticmap.locationiq.com/v2/map?key=${apiKey}&center=${center.lat},${center.lng}&zoom=${zoom}&size=${width}x${height}&format=png&maptype=osm&style=osm-bright`;
        
        console.log('Loading LocationIQ map:', mapUrl.replace(apiKey, 'API_KEY'));
        
        // Test the URL first
        const testResponse = await fetch(mapUrl);
        console.log('LocationIQ API response status:', testResponse.status);
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error('LocationIQ API error:', errorText);
          setError(`API fout: ${testResponse.status}`);
          setLoading(false);
          return;
        }
        
        // Load the map image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          setMapImage(mapUrl);
          setLoading(false);
        };
        
        img.onerror = (e) => {
          console.error('Image load error:', e);
          setError('Afbeelding laden mislukt');
          setLoading(false);
        };
        
        img.src = mapUrl;
        
      } catch (error) {
        setError('Fout bij laden kaart');
        setLoading(false);
      }
    };

    loadMap();
  }, [apiKey, zoom, userLocation, pickupLocation, deliveryLocation, driverLocation, showDrivers]);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 8));
  };

  if (error) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center" style={{ height }}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <div className="text-sm text-gray-600">{error}</div>
          <div className="text-xs text-gray-500 mt-1">LocationIQ service</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100" style={{ height }}>
      <div ref={mapRef} className="w-full h-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">LocationIQ kaart laden...</div>
            </div>
          </div>
        )}
        
        {mapImage && !loading && (
          <img 
            src={mapImage} 
            alt="LocationIQ Map" 
            className="w-full h-full object-cover"
          />
        )}
        
        {!mapImage && !loading && (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Amsterdam kaart</div>
            </div>
          </div>
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
          {showDrivers && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Beschikbare chauffeurs</span>
            </div>
          )}
          {showPackages && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Pakketten</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Jouw locatie</span>
          </div>
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
          Amsterdam • Zoom: {zoom} • LocationIQ Professional
        </div>
      </div>
    </div>
  );
}