import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Route, MapPin, Clock, Fuel, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnhancedMap from "./enhanced-map";
import type { Delivery, Driver } from "@shared/schema";

interface RouteOptimization {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuel: number;
  deliveries: number[];
  efficiency: number;
}

interface AdvancedRoutingProps {
  driverId?: number;
}

export default function AdvancedRouting({ driverId }: AdvancedRoutingProps) {
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [optimizationMode, setOptimizationMode] = useState<string>("balanced");

  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: ['/api/deliveries'],
    select: (data) => data.filter(d => d.status === 'pending' || d.status === 'picked_up')
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
    select: (data) => data.filter(d => d.isActive)
  });

  // Mock route optimization algorithm
  const optimizeRoutes = (): RouteOptimization[] => {
    if (!deliveries || deliveries.length === 0) return [];

    const routes: RouteOptimization[] = [
      {
        id: "route_1",
        name: "Noord Route",
        distance: 12.5,
        duration: 45,
        fuel: 3.2,
        deliveries: deliveries.slice(0, 3).map(d => d.id),
        efficiency: 92
      },
      {
        id: "route_2", 
        name: "Centrum Route",
        distance: 8.7,
        duration: 32,
        fuel: 2.1,
        deliveries: deliveries.slice(3, 6).map(d => d.id),
        efficiency: 96
      },
      {
        id: "route_3",
        name: "Zuid Route", 
        distance: 15.2,
        duration: 52,
        fuel: 4.1,
        deliveries: deliveries.slice(6, 9).map(d => d.id),
        efficiency: 88
      }
    ];

    // Apply optimization mode
    switch (optimizationMode) {
      case "fastest":
        return routes.sort((a, b) => a.duration - b.duration);
      case "shortest":
        return routes.sort((a, b) => a.distance - b.distance);
      case "fuel":
        return routes.sort((a, b) => a.fuel - b.fuel);
      default:
        return routes.sort((a, b) => b.efficiency - a.efficiency);
    }
  };

  const optimizedRoutes = optimizeRoutes();

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return "text-green-600 bg-green-100";
    if (efficiency >= 90) return "text-blue-600 bg-blue-100";
    if (efficiency >= 85) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getOptimizationLabel = (mode: string) => {
    switch (mode) {
      case "fastest": return "Snelste routes";
      case "shortest": return "Kortste afstand";
      case "fuel": return "Brandstof besparing";
      default: return "Gebalanceerd";
    }
  };

  return (
    <div className="space-y-6">
      {/* Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Route Optimalisatie</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Optimalisatie modus
              </label>
              <Select value={optimizationMode} onValueChange={setOptimizationMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Gebalanceerd</SelectItem>
                  <SelectItem value="fastest">Snelste routes</SelectItem>
                  <SelectItem value="shortest">Kortste afstand</SelectItem>
                  <SelectItem value="fuel">Brandstof besparing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Optimaliseren voor: {getOptimizationLabel(optimizationMode)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Options */}
      <div className="space-y-4">
        {optimizedRoutes.map((route, index) => (
          <Card 
            key={route.id} 
            className={`cursor-pointer transition-all ${
              selectedRoute === route.id 
                ? "ring-2 ring-brand-blue bg-blue-50" 
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedRoute(route.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "Aanbevolen" : `Optie ${index + 1}`}
                  </Badge>
                  <h3 className="font-semibold">{route.name}</h3>
                </div>
                <Badge className={`${getEfficiencyColor(route.efficiency)} border-0`}>
                  {route.efficiency}% efficiënt
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Afstand</p>
                    <p className="font-medium">{route.distance} km</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Tijd</p>
                    <p className="font-medium">{route.duration} min</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Fuel className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-600">Brandstof</p>
                    <p className="font-medium">{route.fuel}L</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600">Bezorgingen</p>
                  <p className="font-medium">{route.deliveries.length} stops</p>
                </div>
              </div>

              {selectedRoute === route.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Bezorgingen in deze route:</h4>
                  <div className="space-y-1">
                    {route.deliveries.map((deliveryId, stopIndex) => {
                      const delivery = deliveries?.find(d => d.id === deliveryId);
                      return delivery ? (
                        <div key={deliveryId} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                          <span>Stop {stopIndex + 1}: {delivery.deliveryStreet}, {delivery.deliveryCity}</span>
                          <Badge variant="outline" className="text-xs">
                            #{delivery.orderNumber}
                          </Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Route Visualization */}
      {selectedRoute && (
        <Card>
          <CardHeader>
            <CardTitle>Route Visualisatie</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedMap
              height="h-80"
              showDrivers={true}
              showPackages={true}
            />
            <div className="mt-4 flex space-x-3">
              <Button className="flex-1 bg-brand-blue hover:bg-brand-blue-dark">
                Route starten
              </Button>
              <Button variant="outline" className="flex-1">
                Route delen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Route Statistieken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-600 font-medium">Totale besparing</p>
              <p className="text-2xl font-bold text-green-700">€23.50</p>
              <p className="text-green-600 text-xs">t.o.v. ongeoptimaliseerd</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-600 font-medium">Tijd besparing</p>
              <p className="text-2xl font-bold text-blue-700">18 min</p>
              <p className="text-blue-600 text-xs">per route cyclus</p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-purple-600 font-medium">CO₂ reductie</p>
              <p className="text-2xl font-bold text-purple-700">2.3 kg</p>
              <p className="text-purple-600 text-xs">per dag</p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-orange-600 font-medium">Efficiency</p>
              <p className="text-2xl font-bold text-orange-700">94%</p>
              <p className="text-orange-600 text-xs">gemiddeld</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}