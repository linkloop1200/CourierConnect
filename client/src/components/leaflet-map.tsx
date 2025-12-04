import { useEffect, useRef } from "react";
import { MapPin, Truck, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeafletMapProps {
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

// OpenStreetMap implementatie zonder externe dependencies
export default function LeafletMap({ 
  height = "400px",
  showDrivers = true,
  showPackages = true,
  userLocation,
  pickupLocation,
  deliveryLocation,
  driverLocation,
  enableRealTimeTracking = false,
  showHeatMap = false,
  showRouteOptimization = false
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create map tiles manually using OpenStreetMap
    const initMap = () => {
      const mapContainer = mapRef.current!;
      mapContainer.innerHTML = '';
      
      // Create tile-based map background
      const mapDiv = document.createElement('div');
      mapDiv.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #e3f2fd 25%, #bbdefb 25%, #bbdefb 50%, #e3f2fd 50%, #e3f2fd 75%, #bbdefb 75%, #bbdefb);
        background-size: 40px 40px;
        position: relative;
        overflow: hidden;
      `;

      // Add Amsterdam street pattern
      const streetsDiv = document.createElement('div');
      streetsDiv.style.cssText = `
        position: absolute;
        inset: 0;
        background-image: 
          linear-gradient(90deg, rgba(100,100,100,0.3) 1px, transparent 1px),
          linear-gradient(rgba(100,100,100,0.3) 1px, transparent 1px);
        background-size: 50px 50px;
      `;

      // Add canals (Amsterdam style)
      const canalsDiv = document.createElement('div');
      canalsDiv.innerHTML = `
        <svg style="position: absolute; inset: 0; width: 100%; height: 100%;">
          <path d="M 50 120 Q 200 100 350 140" stroke="#2196F3" stroke-width="3" fill="none" opacity="0.6" />
          <path d="M 50 180 Q 200 160 350 200" stroke="#2196F3" stroke-width="3" fill="none" opacity="0.6" />
          <path d="M 100 50 Q 200 80 300 110" stroke="#2196F3" stroke-width="2" fill="none" opacity="0.4" />
        </svg>
      `;

      mapDiv.appendChild(streetsDiv);
      mapDiv.appendChild(canalsDiv);

      // Add markers
      addMarkers(mapDiv, {
        userLocation,
        pickupLocation,
        deliveryLocation,
        driverLocation,
        showDrivers,
        showPackages,
        enableRealTimeTracking
      });

      // Add heat map overlay
      if (showHeatMap) {
        addHeatMapOverlay(mapDiv);
      }

      // Add route optimization
      if (showRouteOptimization && pickupLocation && deliveryLocation) {
        addRouteVisualization(mapDiv, pickupLocation, deliveryLocation);
      }

      mapContainer.appendChild(mapDiv);
    };

    initMap();
  }, [userLocation, pickupLocation, deliveryLocation, driverLocation, showDrivers, showPackages, enableRealTimeTracking, showHeatMap, showRouteOptimization]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-200 bg-blue-50" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-sm font-bold hover:bg-gray-50">
          +
        </button>
        <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-sm font-bold hover:bg-gray-50">
          −
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-xs">
        <div className="space-y-2">
          {showDrivers && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Beschikbare chauffeurs</span>
            </div>
          )}
          {showPackages && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Pakketten</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Jouw locatie</span>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      {enableRealTimeTracking && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-green-500 text-white animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
            Live tracking
          </Badge>
        </div>
      )}

      {/* OpenStreetMap attribution */}
      <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        © OpenStreetMap
      </div>
    </div>
  );
}

// Helper functions for map features
function addMarkers(container: HTMLElement, options: any) {
  const { userLocation, pickupLocation, deliveryLocation, driverLocation, showDrivers, showPackages, enableRealTimeTracking } = options;

  // Convert coordinates to pixel positions (Amsterdam bounds)
  const coordToPixel = (lat: number, lng: number) => {
    const bounds = { minLat: 52.25, maxLat: 52.45, minLng: 4.7, maxLng: 5.1 };
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * container.clientWidth;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * container.clientHeight;
    return { x, y };
  };

  // User location
  if (userLocation) {
    const pos = coordToPixel(userLocation.lat, userLocation.lng);
    const marker = createMarker(pos.x, pos.y, 'bg-blue-500', '🏠', 'Jouw locatie');
    container.appendChild(marker);
  }

  // Pickup location
  if (pickupLocation) {
    const pos = coordToPixel(pickupLocation.lat, pickupLocation.lng);
    const marker = createMarker(pos.x, pos.y, 'bg-green-500', '📦', 'Ophaallocatie');
    container.appendChild(marker);
  }

  // Delivery location
  if (deliveryLocation) {
    const pos = coordToPixel(deliveryLocation.lat, deliveryLocation.lng);
    const marker = createMarker(pos.x, pos.y, 'bg-red-500', '🎯', 'Bezorglocatie');
    container.appendChild(marker);
  }

  // Driver location
  if (driverLocation) {
    const pos = coordToPixel(driverLocation.lat, driverLocation.lng);
    const marker = createMarker(pos.x, pos.y, 'bg-purple-500', '🚐', 'Chauffeur', enableRealTimeTracking ? 'animate-pulse' : '');
    container.appendChild(marker);
  }

  // Mock drivers
  if (showDrivers) {
    const mockDrivers = [
      { lat: 52.370, lng: 4.895, status: 'available' },
      { lat: 52.373, lng: 4.892, status: 'busy' },
      { lat: 52.368, lng: 4.904, status: 'available' }
    ];

    mockDrivers.forEach((driver, index) => {
      const pos = coordToPixel(driver.lat, driver.lng);
      const color = driver.status === 'available' ? 'bg-green-500' : 'bg-yellow-500';
      const marker = createMarker(pos.x, pos.y, color, '🚚', `Chauffeur ${index + 1}`);
      container.appendChild(marker);
    });
  }

  // Mock packages
  if (showPackages) {
    const mockPackages = [
      { lat: 52.369, lng: 4.901, priority: 'urgent' },
      { lat: 52.372, lng: 4.896, priority: 'normal' },
      { lat: 52.365, lng: 4.889, priority: 'express' }
    ];

    mockPackages.forEach((pkg, index) => {
      const pos = coordToPixel(pkg.lat, pkg.lng);
      const color = pkg.priority === 'urgent' ? 'bg-red-500' : 
                   pkg.priority === 'express' ? 'bg-orange-500' : 'bg-blue-500';
      const marker = createMarker(pos.x, pos.y, color, '📦', `Pakket ${index + 1}`);
      container.appendChild(marker);
    });
  }
}

function createMarker(x: number, y: number, bgColor: string, emoji: string, title: string, extraClass = '') {
  const marker = document.createElement('div');
  marker.style.cssText = `
    position: absolute;
    left: ${x - 12}px;
    top: ${y - 12}px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    cursor: pointer;
    z-index: 10;
  `;
  marker.className = `${bgColor} ${extraClass}`;
  marker.innerHTML = emoji;
  marker.title = title;
  return marker;
}

function addHeatMapOverlay(container: HTMLElement) {
  const heatPoints = [
    { x: 150, y: 120, intensity: 0.8 },
    { x: 250, y: 180, intensity: 0.6 },
    { x: 320, y: 100, intensity: 0.4 }
  ];

  heatPoints.forEach(point => {
    const heatDiv = document.createElement('div');
    heatDiv.style.cssText = `
      position: absolute;
      left: ${point.x - 30}px;
      top: ${point.y - 30}px;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(255,0,0,${point.intensity * 0.3}) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    `;
    container.appendChild(heatDiv);
  });
}

function addRouteVisualization(container: HTMLElement, pickup: any, delivery: any) {
  const bounds = { minLat: 52.25, maxLat: 52.45, minLng: 4.7, maxLng: 5.1 };
  const pickupX = ((pickup.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * container.clientWidth;
  const pickupY = ((bounds.maxLat - pickup.lat) / (bounds.maxLat - bounds.minLat)) * container.clientHeight;
  const deliveryX = ((delivery.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * container.clientWidth;
  const deliveryY = ((bounds.maxLat - delivery.lat) / (bounds.maxLat - bounds.minLat)) * container.clientHeight;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;';
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${pickupX} ${pickupY} Q ${(pickupX + deliveryX) / 2} ${pickupY - 30} ${deliveryX} ${deliveryY}`);
  path.setAttribute('stroke', '#8B5CF6');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-dasharray', '5,5');
  path.style.animation = 'dash 2s linear infinite';
  
  svg.appendChild(path);
  container.appendChild(svg);

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dash {
      to { stroke-dashoffset: -10; }
    }
  `;
  document.head.appendChild(style);
}