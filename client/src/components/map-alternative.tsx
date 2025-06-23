import { useState, useEffect } from "react";
import { MapPin, Navigation, Truck, Package, Clock, Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MapAlternativeProps {
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

export default function MapAlternative({ 
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
}: MapAlternativeProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Mock data initialization
  useEffect(() => {
    const mockDrivers: Driver[] = [
      { id: 1, lat: 52.370216, lng: 4.895168, status: 'busy', name: 'Jan Vermeer', deliveries: 12 },
      { id: 2, lat: 52.373056, lng: 4.892222, status: 'available', name: 'Maria Santos', deliveries: 8 },
      { id: 3, lat: 52.367584, lng: 4.904139, status: 'busy', name: 'Piet de Jong', deliveries: 15 },
    ];

    const mockPackages: Package[] = [
      { id: 1, lat: 52.369719, lng: 4.901047, status: 'pickup', address: 'Damrak 1', priority: 'urgent' },
      { id: 2, lat: 52.371807, lng: 4.896029, status: 'delivery', address: 'Nieuwmarkt 4', priority: 'express' },
      { id: 3, lat: 52.364737, lng: 4.889244, status: 'completed', address: 'Vondelpark 3', priority: 'normal' },
    ];

    setDrivers(mockDrivers);
    setPackages(mockPackages);
  }, []);

  // Animation for real-time tracking
  useEffect(() => {
    if (enableRealTimeTracking) {
      const interval = setInterval(() => {
        setAnimationFrame(prev => prev + 1);
        
        // Simulate driver movement
        setDrivers(prev => prev.map(driver => ({
          ...driver,
          lat: driver.lat + (Math.random() - 0.5) * 0.001,
          lng: driver.lng + (Math.random() - 0.5) * 0.001,
        })));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [enableRealTimeTracking]);

  // Convert lat/lng to SVG coordinates (Amsterdam area)
  const latLngToSVG = (lat: number, lng: number) => {
    const minLat = 52.35;
    const maxLat = 52.39;
    const minLng = 4.85;
    const maxLng = 4.95;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 400;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 300;
    
    return { x: Math.max(0, Math.min(400, x)), y: Math.max(0, Math.min(300, y)) };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981'; // green
      case 'busy': return '#F59E0B'; // yellow
      case 'offline': return '#EF4444'; // red
      case 'pickup': return '#3B82F6'; // blue
      case 'delivery': return '#8B5CF6'; // purple
      case 'completed': return '#10B981'; // green
      case 'urgent': return '#EF4444'; // red
      case 'express': return '#F59E0B'; // yellow
      default: return '#6B7280'; // gray
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'express': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div style={{ height }} className="relative bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          {/* SVG Map Container */}
          <svg viewBox="0 0 400 300" className="w-full h-full">
            {/* Background Amsterdam street grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#grid)" />
            
            {/* Major roads */}
            <path d="M 0 150 L 400 150" stroke="#D1D5DB" strokeWidth="3" />
            <path d="M 200 0 L 200 300" stroke="#D1D5DB" strokeWidth="3" />
            <path d="M 100 50 L 300 250" stroke="#D1D5DB" strokeWidth="2" />
            <path d="M 300 50 L 100 250" stroke="#D1D5DB" strokeWidth="2" />

            {/* Canal system (Amsterdam style) */}
            <path d="M 50 100 Q 200 80 350 120" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 50 180 Q 200 160 350 200" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.6" />

            {/* Heat map overlay */}
            {showHeatMap && (
              <g opacity="0.4">
                <circle cx="150" cy="120" r="30" fill="#EF4444" opacity="0.3" />
                <circle cx="250" cy="180" r="25" fill="#F59E0B" opacity="0.3" />
                <circle cx="320" cy="100" r="20" fill="#10B981" opacity="0.3" />
              </g>
            )}

            {/* Route optimization paths */}
            {showRouteOptimization && pickupLocation && deliveryLocation && (
              <g>
                {(() => {
                  const pickup = latLngToSVG(pickupLocation.lat, pickupLocation.lng);
                  const delivery = latLngToSVG(deliveryLocation.lat, deliveryLocation.lng);
                  return (
                    <>
                      <path 
                        d={`M ${pickup.x} ${pickup.y} Q ${(pickup.x + delivery.x) / 2} ${pickup.y - 30} ${delivery.x} ${delivery.y}`}
                        stroke="#8B5CF6" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                      <path 
                        d={`M ${pickup.x} ${pickup.y} L ${delivery.x} ${delivery.y}`}
                        stroke="#10B981" 
                        strokeWidth="2" 
                        fill="none"
                      />
                    </>
                  );
                })()}
              </g>
            )}

            {/* User location */}
            {userLocation && (
              <g>
                {(() => {
                  const pos = latLngToSVG(userLocation.lat, userLocation.lng);
                  return (
                    <g transform={`translate(${pos.x}, ${pos.y})`}>
                      <circle r="8" fill="#3B82F6" opacity="0.3" />
                      <circle r="4" fill="#3B82F6" />
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Pickup location */}
            {pickupLocation && (
              <g>
                {(() => {
                  const pos = latLngToSVG(pickupLocation.lat, pickupLocation.lng);
                  return (
                    <g transform={`translate(${pos.x}, ${pos.y})`}>
                      <circle r="6" fill="#10B981" />
                      <text x="8" y="4" fontSize="10" fill="#10B981" fontWeight="bold">P</text>
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Delivery location */}
            {deliveryLocation && (
              <g>
                {(() => {
                  const pos = latLngToSVG(deliveryLocation.lat, deliveryLocation.lng);
                  return (
                    <g transform={`translate(${pos.x}, ${pos.y})`}>
                      <circle r="6" fill="#EF4444" />
                      <text x="8" y="4" fontSize="10" fill="#EF4444" fontWeight="bold">D</text>
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Drivers */}
            {showDrivers && drivers.map(driver => {
              const pos = latLngToSVG(driver.lat, driver.lng);
              return (
                <g key={driver.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle 
                    r="8" 
                    fill={getStatusColor(driver.status)} 
                    className={enableRealTimeTracking ? "animate-pulse" : ""}
                  />
                  <polygon 
                    points="-3,-2 3,-2 2,2 -2,2" 
                    fill="white" 
                    transform="rotate(45)"
                  />
                  <text x="12" y="-8" fontSize="8" fill="#374151" fontWeight="bold">
                    {driver.name.split(' ')[0]}
                  </text>
                  <text x="12" y="0" fontSize="7" fill="#6B7280">
                    {driver.deliveries} bezorgingen
                  </text>
                </g>
              );
            })}

            {/* Packages */}
            {showPackages && packages.map(pkg => {
              const pos = latLngToSVG(pkg.lat, pkg.lng);
              return (
                <g key={pkg.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  <rect 
                    x="-4" 
                    y="-4" 
                    width="8" 
                    height="8" 
                    fill={getPriorityColor(pkg.priority)}
                    stroke="white"
                    strokeWidth="1"
                  />
                  <text x="8" y="-8" fontSize="7" fill="#374151">
                    #{pkg.id}
                  </text>
                  <text x="8" y="0" fontSize="6" fill="#6B7280">
                    {pkg.status}
                  </text>
                </g>
              );
            })}

            {/* Driver location (current delivery) */}
            {driverLocation && (
              <g>
                {(() => {
                  const pos = latLngToSVG(driverLocation.lat, driverLocation.lng);
                  return (
                    <g transform={`translate(${pos.x}, ${pos.y})`}>
                      <circle r="12" fill="#8B5CF6" opacity="0.2" className="animate-ping" />
                      <circle r="6" fill="#8B5CF6" />
                      <polygon points="-3,-2 3,-2 2,2 -2,2" fill="white" />
                    </g>
                  );
                })()}
              </g>
            )}
          </svg>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button size="sm" variant="outline" className="bg-white/90">
              <Navigation className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-white/90">
              <Route className="h-4 w-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Beschikbare chauffeurs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Bezige chauffeurs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Urgent pakketten</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Jouw locatie</span>
              </div>
            </div>
          </div>

          {/* Real-time indicator */}
          {enableRealTimeTracking && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-green-500 text-white animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                Live tracking
              </Badge>
            </div>
          )}

          {/* Status overlay for specific delivery */}
          {driverLocation && (
            <div className="absolute bottom-4 right-4 bg-white/95 p-3 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Chauffeur onderweg</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                <Clock className="h-3 w-3" />
                <span>ETA: 12 minuten</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}