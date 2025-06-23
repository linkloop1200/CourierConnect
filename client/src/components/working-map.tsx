import { useEffect, useState } from "react";
import { MapPin, Plus, Minus, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WorkingMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
}

export default function WorkingMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false
}: WorkingMapProps) {
  const [zoom, setZoom] = useState(13);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 8));
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-50" style={{ height }}>
      {/* Base map layer - Amsterdam style */}
      <div className="w-full h-full relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-green-50"></div>
        
        {/* Grid overlay for map feel */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(107, 114, 128, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(107, 114, 128, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Amsterdam geographic features */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
          {/* Water bodies (IJ, Amstel) */}
          <path d="M0,80 Q100,70 200,80 T400,85" fill="#3b82f6" opacity="0.4" />
          <path d="M0,180 Q150,170 300,175 L400,175" fill="#3b82f6" opacity="0.3" />
          <circle cx="320" cy="60" r="15" fill="#3b82f6" opacity="0.3" />
          
          {/* Canal rings */}
          <ellipse cx="200" cy="150" rx="80" ry="60" fill="none" stroke="#1e40af" strokeWidth="2" opacity="0.6" />
          <ellipse cx="200" cy="150" rx="60" ry="45" fill="none" stroke="#1e40af" strokeWidth="1.5" opacity="0.5" />
          <ellipse cx="200" cy="150" rx="40" ry="30" fill="none" stroke="#1e40af" strokeWidth="1" opacity="0.4" />
          
          {/* Parks (Vondelpark, Museumplein) */}
          <rect x="50" y="200" width="40" height="25" fill="#10b981" opacity="0.4" rx="5" />
          <circle cx="300" cy="120" r="18" fill="#10b981" opacity="0.4" />
          <rect x="180" y="80" width="25" height="15" fill="#10b981" opacity="0.3" rx="3" />
          
          {/* Major roads */}
          <line x1="0" y1="150" x2="400" y2="150" stroke="#6b7280" strokeWidth="3" opacity="0.6" />
          <line x1="200" y1="0" x2="200" y2="300" stroke="#6b7280" strokeWidth="3" opacity="0.6" />
          <line x1="0" y1="100" x2="400" y2="110" stroke="#9ca3af" strokeWidth="2" opacity="0.5" />
          <line x1="0" y1="200" x2="400" y2="190" stroke="#9ca3af" strokeWidth="2" opacity="0.5" />
          
          {/* Historic center buildings */}
          <rect x="180" y="130" width="8" height="12" fill="#8b5cf6" opacity="0.7" />
          <rect x="190" y="125" width="6" height="15" fill="#8b5cf6" opacity="0.6" />
          <rect x="205" y="135" width="10" height="10" fill="#8b5cf6" opacity="0.7" />
          <rect x="220" y="128" width="7" height="14" fill="#8b5cf6" opacity="0.6" />
          
          {/* Railway stations */}
          <circle cx="200" cy="50" r="3" fill="#f59e0b" opacity="0.8" />
          <circle cx="120" cy="180" r="2" fill="#f59e0b" opacity="0.7" />
          
          {/* Neighborhoods */}
          <text x="150" y="200" fontSize="8" fill="#6b7280" opacity="0.7">Jordaan</text>
          <text x="250" y="120" fontSize="8" fill="#6b7280" opacity="0.7">Centrum</text>
          <text x="320" y="200" fontSize="8" fill="#6b7280" opacity="0.7">Oost</text>
        </svg>
        
        {/* Amsterdam label */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
          Amsterdam
        </div>
      </div>
      
      {/* Interactive markers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* User location */}
        {userLocation && (
          <div 
            className="absolute w-8 h-8 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-200"
            style={{ left: '50%', top: '50%' }}
            title="Jouw huidige locatie"
          >
            <span className="text-white text-sm">🏠</span>
          </div>
        )}
        
        {/* Pickup location */}
        {pickupLocation && (
          <div 
            className="absolute w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-200"
            style={{ left: '35%', top: '40%' }}
            title={pickupLocation.address || "Ophaallocatie"}
          >
            <span className="text-white text-sm">📦</span>
          </div>
        )}
        
        {/* Delivery location */}
        {deliveryLocation && (
          <div 
            className="absolute w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-200"
            style={{ left: '70%', top: '65%' }}
            title={deliveryLocation.address || "Bezorglocatie"}
          >
            <span className="text-white text-sm">🎯</span>
          </div>
        )}
        
        {/* Driver location */}
        {driverLocation && (
          <div 
            className={`absolute w-8 h-8 bg-purple-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-200 ${enableRealTimeTracking ? 'animate-pulse' : ''}`}
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
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all duration-200"
              style={{ left: '25%', top: '30%' }}
              title="Beschikbare chauffeur - Jan van Amsterdam"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all duration-200"
              style={{ left: '80%', top: '35%' }}
              title="Beschikbare chauffeur - Maria de Jong"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-6 h-6 bg-orange-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all duration-200"
              style={{ left: '65%', top: '25%' }}
              title="Bezige chauffeur - Piet Jansen"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
          </>
        )}
        
        {/* Animated route */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path 
              d="M 35% 40% Q 52% 35% 70% 65%" 
              stroke="#8b5cf6" 
              strokeWidth="4" 
              fill="none" 
              strokeDasharray="12,6"
              opacity="0.9"
              filter="url(#glow)"
            >
              <animate attributeName="stroke-dashoffset" values="0;-18" dur="2s" repeatCount="indefinite" />
            </path>
            
            {/* Route direction arrow */}
            <path 
              d="M 52% 35% L 56% 32% L 56% 38% Z" 
              fill="#8b5cf6" 
              opacity="0.8"
            />
          </svg>
        )}
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          size="sm"
          variant="outline"
          className="w-9 h-9 p-0 bg-white/95 backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-9 h-9 p-0 bg-white/95 backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-9 h-9 p-0 bg-white/95 backdrop-blur-sm shadow-lg hover:bg-gray-50 border-gray-200"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs z-30 border border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Jouw locatie</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Ophalen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Bezorgen</span>
          </div>
          {driverLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Chauffeur</span>
            </div>
          )}
          {showDrivers && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-700">Beschikbaar</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time tracking indicator */}
      {enableRealTimeTracking && (
        <div className="absolute top-4 left-4 z-30">
          <Badge className="bg-green-500 text-white animate-pulse shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
            Live tracking
          </Badge>
        </div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded z-30">
        Kaart van Amsterdam
      </div>

      {/* Zoom level indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-700 border border-gray-200">
          Amsterdam Centrum • Zoom: {zoom}
        </div>
      </div>
    </div>
  );
}