import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation, MapPin, Phone, MessageCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import WorkingMap from "./working-map";
import type { Delivery, Driver } from "@shared/schema";

interface DriverMobileAppProps {
  driverId: number;
}

export default function DriverMobileApp({ driverId }: DriverMobileAppProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const { toast } = useToast();

  // Get driver's assigned deliveries
  const { data: deliveries, isLoading } = useQuery<Delivery[]>({
    queryKey: [`/api/drivers/${driverId}/deliveries`],
    refetchInterval: false, // Disabled to prevent infinite loading
  });

  // Get driver info
  const { data: driver } = useQuery<Driver>({
    queryKey: [`/api/drivers/${driverId}`],
  });

  // Update driver location
  const updateLocationMutation = useMutation({
    mutationFn: async (location: { lat: number; lng: number }) => {
      return apiRequest({
        url: `/api/drivers/${driverId}/location`,
        method: "PUT",
        body: {
          latitude: location.lat.toString(),
          longitude: location.lng.toString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/drivers/${driverId}`] });
    }
  });

  // Update delivery status
  const updateDeliveryMutation = useMutation({
    mutationFn: async ({ deliveryId, status, notes }: { deliveryId: number; status: string; notes?: string }) => {
      return apiRequest("POST", `/api/deliveries/${deliveryId}/status`, { status, driverId, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/drivers/${driverId}/deliveries`] });
      toast({
        title: "Status bijgewerkt",
        description: "Bezorgstatus is succesvol gewijzigd.",
      });
    }
  });

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          
          // Update driver location in backend
          updateLocationMutation.mutate(newLocation);
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

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
      case 'pending': return 'Te verzamelen';
      case 'picked_up': return 'Opgehaald';
      case 'in_transit': return 'Onderweg';
      case 'delivered': return 'Bezorgd';
      default: return 'Onbekend';
    }
  };

  const handleStatusUpdate = (deliveryId: number, newStatus: string) => {
    updateDeliveryMutation.mutate({
      deliveryId,
      status: newStatus,
      notes: deliveryNotes
    });
    setDeliveryNotes("");
  };

  const openNavigation = (delivery: Delivery) => {
    const destination = delivery.status === 'pending' 
      ? `${delivery.pickupStreet}, ${delivery.pickupCity}`
      : `${delivery.deliveryStreet}, ${delivery.deliveryCity}`;
    
    const encodedDestination = encodeURIComponent(destination);
    
    // Try to open in Google Maps app, fallback to web
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Driver Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Chauffeur Dashboard</span>
            <Badge variant={driver?.isActive ? "default" : "secondary"}>
              {driver?.isActive ? "Actief" : "Offline"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Naam:</span>
              <p className="font-medium">{driver?.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Voertuig:</span>
              <p className="font-medium">{driver?.vehicle} ({driver?.vehicleType})</p>
            </div>
            <div>
              <span className="text-gray-600">Rating:</span>
              <p className="font-medium">{driver?.rating || "N/A"} ⭐</p>
            </div>
            <div>
              <span className="text-gray-600">Actieve bezorgingen:</span>
              <p className="font-medium">{deliveries?.filter(d => d.status !== 'delivered').length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Location Map */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>Huidige locatie</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkingMap
              height="h-48"
              showDrivers={true}
              userLocation={currentLocation}
              driverLocation={currentLocation}
            />
          </CardContent>
        </Card>
      )}

      {/* Active Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Actieve bezorgingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deliveries && deliveries.length > 0 ? (
            deliveries
              .filter(delivery => delivery.status !== 'delivered')
              .map((delivery) => (
                <div key={delivery.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(delivery.status)}`}></div>
                      <span className="font-semibold">#{delivery.orderNumber}</span>
                    </div>
                    <Badge variant="outline">{getStatusText(delivery.status)}</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Ophalen van:</span>
                      <p className="font-medium">{delivery.pickupStreet}, {delivery.pickupCity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bezorgen naar:</span>
                      <p className="font-medium">{delivery.deliveryStreet}, {delivery.deliveryCity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium capitalize">{delivery.type}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openNavigation(delivery)}
                      className="flex-1"
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Navigeer
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${delivery.userId}`, '_self')}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="space-y-2">
                    {delivery.status === 'pending' && (
                      <Button
                        onClick={() => handleStatusUpdate(delivery.id, 'picked_up')}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={updateDeliveryMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Markeer als opgehaald
                      </Button>
                    )}
                    
                    {delivery.status === 'picked_up' && (
                      <Button
                        onClick={() => handleStatusUpdate(delivery.id, 'in_transit')}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={updateDeliveryMutation.isPending}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Markeer als onderweg
                      </Button>
                    )}
                    
                    {delivery.status === 'in_transit' && (
                      <Button
                        onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={updateDeliveryMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Markeer als bezorgd
                      </Button>
                    )}
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <Textarea
                      placeholder="Notities voor deze bezorging..."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Geen actieve bezorgingen</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
