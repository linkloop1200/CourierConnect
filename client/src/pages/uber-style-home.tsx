import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Package, Clock, MapPin, Search, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import EmbeddedOpenStreetMap from "@/components/embedded-openstreetmap";
import BottomNavigation from "@/components/bottom-navigation";
import RoleSwitcher from "@/components/role-switcher";
import { useUserRole } from "@/hooks/useUserRole";
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
  const { currentRole, isCustomer, isDriver, isAdmin } = useUserRole();
  const [pickup, setPickup] = useState<UberStyleLocation | null>(null);
  const [delivery, setDelivery] = useState<UberStyleLocation | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
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

  // Start GPS tracking for driver location
  useEffect(() => {
    if (isDriver && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('GPS error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isDriver]);

  // Get address suggestions
  const getAddressSuggestions = async (query: string): Promise<Array<{
    id: string;
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  }>> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Netherlands')}&limit=5&addressdetails=1`, {
        headers: {
          'User-Agent': 'Spoedpakketjes/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        return data.map((item: any, index: number) => ({
          id: `suggestion-${index}`,
          name: item.display_name.split(',')[0],
          address: item.display_name,
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }
        }));
      }
    } catch (error) {
      console.error('Address suggestions error:', error);
    }
    return [];
  };

  // Geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Amsterdam, Netherlands')}&limit=1&addressdetails=1`, {
        headers: {
          'User-Agent': 'Spoedpakketjes/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      // Try without Amsterdam restriction if no results
      const fallbackResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`, {
        headers: {
          'User-Agent': 'Spoedpakketjes/1.0'
        }
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          return {
            lat: parseFloat(fallbackData[0].lat),
            lng: parseFloat(fallbackData[0].lon)
          };
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  // Debounce for address input
  const [addressTimeout, setAddressTimeout] = useState<NodeJS.Timeout | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{
    id: string;
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Handle search input and get suggestions
  const handleSearchInput = (query: string) => {
    setSearchValue(query);
    
    if (addressTimeout) {
      clearTimeout(addressTimeout);
    }

    if (query.length > 2) {
      setShowSuggestions(true);
      const timeout = setTimeout(async () => {
        try {
          const suggestions = await getAddressSuggestions(query);
          setAddressSuggestions(suggestions);
        } catch (error) {
          console.error('Address search error:', error);
        }
      }, 300); // 300ms debounce voor suggesties
      
      setAddressTimeout(timeout);
    } else {
      setShowSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  // Calculate price estimate based on distance
  const calculateEstimate = (pickup?: { lat: number; lng: number }, delivery?: { lat: number; lng: number }) => {
    if (pickup && delivery) {
      // Simple distance calculation (Haversine formula)
      const R = 6371; // Earth's radius in km
      const dLat = (delivery.lat - pickup.lat) * Math.PI / 180;
      const dLon = (delivery.lng - pickup.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(pickup.lat * Math.PI / 180) * Math.cos(delivery.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Calculate price (base €5 + €2 per km)
      const price = (5 + distance * 2).toFixed(2);
      const time = Math.max(15, Math.round(distance * 3 + 10)); // minimum 15 min
      
      setEstimate({ price: `€${price}`, time: `${time} min` });
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    const location: UberStyleLocation = {
      id: `suggestion-${Date.now()}`,
      name: suggestion.name,
      address: suggestion.address,
      type: 'recent',
      coordinates: suggestion.coordinates
    };
    
    if (showLocationPicker === 'pickup') {
      // Set pickup location and return to main screen
      setPickup(location);
    } else if (showLocationPicker === 'delivery') {
      // Set delivery location and return to main screen
      setDelivery(location);
      // Don't calculate automatically - wait for user to click calculate button
    }
    
    // Clear search and suggestions
    setSearchValue('');
    setShowSuggestions(false);
    
    // Return to main screen
    setShowLocationPicker(null);
  };

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

  // Don't auto-calculate - wait for user button click

  const handleLocationSelect = (location: UberStyleLocation) => {
    if (showLocationPicker === 'pickup') {
      setPickup(location);
    } else if (showLocationPicker === 'delivery') {
      setDelivery(location);
      // Don't calculate automatically - wait for user to click calculate button
    }
    setShowLocationPicker(null);
  };

  // Manual calculation trigger - show service selection
  const handleCalculateEstimate = () => {
    if (pickup?.coordinates && delivery?.coordinates) {
      calculateEstimate(pickup.coordinates, delivery.coordinates);
      setShowServiceSelection(true);
    }
  };

  const [showServiceSelection, setShowServiceSelection] = useState(false);

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

        {/* Search with Autocomplete */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Zoek een adres..."
              className="pl-10 h-12 bg-gray-50 border-none"
              value={searchValue}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => {
                if (searchValue.length > 2) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking
                setTimeout(() => setShowSuggestions(false), 300);
              }}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                        <div className="text-sm text-gray-500 truncate">{suggestion.address}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 text-center">
          <p className="text-gray-500">Typ een adres om suggesties te zien</p>
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
          driverLocation={driverLocation}
          enableRealTimeTracking={isDriver}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm p-4 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📦</span>
            </div>
            <h1 className="text-xl font-bold text-brand-blue">Spoedpakketjes</h1>
          </div>
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

            {/* Calculate button - always visible */}
            {!showServiceSelection && (
              <div className="mt-4">
                <Button 
                  className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold"
                  onClick={handleCalculateEstimate}
                  disabled={!pickup || !delivery}
                >
                  Berekenen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Selection - connected to navigation bar */}
      {showServiceSelection && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-6 pb-24">
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

            {/* Role-based Quick Access */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {isCustomer && "Andere diensten"}
                {isDriver && "Bezorger functies"}
                {isAdmin && "Beheer functies"}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {isCustomer && (
                  <>
                    <Button 
                      variant="outline"
                      className="h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50"
                      onClick={() => setLocation("/payment")}
                    >
                      <div className="text-xl">💳</div>
                      <span className="text-xs">Betaling</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 flex flex-col space-y-1 border-red-200 hover:bg-red-50"
                      onClick={() => setLocation("/activity")}
                    >
                      <div className="text-xl">📊</div>
                      <span className="text-xs">Activiteit</span>
                    </Button>
                  </>
                )}
                {isDriver && (
                  <>
                    <Button 
                      variant="outline"
                      className="h-16 flex flex-col space-y-1 border-green-200 hover:bg-green-50"
                      onClick={() => setLocation("/driver")}
                    >
                      <div className="text-xl">👨‍💼</div>
                      <span className="text-xs">Dashboard</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 flex flex-col space-y-1 border-orange-200 hover:bg-orange-50"
                      onClick={() => setLocation("/routing")}
                    >
                      <div className="text-xl">🗺️</div>
                      <span className="text-xs">Routes</span>
                    </Button>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Button 
                      variant="outline"
                      className="h-16 flex flex-col space-y-1 border-orange-200 hover:bg-orange-50"
                      onClick={() => setLocation("/routing")}
                    >
                      <div className="text-xl">🗺️</div>
                      <span className="text-xs">Route planning</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50"
                      onClick={() => setLocation("/payment")}
                    >
                      <div className="text-xl">💳</div>
                      <span className="text-xs">Betalingen</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 flex flex-col space-y-1 border-green-200 hover:bg-green-50"
                      onClick={() => setLocation("/driver")}
                    >
                      <div className="text-xl">👨‍💼</div>
                      <span className="text-xs">Bezorgers</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 flex flex-col space-y-1 border-red-200 hover:bg-red-50"
                      onClick={() => setLocation("/activity")}
                    >
                      <div className="text-xl">📊</div>
                      <span className="text-xs">Analytics</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Switcher */}
      <RoleSwitcher />

      <BottomNavigation onNavigate={setLocation} />
    </div>
  );
}