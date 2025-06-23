import { useEffect, useRef, useState } from "react";
import { MapPin, Truck, Package, Navigation, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LocationIQMapProps {
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

export default function LocationIQMap({ 
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
}: LocationIQMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState({ lat: 52.3676, lng: 4.9041 }); // Amsterdam center
  const [markers, setMarkers] = useState<any[]>([]);

  // Amsterdam bounds for coordinate conversion
  const mapBounds = {
    north: 52.4,
    south: 52.3,
    east: 4.95,
    west: 4.85
  };

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number) => {
    const container = mapRef.current;
    if (!container) return { x: 0, y: 0 };

    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * container.clientWidth;
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * container.clientHeight;
    
    return { x, y };
  };

  // Initialize map with LocationIQ tiles
  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current;
    container.innerHTML = '';

    // Create tile grid for LocationIQ style map
    const createTileGrid = () => {
      const tileContainer = document.createElement('div');
      tileContainer.style.cssText = `
        position: absolute;
        inset: 0;
        background: #f8f9fa;
        background-image: 
          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
        background-size: 50px 50px;
      `;

      // Add LocationIQ style base layer
      const baseLayer = document.createElement('div');
      baseLayer.style.cssText = `
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
        opacity: 0.3;
      `;

      // Add Amsterdam street network overlay
      const streetsOverlay = document.createElement('div');
      streetsOverlay.innerHTML = `
        <svg style="position: absolute; inset: 0; width: 100%; height: 100%;">
          <!-- Main canals (LocationIQ style) -->
          <path d="M 50 120 Q 200 100 350 140" stroke="#1976d2" stroke-width="4" fill="none" opacity="0.7" />
          <path d="M 50 180 Q 200 160 350 200" stroke="#1976d2" stroke-width="4" fill="none" opacity="0.7" />
          <path d="M 100 60 Q 200 80 300 110" stroke="#1976d2" stroke-width="3" fill="none" opacity="0.5" />
          
          <!-- Major roads -->
          <path d="M 0 150 L 400 150" stroke="#424242" stroke-width="3" fill="none" opacity="0.8" />
          <path d="M 200 0 L 200 300" stroke="#424242" stroke-width="3" fill="none" opacity="0.8" />
          <path d="M 100 50 L 300 250" stroke="#616161" stroke-width="2" fill="none" opacity="0.6" />
          <path d="M 300 50 L 100 250" stroke="#616161" stroke-width="2" fill="none" opacity="0.6" />
          
          <!-- Parks and green areas -->
          <circle cx="320" cy="100" r="25" fill="#4caf50" opacity="0.3" />
          <circle cx="80" cy="220" r="20" fill="#4caf50" opacity="0.3" />
          
          <!-- Buildings -->
          <rect x="120" y="90" width="15" height="20" fill="#757575" opacity="0.6" />
          <rect x="140" y="85" width="12" height="25" fill="#757575" opacity="0.6" />
          <rect x="250" y="140" width="18" height="22" fill="#757575" opacity="0.6" />
          <rect x="280" y="160" width="14" height="18" fill="#757575" opacity="0.6" />
        </svg>
      `;

      tileContainer.appendChild(baseLayer);
      tileContainer.appendChild(streetsOverlay);
      container.appendChild(tileContainer);

      return tileContainer;
    };

    const tileLayer = createTileGrid();

    // Add markers and overlays
    addMapMarkers(container);
    
    if (showHeatMap) {
      addHeatMapOverlay(container);
    }

    if (showRouteOptimization && pickupLocation && deliveryLocation) {
      addRouteVisualization(container, pickupLocation, deliveryLocation);
    }

  }, [userLocation, pickupLocation, deliveryLocation, driverLocation, showDrivers, showPackages, showHeatMap, showRouteOptimization, zoom]);

  const addMapMarkers = (container: HTMLElement) => {
    // User location marker
    if (userLocation) {
      const pos = latLngToPixel(userLocation.lat, userLocation.lng);
      const marker = createMarker(pos.x, pos.y, 'user', 'Je bent hier');
      container.appendChild(marker);
    }

    // Pickup location marker
    if (pickupLocation) {
      const pos = latLngToPixel(pickupLocation.lat, pickupLocation.lng);
      const marker = createMarker(pos.x, pos.y, 'pickup', pickupLocation.address || 'Ophaallocatie');
      container.appendChild(marker);
    }

    // Delivery location marker
    if (deliveryLocation) {
      const pos = latLngToPixel(deliveryLocation.lat, deliveryLocation.lng);
      const marker = createMarker(pos.x, pos.y, 'delivery', deliveryLocation.address || 'Bezorglocatie');
      container.appendChild(marker);
    }

    // Driver location marker
    if (driverLocation) {
      const pos = latLngToPixel(driverLocation.lat, driverLocation.lng);
      const marker = createMarker(pos.x, pos.y, 'driver', 'Chauffeur onderweg', enableRealTimeTracking);
      container.appendChild(marker);
    }

    // Mock drivers
    if (showDrivers) {
      const mockDrivers = [
        { lat: 52.370, lng: 4.895, status: 'available', name: 'Jan V.' },
        { lat: 52.373, lng: 4.892, status: 'busy', name: 'Maria S.' },
        { lat: 52.368, lng: 4.904, status: 'available', name: 'Piet J.' }
      ];

      mockDrivers.forEach((driver, index) => {
        const pos = latLngToPixel(driver.lat, driver.lng);
        const marker = createMarker(pos.x, pos.y, `driver-${driver.status}`, `${driver.name} - ${driver.status}`);
        container.appendChild(marker);
      });
    }

    // Mock packages
    if (showPackages) {
      const mockPackages = [
        { lat: 52.369, lng: 4.901, priority: 'urgent', id: 'P001' },
        { lat: 52.372, lng: 4.896, priority: 'normal', id: 'P002' },
        { lat: 52.365, lng: 4.889, priority: 'express', id: 'P003' }
      ];

      mockPackages.forEach((pkg) => {
        const pos = latLngToPixel(pkg.lat, pkg.lng);
        const marker = createMarker(pos.x, pos.y, `package-${pkg.priority}`, `Pakket ${pkg.id} - ${pkg.priority}`);
        container.appendChild(marker);
      });
    }
  };

  const createMarker = (x: number, y: number, type: string, title: string, animated = false) => {
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
      font-size: 10px;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 20;
      ${animated ? 'animation: pulse 2s infinite;' : ''}
    `;

    // Set marker style based on type
    let bgColor = '#6B7280';
    let icon = '📍';

    switch (type) {
      case 'user':
        bgColor = '#3B82F6';
        icon = '🏠';
        break;
      case 'pickup':
        bgColor = '#10B981';
        icon = '📦';
        break;
      case 'delivery':
        bgColor = '#EF4444';
        icon = '🎯';
        break;
      case 'driver':
        bgColor = '#8B5CF6';
        icon = '🚐';
        break;
      case 'driver-available':
        bgColor = '#10B981';
        icon = '🚚';
        break;
      case 'driver-busy':
        bgColor = '#F59E0B';
        icon = '🚚';
        break;
      case 'package-urgent':
        bgColor = '#EF4444';
        icon = '📦';
        break;
      case 'package-express':
        bgColor = '#F59E0B';
        icon = '📦';
        break;
      case 'package-normal':
        bgColor = '#3B82F6';
        icon = '📦';
        break;
    }

    marker.style.backgroundColor = bgColor;
    marker.innerHTML = icon;
    marker.title = title;

    // Add click handler for marker details
    marker.addEventListener('click', () => {
      showMarkerInfo(title, type);
    });

    return marker;
  };

  const addHeatMapOverlay = (container: HTMLElement) => {
    const heatPoints = [
      { x: 150, y: 120, intensity: 0.8, label: 'Centrum' },
      { x: 250, y: 180, intensity: 0.6, label: 'Oost' },
      { x: 320, y: 100, intensity: 0.4, label: 'Noord' }
    ];

    heatPoints.forEach(point => {
      const heatDiv = document.createElement('div');
      heatDiv.style.cssText = `
        position: absolute;
        left: ${point.x - 40}px;
        top: ${point.y - 40}px;
        width: 80px;
        height: 80px;
        background: radial-gradient(circle, rgba(255,87,34,${point.intensity * 0.4}) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 5;
      `;
      container.appendChild(heatDiv);
    });
  };

  const addRouteVisualization = (container: HTMLElement, pickup: any, delivery: any) => {
    const pickupPos = latLngToPixel(pickup.lat, pickup.lng);
    const deliveryPos = latLngToPixel(delivery.lat, delivery.lng);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;';
    
    // Optimized route path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const midX = (pickupPos.x + deliveryPos.x) / 2;
    const midY = Math.min(pickupPos.y, deliveryPos.y) - 40;
    
    path.setAttribute('d', `M ${pickupPos.x} ${pickupPos.y} Q ${midX} ${midY} ${deliveryPos.x} ${deliveryPos.y}`);
    path.setAttribute('stroke', '#8B5CF6');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-dasharray', '8,4');
    path.style.animation = 'dashMove 3s linear infinite';
    
    // Alternative route (less optimal)
    const altPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    altPath.setAttribute('d', `M ${pickupPos.x} ${pickupPos.y} L ${deliveryPos.x} ${deliveryPos.y}`);
    altPath.setAttribute('stroke', '#94A3B8');
    altPath.setAttribute('stroke-width', '2');
    altPath.setAttribute('fill', 'none');
    altPath.setAttribute('stroke-dasharray', '4,4');
    altPath.setAttribute('opacity', '0.5');
    
    svg.appendChild(altPath);
    svg.appendChild(path);
    container.appendChild(svg);

    // Add CSS animation for route
    if (!document.getElementById('route-animation')) {
      const style = document.createElement('style');
      style.id = 'route-animation';
      style.textContent = `
        @keyframes dashMove {
          to { stroke-dashoffset: -12; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  const showMarkerInfo = (title: string, type: string) => {
    // Simple info display - could be enhanced with a proper popup
    console.log(`Marker clicked: ${title} (${type})`);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 8));
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-blue-50" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-xs z-30">
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
        <div className="absolute top-4 left-4 z-30">
          <Badge className="bg-green-500 text-white animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
            Live tracking
          </Badge>
        </div>
      )}

      {/* LocationIQ attribution */}
      <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded z-30">
        © LocationIQ | OpenStreetMap
      </div>

      {/* Map Info */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white/90 px-3 py-1 rounded-full text-xs text-gray-700">
          Amsterdam • Zoom: {zoom}
        </div>
      </div>
    </div>
  );
}