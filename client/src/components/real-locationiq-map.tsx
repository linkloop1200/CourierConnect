import { useEffect, useRef, useState } from "react";
import { MapPin, Truck, Package, Navigation, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RealLocationIQMapProps {
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

// LocationIQ Map implementation using real API
export default function RealLocationIQMap({ 
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
}: RealLocationIQMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState({ lat: 52.3676, lng: 4.9041 }); // Amsterdam
  const [tiles, setTiles] = useState<{ [key: string]: HTMLImageElement }>({});
  const [loading, setLoading] = useState(true);

  const [apiKey, setApiKey] = useState<string>('');

  // Fetch LocationIQ API key from server
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/locationiq-key');
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.key);
        }
      } catch (error) {
        console.warn('Failed to fetch LocationIQ API key:', error);
      }
    };
    
    fetchApiKey();
  }, []);

  // Tile size (standard for web maps)
  const TILE_SIZE = 256;

  // Convert lat/lng to tile coordinates
  const latLngToTile = (lat: number, lng: number, zoom: number) => {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y };
  };

  // Convert lat/lng to pixel coordinates within the map
  const latLngToPixel = (lat: number, lng: number) => {
    const container = mapRef.current;
    if (!container) return { x: 0, y: 0 };

    const centerTile = latLngToTile(center.lat, center.lng, zoom);
    const pointTile = latLngToTile(lat, lng, zoom);
    
    const tileOffsetX = pointTile.x - centerTile.x;
    const tileOffsetY = pointTile.y - centerTile.y;
    
    const x = container.clientWidth / 2 + tileOffsetX * TILE_SIZE;
    const y = container.clientHeight / 2 + tileOffsetY * TILE_SIZE;
    
    return { x, y };
  };

  // Load LocationIQ tiles
  const loadTile = async (x: number, y: number, z: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load tile'));
      
      // LocationIQ tile URL format
      img.src = `https://maps.locationiq.com/v3/static/map?key=${apiKey}&size=256x256&zoom=${z}&center=${y},${x}&format=png&maptype=roads`;
    });
  };

  // Initialize map with real LocationIQ tiles
  useEffect(() => {
    if (!mapRef.current || !apiKey) return;

    const container = mapRef.current;
    container.innerHTML = '';
    
    // Create canvas for tile rendering
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvas.style.cssText = 'position: absolute; inset: 0; z-index: 1;';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    container.appendChild(canvas);

    // Load and render tiles
    const renderMap = async () => {
      setLoading(true);
      
      try {
        // Get center tile coordinates
        const centerTile = latLngToTile(center.lat, center.lng, zoom);
        
        // Calculate visible tile range
        const tilesX = Math.ceil(canvas.width / TILE_SIZE) + 2;
        const tilesY = Math.ceil(canvas.height / TILE_SIZE) + 2;
        
        const startX = centerTile.x - Math.floor(tilesX / 2);
        const startY = centerTile.y - Math.floor(tilesY / 2);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create simple tile-like background while loading
        ctx.fillStyle = '#f0f4f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add street pattern
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < canvas.width; i += 50) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        
        for (let i = 0; i < canvas.height; i += 50) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(canvas.width, i);
          ctx.stroke();
        }

        // Add Amsterdam-style features
        addAmsterdamFeatures(ctx, canvas);
        
        setLoading(false);
        
        // Load actual LocationIQ tiles (simplified for demo)
        // In production, you would load multiple tiles to cover the viewport
        try {
          const mainTileImg = await loadLocationIQStaticMap();
          if (mainTileImg) {
            ctx.globalAlpha = 0.8;
            ctx.drawImage(mainTileImg, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
          }
        } catch (error) {
          console.warn('LocationIQ tile loading failed, using fallback');
        }
        
      } catch (error) {
        console.error('Map rendering error:', error);
        setLoading(false);
      }
    };

    renderMap();
  }, [center, zoom, apiKey]);

  // Load LocationIQ static map
  const loadLocationIQStaticMap = async (): Promise<HTMLImageElement | null> => {
    try {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null); // Fallback gracefully
        
        // LocationIQ static map API
        const size = Math.min(mapRef.current?.clientWidth || 400, 640); // Max 640px for free tier
        img.src = `https://maps.locationiq.com/v3/static/map?key=${apiKey}&center=${center.lat},${center.lng}&zoom=${zoom}&size=${size}x${size}&format=png&maptype=roads`;
      });
    } catch (error) {
      return null;
    }
  };

  // Add Amsterdam-style map features
  const addAmsterdamFeatures = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Canals
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    
    // Main canals
    ctx.beginPath();
    ctx.moveTo(50, canvas.height * 0.4);
    ctx.quadraticCurveTo(canvas.width * 0.5, canvas.height * 0.35, canvas.width - 50, canvas.height * 0.45);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(50, canvas.height * 0.6);
    ctx.quadraticCurveTo(canvas.width * 0.5, canvas.height * 0.55, canvas.width - 50, canvas.height * 0.65);
    ctx.stroke();
    
    // Parks
    ctx.fillStyle = '#10b981';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(canvas.width * 0.8, canvas.height * 0.3, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(canvas.width * 0.2, canvas.height * 0.7, 25, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
  };

  // Add map markers after tiles are loaded
  useEffect(() => {
    if (!mapRef.current || loading) return;

    const container = mapRef.current;
    
    // Remove existing markers
    const existingMarkers = container.querySelectorAll('.map-marker');
    existingMarkers.forEach(marker => marker.remove());

    addMapMarkers(container);
    
    if (showHeatMap) {
      addHeatMapOverlay(container);
    }

    if (showRouteOptimization && pickupLocation && deliveryLocation) {
      addRouteVisualization(container, pickupLocation, deliveryLocation);
    }

  }, [userLocation, pickupLocation, deliveryLocation, driverLocation, showDrivers, showPackages, showHeatMap, showRouteOptimization, loading, zoom, center]);

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

    // Driver location marker with real-time animation
    if (driverLocation) {
      const pos = latLngToPixel(driverLocation.lat, driverLocation.lng);
      const marker = createMarker(pos.x, pos.y, 'driver', 'Chauffeur onderweg', enableRealTimeTracking);
      container.appendChild(marker);
    }

    // Mock drivers with realistic Amsterdam coordinates
    if (showDrivers) {
      const mockDrivers = [
        { lat: 52.370216, lng: 4.895168, status: 'available', name: 'Jan V.' },
        { lat: 52.373056, lng: 4.892222, status: 'busy', name: 'Maria S.' },
        { lat: 52.367584, lng: 4.904139, status: 'available', name: 'Piet J.' }
      ];

      mockDrivers.forEach((driver) => {
        const pos = latLngToPixel(driver.lat, driver.lng);
        const marker = createMarker(pos.x, pos.y, `driver-${driver.status}`, `${driver.name} - ${driver.status}`);
        container.appendChild(marker);
      });
    }

    // Mock packages
    if (showPackages) {
      const mockPackages = [
        { lat: 52.369719, lng: 4.901047, priority: 'urgent', id: 'P001' },
        { lat: 52.371807, lng: 4.896029, priority: 'normal', id: 'P002' },
        { lat: 52.364737, lng: 4.889244, priority: 'express', id: 'P003' }
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
    marker.setAttribute('class', 'map-marker');
    marker.style.cssText = `
      position: absolute;
      left: ${x - 15}px;
      top: ${y - 15}px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 20;
      transition: transform 0.2s ease;
      ${animated ? 'animation: pulse 2s infinite;' : ''}
    `;

    // Set marker style and icon based on type
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

    // Hover effects
    marker.addEventListener('mouseenter', () => {
      marker.style.transform = 'scale(1.2)';
    });
    
    marker.addEventListener('mouseleave', () => {
      marker.style.transform = 'scale(1)';
    });

    return marker;
  };

  const addHeatMapOverlay = (container: HTMLElement) => {
    const heatPoints = [
      { x: container.clientWidth * 0.4, y: container.clientHeight * 0.4, intensity: 0.8 },
      { x: container.clientWidth * 0.6, y: container.clientHeight * 0.6, intensity: 0.6 },
      { x: container.clientWidth * 0.8, y: container.clientHeight * 0.3, intensity: 0.4 }
    ];

    heatPoints.forEach(point => {
      const heatDiv = document.createElement('div');
      heatDiv.setAttribute('class', 'map-marker');
      heatDiv.style.cssText = `
        position: absolute;
        left: ${point.x - 50}px;
        top: ${point.y - 50}px;
        width: 100px;
        height: 100px;
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
    svg.setAttribute('class', 'map-marker');
    svg.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 15;';
    
    // Optimized route
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const midX = (pickupPos.x + deliveryPos.x) / 2;
    const midY = Math.min(pickupPos.y, deliveryPos.y) - 50;
    
    path.setAttribute('d', `M ${pickupPos.x} ${pickupPos.y} Q ${midX} ${midY} ${deliveryPos.x} ${deliveryPos.y}`);
    path.setAttribute('stroke', '#8B5CF6');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-dasharray', '10,5');
    path.style.animation = 'dashMove 3s linear infinite';
    
    svg.appendChild(path);
    container.appendChild(svg);

    // Add CSS animation
    if (!document.getElementById('locationiq-animations')) {
      const style = document.createElement('style');
      style.id = 'locationiq-animations';
      style.textContent = `
        @keyframes dashMove {
          to { stroke-dashoffset: -15; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 8));
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-gray-300 bg-gray-100" style={{ height }}>
      <div ref={mapRef} className="w-full h-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">LocationIQ laden...</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md hover:bg-gray-50"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md hover:bg-gray-50"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md hover:bg-gray-50"
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
          Amsterdam • Zoom: {zoom} • LocationIQ
        </div>
      </div>
    </div>
  );
}