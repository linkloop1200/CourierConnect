import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Truck, Package, Zap, Eye, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdvancedMapProps {
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

interface Driver {
  id: number;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline';
  name: string;
  deliveries: number;
}

interface Package {
  id: number;
  lat: number;
  lng: number;
  status: 'pickup' | 'delivery' | 'completed';
  address: string;
  priority: 'normal' | 'urgent' | 'express';
}

export default function AdvancedMap({ 
  height = "h-96", 
  showDrivers = true, 
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = true,
  showHeatMap = false,
  showRouteOptimization = false
}: AdvancedMapProps) {
  const [mapMode, setMapMode] = useState<'street' | 'satellite' | 'heatmap'>('street');
  const [animationStep, setAnimationStep] = useState(0);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [trackingActive, setTrackingActive] = useState(enableRealTimeTracking);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock real-time data
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 1, lat: 52.3676, lng: 4.9041, status: 'busy', name: 'Jan V.', deliveries: 3 },
    { id: 2, lat: 52.3700, lng: 4.8950, status: 'available', name: 'Maria S.', deliveries: 1 },
    { id: 3, lat: 52.3650, lng: 4.9150, status: 'busy', name: 'Ahmed K.', deliveries: 5 },
    { id: 4, lat: 52.3720, lng: 4.9100, status: 'available', name: 'Lisa D.', deliveries: 0 },
  ]);

  const [packages, setPackages] = useState<Package[]>([
    { id: 1, lat: 52.3680, lng: 4.9000, status: 'pickup', address: 'Damrak 1', priority: 'urgent' },
    { id: 2, lat: 52.3690, lng: 4.9080, status: 'delivery', address: 'Nieuwmarkt 15', priority: 'express' },
    { id: 3, lat: 52.3710, lng: 4.9020, status: 'pickup', address: 'Rembrandtplein 8', priority: 'normal' },
    { id: 4, lat: 52.3660, lng: 4.9120, status: 'completed', address: 'Vondelpark 12', priority: 'normal' },
  ]);

  // Real-time animation and updates
  useEffect(() => {
    if (!trackingActive) return;
    
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 360);
      
      // Simulate driver movement
      setDrivers(prev => prev.map(driver => ({
        ...driver,
        lat: driver.lat + (Math.sin(Date.now() / 10000 + driver.id) * 0.0001),
        lng: driver.lng + (Math.cos(Date.now() / 10000 + driver.id) * 0.0001)
      })));
    }, 100);
    
    return () => clearInterval(interval);
  }, [trackingActive]);

  const getMapStyle = () => {
    switch (mapMode) {
      case 'satellite':
        return {
          background: `
            radial-gradient(circle at 20% 30%, rgba(34, 139, 34, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(101, 67, 33, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(0, 100, 0, 0.25) 0%, transparent 40%),
            linear-gradient(45deg, #8FBC8F 0%, #228B22 25%, #6B8E23 50%, #9ACD32 75%, #ADFF2F 100%)
          `
        };
      case 'heatmap':
        return {
          background: `
            radial-gradient(circle at 25% 30%, rgba(255, 0, 0, 0.4) 0%, transparent 30%),
            radial-gradient(circle at 75% 60%, rgba(255, 165, 0, 0.3) 0%, transparent 25%),
            radial-gradient(circle at 50% 80%, rgba(255, 255, 0, 0.2) 0%, transparent 20%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 0, 0.3) 0%, transparent 30%),
            linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)
          `
        };
      default:
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
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'express': return 'bg-red-500';
      case 'urgent': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className={`${height} relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white`}>
      {/* Map Background */}
      <div 
        ref={mapRef}
        className="absolute inset-0 transition-all duration-500"
        style={getMapStyle()}
      >
        {/* Street Grid for Street View */}
        {mapMode === 'street' && (
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" viewBox="0 0 400 300">
              {/* Main Roads */}
              <line x1="0" y1="75" x2="400" y2="75" stroke="#666" strokeWidth="4" strokeDasharray="10,5" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#666" strokeWidth="6" />
              <line x1="0" y1="225" x2="400" y2="225" stroke="#666" strokeWidth="4" strokeDasharray="10,5" />
              
              {/* Cross Streets */}
              <line x1="100" y1="0" x2="100" y2="300" stroke="#666" strokeWidth="3" />
              <line x1="200" y1="0" x2="200" y2="300" stroke="#666" strokeWidth="4" />
              <line x1="300" y1="0" x2="300" y2="300" stroke="#666" strokeWidth="3" />
              
              {/* Buildings */}
              <rect x="20" y="20" width="60" height="40" fill="#ddd" stroke="#999" strokeWidth="1" />
              <rect x="120" y="30" width="50" height="30" fill="#ddd" stroke="#999" strokeWidth="1" />
              <rect x="320" y="15" width="70" height="50" fill="#ddd" stroke="#999" strokeWidth="1" />
              <rect x="30" y="180" width="55" height="35" fill="#ddd" stroke="#999" strokeWidth="1" />
              <rect x="250" y="170" width="60" height="40" fill="#ddd" stroke="#999" strokeWidth="1" />
              
              {/* Parks */}
              <circle cx="350" cy="250" r="25" fill="#90EE90" opacity="0.6" />
              <circle cx="50" cy="120" r="20" fill="#90EE90" opacity="0.6" />
            </svg>
          </div>
        )}

        {/* Heatmap Overlay */}
        {mapMode === 'heatmap' && (
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-pulse"
                style={{
                  left: `${20 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 25}%`,
                  width: `${30 + (i % 3) * 20}px`,
                  height: `${30 + (i % 3) * 20}px`,
                  background: `radial-gradient(circle, rgba(255, ${100 + i * 10}, 0, 0.${6 + i % 4}) 0%, transparent 70%)`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Elements */}
      <div className="absolute inset-0 p-4">
        {/* Pickup Location */}
        {pickupLocation && (
          <div 
            className="absolute animate-bounce z-20"
            style={{ 
              left: '25%', 
              top: '30%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative group">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                <Package className="text-white text-xs" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Ophalen
              </div>
              <div className="absolute inset-0 rounded-full bg-green-500 opacity-30 animate-ping"></div>
            </div>
          </div>
        )}

        {/* Delivery Location */}
        {deliveryLocation && (
          <div 
            className="absolute animate-pulse z-20"
            style={{ 
              left: '75%', 
              top: '60%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative group">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                <MapPin className="text-white text-xs" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Bezorgen
              </div>
            </div>
          </div>
        )}

        {/* Drivers */}
        {showDrivers && drivers.map((driver, index) => (
          <div 
            key={driver.id}
            className="absolute transition-all duration-1000 z-10"
            style={{ 
              left: `${45 + (index % 2) * 30 + Math.sin(animationStep * 0.02 + index) * 10}%`, 
              top: `${35 + Math.floor(index / 2) * 25 + Math.cos(animationStep * 0.02 + index) * 8}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
          >
            <div className="relative group cursor-pointer">
              <div className={`w-10 h-10 ${getDriverStatusColor(driver.status)} rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform`}>
                <Truck className="text-white text-sm" />
              </div>
              {selectedDriver === driver.id && (
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-30">
                  <div className="font-medium">{driver.name}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`${getDriverStatusColor(driver.status)} text-white text-xs`}>
                      {driver.status}
                    </Badge>
                    <span>{driver.deliveries} bezorgingen</span>
                  </div>
                </div>
              )}
              <div className={`absolute inset-0 rounded-full ${getDriverStatusColor(driver.status)} opacity-30 animate-ping`}></div>
            </div>
          </div>
        ))}

        {/* Packages */}
        {showPackages && packages.map((pkg, index) => (
          <div 
            key={pkg.id}
            className="absolute z-10"
            style={{ 
              left: `${30 + (index % 3) * 25}%`, 
              top: `${40 + Math.floor(index / 3) * 30}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative group cursor-pointer">
              <div className={`w-6 h-6 ${getPriorityColor(pkg.priority)} rounded-full flex items-center justify-center shadow-md border border-white animate-pulse`}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <div>{pkg.address}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <Badge className={`${getPriorityColor(pkg.priority)} text-white text-xs`}>
                    {pkg.priority}
                  </Badge>
                  <span className="text-xs">{pkg.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Route Visualization */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }} />
                <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
              </linearGradient>
              <linearGradient id="optimizedRoute" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.7 }} />
              </linearGradient>
            </defs>
            
            {/* Main Route */}
            <path
              d="M 25% 30% Q 50% 20% 75% 60%"
              stroke={showRouteOptimization ? "url(#optimizedRoute)" : "url(#routeGradient)"}
              strokeWidth={showRouteOptimization ? "6" : "4"}
              strokeDasharray={showRouteOptimization ? "15,5" : "10,5"}
              fill="none"
              className="animate-pulse"
            />
            
            {/* Alternative Routes (when optimization is enabled) */}
            {showRouteOptimization && (
              <>
                <path
                  d="M 25% 30% Q 40% 45% 75% 60%"
                  stroke="rgba(99, 102, 241, 0.4)"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="none"
                />
                <path
                  d="M 25% 30% Q 60% 15% 75% 60%"
                  stroke="rgba(99, 102, 241, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="3,7"
                  fill="none"
                />
              </>
            )}
            
            {/* Moving indicator */}
            <circle r="4" fill={showRouteOptimization ? "#f59e0b" : "#10b981"} opacity="0.8">
              <animateMotion dur={showRouteOptimization ? "2s" : "3s"} repeatCount="indefinite">
                <mpath href="#route"/>
              </animateMotion>
            </circle>
          </svg>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          variant="secondary"
          size="icon"
          className="w-10 h-10 bg-white rounded shadow-lg hover:bg-gray-50"
          onClick={() => setMapMode(mapMode === 'street' ? 'satellite' : mapMode === 'satellite' ? 'heatmap' : 'street')}
        >
          {mapMode === 'street' ? '🛰️' : mapMode === 'satellite' ? '🔥' : '🗺️'}
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          className={`w-10 h-10 rounded shadow-lg hover:bg-gray-50 ${trackingActive ? 'bg-green-100 text-green-600' : 'bg-white'}`}
          onClick={() => setTrackingActive(!trackingActive)}
        >
          <Zap className="h-4 w-4" />
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
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg z-30">
        <div className="flex items-center space-x-2 text-sm">
          <Eye className="h-4 w-4 text-blue-500" />
          <span className="text-gray-700">
            {mapMode === 'heatmap' ? 'Heat Map Actief' : 
             mapMode === 'satellite' ? 'Satelliet Weergave' : 
             'Street View'}
          </span>
        </div>
        {trackingActive && (
          <div className="flex items-center space-x-2 text-xs text-green-600 mt-1">
            <Zap className="h-3 w-3" />
            <span>Live Tracking</span>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          Amsterdam, Nederland
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg z-30">
        <div className="space-y-2 text-xs">
          <div className="font-medium text-gray-900 mb-2">Legenda</div>
          {showPackages && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Ophaallocatie</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Bezorglocatie</span>
              </div>
            </>
          )}
          {showDrivers && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Beschikbare chauffeur</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Bezige chauffeur</span>
              </div>
            </>
          )}
          {mapMode === 'heatmap' && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Hoge bezorgdichtheid</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg z-30">
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <Users className="h-3 w-3 text-green-500" />
            <span>{drivers.filter(d => d.status === 'available').length} beschikbaar</span>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-3 w-3 text-blue-500" />
            <span>{packages.filter(p => p.status !== 'completed').length} actief</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-orange-500" />
            <span>Gem. 12 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}