import { useEffect, useState } from "react";
import { MapPin, Plus, Minus, Navigation, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProfessionalMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
}

export default function ProfessionalMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false
}: ProfessionalMapProps) {
  const [zoom, setZoom] = useState(13);
  const [loading, setLoading] = useState(false);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 8));
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50" style={{ height }}>
      {/* OpenStreetMap-style base layer */}
      <div className="w-full h-full relative bg-gray-100">
        {/* Map tiles grid background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(156, 163, 175, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Streets and roads */}
        <div className="absolute inset-0">
          <svg className="w-full h-full">
            {/* Major roads */}
            <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#9ca3af" strokeWidth="4" opacity="0.8" />
            <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#9ca3af" strokeWidth="3" opacity="0.7" />
            <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#9ca3af" strokeWidth="3" opacity="0.7" />
            <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#9ca3af" strokeWidth="3" opacity="0.7" />
            
            {/* Secondary roads */}
            <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#d1d5db" strokeWidth="2" opacity="0.6" />
            <line x1="80%" y1="0" x2="20%" y2="100%" stroke="#d1d5db" strokeWidth="2" opacity="0.6" />
            <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#d1d5db" strokeWidth="2" opacity="0.5" />
            <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#d1d5db" strokeWidth="2" opacity="0.5" />
            
            {/* Water features */}
            <path d="M 0,50% Q 50%,45% 100%,50%" stroke="#3b82f6" strokeWidth="6" fill="none" opacity="0.7" />
            <path d="M 0,65% Q 50%,60% 100%,65%" stroke="#3b82f6" strokeWidth="4" fill="none" opacity="0.6" />
            
            {/* Parks/green spaces */}
            <circle cx="80%" cy="20%" r="8%" fill="#10b981" opacity="0.3" />
            <circle cx="20%" cy="80%" r="6%" fill="#10b981" opacity="0.3" />
            <rect x="60%" y="70%" width="15%" height="10%" fill="#10b981" opacity="0.3" rx="2%" />
            
            {/* Buildings */}
            <rect x="25%" y="30%" width="4%" height="8%" fill="#6b7280" opacity="0.4" />
            <rect x="31%" y="28%" width="3%" height="10%" fill="#6b7280" opacity="0.4" />
            <rect x="72%" y="45%" width="5%" height="6%" fill="#6b7280" opacity="0.4" />
            <rect x="45%" y="35%" width="4%" height="7%" fill="#6b7280" opacity="0.4" />
            <rect x="35%" y="65%" width="6%" height="8%" fill="#6b7280" opacity="0.4" />
            
            {/* Additional urban details */}
            <circle cx="15%" cy="15%" r="1%" fill="#f59e0b" opacity="0.6" />
            <circle cx="85%" cy="85%" r="1%" fill="#f59e0b" opacity="0.6" />
            <circle cx="50%" cy="20%" r="1%" fill="#f59e0b" opacity="0.6" />
          </svg>
        </div>
        
        {/* Amsterdam label */}
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-gray-700">
          Amsterdam Centrum
        </div>
      </div>
      
      {/* Markers overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* User location */}
        {userLocation && (
          <div 
            className="absolute w-8 h-8 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
            style={{ left: '40%', top: '60%' }}
            title="Jouw huidige locatie"
          >
            <span className="text-white text-sm">🏠</span>
          </div>
        )}
        
        {/* Pickup location */}
        {pickupLocation && (
          <div 
            className="absolute w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
            style={{ left: '25%', top: '35%' }}
            title={pickupLocation.address || "Ophaallocatie"}
          >
            <span className="text-white text-sm">📦</span>
          </div>
        )}
        
        {/* Delivery location */}
        {deliveryLocation && (
          <div 
            className="absolute w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
            style={{ left: '75%', top: '70%' }}
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
              style={{ left: '20%', top: '25%' }}
              title="Beschikbare chauffeur - Jan van der Berg"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
              style={{ left: '85%', top: '40%' }}
              title="Beschikbare chauffeur - Maria Smit"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-6 h-6 bg-orange-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
              style={{ left: '65%', top: '20%' }}
              title="Bezige chauffeur - Piet Jansen"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
          </>
        )}
        
        {/* Route visualization */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path 
              d="M 25% 35% Q 50% 25% 75% 70%" 
              stroke="#8b5cf6" 
              strokeWidth="3" 
              fill="none" 
              strokeDasharray="8,4"
              opacity="0.8"
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
        OpenStreetMap Style
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