import { useState, useEffect } from "react";
import { MapPin, Plus, Minus, Navigation, ExternalLink, Home, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EmbeddedOpenStreetMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
}

export default function EmbeddedOpenStreetMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false
}: EmbeddedOpenStreetMapProps) {
  const [zoom, setZoom] = useState(13);
  
  // Auto-zoom op ophaallocatie
  useEffect(() => {
    if (pickupLocation) {
      setZoom(15); // Zoom in naar niveau 15 voor betere detail
    } else {
      setZoom(13); // Terug naar overzicht niveau
    }
  }, [pickupLocation]);
  
  // Amsterdam center coordinates - altijd gefocust op Amsterdam
  const center = { lat: 52.3676, lng: 4.9041 };
  
  // Centreer op ophaallocatie als deze bestaat, anders Amsterdam centrum
  const mapCenter = pickupLocation ? pickupLocation : center;
  
  // Functie om echte coördinaten om te zetten naar kaart percentages
  const coordsToMapPosition = (lat: number, lng: number) => {
    // Gebruik exact dezelfde bounding box berekening als in getOsmUrl()
    const baseLatDiff = 0.055;
    const baseLngDiff = 0.10;
    const zoomMultiplier = Math.pow(0.5, zoom - 13);
    const latDiff = baseLatDiff * zoomMultiplier;
    const lngDiff = baseLngDiff * zoomMultiplier;
    
    const minLat = mapCenter.lat - latDiff;
    const maxLat = mapCenter.lat + latDiff;
    const minLng = mapCenter.lng - lngDiff;
    const maxLng = mapCenter.lng + lngDiff;
    
    // Converteer naar percentages (identiek aan iframe bounds)
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    // Beperk tot kaart gebied
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    return {
      left: `${clampedX}%`,
      top: `${clampedY}%`
    };
  };

  // Create OpenStreetMap iframe URL with dynamic zoom
  const getOsmUrl = () => {
    // Calculate bounding box based on zoom level
    const baseLatDiff = 0.055; // Base latitude difference
    const baseLngDiff = 0.10; // Base longitude difference
    
    // Higher zoom = smaller area visible
    const zoomMultiplier = Math.pow(0.5, zoom - 13); // Exponential scaling
    const latDiff = baseLatDiff * zoomMultiplier;
    const lngDiff = baseLngDiff * zoomMultiplier;
    
    const minLat = mapCenter.lat - latDiff;
    const maxLat = mapCenter.lat + latDiff;
    const minLng = mapCenter.lng - lngDiff;
    const maxLng = mapCenter.lng + lngDiff;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLng}&layer=mapnik`;
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 1, 17);
    setZoom(newZoom);
  };
  
  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 1, 10);
    setZoom(newZoom);
  };

  const openFullMap = () => {
    window.open(`https://www.openstreetmap.org/#map=${zoom}/${center.lat}/${center.lng}`, '_blank');
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-white" style={{ height }}>
      {/* OpenStreetMap iframe */}
      <iframe
        src={getOsmUrl()}
        className="w-full h-full transition-all duration-500 ease-in-out"
        style={{ border: 'none' }}
        title="OpenStreetMap van Amsterdam"
        loading="lazy"
        key={`osm-${zoom}-${pickupLocation?.lat}-${deliveryLocation?.lat}`}
      />
      
      {/* Overlay markers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* User location marker */}
        {userLocation && (
          <div 
            className="absolute w-10 h-10 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '50%', top: '50%' }}
            title="Jouw locatie"
          >
            <Home className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Pickup location - Huis icoon - Altijd in centrum wanneer gefocust */}
        {pickupLocation && (
          <div 
            className="absolute w-10 h-10 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '50%', top: '50%' }}
            title={pickupLocation.address || "Ophaallocatie"}
          >
            <Home className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Delivery location - Rood pakket icoon - Relatieve positie ten opzichte van pickup */}
        {deliveryLocation && pickupLocation && (
          <div 
            className="absolute w-10 h-10 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ 
              left: `${50 + (deliveryLocation.lng - pickupLocation.lng) * 1000}%`, 
              top: `${50 - (deliveryLocation.lat - pickupLocation.lat) * 1000}%`
            }}
            title={deliveryLocation.address || "Bezorglocatie"}
          >
            <Package className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Delivery location - Alleen delivery zonder pickup */}
        {deliveryLocation && !pickupLocation && (
          <div 
            className="absolute w-10 h-10 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20"
            style={{ left: '60%', top: '60%' }}
            title={deliveryLocation.address || "Bezorglocatie"}
          >
            <Package className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Driver location - Paarse scooter icoon - Tussen pickup en delivery */}
        {driverLocation && (
          <div 
            className={`absolute w-10 h-10 bg-purple-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20 ${enableRealTimeTracking ? 'animate-pulse' : ''}`}
            style={{ left: '45%', top: '40%' }}
            title="Bezorger onderweg"
          >
            <span className="text-white text-lg">🛴</span>
          </div>
        )}
        
        {/* Available drivers */}
        {showDrivers && (
          <>
            <div 
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-15"
              style={{ left: '25%', top: '30%' }}
              title="Jan - beschikbaar"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
            <div 
              className="absolute w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-15"
              style={{ left: '80%', top: '35%' }}
              title="Maria - beschikbaar"
            >
              <span className="text-white text-xs">🚚</span>
            </div>
          </>
        )}
        
        {/* Optimale route weergave - Vaste posities */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Hoofdroute lijn van pickup naar delivery */}
            <path
              d="M 50% 50% Q 55% 45% 60% 60%"
              stroke="#4f46e5"
              strokeWidth="5"
              fill="none"
              opacity="0.7"
              strokeLinecap="round"
            />
            {/* Geanimeerde overlay voor beweging effect */}
            <path
              d="M 50% 50% Q 55% 45% 60% 60%"
              stroke="#818cf8"
              strokeWidth="3"
              fill="none"
              strokeDasharray="12,8"
              strokeLinecap="round"
            >
              <animate 
                attributeName="stroke-dashoffset" 
                values="0;-20" 
                dur="3s" 
                repeatCount="indefinite" 
              />
            </path>
          </svg>
        )}
      </div>
      
      {/* Map controls overlay */}
      <div className="absolute bottom-32 right-4 flex flex-col space-y-2 z-30">
        <Button
          size="sm"
          variant="outline"
          className={`w-9 h-9 p-0 bg-white shadow-lg hover:bg-gray-50 transition-all duration-200 ${zoom >= 17 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          onClick={handleZoomIn}
          disabled={zoom >= 17}
          title="Inzoomen"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={`w-9 h-9 p-0 bg-white shadow-lg hover:bg-gray-50 transition-all duration-200 ${zoom <= 10 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          onClick={handleZoomOut}
          disabled={zoom <= 10}
          title="Uitzoomen"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-9 h-9 p-0 bg-white shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200"
          onClick={openFullMap}
          title="Volledige kaart openen"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend - Altijd alle iconen tonen */}
      <div className="absolute bottom-20 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-xs z-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Home className="h-2.5 w-2.5 text-white" />
            </div>
            <span>Ophaallocatie</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Package className="h-2.5 w-2.5 text-white" />
            </div>
            <span>Bezorglocatie</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🛴</span>
            </div>
            <span>Bezorger</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-indigo-500 rounded"></div>
            <span>Optimale route</span>
          </div>
        </div>
      </div>

      {/* Real-time tracking indicator */}
      {enableRealTimeTracking && (
        <div className="absolute top-4 left-4 z-30">
          <Badge className="bg-green-500 text-white animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
            Live tracking
          </Badge>
        </div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded z-30">
        © OpenStreetMap
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/90 px-3 py-1 rounded-full text-xs text-gray-700 shadow-sm border">
          {pickupLocation ? 'Ophaallocatie' : 'Amsterdam'} • Zoom: {zoom}/17
        </div>
      </div>
    </div>
  );
}