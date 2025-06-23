import { useQuery } from "@tanstack/react-query";
import { User, MapPin, Phone, Mail, Settings, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import type { Address } from "@shared/schema";

export default function Account() {
  // Mock user data
  const user = {
    fullName: "Jan Smit",
    email: "jan@example.com",
    phone: "+31612345678"
  };

  const userId = 1;
  
  const { data: addresses } = useQuery<Address[]>({
    queryKey: [`/api/addresses/${userId}`],
  });

  const menuItems = [
    { icon: MapPin, label: "Mijn adressen", count: addresses?.length || 0 },
    { icon: Settings, label: "Instellingen" },
    { icon: HelpCircle, label: "Help & Support" },
  ];

  return (
    <>
      <AppHeader title="Account" showNotifications={false} />
      
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="px-6 pt-6">
          {/* User Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="space-y-2 mb-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Icon className="text-gray-600 h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.count !== undefined && (
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.count}
                          </span>
                        )}
                        <div className="text-gray-400">›</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* App Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Spoedpakketjes</h3>
                <p className="text-sm text-gray-500 mb-2">Versie 1.0.0</p>
                <p className="text-xs text-gray-400">
                  Snelle en betrouwbare bezorgdienst in heel Nederland
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}