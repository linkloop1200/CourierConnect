import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Package, Mail, Zap, Clock, CheckCircle, XCircle, Truck, TrendingUp, CreditCard, MapPin, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Delivery, Driver } from "@shared/schema";

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

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: [`/api/drivers`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleDeliveryClick = (deliveryId: number) => {
    setLocation(`/tracking/${deliveryId}`);
  };

  // Calculate statistics from real data
  const stats = deliveries ? {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    totalSpent: deliveries.reduce((sum, d) => sum + parseFloat(d.finalPrice || d.estimatedPrice || '0'), 0),
    avgDeliveryTime: deliveries.length > 0 ? 
      deliveries.filter(d => d.deliveredAt && d.pickedUpAt)
        .reduce((sum, d) => {
          const pickup = new Date(d.pickedUpAt!);
          const delivery = new Date(d.deliveredAt!);
          return sum + (delivery.getTime() - pickup.getTime()) / (1000 * 60); // minutes
        }, 0) / deliveries.filter(d => d.deliveredAt && d.pickedUpAt).length : 0
  } : { total: 0, delivered: 0, inTransit: 0, pending: 0, totalSpent: 0, avgDeliveryTime: 0 };

  return (
    <>
      <AppHeader title="Dashboard" showNotifications={false} />
      
      <div className="bg-gray-50 min-h-screen pb-20 overflow-y-auto">
        <div className="px-6 pt-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Bezorgingen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                    <p className="text-sm text-gray-500">Afgeleverd</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Stats */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Prestaties</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Succesvol afgeleverd</span>
                <span className="font-medium">{stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%</span>
              </div>
              <Progress value={stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-gray-600">Totaal uitgegeven</p>
                  <p className="text-lg font-semibold">€{stats.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gem. bezorgtijd</p>
                  <p className="text-lg font-semibold">{Math.round(stats.avgDeliveryTime)} min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Snelle acties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  className="h-16 flex flex-col space-y-1"
                  onClick={() => setLocation("/")}
                >
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Nieuwe bezorging</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-16 flex flex-col space-y-1"
                  onClick={() => setLocation("/driver")}
                >
                  <Truck className="h-5 w-5" />
                  <span className="text-xs">Bezorger worden</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-16 flex flex-col space-y-1"
                  onClick={() => setLocation("/payment")}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Betalingen</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-16 flex flex-col space-y-1"
                  onClick={() => setLocation("/routing")}
                >
                  <MapPin className="h-5 w-5" />
                  <span className="text-xs">Route planning</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recente bezorgingen</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/")}
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