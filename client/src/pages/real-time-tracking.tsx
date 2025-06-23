import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Phone, MessageCircle, Star, Clock, MapPin, Package, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import EmbeddedOpenStreetMap from "@/components/embedded-openstreetmap";
import BottomNavigation from "@/components/bottom-navigation";

interface TrackingProps {
  params: {
    id: string;
  };
}

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timestamp?: Date;
  estimated?: Date;
  icon: React.ComponentType<any>;
}

interface LiveDriver {
  id: number;
  name: string;
  rating: number;
  vehicleType: string;
  licensePlate: string;
  photo: string;
  phone: string;
  location: { lat: number; lng: number };
  eta: number;
}

export default function RealTimeTracking({ params }: TrackingProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [driverLocation, setDriverLocation] = useState({ lat: 52.3676, lng: 4.9041 });
  const [eta, setEta] = useState(15);

  // Mock driver data
  const driver: LiveDriver = {
    id: 1,
    name: "Marco van der Berg",
    rating: 4.8,
    vehicleType: "Bakfiets",
    licensePlate: "BF-123-X",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco",
    phone: "+31 6 12345678",
    location: driverLocation,
    eta: eta
  };

  // Tracking steps
  const steps: TrackingStep[] = [
    {
      id: "assigned",
      title: "Bezorger toegewezen",
      description: `${driver.name} komt je pakket ophalen`,
      completed: true,
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      icon: User
    },
    {
      id: "pickup",
      title: "Onderweg naar ophaallocatie",
      description: "Je bezorger is onderweg",
      completed: currentStep >= 1,
      timestamp: currentStep >= 1 ? new Date(Date.now() - 5 * 60 * 1000) : undefined,
      estimated: new Date(Date.now() + 10 * 60 * 1000),
      icon: MapPin
    },
    {
      id: "collected",
      title: "Pakket opgehaald",
      description: "Je pakket is opgehaald en onderweg",
      completed: currentStep >= 2,
      timestamp: currentStep >= 2 ? new Date(Date.now() - 2 * 60 * 1000) : undefined,
      icon: Package
    },
    {
      id: "delivery",
      title: "Onderweg naar bestemming",
      description: "Je pakket wordt bezorgd",
      completed: currentStep >= 3,
      timestamp: currentStep >= 3 ? new Date(Date.now() - 1 * 60 * 1000) : undefined,
      estimated: new Date(Date.now() + 5 * 60 * 1000),
      icon: Clock
    },
    {
      id: "delivered",
      title: "Bezorging voltooid",
      description: "Je pakket is succesvol bezorgd",
      completed: currentStep >= 4,
      timestamp: currentStep >= 4 ? new Date() : undefined,
      icon: CheckCircle
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate driver movement
      setDriverLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));

      // Update ETA
      setEta(prev => Math.max(1, prev - Math.random() * 0.5));

      // Progress through steps
      if (currentStep < 4 && Math.random() > 0.95) {
        setCurrentStep(prev => prev + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentStep]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStepColor = (step: TrackingStep, index: number) => {
    if (step.completed) return "text-green-600";
    if (index === currentStep) return "text-brand-blue";
    return "text-gray-400";
  };

  const getStepBgColor = (step: TrackingStep, index: number) => {
    if (step.completed) return "bg-green-600";
    if (index === currentStep) return "bg-brand-blue";
    return "bg-gray-300";
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Volg je bezorging</h1>
            <p className="text-sm text-gray-600">SP240623001</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Live tracking
        </Badge>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <EmbeddedOpenStreetMap 
          height="100%"
          driverLocation={driver.location}
          pickupLocation={{ lat: 52.3676, lng: 4.9041 }}
          deliveryLocation={{ lat: 52.3500, lng: 4.9500 }}
          enableRealTimeTracking={true}
        />
        
        {/* ETA Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-brand-blue">{Math.round(eta)} min</p>
                  <p className="text-sm text-gray-600">Geschatte aankomst</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Stap {currentStep + 1} van {steps.length}</p>
                  <Progress value={progress} className="w-20 h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bg-white border-t p-4 max-h-80 overflow-y-auto">
        {/* Driver Info */}
        <Card className="mb-4 border-brand-blue/20 bg-brand-blue-light/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <img 
                src={driver.photo} 
                alt={driver.name}
                className="w-12 h-12 rounded-full bg-gray-200"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{driver.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{driver.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{driver.vehicleType} • {driver.licensePlate}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="w-10 h-10 p-0">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Bezorgstatus</h3>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepBgColor(step, index)}`}>
                  <Icon className={`h-4 w-4 text-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${getStepColor(step, index)}`}>
                      {step.title}
                    </p>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">
                        {formatTime(step.timestamp)}
                      </span>
                    )}
                    {!step.completed && step.estimated && (
                      <span className="text-xs text-gray-500">
                        ~{formatTime(step.estimated)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {index === currentStep && !step.completed && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-brand-blue rounded-full animate-pulse"></div>
                        <span className="text-xs text-brand-blue font-medium">In behandeling</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery completed actions */}
        {currentStep >= 4 && (
          <div className="mt-6 space-y-3">
            <Button className="w-full bg-green-600 text-white">
              <Star className="h-4 w-4 mr-2" />
              Beoordeel je bezorger
            </Button>
            <Button variant="outline" className="w-full">
              Bestel opnieuw
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation onNavigate={setLocation} />
    </div>
  );
}