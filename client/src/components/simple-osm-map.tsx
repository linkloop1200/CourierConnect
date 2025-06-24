import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleOsmMapProps {
  height?: string;
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
}

export default function SimpleOsmMap({
  height = "400px",
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false
}: SimpleOsmMapProps) {
  const [zoom, setZoom] = useState(13);
  
  // Auto-zoom wanneer locaties worden toegevoegd
  useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      setZoom(14);
    } else if (pickupLocation) {
      setZoom(15);
    } else {
      setZoom(13);
    }
  }, [pickupLocation, deliveryLocation]);
  
  // Amsterdam centrum
  const amsterdamCenter = { lat: 52.3676, lng: 4.9041 };
  
  // Bepaal kaart centrum
  const getMapCenter = () => {
    if (pickupLocation && deliveryLocation) {
      return {
        lat: (pickupLocation.lat + deliveryLocation.lat) / 2,
        lng: (pickupLocation.lng + deliveryLocation.lng) / 2
      };
    }
    return pickupLocation || amsterdamCenter;
  };
  
  const mapCenter = getMapCenter();
  
  // Bereken bounding box
  const getBoundingBox = () => {
    const latRange = 0.01 * Math.pow(2, 15 - zoom);
    const lngRange = 0.015 * Math.pow(2, 15 - zoom);
    
    return {
      minLat: mapCenter.lat - latRange,
      maxLat: mapCenter.lat + latRange,
      minLng: mapCenter.lng - lngRange,
      maxLng: mapCenter.lng + lngRange
    };
  };
  
  // Maak OpenStreetMap URL met alle markers
  const getMapUrl = () => {
    const bbox = getBoundingBox();
    let url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik`;
    
    // Voeg markers toe - alleen de eerste marker wordt getoond door OSM
    if (pickupLocation) {
      url += `&marker=${pickupLocation.lat},${pickupLocation.lng}`;
    }
    
    return url;
  };
  
  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 18));
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 10));
  
  const openFullMap = () => {
    const center = getMapCenter();
    window.open(`https://www.openstreetmap.org/#map=${zoom}/${center.lat}/${center.lng}`, '_blank');
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-white" style={{ height }}>
      {/* OpenStreetMap iframe */}
      <iframe
        src={getMapUrl()}
        className="w-full h-full"
        style={{ border: 'none' }}
        title="Kaart van Amsterdam"
        loading="lazy"
        key={`map-${zoom}-${mapCenter.lat.toFixed(4)}-${mapCenter.lng.toFixed(4)}`}
      />
      
      {/* Zoom controls - hoger gepositioneerd */}
      <div className="absolute bottom-20 right-6 flex flex-col space-y-3 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 18}
          className="w-12 h-12 p-0 bg-white shadow-xl hover:bg-gray-50 border-2 border-gray-200"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 10}
          className="w-12 h-12 p-0 bg-white shadow-xl hover:bg-gray-50 border-2 border-gray-200"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={openFullMap}
          className="w-12 h-12 p-0 bg-white shadow-xl hover:bg-gray-50 border-2 border-gray-200"
          title="Open volledige kaart"
        >
          <ExternalLink className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Verbeterde legenda met iconen */}
      {(pickupLocation || deliveryLocation || driverLocation) && (
        <div className="absolute top-6 left-6 bg-white backdrop-blur-sm rounded-xl p-5 shadow-2xl max-w-sm z-50 border-2 border-gray-300">
          <h3 className="font-bold text-gray-900 mb-4 text-base border-b border-gray-200 pb-2">📍 Locaties</h3>
          <div className="space-y-4 text-sm">
            {pickupLocation && (
              <div className="flex items-start space-x-4 p-2 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white text-base">🏠</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-green-800 text-base">Ophalen</div>
                  <div className="text-gray-700 text-sm leading-relaxed">{pickupLocation.address || `${pickupLocation.lat.toFixed(4)}, ${pickupLocation.lng.toFixed(4)}`}</div>
                </div>
              </div>
            )}
            {deliveryLocation && (
              <div className="flex items-start space-x-4 p-2 bg-red-50 rounded-lg">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white text-base">📦</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-red-800 text-base">Bezorgen naar</div>
                  <div className="text-gray-700 text-sm leading-relaxed">{deliveryLocation.address || `${deliveryLocation.lat.toFixed(4)}, ${deliveryLocation.lng.toFixed(4)}`}</div>
                </div>
              </div>
            )}
            {driverLocation && (
              <div className="flex items-start space-x-4 p-2 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white text-base">🛵</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-800 text-base">Bezorger onderweg</div>
                  {enableRealTimeTracking && (
                    <div className="text-sm text-purple-600 font-medium">● Live tracking actief</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {pickupLocation && deliveryLocation && (
            <div className="mt-5 pt-4 border-t-2 border-gray-300">
              <div className="flex items-center space-x-3 text-sm text-gray-800">
                <div className="w-6 h-2 bg-gradient-to-r from-green-500 via-blue-500 to-red-500 rounded-full shadow-sm"></div>
                <span className="font-semibold">Optimale route</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Extra visuele markers overlay om duidelijkheid te bieden */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Pickup locatie marker overlay */}
        {pickupLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-25">
            <div className="w-12 h-12 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-pulse">
              <span className="text-white text-lg">🏠</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Ophalen
            </div>
          </div>
        )}
        
        {/* Delivery locatie marker overlay */}
        {deliveryLocation && (
          <div className="absolute top-1/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2 z-25">
            <div className="w-12 h-12 bg-red-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-pulse">
              <span className="text-white text-lg">📦</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Bezorgen naar
            </div>
          </div>
        )}
        
        {/* Driver locatie marker overlay */}
        {driverLocation && (
          <div className="absolute top-2/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2 z-25">
            <div className={`w-10 h-10 bg-purple-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center ${enableRealTimeTracking ? 'animate-bounce' : 'animate-pulse'}`}>
              <span className="text-white text-sm">🛵</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Bezorger
            </div>
          </div>
        )}
        
        {/* Route lijn tussen pickup en delivery */}
        {pickupLocation && deliveryLocation && (
          <svg className="absolute inset-0 w-full h-full z-5">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            <path
              d="M 50% 50% Q 60% 30% 66% 33%"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeDasharray="8,4"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>
        )}
      </div>
      
      {/* Zoom level indicator */}
      <div className="absolute bottom-6 left-6 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium z-50 shadow-lg">
        Zoom: {zoom}
      </div>
    </div>
  );
}