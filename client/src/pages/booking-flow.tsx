import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Package, User, Phone, MessageCircle, Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import EmbeddedOpenStreetMap from "@/components/embedded-openstreetmap";
import type { InsertDelivery } from "@shared/schema";

interface BookingFlowProps {
  params: {
    pickup?: string;
    delivery?: string;
    service?: string;
  };
}

interface DeliveryDriver {
  id: number;
  name: string;
  rating: number;
  completedDeliveries: number;
  vehicleType: string;
  licensePlate: string;
  photo: string;
  eta: number;
  location: { lat: number; lng: number };
}

export default function BookingFlow({ params }: BookingFlowProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'details' | 'searching' | 'assigned' | 'tracking'>('details');
  const [assignedDriver, setAssignedDriver] = useState<DeliveryDriver | null>(null);
  const [deliveryId, setDeliveryId] = useState<number | null>(null);
  const [packageDetails, setPackageDetails] = useState({
    description: '',
    recipientName: '',
    recipientPhone: '',
    notes: ''
  });

  // Mock driver data (would come from API in real app)
  const mockDrivers: DeliveryDriver[] = [
    {
      id: 1,
      name: "Marco van der Berg",
      rating: 4.8,
      completedDeliveries: 1247,
      vehicleType: "Bakfiets",
      licensePlate: "BF-123-X",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco",
      eta: 8,
      location: { lat: 52.3676, lng: 4.9041 }
    },
    {
      id: 2,
      name: "Sarah Jansen",
      rating: 4.9,
      completedDeliveries: 892,
      vehicleType: "Scooter",
      licensePlate: "SC-456-Y",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      eta: 12,
      location: { lat: 52.3700, lng: 4.9100 }
    }
  ];

  const createDeliveryMutation = useMutation({
    mutationFn: async (data: InsertDelivery) => {
      const res = await apiRequest("POST", "/api/deliveries", data);
      return res.json();
    },
    onSuccess: (delivery) => {
      setDeliveryId(delivery.id);
      setStep('searching');
      
      // Simulate driver search and assignment
      setTimeout(() => {
        const randomDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
        setAssignedDriver(randomDriver);
        setStep('assigned');
        
        toast({
          title: "Bezorger gevonden!",
          description: `${randomDriver.name} komt je pakket ophalen`,
        });
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Fout bij boeken",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitDetails = () => {
    const deliveryData: InsertDelivery = {
      userId: 1,
      type: 'package',
      status: 'pending',
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
      estimatedPrice: "12.50",
      estimatedDeliveryTime: 45,
    };

    createDeliveryMutation.mutate(deliveryData);
  };

  const handleStartTracking = () => {
    if (deliveryId) {
      setLocation(`/tracking/${deliveryId}`);
    }
  };

  // Package details step
  if (step === 'details') {
    return (
      <div className="h-screen bg-white">
        {/* Header */}
        <div className="bg-white p-4 border-b flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/uber")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Pakket details</h1>
        </div>

        {/* Form */}
        <div className="p-4 space-y-6">
          {/* Package description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Wat verstuur je?
            </label>
            <Input
              placeholder="Bijv. documenten, kleine pakket, eten"
              value={packageDetails.description}
              onChange={(e) => setPackageDetails(prev => ({ ...prev, description: e.target.value }))}
              className="h-12"
            />
          </div>

          {/* Recipient details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Ontvanger gegevens</h3>
            
            <Input
              placeholder="Naam ontvanger"
              value={packageDetails.recipientName}
              onChange={(e) => setPackageDetails(prev => ({ ...prev, recipientName: e.target.value }))}
              className="h-12"
            />
            
            <Input
              placeholder="Telefoonnummer ontvanger"
              type="tel"
              value={packageDetails.recipientPhone}
              onChange={(e) => setPackageDetails(prev => ({ ...prev, recipientPhone: e.target.value }))}
              className="h-12"
            />
          </div>

          {/* Special instructions */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Speciale instructies (optioneel)
            </label>
            <Textarea
              placeholder="Bijv. bel aan bij de voordeur, laat bij de portier achter"
              value={packageDetails.notes}
              onChange={(e) => setPackageDetails(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Service summary */}
          <Card className="bg-brand-blue-light border-brand-blue/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-brand-blue">Spoedpakket Express</p>
                  <p className="text-sm text-brand-blue/80">Binnen 30 minuten</p>
                </div>
                <p className="text-lg font-bold text-brand-blue">€12.50</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button 
            className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold"
            onClick={handleSubmitDetails}
            disabled={!packageDetails.description || !packageDetails.recipientName || createDeliveryMutation.isPending}
          >
            {createDeliveryMutation.isPending ? "Bezig..." : "Bevestig bezorging"}
          </Button>
        </div>
      </div>
    );
  }

  // Searching for driver
  if (step === 'searching') {
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Map */}
        <div className="flex-1">
          <EmbeddedOpenStreetMap 
            height="100%"
            showDrivers={true}
            enableRealTimeTracking={true}
          />
        </div>

        {/* Searching overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Zoeken naar bezorger...</h3>
              <p className="text-gray-600">We zoeken de beste bezorger in je buurt</p>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Driver assigned
  if (step === 'assigned' && assignedDriver) {
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Map */}
        <div className="flex-1">
          <EmbeddedOpenStreetMap 
            height="100%"
            driverLocation={assignedDriver.location}
            enableRealTimeTracking={true}
          />
        </div>

        {/* Driver info */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6">
          <div className="space-y-6">
            {/* Driver card */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={assignedDriver.photo} 
                    alt={assignedDriver.name}
                    className="w-16 h-16 rounded-full bg-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-lg">{assignedDriver.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{assignedDriver.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{assignedDriver.vehicleType} • {assignedDriver.licensePlate}</p>
                    <p className="text-sm text-gray-500">{assignedDriver.completedDeliveries} bezorgingen</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{assignedDriver.eta} min</p>
                    <p className="text-sm text-gray-500">Verwacht</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" size="lg" className="flex-1">
                <Phone className="h-5 w-5 mr-2" />
                Bellen
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <MessageCircle className="h-5 w-5 mr-2" />
                Berichten
              </Button>
            </div>

            {/* Track button */}
            <Button 
              className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold"
              onClick={handleStartTracking}
            >
              Volg je bezorging
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}