import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Brain, TrendingUp, AlertTriangle, CheckCircle, MapPin, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Delivery, Driver } from "@shared/schema";

interface ArrivalPrediction {
  deliveryId: number;
  originalETA: Date;
  predictedETA: Date;
  confidence: number;
  factors: {
    traffic: { impact: number; description: string };
    weather: { impact: number; description: string };
    driverHistory: { impact: number; description: string };
    routeComplexity: { impact: number; description: string };
    timeOfDay: { impact: number; description: string };
  };
  accuracy: number;
  lastUpdated: Date;
  status: 'on_time' | 'delayed' | 'early' | 'uncertain';
}

interface PredictionMetrics {
  totalPredictions: number;
  averageAccuracy: number;
  onTimeRate: number;
  earlyRate: number;
  delayedRate: number;
  averageDelay: number;
}

export default function SmartArrivalPredictor() {
  const [predictions, setPredictions] = useState<ArrivalPrediction[]>([]);
  const [metrics, setMetrics] = useState<PredictionMetrics>({
    totalPredictions: 0,
    averageAccuracy: 0,
    onTimeRate: 0,
    earlyRate: 0,
    delayedRate: 0,
    averageDelay: 0
  });
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);

  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: ['/api/deliveries'],
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
  });

  // Initialize prediction data
  useEffect(() => {
    const mockPredictions: ArrivalPrediction[] = [
      {
        deliveryId: 1,
        originalETA: new Date(Date.now() + 25 * 60 * 1000),
        predictedETA: new Date(Date.now() + 28 * 60 * 1000),
        confidence: 87,
        factors: {
          traffic: { impact: -3, description: "Lichte vertraging door verkeer" },
          weather: { impact: 0, description: "Helder weer, geen impact" },
          driverHistory: { impact: +2, description: "Chauffeur is meestal sneller" },
          routeComplexity: { impact: -1, description: "Standaard route" },
          timeOfDay: { impact: -1, description: "Spitsuur effect" }
        },
        accuracy: 92,
        lastUpdated: new Date(),
        status: 'delayed'
      },
      {
        deliveryId: 2,
        originalETA: new Date(Date.now() + 15 * 60 * 1000),
        predictedETA: new Date(Date.now() + 12 * 60 * 1000),
        confidence: 94,
        factors: {
          traffic: { impact: +3, description: "Vrije wegen" },
          weather: { impact: 0, description: "Goede weersomstandigheden" },
          driverHistory: { impact: +2, description: "Ervaren chauffeur" },
          routeComplexity: { impact: 0, description: "Bekende route" },
          timeOfDay: { impact: +1, description: "Rustig tijdstip" }
        },
        accuracy: 96,
        lastUpdated: new Date(),
        status: 'early'
      },
      {
        deliveryId: 3,
        originalETA: new Date(Date.now() + 35 * 60 * 1000),
        predictedETA: new Date(Date.now() + 35 * 60 * 1000),
        confidence: 91,
        factors: {
          traffic: { impact: 0, description: "Normale verkeersdrukte" },
          weather: { impact: 0, description: "Stabiele omstandigheden" },
          driverHistory: { impact: 0, description: "Gemiddelde prestatie" },
          routeComplexity: { impact: 0, description: "Standaard complexiteit" },
          timeOfDay: { impact: 0, description: "Normale uren" }
        },
        accuracy: 88,
        lastUpdated: new Date(),
        status: 'on_time'
      }
    ];

    const mockMetrics: PredictionMetrics = {
      totalPredictions: 1247,
      averageAccuracy: 89.4,
      onTimeRate: 68.2,
      earlyRate: 18.7,
      delayedRate: 13.1,
      averageDelay: 4.3
    };

    setPredictions(mockPredictions);
    setMetrics(mockMetrics);
  }, [deliveries]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPredictions(prev => prev.map(prediction => {
        // Simulate small confidence adjustments
        const confidenceChange = (Math.random() - 0.5) * 2;
        const newConfidence = Math.max(70, Math.min(98, prediction.confidence + confidenceChange));
        
        // Simulate ETA adjustments based on real-time factors
        const etaAdjustment = (Math.random() - 0.5) * 120000; // ±2 minutes
        const newPredictedETA = new Date(prediction.predictedETA.getTime() + etaAdjustment);
        
        return {
          ...prediction,
          confidence: Math.round(newConfidence),
          predictedETA: newPredictedETA,
          lastUpdated: new Date()
        };
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_time': return 'bg-green-100 text-green-800';
      case 'early': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_time': return <CheckCircle className="h-4 w-4" />;
      case 'early': return <TrendingUp className="h-4 w-4" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_time': return 'Op tijd';
      case 'early': return 'Vroeger';
      case 'delayed': return 'Vertraagd';
      default: return 'Onzeker';
    }
  };

  const formatTimeRemaining = (eta: Date) => {
    const now = new Date();
    const diff = eta.getTime() - now.getTime();
    const minutes = Math.round(diff / 60000);
    
    if (minutes < 0) return 'Verlopen';
    if (minutes === 0) return 'Nu';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}u ${remainingMinutes}m`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateTimeDifference = (original: Date, predicted: Date) => {
    const diff = predicted.getTime() - original.getTime();
    const minutes = Math.round(diff / 60000);
    
    if (minutes === 0) return 'Geen wijziging';
    if (minutes > 0) return `+${minutes} min`;
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Smart Aankomst Voorspelling</span>
            <Badge className="bg-purple-100 text-purple-800">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.totalPredictions}</div>
              <div className="text-sm text-gray-600">Totaal voorspellingen</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getConfidenceColor(metrics.averageAccuracy)}`}>
                {metrics.averageAccuracy}%
              </div>
              <div className="text-sm text-gray-600">Gem. nauwkeurigheid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.onTimeRate}%</div>
              <div className="text-sm text-gray-600">Op tijd</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.earlyRate}%</div>
              <div className="text-sm text-gray-600">Te vroeg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.delayedRate}%</div>
              <div className="text-sm text-gray-600">Vertraagd</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Predictions */}
      <div className="space-y-4">
        {predictions.map(prediction => (
          <Card 
            key={prediction.deliveryId}
            className={`cursor-pointer transition-all ${
              selectedDelivery === prediction.deliveryId ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setSelectedDelivery(
              selectedDelivery === prediction.deliveryId ? null : prediction.deliveryId
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Car className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Bezorging #{prediction.deliveryId}</h3>
                    <p className="text-sm text-gray-600">
                      Laatste update: {prediction.lastUpdated.toLocaleTimeString('nl-NL')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(prediction.status)}>
                    {getStatusIcon(prediction.status)}
                    <span className="ml-1">{getStatusText(prediction.status)}</span>
                  </Badge>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatTimeRemaining(prediction.predictedETA)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {calculateTimeDifference(prediction.originalETA, prediction.predictedETA)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence & ETA */}
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Betrouwbaarheid</span>
                    <span className={`text-sm font-bold ${getConfidenceColor(prediction.confidence)}`}>
                      {prediction.confidence}%
                    </span>
                  </div>
                  <Progress value={prediction.confidence} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Nauwkeurigheid historisch</span>
                    <span className={`text-sm font-bold ${getConfidenceColor(prediction.accuracy)}`}>
                      {prediction.accuracy}%
                    </span>
                  </div>
                  <Progress value={prediction.accuracy} className="h-2" />
                </div>
              </div>

              {/* ETA Comparison */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Originele ETA</div>
                    <div className="font-medium">{prediction.originalETA.toLocaleTimeString('nl-NL')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Voorspelde ETA</div>
                    <div className="font-medium text-purple-600">
                      {prediction.predictedETA.toLocaleTimeString('nl-NL')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedDelivery === prediction.deliveryId && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>AI Factoren Analyse</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {Object.entries(prediction.factors).map(([factor, data]) => (
                      <div key={factor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium capitalize text-sm">
                            {factor === 'traffic' ? 'Verkeer' :
                             factor === 'weather' ? 'Weer' :
                             factor === 'driverHistory' ? 'Chauffeur Historie' :
                             factor === 'routeComplexity' ? 'Route Complexiteit' :
                             'Tijdstip'}
                          </div>
                          <div className="text-xs text-gray-600">{data.description}</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`text-sm font-bold ${
                            data.impact > 0 ? 'text-green-600' :
                            data.impact < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {data.impact > 0 ? '+' : ''}{data.impact} min
                          </div>
                          <div className={`w-12 h-2 rounded-full ${
                            data.impact > 0 ? 'bg-green-200' :
                            data.impact < 0 ? 'bg-red-200' : 'bg-gray-200'
                          }`}>
                            <div 
                              className={`h-full rounded-full ${
                                data.impact > 0 ? 'bg-green-500' :
                                data.impact < 0 ? 'bg-red-500' : 'bg-gray-400'
                              }`}
                              style={{ 
                                width: `${Math.min(100, Math.abs(data.impact) * 20)}%`,
                                marginLeft: data.impact < 0 ? `${100 - Math.min(100, Math.abs(data.impact) * 20)}%` : '0'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      Bekijk route
                    </Button>
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Herbereken
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Algorithm Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Algoritme Prestaties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Voorspelling Nauwkeurigheid</span>
                <span>{metrics.averageAccuracy}%</span>
              </div>
              <Progress value={metrics.averageAccuracy} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{metrics.onTimeRate}%</div>
                <div className="text-xs text-green-700">Op tijd leveringen</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{metrics.earlyRate}%</div>
                <div className="text-xs text-blue-700">Vroege leveringen</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{metrics.delayedRate}%</div>
                <div className="text-xs text-red-700">Vertraagde leveringen</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              Gemiddelde vertraging: {metrics.averageDelay} minuten
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}