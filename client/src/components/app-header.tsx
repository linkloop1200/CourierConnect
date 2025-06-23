import { Bell, Box } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  showNotifications?: boolean;
}

export default function AppHeader({ title = "Spoedpakketjes", showNotifications = true }: AppHeaderProps) {
  return (
    <header className="bg-brand-blue text-white p-4 flex items-center justify-between relative z-20">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-brand-blue font-bold text-lg">📦</span>
        </div>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {showNotifications && (
          <Bell className="text-lg" />
        )}
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium">JS</span>
        </div>
      </div>
    </header>
  );
}
