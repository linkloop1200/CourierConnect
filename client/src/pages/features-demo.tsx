import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import RealTimeTracking from "@/components/real-time-tracking";
import PaymentProcessing from "@/components/payment-processing";
import DriverMobileApp from "@/components/driver-mobile-app";
import AdvancedRouting from "@/components/advanced-routing";
import InteractiveHeatMap from "@/components/interactive-heat-map";
import AutomatedDeliveryStatus from "@/components/automated-delivery-status";
import AddressAutocomplete from "@/components/address-autocomplete";
import MultilingualSupport from "@/components/multilingual-support";
import GamifiedRewards from "@/components/gamified-rewards";
import AnimatedPackageMovement from "@/components/animated-package-movement";
import InteractiveMilestoneCelebrations from "@/components/interactive-milestone-celebrations";
import PersonalizedDeliveryPreferences from "@/components/personalized-delivery-preferences";
import CommunityDeliveryFeedback from "@/components/community-delivery-feedback";
import SmartArrivalPredictor from "@/components/smart-arrival-predictor";

export default function FeaturesDemo() {
  const [selectedFeature, setSelectedFeature] = useState("tracking");
  const [selectedAddress, setSelectedAddress] = useState("");

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address.address);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Features Demo" showNotifications={false} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Spoedpakketjes Live Demo</h1>
          <p className="text-gray-600">Interactieve demonstratie van alle 14 geavanceerde functies</p>
        </div>

        <Tabs value={selectedFeature} onValueChange={setSelectedFeature} className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-7 gap-1 h-auto p-2">
            <TabsTrigger value="tracking" className="text-xs p-2">
              GPS Tracking
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs p-2">
              Betaling
            </TabsTrigger>
            <TabsTrigger value="driver" className="text-xs p-2">
              Chauffeur
            </TabsTrigger>
            <TabsTrigger value="routing" className="text-xs p-2">
              Route Opt.
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-xs p-2">
              Heat Map
            </TabsTrigger>
            <TabsTrigger value="automation" className="text-xs p-2">
              Status
            </TabsTrigger>
            <TabsTrigger value="autocomplete" className="text-xs p-2">
              Adres
            </TabsTrigger>
            <TabsTrigger value="multilingual" className="text-xs p-2">
              Talen
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-xs p-2">
              Rewards
            </TabsTrigger>
            <TabsTrigger value="animation" className="text-xs p-2">
              Animatie
            </TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs p-2">
              Mijlpalen
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs p-2">
              Voorkeuren
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs p-2">
              Feedback
            </TabsTrigger>
            <TabsTrigger value="predictor" className="text-xs p-2">
              AI Predictor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-blue-500">1</Badge>
                  <span>Real-time GPS Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RealTimeTracking deliveryId={1} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-green-500">2</Badge>
                  <span>Payment Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentProcessing 
                  amount="15.50" 
                  deliveryId={1} 
                  onPaymentComplete={() => console.log("Payment completed")} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="driver" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-orange-500">3</Badge>
                  <span>Driver Mobile App</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DriverMobileApp driverId={1} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-purple-500">4</Badge>
                  <span>Advanced Routing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedRouting driverId={1} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-red-500">5</Badge>
                  <span>Interactive Heat Map</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveHeatMap timeRange="today" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-yellow-500">6</Badge>
                  <span>Automated Delivery Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AutomatedDeliveryStatus deliveryId={1} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="autocomplete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-indigo-500">7</Badge>
                  <span>Address Autocomplete</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AddressAutocomplete 
                    placeholder="Voer adres in voor demo..."
                    onAddressSelect={handleAddressSelect}
                    showRecentAddresses={true}
                  />
                  {selectedAddress && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        Geselecteerd adres: <strong>{selectedAddress}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multilingual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-teal-500">8</Badge>
                  <span>Multilingual Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MultilingualSupport />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-pink-500">9</Badge>
                  <span>Gamified Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GamifiedRewards />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="animation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-indigo-500">10</Badge>
                  <span>Animated Package Movement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedPackageMovement deliveryId={1} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-purple-500">11</Badge>
                  <span>Interactive Milestone Celebrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveMilestoneCelebrations />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-cyan-500">12</Badge>
                  <span>Personalized Delivery Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalizedDeliveryPreferences />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-emerald-500">13</Badge>
                  <span>Community Delivery Feedback</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommunityDeliveryFeedback />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="bg-violet-500">14</Badge>
                  <span>Smart Arrival Time Predictor</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SmartArrivalPredictor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}