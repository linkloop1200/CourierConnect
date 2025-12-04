import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Removed geocoding dependency - using mock data instead

interface AddressSuggestion {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  coordinates?: { lat: number; lng: number };
  recent?: boolean;
  favorite?: boolean;
  distance?: number;
}

interface AddressAutocompleteProps {
  placeholder?: string;
  onAddressSelect: (address: AddressSuggestion) => void;
  initialValue?: string;
  showRecentAddresses?: boolean;
}

export default function AddressAutocomplete({ 
  placeholder = "Voer adres in...", 
  onAddressSelect,
  initialValue = "",
  showRecentAddresses = true 
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mock recent and favorite addresses
  const recentAddresses: AddressSuggestion[] = [
    {
      id: "recent_1",
      address: "Damrak 70",
      city: "Amsterdam",
      postalCode: "1012 LM",
      coordinates: { lat: 52.3727, lng: 4.8936 },
      recent: true
    },
    {
      id: "recent_2", 
      address: "Vondelpark 1",
      city: "Amsterdam",
      postalCode: "1071 AA",
      coordinates: { lat: 52.3580, lng: 4.8686 },
      recent: true
    },
    {
      id: "favorite_1",
      address: "Anne Frank Huis, Prinsengracht 263",
      city: "Amsterdam", 
      postalCode: "1016 GV",
      coordinates: { lat: 52.3752, lng: 4.8840 },
      favorite: true
    }
  ];

  // Mock address database for Netherlands
  const mockAddresses: AddressSuggestion[] = [
    {
      id: "addr_1",
      address: "Museumplein 6",
      city: "Amsterdam",
      postalCode: "1071 DJ",
      coordinates: { lat: 52.3600, lng: 4.8852 }
    },
    {
      id: "addr_2",
      address: "Nieuwmarkt 4",
      city: "Amsterdam", 
      postalCode: "1011 HP",
      coordinates: { lat: 52.3727, lng: 4.9003 }
    },
    {
      id: "addr_3",
      address: "Kalverstraat 152",
      city: "Amsterdam",
      postalCode: "1012 XE", 
      coordinates: { lat: 52.3702, lng: 4.8906 }
    },
    {
      id: "addr_4",
      address: "Jordaan 45",
      city: "Amsterdam",
      postalCode: "1015 BK",
      coordinates: { lat: 52.3738, lng: 4.8799 }
    },
    {
      id: "addr_5",
      address: "Leidseplein 12",
      city: "Amsterdam",
      postalCode: "1017 PT",
      coordinates: { lat: 52.3644, lng: 4.8825 }
    },
    {
      id: "addr_6",
      address: "Centraal Station",
      city: "Amsterdam", 
      postalCode: "1012 AB",
      coordinates: { lat: 52.3791, lng: 4.9003 }
    },
    {
      id: "addr_7",
      address: "Grote Markt 1",
      city: "Haarlem",
      postalCode: "2011 RD",
      coordinates: { lat: 52.3816, lng: 4.6368 }
    },
    {
      id: "addr_8",
      address: "Korte Voorhout 7",
      city: "Den Haag",
      postalCode: "2511 CW", 
      coordinates: { lat: 52.0799, lng: 4.3113 }
    }
  ];

  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions(showRecentAddresses ? recentAddresses : []);
      return;
    }

    setIsLoading(true);
    
    try {
      // Filter mock addresses based on query
      const filteredAddresses = mockAddresses.filter(addr => 
        addr.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.postalCode.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Add mock coordinates for Amsterdam area
      const addressesWithCoords = filteredAddresses.map((addr) => {
        if (!addr.coordinates) {
          // Generate realistic Amsterdam coordinates
          return { 
            ...addr, 
            coordinates: { 
              lat: 52.3676 + (Math.random() - 0.5) * 0.1, 
              lng: 4.9041 + (Math.random() - 0.5) * 0.1 
            } 
          };
        }
        return addr;
      });

      // Combine with recent addresses if they match
      const matchingRecent = recentAddresses.filter(addr =>
        addr.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.city.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSuggestions([...matchingRecent, ...addressesWithCoords].slice(0, 8));
    } catch (error) {
      console.error("Address search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchAddresses(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setQuery(`${suggestion.address}, ${suggestion.city}`);
    setShowSuggestions(false);
    onAddressSelect(suggestion);
    
    // Save to recent addresses
    const updatedRecent = [suggestion, ...recentAddresses.filter(addr => addr.id !== suggestion.id)].slice(0, 5);
    localStorage.setItem('recentAddresses', JSON.stringify(updatedRecent));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Mock reverse geocoding
          const currentLocation: AddressSuggestion = {
            id: "current_location",
            address: "Huidige locatie",
            city: "Amsterdam", // Would be determined by reverse geocoding
            postalCode: "1012 AB",
            coordinates: coords
          };
          
          setQuery("Huidige locatie");
          onAddressSelect(currentLocation);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={handleCurrentLocation}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto border shadow-lg">
          <CardContent className="p-0">
            {isLoading && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                <span className="text-sm mt-2 block">Zoeken...</span>
              </div>
            )}

            {!isLoading && suggestions.length === 0 && query.length >= 2 && (
              <div className="p-4 text-center text-gray-500">
                <span className="text-sm">Geen adressen gevonden</span>
              </div>
            )}

            {!isLoading && suggestions.length === 0 && query.length < 2 && showRecentAddresses && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">Recent gebruikte adressen</p>
                {recentAddresses.map((addr, index) => (
                  <div
                    key={addr.id}
                    ref={el => suggestionRefs.current[index] = el}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => handleSuggestionClick(addr)}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{addr.address}</p>
                        <p className="text-xs text-gray-500">{addr.city}, {addr.postalCode}</p>
                      </div>
                    </div>
                    {addr.favorite && <Star className="h-4 w-4 text-yellow-500" />}
                  </div>
                ))}
              </div>
            )}

            {!isLoading && suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    ref={el => suggestionRefs.current[index] = el}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                      selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{suggestion.address}</p>
                        <p className="text-xs text-gray-500">
                          {suggestion.city}, {suggestion.postalCode}
                          {suggestion.distance && ` • ${suggestion.distance.toFixed(1)}km`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {suggestion.recent && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Recent
                        </Badge>
                      )}
                      {suggestion.favorite && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Favoriet
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}