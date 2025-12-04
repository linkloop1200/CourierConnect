import { MapPin, Truck, Package, Mail, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
}

export default function MapView({ 
  height = "h-96", 
  showDrivers = true, 
  showPackages = true,
  userLocation 
}: MapViewProps) {
  return (
    <div className={`map-container ${height} relative`}>
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-light to-blue-200"></div>
      
      {/* Mock Map Elements */}
      <div className="absolute inset-0 p-4">
        {/* Delivery Markers */}
        {showDrivers && (
          <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center shadow-lg">
            <Truck className="text-white text-sm" />
          </div>
        )}
        
        {showPackages && (
          <>
            <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Package className="text-white text-xs" />
            </div>
            <div className="absolute bottom-1/3 left-1/2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="text-white text-xs" />
            </div>
          </>
        )}
        
        {/* User Location */}
        <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-brand-blue rounded-full border-4 border-white shadow-lg status-active"></div>
        </div>
      </div>

      {/* Current Location Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg"
      >
        <Navigation className="text-brand-blue h-4 w-4" />
      </Button>
    </div>
  );
}
