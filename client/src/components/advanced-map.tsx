import MapAlternative from "./map-alternative";

interface AdvancedMapProps {
  height?: string;
  showDrivers?: boolean;
  showPackages?: boolean;
  userLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number; address?: string };
  deliveryLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
  enableRealTimeTracking?: boolean;
  showHeatMap?: boolean;
  showRouteOptimization?: boolean;
}

export default function AdvancedMap(props: AdvancedMapProps) {
  return (
    <MapAlternative
      {...props}
      enableRealTimeTracking={props.enableRealTimeTracking}
      showHeatMap={props.showHeatMap}
      showRouteOptimization={props.showRouteOptimization}
    />
  );
}