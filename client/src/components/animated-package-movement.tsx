import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Truck, MapPin, Clock, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GoogleMapFixed from "./google-map-fixed";
import type { Delivery, Driver } from "@shared/schema";

interface AnimatedPackageMovementProps {
  deliveryId?: number;
}

interface PackageMovement {
  id: string;
  packageId: number;
  currentLocation: { lat: number; lng: number };
  targetLocation: { lat: number; lng: number };
  progress: number;
  status: 'pickup' | 'in_transit' | 'delivering' | 'delivered';
  estimatedArrival: Date;
  driverId: number;
}

export default function AnimatedPackageMovement({ deliveryId = 1 }: AnimatedPackageMovementProps) {
  const [movements, setMovements] = useState<PackageMovement[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: ['/api/deliveries'],
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
  });

  // Initialize package movements
  useEffect(() => {
    const mockMovements: PackageMovement[] = [
      {
        id: 'pkg-001',
        packageId: 1,
        currentLocation: { lat: 52.3676, lng: 4.9041 },
        targetLocation: { lat: 52.3700, lng: 4.8950 },
        progress: 35,
        status: 'in_transit',
        estimatedArrival: new Date(Date.now() + 15 * 60 * 1000),
        driverId: 1
      },
      {
        id: 'pkg-002',
        packageId: 2,
        currentLocation: { lat: 52.3720, lng: 4.9100 },
        targetLocation: { lat: 52.3650, lng: 4.9150 },
        progress: 78,
        status: 'delivering',
        estimatedArrival: new Date(Date.now() + 5 * 60 * 1000),
        driverId: 2
      },
      {
        id: 'pkg-003',
        packageId: 3,
        currentLocation: { lat: 52.3690, lng: 4.9080 },
        targetLocation: { lat: 52.3710, lng: 4.9020 },
        progress: 12,
        status: 'pickup',
        estimatedArrival: new Date(Date.now() + 25 * 60 * 1000),
        driverId: 1
      }
    ];
    setMovements(mockMovements);
  }, []);

  // Animate package movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMovements(prev => prev.map(movement => {
        if (movement.status === 'delivered') return movement;
        
        const newProgress = Math.min(movement.progress + (0.5 * animationSpeed), 100);
        const newStatus = newProgress >= 100 ? 'delivered' : 
                         newProgress >= 80 ? 'delivering' :
                         newProgress >= 10 ? 'in_transit' : 'pickup';

        // Calculate current position based on progress
        const latDiff = movement.targetLocation.lat - movement.currentLocation.lat;
        const lngDiff = movement.targetLocation.lng - movement.currentLocation.lng;
        
        const currentLat = movement.currentLocation.lat + (latDiff * newProgress / 100);
        const currentLng = movement.currentLocation.lng + (lngDiff * newProgress / 100);

        return {
          ...movement,
          progress: newProgress,
          status: newStatus,
          currentLocation: { lat: currentLat, lng: currentLng }
        };
      }));
    }, 200);

    return () => clearInterval(interval);
  }, [animationSpeed]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pickup': return 'bg-blue-500';
      case 'in_transit': return 'bg-yellow-500';
      case 'delivering': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pickup': return 'Ophalen';
      case 'in_transit': return 'Onderweg';
      case 'delivering': return 'Bezorgen';
      case 'delivered': return 'Bezorgd';
      default: return 'Onbekend';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Geanimeerde Pakket Beweging</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {movements.filter(m => m.status !== 'delivered').length} actief
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium">Animatie snelheid:</label>
            <div className="flex space-x-2">
              {[0.5, 1, 2, 3].map(speed => (
                <Button
                  key={speed}
                  variant={animationSpeed === speed ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnimationSpeed(speed)}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>

          {/* Live Map */}
          <div className="mb-4">
            <GoogleMapFixed
              height="h-64"
              showDrivers={true}
              showPackages={true}
              userLocation={{ lat: 52.3676, lng: 4.9041 }}
              pickupLocation={{ lat: 52.3700, lng: 4.8950 }}
              deliveryLocation={{ lat: 52.3650, lng: 4.9150 }}
              driverLocation={{ lat: 52.3680, lng: 4.9000 }}
            />
          </div>

          {/* Package List */}
          <div className="space-y-3">
            {movements.map(movement => (
              <div
                key={movement.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPackage === movement.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPackage(
                  selectedPackage === movement.id ? null : movement.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(movement.status)} animate-pulse`}></div>
                    <div>
                      <div className="font-medium">Pakket #{movement.packageId}</div>
                      <div className="text-sm text-gray-600">
                        Chauffeur #{movement.driverId}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getStatusColor(movement.status)} text-white`}>
                      {getStatusText(movement.status)}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{movement.progress.toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">
                        ETA: {formatTime(movement.estimatedArrival)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Voortgang</span>
                    <span>{movement.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(movement.status)}`}
                      style={{ width: `${movement.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedPackage === movement.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Huidige locatie</div>
                        <div className="font-medium">
                          {movement.currentLocation.lat.toFixed(4)}, {movement.currentLocation.lng.toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Bestemming</div>
                        <div className="font-medium">
                          {movement.targetLocation.lat.toFixed(4)}, {movement.targetLocation.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Verwachte aankomst: {formatTime(movement.estimatedArrival)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Navigation className="h-4 w-4 text-gray-500" />
                        <span>Route geoptimaliseerd</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {movements.filter(m => m.status === 'in_transit').length}
            </div>
            <div className="text-sm text-gray-600">Onderweg</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {movements.filter(m => m.status === 'delivering').length}
            </div>
            <div className="text-sm text-gray-600">Aan het bezorgen</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {movements.filter(m => m.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600">Bezorgd</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Math.round(movements.reduce((acc, m) => acc + m.progress, 0) / movements.length)}%
            </div>
            <div className="text-sm text-gray-600">Gem. voortgang</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}