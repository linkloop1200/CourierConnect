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
  
  // Auto-zoom en centrering
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      setZoom(15); // Optimaal voor beide locaties
    } else if (pickupLocation) {
      setZoom(16); // Zoom in op einzelne locatie
    } else {
      setZoom(13); // Amsterdam overzicht
    }
  }, [pickupLocation?.lat, pickupLocation?.lng, deliveryLocation?.lat, deliveryLocation?.lng]);
  
  // Amsterdam center coordinates - altijd gefocust op Amsterdam
  const center = { lat: 52.3676, lng: 4.9041 };
  
  // Slimme centrering: tussen pickup en delivery als beide bestaan
  const mapCenter = (() => {
    if (pickupLocation && deliveryLocation) {
      return {
        lat: (pickupLocation.lat + deliveryLocation.lat) / 2,
        lng: (pickupLocation.lng + deliveryLocation.lng) / 2
      };
    }
    return pickupLocation || center;
  })();
  
  // Stabiele GPS-naar-pixel conversie - iconen blijven op plaats bij zoom
  const getMarkerPosition = (location: { lat: number; lng: number }) => {
    // Voor nu: eenvoudige vaste posities om het probleem te demonstreren
    if (pickupLocation && location === pickupLocation) {
      return { left: '40%', top: '50%' }; // Pickup altijd linksmidden
    }
    if (deliveryLocation && location === deliveryLocation) {
      return { left: '60%', top: '50%' }; // Delivery altijd rechtsmidden
    }
    if (driverLocation && location === driverLocation) {
      return { left: '50%', top: '45%' }; // Driver tussen beide in
    }
    
    // Fallback berekening voor andere markers
    const amsterdamCenter = { lat: 52.3676, lng: 4.9041 };
    const latOffset = (location.lat - amsterdamCenter.lat) * 1000;
    const lngOffset = (location.lng - amsterdamCenter.lng) * 1500;
    
    return { 
      left: `${Math.max(10, Math.min(90, 50 + lngOffset))}%`, 
      top: `${Math.max(10, Math.min(90, 50 - latOffset))}%` 
    };
  };

  // Bereken dynamische bounding box voor iframe
  const getBoundingBox = () => {
    const baseLatDiff = 0.055;
    const baseLngDiff = 0.10;
    const zoomMultiplier = Math.pow(0.5, zoom - 13);
    
    const latDiff = baseLatDiff * zoomMultiplier;
    const lngDiff = baseLngDiff * zoomMultiplier;
    
    return {
      minLat: mapCenter.lat - latDiff,
      maxLat: mapCenter.lat + latDiff,
      minLng: mapCenter.lng - lngDiff,
      maxLng: mapCenter.lng + lngDiff
    };
  };

  // Create OpenStreetMap iframe URL met exact dezelfde bounding box
  const getOsmUrl = () => {
    const bbox = getBoundingBox();
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng}%2C${bbox.minLat}%2C${bbox.maxLng}%2C${bbox.maxLat}&layer=mapnik`;
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
        key={`osm-${zoom}-${mapCenter.lat.toFixed(4)}-${mapCenter.lng.toFixed(4)}`}
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
        
        {/* Pickup location - Groen huis icoon */}
        {pickupLocation && (
          <div 
            className="absolute w-12 h-12 bg-green-500 rounded-full border-3 border-white shadow-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-200 z-20"
            style={getMarkerPosition(pickupLocation)}
            title={`Ophalen: ${pickupLocation.address || "Onbekend adres"}`}
          >
            <Home className="h-6 w-6 text-white" />
          </div>
        )}
        
        {/* Delivery location - Rood pakket icoon */}
        {deliveryLocation && (
          <div 
            className="absolute w-12 h-12 bg-red-500 rounded-full border-3 border-white shadow-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-200 z-20"
            style={getMarkerPosition(deliveryLocation)}
            title={`Bezorgen: ${deliveryLocation.address || "Onbekend adres"}`}
          >
            <Package className="h-6 w-6 text-white" />
          </div>
        )}
        
        {/* Driver location - Paarse scooter icoon */}
        {driverLocation && (
          <div 
            className={`absolute w-10 h-10 bg-purple-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-200 z-20 ${enableRealTimeTracking ? 'animate-bounce' : ''}`}
            style={getMarkerPosition(driverLocation)}
            title="Bezorger onderweg"
          >
            <span className="text-white text-lg">🛵</span>
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
        
        {/* Optimale route tussen pickup en delivery - Altijd zichtbaar */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="1"/>
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#dc2626" stopOpacity="1"/>
              </linearGradient>
              <filter id="glow">
                <feMorphology operator="dilate" radius="2"/>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {(() => {
              const pickupPos = getMarkerPosition(pickupLocation);
              const deliveryPos = getMarkerPosition(deliveryLocation);
              const startX = parseFloat(pickupPos.left as string);
              const startY = parseFloat(pickupPos.top as string);
              const endX = parseFloat(deliveryPos.left as string);
              const endY = parseFloat(deliveryPos.top as string);
              
              // Create curved path tussen werkelijke marker posities
              const midX = (startX + endX) / 2;
              const midY = Math.min(startY, endY) - 15; // Meer curve
              
              return (
                <>
                  {/* Schaduw lijn */}
                  <path
                    d={`M ${startX}% ${startY}% Q ${midX}% ${midY}% ${endX}% ${endY}%`}
                    fill="none"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Hoofdroute lijn */}
                  <path
                    d={`M ${startX}% ${startY}% Q ${midX}% ${midY}% ${endX}% ${endY}%`}
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    strokeDasharray="10,5"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    className="animate-pulse"
                  />
                </>
              );
            })()}
          </svg>
        )}
        
        {/* Legacy route display - fallback */}
        {pickupLocation && deliveryLocation && false && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
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