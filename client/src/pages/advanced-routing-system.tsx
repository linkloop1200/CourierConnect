import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Route, MapPin, Clock, Fuel, TrendingUp, Users, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmbeddedOpenStreetMap from "@/components/embedded-openstreetmap";

interface RouteOptimization {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuelConsumption: number;
  deliveries: number[];
  efficiency: number;
  co2Saved: number;
  costSaved: number;
}

interface DeliveryStop {
  id: number;
  address: string;
  timeWindow: string;
  priority: 'high' | 'normal' | 'low';
  packageCount: number;
  coordinates: { lat: number; lng: number };
  estimatedTime: number;
}

interface DriverRoute {
  driverId: number;
  driverName: string;
  vehicleType: string;
  currentLocation: { lat: number; lng: number };
  route: RouteOptimization;
  stops: DeliveryStop[];
  status: 'active' | 'completed' | 'pending';
}

export default function AdvancedRoutingSystem() {
  const [, setLocation] = useLocation();
  const [selectedRoute, setSelectedRoute] = useState<string>('optimal');
  const [activeTab, setActiveTab] = useState('overview');

  const routeOptions: RouteOptimization[] = [
    {
      id: 'optimal',
      name: 'AI Optimal Route',
      distance: 23.4,
      duration: 95,
      fuelConsumption: 2.1,
      deliveries: [1, 3, 7, 12, 15],
      efficiency: 98,
      co2Saved: 1.2,
      costSaved: 8.50
    },
    {
      id: 'fastest',
      name: 'Snelste Route',
      distance: 28.1,
      duration: 82,
      fuelConsumption: 2.8,
      deliveries: [1, 7, 12, 3, 15],
      efficiency: 85,
      co2Saved: 0.8,
      costSaved: 5.20
    },
    {
      id: 'efficient',
      name: 'Meest Efficiënte',
      distance: 21.8,
      duration: 108,
      fuelConsumption: 1.9,
      deliveries: [3, 1, 12, 7, 15],
      efficiency: 94,
      co2Saved: 1.5,
      costSaved: 9.80
    }
  ];

  const deliveryStops: DeliveryStop[] = [
    {
      id: 1,
      address: 'Damrak 123, Amsterdam',
      timeWindow: '09:00-11:00',
      priority: 'high',
      packageCount: 2,
      coordinates: { lat: 52.3676, lng: 4.9041 },
      estimatedTime: 8
    },
    {
      id: 3,
      address: 'Vondelpark 45, Amsterdam',
      timeWindow: '10:00-12:00',
      priority: 'normal',
      packageCount: 1,
      coordinates: { lat: 52.3584, lng: 4.8691 },
      estimatedTime: 5
    },
    {
      id: 7,
      address: 'Zuiderpark 78, Amsterdam',
      timeWindow: '11:00-13:00',
      priority: 'low',
      packageCount: 3,
      coordinates: { lat: 52.3396, lng: 4.8718 },
      estimatedTime: 12
    },
    {
      id: 12,
      address: 'Oosterpark 234, Amsterdam',
      timeWindow: '12:00-14:00',
      priority: 'normal',
      packageCount: 1,
      coordinates: { lat: 52.3598, lng: 4.9213 },
      estimatedTime: 6
    },
    {
      id: 15,
      address: 'Noord Plaza 567, Amsterdam',
      timeWindow: '13:00-15:00',
      priority: 'high',
      packageCount: 2,
      coordinates: { lat: 52.3834, lng: 4.9012 },
      estimatedTime: 9
    }
  ];

  const driverRoutes: DriverRoute[] = [
    {
      driverId: 1,
      driverName: 'Marco van der Berg',
      vehicleType: 'Bakfiets',
      currentLocation: { lat: 52.3676, lng: 4.9041 },
      route: routeOptions[0],
      stops: deliveryStops,
      status: 'active'
    },
    {
      driverId: 2,
      driverName: 'Sarah Jansen',
      vehicleType: 'Scooter',
      currentLocation: { lat: 52.3584, lng: 4.8691 },
      route: routeOptions[1],
      stops: deliveryStops.slice(0, 3),
      status: 'pending'
    }
  ];

  const selectedRouteData = routeOptions.find(r => r.id === selectedRoute) || routeOptions[0];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}u ${mins}m` : `${mins}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'normal': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/driver')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <Route className="h-5 w-5 text-brand-blue" />
          <h1 className="text-lg font-semibold">Advanced Routing</h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="optimization">Optimalisatie</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Route Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Route Opties</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {routeOptions.map((route) => (
                  <div
                    key={route.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRoute === route.id
                        ? 'border-brand-blue bg-brand-blue-light'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRoute(route.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{route.name}</h3>
                        <p className="text-sm text-gray-600">{route.deliveries.length} bezorgingen</p>
                      </div>
                      <Badge variant="outline" className={`${route.efficiency >= 95 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {route.efficiency}% efficiënt
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{route.distance} km</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{formatTime(route.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Fuel className="h-4 w-4 text-gray-500" />
                        <span>{route.fuelConsumption}L</span>
                      </div>
                    </div>

                    <div className="mt-2 flex space-x-4 text-xs text-green-600">
                      <span>💰 €{route.costSaved} bespaard</span>
                      <span>🌱 {route.co2Saved}kg CO₂ minder</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Map View */}
            <Card>
              <CardHeader>
                <CardTitle>Route Visualisatie</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <EmbeddedOpenStreetMap 
                  height="300px"
                  showDrivers={true}
                  showPackages={true}
                  enableRealTimeTracking={true}
                />
              </CardContent>
            </Card>

            {/* Delivery Stops */}
            <Card>
              <CardHeader>
                <CardTitle>Bezorgstops</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedRouteData.deliveries.map((deliveryId, index) => {
                  const stop = deliveryStops.find(s => s.id === deliveryId);
                  if (!stop) return null;
                  
                  return (
                    <div key={stop.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{stop.address}</p>
                        <p className="text-sm text-gray-600">{stop.timeWindow} • {stop.packageCount} pakket(ten)</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getPriorityColor(stop.priority)}>
                          {stop.priority}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{stop.estimatedTime} min</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4 mt-4">
            {/* AI Optimization Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>AI Optimalisatie Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Route Efficiëntie</p>
                    <Progress value={selectedRouteData.efficiency} className="h-2" />
                    <p className="text-xs text-gray-600">{selectedRouteData.efficiency}% van theoretisch optimum</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Brandstof Besparing</p>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-gray-600">75% minder verbruik vs standaard</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedRouteData.co2Saved}kg</p>
                    <p className="text-sm text-gray-600">CO₂ Reductie</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">€{selectedRouteData.costSaved}</p>
                    <p className="text-sm text-gray-600">Kostenbesparing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{formatTime(selectedRouteData.duration)}</p>
                    <p className="text-sm text-gray-600">Totale Tijd</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optimization Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Optimalisatie Factoren</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Verkeersdrukte</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Optimaal</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Tijd Vensters</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Gemiddeld</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Afstand Optimalisatie</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Uitstekend</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Pakket Prioriteit</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">Optimaal</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-4">
            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Vandaag vs Gisteren</p>
                    <p className="text-2xl font-bold text-green-600">+23%</p>
                    <p className="text-xs text-gray-600">Efficiëntie verbetering</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Deze Week</p>
                    <p className="text-2xl font-bold text-blue-600">+15%</p>
                    <p className="text-xs text-gray-600">Snellere bezorgingen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Team Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {driverRoutes.map((driver) => (
                  <div key={driver.driverId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{driver.driverName}</p>
                      <p className="text-sm text-gray-600">{driver.vehicleType} • {driver.stops.length} stops</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={driver.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}
                      >
                        {driver.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{driver.route.efficiency}% efficiënt</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Apply Route Button */}
        <div className="mt-6">
          <Button className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold">
            Route Toepassen • {selectedRouteData.deliveries.length} Bezorgingen
          </Button>
        </div>
      </div>
    </div>
  );
}