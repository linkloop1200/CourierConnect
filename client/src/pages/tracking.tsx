import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Truck, Home, Phone, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppHeader from "@/components/app-header";
import MapView from "@/components/map-view";
import GoogleMap from "@/components/google-map";
import BottomNavigation from "@/components/bottom-navigation";
import { useConfig } from "@/hooks/use-config";
import { parseCoordinates } from "@/lib/geocoding";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Delivery, Driver } from "@shared/schema";

interface TrackingProps {
  params: {
    id: string;
  };
}

export default function Tracking({ params }: TrackingProps) {
  const [, setLocation] = useLocation();
  const { data: config } = useConfig();
  const deliveryId = parseInt(params.id);

  const { data: deliveryData, isLoading } = useQuery<Delivery & { driver: Driver | null }>({
    queryKey: [`/api/deliveries/${deliveryId}`],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const handleBack = () => {
    setLocation("/");
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: "picked_up", label: "Pakket opgehaald", icon: Check, completed: false },
      { key: "in_transit", label: "Onderweg naar bestemming", icon: Truck, completed: false },
      { key: "delivered", label: "Afgeleverd", icon: Home, completed: false },
    ];

    const statusOrder = ["pending", "assigned", "picked_up", "in_transit", "delivered"];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex - 2, // -2 because picked_up is index 2
      active: index === currentIndex - 2,
    }));
  };

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      </>
    );
  }

  if (!deliveryData) {
    return (
      <>
        <AppHeader />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Bezorging niet gevonden</p>
        </div>
      </>
    );
  }

  const statusSteps = getStatusSteps(deliveryData.status);

  return (
    <>
      <AppHeader />
      
      {config?.GOOGLE_MAPS_API_KEY ? (
        <GoogleMap 
          height="h-64" 
          showDrivers={true}
          pickupLocation={parseCoordinates(deliveryData?.pickupLatitude, deliveryData?.pickupLongitude) || undefined}
          deliveryLocation={parseCoordinates(deliveryData?.deliveryLatitude, deliveryData?.deliveryLongitude) || undefined}
          driverLocation={deliveryData?.driver ? parseCoordinates(deliveryData.driver.currentLatitude, deliveryData.driver.currentLongitude) || undefined : undefined}
        />
      ) : (
        <MapView height="h-64" showDrivers={true} />
      )}
      
      {/* Tracking Bottom Sheet */}
      <div className="floating-panel bg-white rounded-t-3xl absolute bottom-0 left-0 right-0 z-10 overflow-hidden" style={{ height: "calc(100vh - 256px)" }}>
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6"></div>

        <div className="px-6 pb-32 overflow-y-auto" style={{ height: "calc(100% - 40px)" }}>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="w-8 h-8"
            >
              <ArrowLeft className="text-gray-600 h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold text-gray-900">Je bezorging</h2>
            <div></div>
          </div>
          
          {/* Driver Card */}
          {deliveryData.driver && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">
                      {deliveryData.driver.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{deliveryData.driver.name}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="text-yellow-400 h-4 w-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{deliveryData.driver.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{deliveryData.driver.vehicle}</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 bg-green-100 border-green-200 hover:bg-green-200"
                    >
                      <Phone className="text-green-600 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 bg-blue-100 border-blue-200 hover:bg-blue-200"
                    >
                      <MessageCircle className="text-blue-600 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Status */}
          <div className="space-y-4 mb-6">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-green-500"
                      : step.active
                      ? "bg-brand-blue status-active"
                      : "bg-gray-300"
                  }`}>
                    <Icon className={`text-white h-4 w-4 ${step.active ? "animate-pulse" : ""}`} />
                  </div>
                  <div className={step.completed || step.active ? "" : "opacity-50"}>
                    <p className="font-medium text-gray-900">{step.label}</p>
                    <p className="text-sm text-gray-500">
                      {step.completed && deliveryData.pickedUpAt
                        ? formatDateTime(deliveryData.pickedUpAt)
                        : step.active
                        ? "Geschatte aankomst: 15:15"
                        : "Wachten op bezorging"
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Bezorgdetails</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bestelnummer</span>
                <span className="font-medium">{deliveryData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium capitalize">{deliveryData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prijs</span>
                <span className="font-medium">{formatPrice(deliveryData.estimatedPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Van</span>
                <span className="font-medium text-right">{deliveryData.pickupStreet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Naar</span>
                <span className="font-medium text-right">{deliveryData.deliveryStreet}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}
