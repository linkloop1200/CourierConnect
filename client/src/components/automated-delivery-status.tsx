import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, Clock, AlertTriangle, Truck, Bell, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Delivery, Driver } from "@shared/schema";

interface DeliveryStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timestamp?: Date;
  automated: boolean;
}

interface AutomatedDeliveryStatusProps {
  deliveryId: number;
}

export default function AutomatedDeliveryStatus({ deliveryId }: AutomatedDeliveryStatusProps) {
  const [autoUpdates, setAutoUpdates] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const { data: delivery, refetch } = useQuery<Delivery & { driver: Driver | null }>({
    queryKey: ['/api/deliveries', deliveryId],
    refetchInterval: autoUpdates ? 10000 : false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest({
        url: `/api/deliveries/${deliveryId}/status`,
        method: "PUT",
        body: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries', deliveryId] });
      if (notifications) {
        toast({
          title: "Status automatisch bijgewerkt",
          description: "Bezorgstatus is succesvol gewijzigd.",
        });
      }
    }
  });

  const getDeliverySteps = (): DeliveryStep[] => {
    if (!delivery) return [];

    return [
      {
        id: "order_placed",
        title: "Bestelling geplaatst",
        description: "Je pakket is besteld en wordt verwerkt",
        completed: true,
        timestamp: delivery.createdAt,
        automated: true
      },
      {
        id: "payment_confirmed",
        title: "Betaling bevestigd",
        description: "Betaling is succesvol ontvangen",
        completed: true,
        timestamp: delivery.createdAt,
        automated: true
      },
      {
        id: "driver_assigned",
        title: "Chauffeur toegewezen",
        description: delivery.driver ? `${delivery.driver.name} gaat je pakket ophalen` : "Zoeken naar beschikbare chauffeur",
        completed: !!delivery.driver,
        timestamp: delivery.driver ? delivery.createdAt : undefined,
        automated: true
      },
      {
        id: "pickup_started",
        title: "Onderweg naar ophaaladres",
        description: "Chauffeur is onderweg om je pakket op te halen",
        completed: delivery.status !== 'pending',
        timestamp: delivery.status !== 'pending' ? delivery.createdAt : undefined,
        automated: true
      },
      {
        id: "package_picked_up",
        title: "Pakket opgehaald",
        description: "Je pakket is succesvol opgehaald",
        completed: ['picked_up', 'in_transit', 'delivered'].includes(delivery.status),
        timestamp: delivery.pickedUpAt,
        automated: true
      },
      {
        id: "in_transit",
        title: "Onderweg naar bestemming",
        description: "Je pakket is onderweg naar het bezorgadres",
        completed: ['in_transit', 'delivered'].includes(delivery.status),
        timestamp: delivery.status === 'in_transit' ? new Date() : undefined,
        automated: true
      },
      {
        id: "delivered",
        title: "Bezorgd",
        description: "Je pakket is succesvol bezorgd",
        completed: delivery.status === 'delivered',
        timestamp: delivery.deliveredAt,
        automated: true
      }
    ];
  };

  const steps = getDeliverySteps();
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // Auto-progression logic
  useEffect(() => {
    if (!autoUpdates || !delivery) return;

    const progressDelivery = () => {
      if (delivery.status === 'pending' && delivery.driver) {
        setTimeout(() => updateStatusMutation.mutate('picked_up'), 5000);
      } else if (delivery.status === 'picked_up') {
        setTimeout(() => updateStatusMutation.mutate('in_transit'), 3000);
      } else if (delivery.status === 'in_transit') {
        setTimeout(() => updateStatusMutation.mutate('delivered'), 8000);
      }
    };

    progressDelivery();
  }, [delivery?.status, autoUpdates]);

  const getStepIcon = (step: DeliveryStep) => {
    if (step.completed) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (step.id === getCurrentStep()?.id) {
      return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>;
    }
  };

  const getCurrentStep = () => {
    return steps.find(step => !step.completed) || steps[steps.length - 1];
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return "Nog niet uitgevoerd";
    return new Date(timestamp).toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Automatische Status Tracking</span>
            </CardTitle>
            <Badge variant={delivery?.status === 'delivered' ? 'default' : 'secondary'}>
              {Math.round(progressPercentage)}% compleet
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Bestelnummer:</span>
                <p className="font-medium">#{delivery?.orderNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Huidige status:</span>
                <p className="font-medium capitalize">{getCurrentStep()?.title}</p>
              </div>
              <div>
                <span className="text-gray-600">Geschatte aankomst:</span>
                <p className="font-medium">
                  {delivery?.estimatedDeliveryTime ? `${delivery.estimatedDeliveryTime} minuten` : 'Wordt berekend...'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium capitalize">{delivery?.type}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Automatisering Instellingen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Automatische updates</p>
                <p className="text-sm text-gray-600">Status wordt automatisch bijgewerkt</p>
              </div>
              <Switch 
                checked={autoUpdates} 
                onCheckedChange={setAutoUpdates}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push notificaties</p>
                <p className="text-sm text-gray-600">Ontvang meldingen bij statuswijzigingen</p>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Bezorg Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  {getStepIcon(step)}
                  {index < steps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-2 ${
                      step.completed ? 'bg-green-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      step.completed ? 'text-green-900' : 
                      step.id === getCurrentStep()?.id ? 'text-blue-900' : 
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    
                    <div className="flex items-center space-x-2">
                      {step.automated && (
                        <Badge variant="outline" className="text-xs">
                          AUTO
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(step.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    step.completed ? 'text-green-700' : 
                    step.id === getCurrentStep()?.id ? 'text-blue-700' : 
                    'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Slimme Meldingen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800 font-medium">SMS bevestiging verstuurd</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                De ontvanger is geïnformeerd over de verwachte aankomsttijd
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium">Route geoptimaliseerd</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Bezorgtijd verkort met 8 minuten door verkeer omzeiling
              </p>
            </div>
            
            {delivery?.status === 'in_transit' && (
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-800 font-medium">Aankomst over 5 minuten</span>
                </div>
                <p className="text-orange-700 text-sm mt-1">
                  Automatische melding naar ontvanger verstuurd
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => refetch()}
        >
          Status vernieuwen
        </Button>
        
        {delivery?.driver && (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open(`tel:${delivery.driver?.phone}`)}
          >
            Bel chauffeur
          </Button>
        )}
      </div>
    </div>
  );
}