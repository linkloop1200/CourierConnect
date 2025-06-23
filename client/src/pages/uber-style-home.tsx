import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Package, Clock, MapPin, Search, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import EmbeddedOpenStreetMap from "@/components/embedded-openstreetmap";
import type { Address, Driver } from "@shared/schema";

interface UberStyleLocation {
  id: string;
  name: string;
  address: string;
  type: 'current' | 'recent' | 'favorite';
  coordinates: { lat: number; lng: number };
}

export default function UberStyleHome() {
  const [, setLocation] = useLocation();
  const [pickup, setPickup] = useState<UberStyleLocation | null>(null);
  const [delivery, setDelivery] = useState<UberStyleLocation | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState<'pickup' | 'delivery' | null>(null);
  const [estimate, setEstimate] = useState<{ price: string; time: string } | null>(null);
  const [selectedService, setSelectedService] = useState<string>('standard');

  // Uber-style service types
  const services = [
    {
      id: 'express',
      name: 'Spoedpakket Express',
      description: 'Binnen 30 minuten',
      price: '€12-15',
      icon: '⚡',
      multiplier: 1.5
    },
    {
      id: 'standard',
      name: 'Spoedpakket',
      description: '45-60 minuten',
      price: '€8-12',
      icon: '📦',
      multiplier: 1.0
    },
    {
      id: 'eco',
      name: 'Spoedpakket Eco',
      description: '60-90 minuten',
      price: '€6-9',
      icon: '🌱',
      multiplier: 0.8
    }
  ];

  // Mock recent locations (Uber-style)
  const recentLocations: UberStyleLocation[] = [
    { id: '1', name: 'Thuis', address: 'Damrak 123, Amsterdam', type: 'recent', coordinates: { lat: 52.3676, lng: 4.9041 } },
    { id: '2', name: 'Werk', address: 'Zuidas 456, Amsterdam', type: 'recent', coordinates: { lat: 52.3676, lng: 4.9041 } },
    { id: '3', name: 'Centraal Station', address: 'Stationsplein 1, Amsterdam', type: 'recent', coordinates: { lat: 52.3676, lng: 4.9041 } }
  ];

  // Get current location (Uber-style)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLoc: UberStyleLocation = {
            id: 'current',
            name: 'Huidige locatie',
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            type: 'current',
            coordinates: { lat: latitude, lng: longitude }
          };
          setPickup(currentLoc);
        },
        () => {
          // Fallback to Amsterdam center
          const fallbackLoc: UberStyleLocation = {
            id: 'current',
            name: 'Amsterdam Centrum',
            address: 'Damrak, Amsterdam',
            type: 'current',
            coordinates: { lat: 52.3676, lng: 4.9041 }
          };
          setPickup(fallbackLoc);
        }
      );
    }
  };

  // Auto-set current location on load
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Calculate estimate when both locations are set
  useEffect(() => {
    if (pickup && delivery) {
      const service = services.find(s => s.id === selectedService);
      const basePrice = Math.floor(Math.random() * 4) + 8; // €8-12 base
      const finalPrice = Math.round(basePrice * (service?.multiplier || 1));
      const baseTime = Math.floor(Math.random() * 15) + 45; // 45-60 min base
      const finalTime = Math.round(baseTime / (service?.multiplier || 1));
      
      setEstimate({
        price: `€${finalPrice}`,
        time: `${finalTime} min`
      });
    }
  }, [pickup, delivery, selectedService]);

  const handleLocationSelect = (location: UberStyleLocation) => {
    if (showLocationPicker === 'pickup') {
      setPickup(location);
    } else if (showLocationPicker === 'delivery') {
      setDelivery(location);
    }
    setShowLocationPicker(null);
  };

  const handleBookDelivery = () => {
    if (pickup && delivery) {
      setLocation(`/delivery?pickup=${pickup.id}&delivery=${delivery.id}&service=${selectedService}`);
    }
  };

  // Show location picker overlay
  if (showLocationPicker) {
    return (
      <div className="h-screen bg-white">
        {/* Header */}
        <div className="bg-white p-4 border-b">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setShowLocationPicker(null)}>
              ←
            </Button>
            <h1 className="text-lg font-semibold">
              {showLocationPicker === 'pickup' ? 'Ophaallocatie' : 'Bezorglocatie'}
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Zoek een adres..."
              className="pl-10 h-12 bg-gray-50 border-none"
            />
          </div>
        </div>

        {/* Current location */}
        <div className="px-4 pb-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-4 text-left"
            onClick={() => {
              getCurrentLocation();
              setShowLocationPicker(null);
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium">Gebruik huidige locatie</p>
                <p className="text-sm text-gray-500">GPS locatie</p>
              </div>
            </div>
          </Button>
        </div>

        {/* Recent locations */}
        <div className="px-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recente locaties</h3>
          <div className="space-y-1">
            {recentLocations.map((location) => (
              <Button
                key={location.id}
                variant="ghost"
                className="w-full justify-start h-auto p-4 text-left"
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-gray-500">{location.address}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <EmbeddedOpenStreetMap 
          height="100vh"
          pickupLocation={pickup?.coordinates}
          deliveryLocation={delivery?.coordinates}
          enableRealTimeTracking={false}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-blue">Spoedpakketjes</h1>
          <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Location Inputs */}
      <div className="absolute top-20 left-4 right-4 z-20">
        <Card className="shadow-lg">
          <CardContent className="p-4 space-y-3">
            {/* Pickup */}
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3 text-left bg-gray-50 hover:bg-gray-100"
              onClick={() => setShowLocationPicker('pickup')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Ophalen van</p>
                  <p className="font-medium">{pickup?.name || 'Kies ophaallocatie'}</p>
                  {pickup && <p className="text-xs text-gray-500">{pickup.address}</p>}
                </div>
              </div>
            </Button>

            {/* Delivery */}
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3 text-left bg-gray-50 hover:bg-gray-100"
              onClick={() => setShowLocationPicker('delivery')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Bezorgen naar</p>
                  <p className="font-medium">{delivery?.name || 'Waar moet het naartoe?'}</p>
                  {delivery && <p className="text-xs text-gray-500">{delivery.address}</p>}
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Service Selection */}
      {pickup && delivery && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Kies je service</h3>
            
            <div className="space-y-3 mb-6">
              {services.map((service) => (
                <Button
                  key={service.id}
                  variant={selectedService === service.id ? "default" : "ghost"}
                  className={`w-full h-auto p-4 justify-between ${
                    selectedService === service.id ? 'bg-brand-blue text-white' : 'bg-gray-50'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div className="text-left">
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm opacity-80">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{estimate?.price || service.price}</p>
                    <p className="text-sm opacity-80">{estimate?.time || '45 min'}</p>
                  </div>
                </Button>
              ))}
            </div>

            <Button 
              className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold"
              onClick={handleBookDelivery}
            >
              Boek bezorging {estimate?.price && `• ${estimate.price}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}