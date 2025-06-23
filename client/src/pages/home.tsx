import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Package, Mail, Home as HomeIcon, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/app-header";
import EmbeddedOpenStreetMap from "@/components/embedded-openstreetmap";
import BottomNavigation from "@/components/bottom-navigation";
import type { Address } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const [bottomSheetHeight, setBottomSheetHeight] = useState('calc(100vh - 384px)');
  
  // Mock user ID for demo
  const userId = 1;
  
  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: [`/api/addresses/${userId}`],
  });

  const handleDeliveryType = (type: string) => {
    setLocation(`/delivery?type=${type}`);
  };

  const handleNewDelivery = () => {
    setLocation("/delivery");
  };

  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
    setBottomSheetHeight(isBottomSheetOpen ? '80px' : 'calc(100vh - 384px)');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const startY = touch.clientY;
    let moved = false;
    
    const handleTouchMove = (e: TouchEvent) => {
      moved = true;
      const touch = e.touches[0];
      const deltaY = touch.clientY - startY;
      
      if (deltaY > 30 && isBottomSheetOpen) {
        toggleBottomSheet();
      } else if (deltaY < -30 && !isBottomSheetOpen) {
        toggleBottomSheet();
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // If no movement, treat as tap
      if (!moved) {
        toggleBottomSheet();
      }
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <>
      <AppHeader />
      
      <EmbeddedOpenStreetMap 
        height="384px"
        showDrivers={true} 
        showPackages={true} 
        userLocation={{ lat: 52.3676, lng: 4.9041 }}
        pickupLocation={{ lat: 52.3700, lng: 4.8950 }}
        deliveryLocation={{ lat: 52.3650, lng: 4.9150 }}
        driverLocation={{ lat: 52.3680, lng: 4.9000 }}
        enableRealTimeTracking={true}
      />
      
      {/* Delivery Bottom Sheet */}
      <div 
        className={`floating-panel bg-white rounded-t-3xl absolute bottom-0 left-0 right-0 z-10 overflow-hidden transition-all duration-300 ease-in-out`}
        style={{ height: bottomSheetHeight }}
      >
        {/* Handle Bar - Clickable and Swipeable */}
        <div 
          className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6 cursor-pointer hover:bg-gray-400 transition-colors"
          onClick={toggleBottomSheet}
          onTouchStart={handleTouchStart}
        ></div>

        {/* Collapsed Header */}
        {!isBottomSheetOpen && (
          <div 
            className="px-6 py-3 text-center border-b border-gray-100"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-600">Bezorgopties</span>
              <div className="w-4 h-0.5 bg-gray-400 rounded"></div>
              <span className="text-xs text-blue-600 font-medium">Tik om te openen</span>
            </div>
          </div>
        )}

        <div className={`panel-scroll ${!isBottomSheetOpen ? 'hidden' : ''}`}>
          <div className="px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Waar wil je iets versturen?</h2>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              className="bg-brand-blue-light p-4 h-auto flex flex-col items-center space-y-2 hover:bg-blue-100 transition-colors border-transparent"
              onClick={() => handleDeliveryType("package")}
            >
              <Package className="text-brand-blue h-8 w-8" />
              <span className="text-brand-blue font-medium text-sm">Pakket</span>
            </Button>
            <Button
              variant="outline"
              className="bg-brand-blue-light p-4 h-auto flex flex-col items-center space-y-2 hover:bg-blue-100 transition-colors border-transparent"
              onClick={() => handleDeliveryType("letter")}
            >
              <Mail className="text-brand-blue h-8 w-8" />
              <span className="text-brand-blue font-medium text-sm">Brief</span>
            </Button>
          </div>

          {/* Recent Addresses */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recente adressen</h3>
            
            {isLoading ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ) : addresses && addresses.length > 0 ? (
              addresses.map((address) => (
                <div 
                  key={address.id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/delivery?address=${address.id}`)}
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {address.label === "Thuis" ? (
                      <HomeIcon className="text-gray-600 h-5 w-5" />
                    ) : (
                      <Building className="text-gray-600 h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{address.label}</p>
                    <p className="text-sm text-gray-500">{address.street}, {address.city}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Geen recente adressen gevonden</p>
              </div>
            )}
          </div>

          {/* Main CTA */}
          <Button 
            className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold hover:bg-brand-blue-dark transition-colors"
            onClick={handleNewDelivery}
          >
            Nieuwe bezorging
          </Button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}
