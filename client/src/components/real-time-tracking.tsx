import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Clock, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MapAlternative from "./map-alternative";
import type { Delivery, Driver } from "@shared/schema";

interface RealTimeTrackingProps {
  deliveryId: number;
}

export default function RealTimeTracking({ deliveryId }: RealTimeTrackingProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time delivery tracking
  const { data: deliveryData, refetch } = useQuery<Delivery & { driver: Driver | null }>({
    queryKey: ['/api/deliveries', deliveryId],
    // Disabled automatic refresh to prevent infinite loading
    refetchInterval: false,
  });

  // Manual refresh updates only
  useEffect(() => {
    setLastUpdate(new Date());
  }, [deliveryData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'picked_up': return 'bg-blue-500';
      case 'in_transit': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Wachtend op ophaling';
      case 'picked_up': return 'Opgehaald';
      case 'in_transit': return 'Onderweg';
      case 'delivered': return 'Bezorgd';
      default: return 'Onbekend';
    }
  };

  if (!deliveryData) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Status Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(deliveryData.status)} animate-pulse`}></div>
              <span className="font-semibold text-gray-900">{getStatusText(deliveryData.status)}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              LIVE
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Laatste update:</span>
            </div>
            <span className="text-gray-900 font-medium">
              {lastUpdate.toLocaleTimeString('nl-NL')}
            </span>
            
            {deliveryData.driver && (
              <>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Chauffeur:</span>
                </div>
                <span className="text-gray-900 font-medium">{deliveryData.driver.name}</span>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">ETA:</span>
            </div>
            <span className="text-gray-900 font-medium">
              {deliveryData.estimatedDeliveryTime ? `${deliveryData.estimatedDeliveryTime} min` : 'Wordt berekend...'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Real-time GPS Map */}
      <MapAlternative
        height="320px"
        showDrivers={true}
        showPackages={true}
        enableRealTimeTracking={true}
        pickupLocation={deliveryData.pickupLatitude && deliveryData.pickupLongitude ? 
          { lat: parseFloat(deliveryData.pickupLatitude), lng: parseFloat(deliveryData.pickupLongitude) } : undefined}
        deliveryLocation={deliveryData.deliveryLatitude && deliveryData.deliveryLongitude ? 
          { lat: parseFloat(deliveryData.deliveryLatitude), lng: parseFloat(deliveryData.deliveryLongitude) } : undefined}
        driverLocation={deliveryData.driver?.currentLatitude && deliveryData.driver?.currentLongitude ? 
          { lat: parseFloat(deliveryData.driver.currentLatitude), lng: parseFloat(deliveryData.driver.currentLongitude) } : undefined}
      />

      {/* Live Tracking Controls */}
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => refetch()}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Locatie vernieuwen
        </Button>
        
        {deliveryData.driver && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(`tel:${deliveryData.driver?.phone}`)}
          >
            Bel chauffeur
          </Button>
        )}
      </div>
    </div>
  );
}