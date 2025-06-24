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
  
  // Maak OpenStreetMap URL zonder markers - gebruik alleen de kaart
  const getMapUrl = () => {
    const bbox = getBoundingBox();
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik`;
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
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 18}
          className="w-10 h-10 p-0 bg-white shadow-lg hover:bg-gray-50"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 10}
          className="w-10 h-10 p-0 bg-white shadow-lg hover:bg-gray-50"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={openFullMap}
          className="w-10 h-10 p-0 bg-white shadow-lg hover:bg-gray-50"
          title="Open volledige kaart"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Locatie informatie rechtsboven */}
      {(pickupLocation || deliveryLocation || driverLocation) && (
        <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-xl max-w-sm z-40 border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Locaties</h3>
          <div className="space-y-3 text-sm">
            {pickupLocation && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">🏠</span>
                </div>
                <div>
                  <div className="font-medium text-green-700">Ophalen</div>
                  <div className="text-gray-600 text-xs">{pickupLocation.address}</div>
                </div>
              </div>
            )}
            {deliveryLocation && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">📦</span>
                </div>
                <div>
                  <div className="font-medium text-red-700">Bezorgen naar</div>
                  <div className="text-gray-600 text-xs">{deliveryLocation.address}</div>
                </div>
              </div>
            )}
            {driverLocation && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">🛵</span>
                </div>
                <div>
                  <div className="font-medium text-purple-700">Bezorger onderweg</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs z-30">
        Zoom: {zoom}
      </div>
    </div>
  );
}