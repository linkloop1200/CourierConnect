import { useState } from "react";
import { MapPin, Plus, Minus, Navigation, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EmbeddedOpenStreetMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
}

export default function EmbeddedOpenStreetMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false
}: EmbeddedOpenStreetMapProps) {
  const [zoom, setZoom] = useState(13);
  
  // Amsterdam center coordinates
  const center = { lat: 52.3676, lng: 4.9041 };

  // Create OpenStreetMap iframe URL with dynamic zoom
  const getOsmUrl = () => {
    const zoomFactor = zoom / 13; // Base zoom level
    const latDiff = 0.0275 / zoomFactor; // Smaller area for higher zoom
    const lngDiff = 0.05 / zoomFactor;
    
    const minLat = center.lat - latDiff;
    const maxLat = center.lat + latDiff;
    const minLng = center.lng - lngDiff;
    const maxLng = center.lng + lngDiff;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&amp;layer=mapnik&amp;marker=${center.lat}%2C${center.lng}`;
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 18));
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 8));

  const openFullMap = () => {
    window.open(`https://www.openstreetmap.org/#map=${zoom}/${center.lat}/${center.lng}`, '_blank');
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-white" style={{ height }}>
      {/* OpenStreetMap iframe */}
      <iframe
        src={getOsmUrl()}
        className="w-full h-full"
        style={{ border: 'none' }}
        title="OpenStreetMap van Amsterdam"
        loading="lazy"
        key={zoom}
      />
      
      {/* Hide zoom indicator overlay - covers only the "Amsterdam • Zoom: 13" text */}
      <div className="absolute top-2 left-2 w-40 h-6 bg-white z-40 pointer-events-none"></div>
      
      {/* Overlay markers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* User location marker */}
        {userLocation && (
          <div 
            className="absolute w-8 h-8 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '50%', top: '50%' }}
            title="Jouw locatie"
          >
            <span className="text-white text-sm">🏠</span>
          </div>
        )}
        
        {/* Pickup location */}
        {pickupLocation && (
          <div 
            className="absolute w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '35%', top: '40%' }}
            title={pickupLocation.address || "Ophaallocatie"}
          >
            <span className="text-white text-sm">📦</span>
          </div>
        )}
        
        {/* Delivery location */}
        {deliveryLocation && (
          <div 
            className="absolute w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '70%', top: '65%' }}
            title={deliveryLocation.address || "Bezorglocatie"}
          >
            <span className="text-white text-sm">🎯</span>
          </div>
        )}
        
        {/* Driver location */}
        {driverLocation && (
          <div 
            className={`absolute w-8 h-8 bg-purple-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20 ${enableRealTimeTracking ? 'animate-pulse' : ''}`}
            style={{ left: '55%', top: '45%' }}
            title="Chauffeur onderweg"
          >
            <span className="text-white text-sm">🚐</span>
          </div>
        )}
        
        {/* Available drivers */}
        {showDrivers && (
          <>
            <div 
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-15"
              style={{ left: '25%', top: '30%' }}
              title="Jan - beschikbaar"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-15"
              style={{ left: '80%', top: '35%' }}
              title="Maria - beschikbaar"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
          </>
        )}
        
        {/* Route visualization */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line 
              x1="35%" y1="40%" 
              x2="70%" y2="65%" 
              stroke="#8b5cf6" 
              strokeWidth="4" 
              strokeDasharray="8,4" 
              opacity="0.8"
            >
              <animate attributeName="stroke-dashoffset" values="0;-12" dur="2s" repeatCount="indefinite" />
            </line>
          </svg>
        )}
      </div>
      
      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          size="sm"
          variant="outline"
          className="w-9 h-9 p-0 bg-white shadow-lg hover:bg-gray-50"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-9 h-9 p-0 bg-white shadow-lg hover:bg-gray-50"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-9 h-9 p-0 bg-white shadow-lg hover:bg-gray-50"
          onClick={openFullMap}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-20 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-xs z-30">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Ophalen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Bezorgen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Bezorger locatie</span>
          </div>
        </div>
      </div>

      {/* Real-time tracking indicator */}
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

      {/* Zoom indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/90 px-3 py-1 rounded-full text-xs text-gray-700">
          Amsterdam • Zoom: {zoom}
        </div>
      </div>
    </div>
  );
}