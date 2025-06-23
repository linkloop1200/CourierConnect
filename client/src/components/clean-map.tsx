import { useState } from "react";
import { MapPin, Plus, Minus, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CleanMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
}

export default function CleanMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false
}: CleanMapProps) {
  const [zoom, setZoom] = useState(13);

  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 18));
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 8));

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50" style={{ height }}>
      {/* Clean map background */}
      <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Simple grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Amsterdam city outline */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center opacity-20">
            <div className="text-8xl mb-2">🗺️</div>
            <div className="text-lg font-medium text-gray-600">Amsterdam</div>
          </div>
        </div>
      </div>
      
      {/* Delivery markers */}
      <div className="absolute inset-0">
        {/* User location - center */}
        {userLocation && (
          <div 
            className="absolute w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '50%', top: '50%' }}
            title="Jouw locatie"
          >
            <span className="text-white text-lg">🏠</span>
          </div>
        )}
        
        {/* Pickup location */}
        {pickupLocation && (
          <div 
            className="absolute w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '30%', top: '35%' }}
            title={pickupLocation.address || "Ophaallocatie"}
          >
            <span className="text-white text-lg">📦</span>
          </div>
        )}
        
        {/* Delivery location */}
        {deliveryLocation && (
          <div 
            className="absolute w-10 h-10 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '75%', top: '70%' }}
            title={deliveryLocation.address || "Bezorglocatie"}
          >
            <span className="text-white text-lg">🎯</span>
          </div>
        )}
        
        {/* Driver location */}
        {driverLocation && (
          <div 
            className={`absolute w-10 h-10 bg-purple-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-20 ${enableRealTimeTracking ? 'animate-pulse' : ''}`}
            style={{ left: '60%', top: '45%' }}
            title="Chauffeur"
          >
            <span className="text-white text-lg">🚐</span>
          </div>
        )}
        
        {/* Available drivers */}
        {showDrivers && (
          <>
            <div 
              className="absolute w-8 h-8 bg-green-400 rounded-full border-3 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-15"
              style={{ left: '25%', top: '25%' }}
              title="Jan - beschikbaar"
            >
              <span className="text-white text-sm">🚚</span>
            </div>
            <div 
              className="absolute w-8 h-8 bg-green-400 rounded-full border-3 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-15"
              style={{ left: '85%', top: '30%' }}
              title="Maria - beschikbaar"
            >
              <span className="text-white text-sm">🚚</span>
            </div>
            <div 
              className="absolute w-8 h-8 bg-orange-400 rounded-full border-3 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-15"
              style={{ left: '70%', top: '20%' }}
              title="Piet - bezet"
            >
              <span className="text-white text-sm">🚚</span>
            </div>
          </>
        )}
        
        {/* Route line */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line 
              x1="30%" y1="35%" 
              x2="75%" y2="70%" 
              stroke="#8b5cf6" 
              strokeWidth="4" 
              strokeDasharray="10,5" 
              opacity="0.8"
            >
              <animate attributeName="stroke-dashoffset" values="0;-15" dur="2s" repeatCount="indefinite" />
            </line>
            <circle cx="52.5%" cy="52.5%" r="3" fill="#8b5cf6" opacity="0.8">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        )}
      </div>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 bg-white shadow-lg hover:bg-gray-50"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 bg-white shadow-lg hover:bg-gray-50"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 bg-white shadow-lg hover:bg-gray-50"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-xs z-30">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Jouw locatie</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Ophalen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Bezorgen</span>
          </div>
          {driverLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>Chauffeur</span>
            </div>
          )}
          {showDrivers && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
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

      {/* Map info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/90 px-3 py-1 rounded-full text-xs text-gray-700">
          Amsterdam • Zoom: {zoom}
        </div>
      </div>
    </div>
  );
}