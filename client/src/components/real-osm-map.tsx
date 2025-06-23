import { useEffect, useRef, useState } from "react";
import { MapPin, Plus, Minus, Navigation, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RealOSMMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
}

export default function RealOSMMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false
}: RealOSMMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(13);
  const [mapImages, setMapImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Amsterdam center coordinates
  const center = { lat: 52.3676, lng: 4.9041 };

  // Calculate tile coordinates for given lat/lng and zoom
  const getTileCoords = (lat: number, lng: number, zoom: number) => {
    const tileX = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x: tileX, y: tileY };
  };

  // Load OpenStreetMap tiles
  useEffect(() => {
    if (!mapRef.current) return;

    const loadMapTiles = async () => {
      setLoading(true);
      setError(null);

      try {
        const centerTile = getTileCoords(center.lat, center.lng, zoom);
        const tileUrls: string[] = [];

        // Load a 3x3 grid of tiles around the center
        for (let x = centerTile.x - 1; x <= centerTile.x + 1; x++) {
          for (let y = centerTile.y - 1; y <= centerTile.y + 1; y++) {
            // Use OpenStreetMap tile server
            const tileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
            tileUrls.push(tileUrl);
          }
        }

        // Test if we can load at least one tile
        const testImage = new Image();
        testImage.crossOrigin = 'anonymous';
        
        testImage.onload = () => {
          setMapImages(tileUrls);
          setLoading(false);
        };
        
        testImage.onerror = () => {
          setError('Kan OpenStreetMap tiles niet laden');
          setLoading(false);
        };
        
        testImage.src = tileUrls[4]; // Center tile
        
      } catch (error) {
        setError('Fout bij laden kaart');
        setLoading(false);
      }
    };

    loadMapTiles();
  }, [zoom]);

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
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-600 mb-1">{error}</div>
          <div className="text-xs text-gray-500">Fallback naar lokale kaart</div>
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
            <div className="text-sm text-gray-600">OpenStreetMap laden...</div>
          </div>
        </div>
      )}
      
      {/* Map tiles grid */}
      {mapImages.length > 0 && !loading && (
        <div className="w-full h-full relative">
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
            {mapImages.map((tileUrl, index) => (
              <img
                key={index}
                src={tileUrl}
                alt={`Map tile ${index}`}
                className="w-full h-full object-cover"
                style={{
                  filter: 'contrast(1.1) brightness(1.05)'
                }}
                onError={(e) => {
                  // Hide broken tiles
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
          
          {/* Map overlay for better integration */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-900/10 pointer-events-none" />
        </div>
      )}
      
      {/* Fallback if tiles don't load */}
      {!loading && mapImages.length === 0 && !error && (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative">
          {/* Simple Amsterdam representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <div className="text-lg font-medium text-gray-700">Amsterdam</div>
              <div className="text-sm text-gray-500">Kaart overzicht</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Markers overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* User location */}
        {userLocation && (
          <div 
            className="absolute w-8 h-8 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
            style={{ left: '50%', top: '50%' }}
            title="Jouw huidige locatie"
          >
            <span className="text-white text-sm">🏠</span>
          </div>
        )}
        
        {/* Pickup location */}
        {pickupLocation && (
          <div 
            className="absolute w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
            style={{ left: '35%', top: '40%' }}
            title={pickupLocation.address || "Ophaallocatie"}
          >
            <span className="text-white text-sm">📦</span>
          </div>
        )}
        
        {/* Delivery location */}
        {deliveryLocation && (
          <div 
            className="absolute w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
            style={{ left: '70%', top: '65%' }}
            title={deliveryLocation.address || "Bezorglocatie"}
          >
            <span className="text-white text-sm">🎯</span>
          </div>
        )}
        
        {/* Driver location */}
        {driverLocation && (
          <div 
            className={`absolute w-8 h-8 bg-purple-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform ${enableRealTimeTracking ? 'animate-pulse' : ''}`}
            style={{ left: '55%', top: '45%' }}
            title="Chauffeur onderweg"
          >
            <span className="text-white text-sm">🚐</span>
          </div>
        )}
        
        {/* Mock drivers */}
        {showDrivers && (
          <>
            <div 
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
              style={{ left: '25%', top: '30%' }}
              title="Beschikbare chauffeur - Jan"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
              style={{ left: '80%', top: '35%' }}
              title="Beschikbare chauffeur - Maria"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-6 h-6 bg-orange-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
              style={{ left: '65%', top: '25%' }}
              title="Bezige chauffeur - Piet"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
          </>
        )}
        
        {/* Route visualization */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path 
              d="M 35% 40% Q 52% 35% 70% 65%" 
              stroke="#8b5cf6" 
              strokeWidth="3" 
              fill="none" 
              strokeDasharray="8,4"
              opacity="0.9"
            >
              <animate attributeName="stroke-dashoffset" values="0;-12" dur="2s" repeatCount="indefinite" />
            </path>
          </svg>
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
          {driverLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Chauffeur</span>
            </div>
          )}
          {showDrivers && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Beschikbaar</span>
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

      {/* Map attribution */}
      <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded z-30">
        © OpenStreetMap
      </div>

      {/* Map Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/90 px-3 py-1 rounded-full text-xs text-gray-700">
          Amsterdam • Zoom: {zoom}
        </div>
      </div>
    </div>
  );
}