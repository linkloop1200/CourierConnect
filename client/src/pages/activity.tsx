import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Package, Mail, Zap, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Delivery } from "@shared/schema";

const getDeliveryIcon = (type: string) => {
  switch (type) {
    case "package": return Package;
    case "letter": return Mail;
    case "express": return Zap;
    default: return Package;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800";
    case "in_transit": return "bg-blue-100 text-blue-800";
    case "picked_up": return "bg-yellow-100 text-yellow-800";
    case "assigned": return "bg-purple-100 text-purple-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending": return "In afwachting";
    case "assigned": return "Toegewezen";
    case "picked_up": return "Opgehaald";
    case "in_transit": return "Onderweg";
    case "delivered": return "Afgeleverd";
    case "cancelled": return "Geannuleerd";
    default: return status;
  }
};

export default function Activity() {
  const [, setLocation] = useLocation();
  
  // Mock user ID for demo
  const userId = 1;
  
  const { data: deliveries, isLoading } = useQuery<Delivery[]>({
    queryKey: [`/api/deliveries/user/${userId}`],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleDeliveryClick = (deliveryId: number) => {
    setLocation(`/tracking/${deliveryId}`);
  };

  return (
    <>
      <AppHeader title="Activiteit" showNotifications={false} />
      
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Je bezorgingen</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/delivery")}
              className="text-brand-blue border-brand-blue hover:bg-brand-blue-light"
            >
              Nieuwe bezorging
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-300 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : deliveries && deliveries.length > 0 ? (
            <div className="space-y-4">
              {deliveries.map((delivery) => {
                const Icon = getDeliveryIcon(delivery.type);
                return (
                  <Card 
                    key={delivery.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleDeliveryClick(delivery.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-brand-blue-light rounded-xl flex items-center justify-center">
                          <Icon className="text-brand-blue h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900">{delivery.orderNumber}</p>
                            <Badge className={getStatusColor(delivery.status)}>
                              {getStatusText(delivery.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Van: {delivery.pickupStreet}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Naar: {delivery.deliveryStreet}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {delivery.createdAt && formatDateTime(delivery.createdAt)}
                            </span>
                            <span className="font-semibold text-brand-blue">
                              {formatPrice(delivery.estimatedPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-400 h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen bezorgingen</h3>
              <p className="text-gray-500 mb-6">Begin met je eerste bezorging om je activiteit hier te zien.</p>
              <Button 
                onClick={() => setLocation("/delivery")} 
                className="bg-brand-blue text-white hover:bg-brand-blue-dark"
              >
                Eerste bezorging maken
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}