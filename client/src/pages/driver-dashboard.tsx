import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navigation, Phone, MessageCircle, CheckCircle, Clock, MapPin, Star, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import EmbeddedOpenStreetMap from "@/components/embedded-openstreetmap";
import BottomNavigation from "@/components/bottom-navigation";
import type { Delivery } from "@shared/schema";

interface DriverStats {
  todayEarnings: number;
  deliveriesCompleted: number;
  rating: number;
  onlineTime: string;
}

interface ActiveDelivery extends Delivery {
  customerName: string;
  customerPhone: string;
  pickupDistance: number;
  deliveryDistance: number;
  estimatedEarnings: number;
}

export default function DriverDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(true);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 52.3676, lng: 4.9041 });

  // Mock driver stats
  const stats: DriverStats = {
    todayEarnings: 127.50,
    deliveriesCompleted: 12,
    rating: 4.8,
    onlineTime: "6u 23m"
  };

  // Mock active delivery
  useEffect(() => {
    if (isOnline) {
      const mockDelivery: ActiveDelivery = {
        id: 1,
        userId: 1,
        driverId: 1,
        orderNumber: "SP240623001",
        type: "package",
        pickupStreet: "Damrak 123",
        pickupCity: "Amsterdam",
        pickupPostalCode: "1012 LK",
        pickupAddressId: 1,
        pickupLatitude: "52.3676",
        pickupLongitude: "4.9041",
        deliveryStreet: "Zuidas 456",
        deliveryCity: "Amsterdam",
        deliveryPostalCode: "1082 MD",
        deliveryAddressId: 2,
        deliveryLatitude: "52.3500",
        deliveryLongitude: "4.9500",
        status: "assigned",
        estimatedPrice: "12.50",
        estimatedDeliveryTime: 45,
        finalPrice: "12.50",
        createdAt: new Date(),
        pickedUpAt: null,
        deliveredAt: null,
        customerName: "Jan de Vries",
        customerPhone: "+31 6 12345678",
        pickupDistance: 0.8,
        deliveryDistance: 3.2,
        estimatedEarnings: 8.75
      };
      setActiveDelivery(mockDelivery);
    }
  }, [isOnline]);

  // Update driver location
  const updateLocationMutation = useMutation({
    mutationFn: async (location: { lat: number; lng: number }) => {
      const res = await apiRequest("POST", "/api/drivers/location", location);
      return res.json();
    },
  });

  // Accept delivery
  const acceptDeliveryMutation = useMutation({
    mutationFn: async (deliveryId: number) => {
      const res = await apiRequest("POST", `/api/deliveries/${deliveryId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bezorging geaccepteerd",
        description: "Navigate naar de ophaallocatie",
      });
    },
  });

  // Update delivery status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ deliveryId, status }: { deliveryId: number; status: string }) => {
      const res = await apiRequest("POST", `/api/deliveries/${deliveryId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
    },
  });

  const handleStatusUpdate = (status: string) => {
    if (activeDelivery) {
      updateStatusMutation.mutate({ deliveryId: activeDelivery.id, status });
      
      if (status === "delivered") {
        setActiveDelivery(null);
        toast({
          title: "Bezorging voltooid!",
          description: `Ôé¼${activeDelivery.estimatedEarnings} toegevoegd aan je verdiensten`,
        });
      }
    }
  };

  const openNavigation = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      setActiveDelivery(null);
    }
    toast({
      title: isOnline ? "Je bent nu offline" : "Je bent nu online",
      description: isOnline ? "Je ontvangt geen nieuwe bezorgingen" : "Je kunt nieuwe bezorgingen ontvangen",
    });
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-blue">Bezorger Dashboard</h1>
          <Button
            onClick={toggleOnlineStatus}
            className={`${
              isOnline 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <p className="text-sm text-gray-600">Vandaag verdiend</p>
              <p className="text-xl font-bold text-green-600">Ôé¼{stats.todayEarnings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-sm text-gray-600">Bezorgingen</p>
              <p className="text-xl font-bold">{stats.deliveriesCompleted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-sm text-gray-600">Beoordeling</p>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <p className="text-xl font-bold">{stats.rating}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-sm text-gray-600">Online tijd</p>
              <p className="text-xl font-bold">{stats.onlineTime}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Delivery or Map */}
      {activeDelivery ? (
        <div className="flex-1 p-4">
          {/* Delivery Card */}
          <Card className="mb-4 border-2 border-brand-blue">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Actieve Bezorging</h3>
                <Badge variant="outline" className="bg-brand-blue-light text-brand-blue">
                  {activeDelivery.orderNumber}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activeDelivery.customerName}</p>
                    <p className="text-sm text-gray-600">{activeDelivery.customerPhone}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Ophalen</p>
                    <p className="text-sm text-gray-600">{activeDelivery.pickupStreet}, {activeDelivery.pickupCity}</p>
                    <p className="text-xs text-gray-500">{activeDelivery.pickupDistance} km afstand</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openNavigation(`${activeDelivery.pickupStreet}, ${activeDelivery.pickupCity}`)}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Bezorgen</p>
                    <p className="text-sm text-gray-600">{activeDelivery.deliveryStreet}, {activeDelivery.deliveryCity}</p>
                    <p className="text-xs text-gray-500">{activeDelivery.deliveryDistance} km afstand</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openNavigation(`${activeDelivery.deliveryStreet}, ${activeDelivery.deliveryCity}`)}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Earnings */}
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-medium">Verwachte verdiensten</span>
                  <span className="text-green-600 font-bold text-lg">Ôé¼{activeDelivery.estimatedEarnings}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Advanced Routing Button */}
                <Button 
                  variant="outline"
                  className="w-full border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                  onClick={() => setLocation("/routing")}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Route Optimaliseren
                </Button>
                
                {activeDelivery.status === "assigned" && (
                  <Button 
                    className="w-full bg-brand-blue text-white"
                    onClick={() => handleStatusUpdate("picked_up")}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Pakket opgehaald
                  </Button>
                )}
                
                {activeDelivery.status === "picked_up" && (
                  <Button 
                    className="w-full bg-green-600 text-white"
                    onClick={() => handleStatusUpdate("delivered")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Bezorging voltooid
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mini Map */}
          <Card>
            <CardContent className="p-0">
              <EmbeddedOpenStreetMap 
                height="200px"
                driverLocation={driverLocation}
                pickupLocation={{ lat: 52.3676, lng: 4.9041 }}
                deliveryLocation={{ lat: 52.3500, lng: 4.9500 }}
                enableRealTimeTracking={true}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isOnline ? "Wachten op bezorging..." : "Je bent offline"}
            </h3>
            <p className="text-gray-600 mb-4">
              {isOnline 
                ? "We zoeken naar bezorgingen in je buurt" 
                : "Zet je status op online om bezorgingen te ontvangen"
              }
            </p>
            {!isOnline && (
              <Button onClick={toggleOnlineStatus} className="bg-brand-blue text-white">
                Ga online
              </Button>
            )}
          </div>
        </div>
      )}

      <BottomNavigation onNavigate={setLocation} />
    </div>
  );
}
