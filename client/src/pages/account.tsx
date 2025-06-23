import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, MapPin, Phone, Mail, Settings, HelpCircle, LogOut, Package, CreditCard, Star, Bell, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import type { Address, Delivery, User as UserType } from "@shared/schema";

export default function Account() {
  const [, setLocation] = useLocation();
  
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

  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: [`/api/deliveries/user/${userId}`],
  });

  // Calculate user statistics
  const userStats = deliveries ? {
    totalDeliveries: deliveries.length,
    completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
    totalSpent: deliveries.reduce((sum, d) => sum + parseFloat(d.finalPrice || d.estimatedPrice || '0'), 0),
    averageRating: 4.8, // Would come from ratings table
    memberSince: '2024',
    favoriteService: deliveries.length > 0 ? 
      deliveries.reduce((prev, curr) => 
        deliveries.filter(d => d.type === curr.type).length > 
        deliveries.filter(d => d.type === prev.type).length ? curr : prev
      ).type : 'express'
  } : {
    totalDeliveries: 0,
    completedDeliveries: 0,
    totalSpent: 0,
    averageRating: 0,
    memberSince: '2024',
    favoriteService: 'express'
  };

  const quickActions = [
    { icon: Package, label: "Nieuwe bezorging", action: () => setLocation("/"), color: "blue" },
    { icon: Truck, label: "Word bezorger", action: () => setLocation("/driver"), color: "green" },
    { icon: CreditCard, label: "Betalingen", action: () => setLocation("/payment"), color: "purple" },
    { icon: MapPin, label: "Route planning", action: () => setLocation("/routing"), color: "orange" },
  ];

  const menuItems = [
    { icon: MapPin, label: "Mijn adressen", count: addresses?.length || 0, action: () => {} },
    { icon: Bell, label: "Meldingen", action: () => {} },
    { icon: Shield, label: "Privacy & Veiligheid", action: () => {} },
    { icon: Settings, label: "Instellingen", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", action: () => {} },
  ];

  return (
    <>
      <AppHeader title="Account" showNotifications={false} />
      
      <div className="bg-gray-50 min-h-screen pb-20 overflow-y-auto">
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
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                    <Badge variant="secondary" className="text-xs">
                      Lid sinds {userStats.memberSince}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{userStats.averageRating.toFixed(1)} beoordeling</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Statistieken</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-blue">{userStats.totalDeliveries}</p>
                  <p className="text-sm text-gray-500">Totaal bezorgd</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{userStats.completedDeliveries}</p>
                  <p className="text-sm text-gray-500">Succesvol</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">€{userStats.totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Uitgegeven</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 capitalize">{userStats.favoriteService}</p>
                  <p className="text-sm text-gray-500">Favoriete service</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Snelle acties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-16 flex flex-col space-y-1"
                      onClick={action.action}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  );
                })}
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