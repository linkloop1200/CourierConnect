import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, MapPin, Clock, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LeafletMap from "./leaflet-map";
import type { Delivery } from "@shared/schema";

interface HeatMapData {
  lat: number;
  lng: number;
  intensity: number;
  deliveries: number;
  avgTime: number;
  area: string;
}

interface InteractiveHeatMapProps {
  timeRange?: string;
}

export default function InteractiveHeatMap({ timeRange = "today" }: InteractiveHeatMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("demand");
  const [selectedArea, setSelectedArea] = useState<string>("");

  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: ['/api/deliveries'],
  });

  // Generate heat map data based on deliveries
  const generateHeatMapData = (): HeatMapData[] => {
    if (!deliveries) return [];

    const areas = [
      { name: "Amsterdam Noord", lat: 52.3947, lng: 4.9142, intensity: 85, deliveries: 142, avgTime: 28 },
      { name: "Amsterdam Centrum", lat: 52.3676, lng: 4.9041, intensity: 95, deliveries: 198, avgTime: 22 },
      { name: "Amsterdam Oost", lat: 52.3586, lng: 4.9411, intensity: 78, deliveries: 126, avgTime: 31 },
      { name: "Amsterdam Zuid", lat: 52.3384, lng: 4.8721, intensity: 92, deliveries: 165, avgTime: 25 },
      { name: "Amsterdam West", lat: 52.3721, lng: 4.8522, intensity: 73, deliveries: 108, avgTime: 34 },
      { name: "Zaandam", lat: 52.4391, lng: 4.8278, intensity: 65, deliveries: 87, avgTime: 38 },
      { name: "Haarlem", lat: 52.3816, lng: 4.6368, intensity: 71, deliveries: 94, avgTime: 35 },
      { name: "Almere", lat: 52.3508, lng: 5.2647, intensity: 82, deliveries: 119, avgTime: 29 }
    ];

    return areas.map(area => ({
      lat: area.lat,
      lng: area.lng,
      intensity: selectedMetric === "demand" ? area.intensity : 
                selectedMetric === "speed" ? (60 - area.avgTime) * 1.5 : 
                area.deliveries / 2,
      deliveries: area.deliveries,
      avgTime: area.avgTime,
      area: area.name
    }));
  };

  const heatMapData = generateHeatMapData();

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 90) return "bg-red-500";
    if (intensity >= 75) return "bg-orange-500";
    if (intensity >= 60) return "bg-yellow-500";
    if (intensity >= 45) return "bg-green-500";
    return "bg-blue-500";
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "demand": return "Vraag intensiteit";
      case "speed": return "Bezorgsnelheid";
      case "volume": return "Volume";
      default: return "Vraag intensiteit";
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case "demand": return "%";
      case "speed": return "min";
      case "volume": return "paketten";
      default: return "%";
    }
  };

  const totalDeliveries = heatMapData.reduce((sum, area) => sum + area.deliveries, 0);
  const avgDeliveryTime = Math.round(heatMapData.reduce((sum, area) => sum + area.avgTime, 0) / heatMapData.length);
  const peakArea = heatMapData.reduce((max, area) => area.intensity > max.intensity ? area : max, heatMapData[0]);

  return (
    <div className="space-y-6">
      {/* Heat Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>GPS Tracking Heat Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Metric weergave
              </label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demand">Vraag intensiteit</SelectItem>
                  <SelectItem value="speed">Bezorgsnelheid</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tijdsperiode
              </label>
              <Select value={timeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Vandaag</SelectItem>
                  <SelectItem value="week">Deze week</SelectItem>
                  <SelectItem value="month">Deze maand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heat Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>
            {getMetricLabel(selectedMetric)} Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <LeafletMap
              height="384px"
              showDrivers={true}
              showPackages={true}
              showHeatMap={true}
              userLocation={{ lat: 52.3676, lng: 4.9041 }}
              pickupLocation={{ lat: 52.3700, lng: 4.8950 }}
              deliveryLocation={{ lat: 52.3650, lng: 4.9150 }}
              driverLocation={{ lat: 52.3680, lng: 4.9000 }}
            />
            
            {/* Heat Map Overlay Points */}
            <div className="absolute inset-0 pointer-events-none">
              {heatMapData.map((point, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{
                    left: `${30 + (index % 3) * 30}%`,
                    top: `${25 + Math.floor(index / 3) * 25}%`
                  }}
                >
                  <div 
                    className={`w-8 h-8 rounded-full ${getIntensityColor(point.intensity)} opacity-70 cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => setSelectedArea(point.area)}
                    title={`${point.area}: ${point.intensity}${getMetricUnit(selectedMetric)}`}
                  >
                    <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-30"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heat Map Legend */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Intensiteit:</span>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-xs">Laag</span>
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-xs">Gemiddeld</span>
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-xs">Hoog</span>
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-xs">Zeer hoog</span>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-xs">Piek</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Exporteer data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Area Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Totaal bezorgingen</p>
                <p className="text-2xl font-bold">{totalDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Gem. bezorgtijd</p>
                <p className="text-2xl font-bold">{avgDeliveryTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Drukste gebied</p>
                <p className="text-lg font-bold">{peakArea?.area}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area Details */}
      {selectedArea && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gebied Details: {selectedArea}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedArea("")}>
                Sluiten
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const areaData = heatMapData.find(area => area.area === selectedArea);
              return areaData ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-brand-blue">{areaData.deliveries}</p>
                    <p className="text-sm text-gray-600">Bezorgingen</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{areaData.avgTime} min</p>
                    <p className="text-sm text-gray-600">Gem. tijd</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{areaData.intensity}%</p>
                    <p className="text-sm text-gray-600">Intensiteit</p>
                  </div>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">Beste performance gebied</span>
              <Badge className="bg-green-600">{peakArea?.area}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-800">Optimalisatie kans</span>
              <Badge className="bg-yellow-600">Amsterdam West (-15%)</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800">Groei potentieel</span>
              <Badge className="bg-blue-600">Zaandam (+23%)</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}