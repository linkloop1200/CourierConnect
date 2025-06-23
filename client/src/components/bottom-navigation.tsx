import { Home, Clock, User, Package, Truck, Shield, CreditCard, MapPin, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

interface BottomNavigationProps {
  onNavigate?: (path: string) => void;
}

export default function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();
  const { currentRole, isCustomer, isDriver, isAdmin } = useUserRole();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onNavigate?.(path);
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  // Role-based navigation items - limited to 4 items max
  const getNavigationItems = () => {
    if (isCustomer) {
      return [
        { path: "/", icon: Home, label: "Home" },
        { path: "/payment", icon: CreditCard, label: "Betaling" },
        { path: "/activity", icon: BarChart3, label: "Activiteit" },
        { path: "/account", icon: User, label: "Account" }
      ];
    }

    if (isDriver) {
      return [
        { path: "/", icon: Home, label: "Home" },
        { path: "/driver", icon: Truck, label: "Dashboard" },
        { path: "/activity", icon: BarChart3, label: "Activiteit" },
        { path: "/account", icon: User, label: "Account" }
      ];
    }

    if (isAdmin) {
      return [
        { path: "/", icon: Home, label: "Home" },
        { path: "/routing", icon: MapPin, label: "Routes" },
        { path: "/activity", icon: BarChart3, label: "Analytics" },
        { path: "/account", icon: User, label: "Account" }
      ];
    }

    return [
      { path: "/", icon: Home, label: "Home" },
      { path: "/activity", icon: BarChart3, label: "Activiteit" },
      { path: "/account", icon: User, label: "Account" }
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex justify-center max-w-sm mx-auto">
        {navigationItems.map(({ path, icon: IconComponent, label }) => (
          <button 
            key={path}
            onClick={() => handleNavigation(path)}
            className={cn(
              "flex flex-col items-center space-y-1 py-2 px-2 transition-colors flex-1 max-w-20",
              isActive(path) ? "text-brand-blue bg-blue-50" : "text-gray-400"
            )}
          >
            <IconComponent className="h-4 w-4" />
            <span className="text-xs font-medium truncate w-full text-center">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
