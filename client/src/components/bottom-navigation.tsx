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

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { path: "/", icon: Home, label: "Home" },
      { path: "/account", icon: User, label: "Account" }
    ];

    if (isCustomer) {
      return [
        baseItems[0], // Home
        { path: "/payment", icon: CreditCard, label: "Betaling" },
        { path: "/activity", icon: BarChart3, label: "Activiteit" },
        baseItems[1] // Account
      ];
    }

    if (isDriver) {
      return [
        baseItems[0], // Home
        { path: "/driver", icon: Truck, label: "Dashboard" },
        { path: "/activity", icon: BarChart3, label: "Activiteit" },
        baseItems[1] // Account
      ];
    }

    if (isAdmin) {
      return [
        baseItems[0], // Home
        { path: "/routing", icon: MapPin, label: "Routes" },
        { path: "/activity", icon: BarChart3, label: "Analytics" },
        baseItems[1] // Account
      ];
    }

    return [...baseItems, { path: "/activity", icon: BarChart3, label: "Activiteit" }];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex">
        {navigationItems.map(({ path, icon: IconComponent, label }) => (
          <button 
            key={path}
            onClick={() => handleNavigation(path)}
            className={cn(
              "flex-1 py-3 flex flex-col items-center space-y-1 transition-colors",
              isActive(path) ? "text-brand-blue" : "text-gray-400"
            )}
          >
            <IconComponent className="text-lg" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
