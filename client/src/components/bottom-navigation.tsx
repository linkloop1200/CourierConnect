import { Home, Clock, User } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onNavigate?: (path: string) => void;
}

export default function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onNavigate?.(path);
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="flex">
        <button 
          onClick={() => handleNavigation("/")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center space-y-1 transition-colors",
            isActive("/") ? "text-brand-blue" : "text-gray-400"
          )}
        >
          <Home className="text-lg" />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button 
          onClick={() => handleNavigation("/activity")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center space-y-1 transition-colors",
            isActive("/activity") ? "text-brand-blue" : "text-gray-400"
          )}
        >
          <Clock className="text-lg" />
          <span className="text-xs font-medium">Activiteit</span>
        </button>
        <button 
          onClick={() => handleNavigation("/account")}
          className={cn(
            "flex-1 py-3 flex flex-col items-center space-y-1 transition-colors",
            isActive("/account") ? "text-brand-blue" : "text-gray-400"
          )}
        >
          <User className="text-lg" />
          <span className="text-xs font-medium">Account</span>
        </button>
      </div>
    </nav>
  );
}
