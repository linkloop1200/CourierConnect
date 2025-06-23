import { useState, useEffect } from "react";
import { MapPin, Navigation, Truck, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkingMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
}

export default function WorkingMap({ 
  height = "h-96", 
  showDrivers = true, 
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation
}: WorkingMapProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const [animationStep, setAnimationStep] = useState(0);

  // Animate driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getMapStyle = () => {
    if (mapMode === 'satellite') {
      return {
        background: `
          radial-gradient(circle at 20% 30%, rgba(34, 139, 34, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(101, 67, 33, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(0, 100, 0, 0.25) 0%, transparent 40%),
          linear-gradient(45deg, #8FBC8F 0%, #228B22 25%, #6B8E23 50%, #9ACD32 75%, #ADFF2F 100%)
        `
      };
    }
    return {
      background: `
        linear-gradient(90deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%),
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.03) 2px,
          rgba(0,0,0,0.03) 4px
        )
      `
    };
  };

  return (
    <div className={`${height} relative overflow-hidden rounded-lg border-2 border-gray-200`}>
      {/* Map Background */}
      <div 
        className="absolute inset-0 transition-all duration-500"
        style={getMapStyle()}
      >
        {/* Street Grid for Street View */}
        {mapMode === 'street' && (
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" viewBox="0 0 400 300">
              {/* Horizontal Streets */}
              <line x1="0" y1="75" x2="400" y2="75" stroke="#666" strokeWidth="3" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#666" strokeWidth="4" />
              <line x1="0" y1="225" x2="400" y2="225" stroke="#666" strokeWidth="3" />
              
              {/* Vertical Streets */}
              <line x1="100" y1="0" x2="100" y2="300" stroke="#666" strokeWidth="2" />
              <line x1="200" y1="0" x2="200" y2="300" stroke="#666" strokeWidth="3" />
              <line x1="300" y1="0" x2="300" y2="300" stroke="#666" strokeWidth="2" />
              
              {/* Buildings */}
              <rect x="20" y="20" width="60" height="40" fill="#ddd" stroke="#999" />
              <rect x="120" y="30" width="50" height="30" fill="#ddd" stroke="#999" />
              <rect x="320" y="15" width="70" height="50" fill="#ddd" stroke="#999" />
              <rect x="30" y="180" width="55" height="35" fill="#ddd" stroke="#999" />
              <rect x="250" y="170" width="60" height="40" fill="#ddd" stroke="#999" />
            </svg>
          </div>
        )}

        {/* Trees and Landmarks for Satellite View */}
        {mapMode === 'satellite' && (
          <div className="absolute inset-0 opacity-60">
            <div className="absolute top-4 left-8 w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="absolute top-12 right-12 w-4 h-4 bg-green-700 rounded-full"></div>
            <div className="absolute bottom-16 left-16 w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-6 h-2 bg-blue-400 rounded-full opacity-70"></div>
          </div>
        )}
      </div>

      {/* Interactive Markers */}
      <div className="absolute inset-0 p-4">
        {/* Pickup Location */}
        {pickupLocation && (
          <div 
            className="absolute animate-bounce"
            style={{ 
              left: '25%', 
              top: '30%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Package className="text-white text-xs" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Ophalen
              </div>
            </div>
          </div>
        )}

        {/* Delivery Location */}
        {deliveryLocation && (
          <div 
            className="absolute animate-pulse"
            style={{ 
              left: '75%', 
              top: '60%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="text-white text-xs" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Bezorgen
              </div>
            </div>
          </div>
        )}

        {/* Driver Location with Animation */}
        {driverLocation && showDrivers && (
          <div 
            className="absolute transition-all duration-1000"
            style={{ 
              left: `${45 + Math.sin(animationStep * 0.02) * 15}%`, 
              top: `${45 + Math.cos(animationStep * 0.02) * 10}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                <Truck className="text-white text-sm" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Chauffeur
              </div>
              <div className="absolute inset-0 rounded-full bg-orange-500 opacity-30 animate-ping"></div>
            </div>
          </div>
        )}

        {/* User Location */}
        {userLocation && (
          <div 
            className="absolute"
            style={{ 
              left: '50%', 
              top: '70%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg">
                <div className="absolute inset-0 rounded-full bg-blue-600 opacity-30 animate-ping"></div>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Jij
              </div>
            </div>
          </div>
        )}

        {/* Route Line Animation */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }} />
                <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
            <path
              d="M 25% 30% Q 50% 20% 75% 60%"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeDasharray="10,5"
              fill="none"
              className="animate-pulse"
            />
            <circle r="3" fill="#10b981" opacity="0.8">
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href="#route"/>
              </animateMotion>
            </circle>
          </svg>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          className="w-10 h-10 bg-white rounded shadow-lg hover:bg-gray-50"
          onClick={() => setMapMode(mapMode === 'street' ? 'satellite' : 'street')}
        >
          {mapMode === 'street' ? '🛰️' : '🗺️'}
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          className="w-10 h-10 bg-white rounded shadow-lg hover:bg-gray-50"
        >
          <Navigation className="text-blue-600 h-4 w-4" />
        </Button>
      </div>

      {/* Map Info */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2 text-sm">
          <Zap className="h-4 w-4 text-green-500" />
          <span className="text-gray-700">Live Tracking Actief</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Amsterdam, Nederland
        </div>
      </div>

      {/* Legend */}
      {showPackages && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Ophaallocatie</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Bezorglocatie</span>
            </div>
            {showDrivers && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Chauffeur</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}