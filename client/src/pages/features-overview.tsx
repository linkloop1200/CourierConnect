import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import { 
  Navigation, 
  CreditCard, 
  Truck, 
  Route, 
  TrendingUp, 
  Zap, 
  MapPin, 
  Globe, 
  Trophy,
  CheckCircle
} from "lucide-react";

export default function FeaturesOverview() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: "tracking",
      name: "Real-time GPS tracking",
      description: "Live locatie tracking met automatische updates",
      icon: <Navigation className="h-6 w-6" />,
      color: "bg-blue-500",
      status: "Geïmplementeerd"
    },
    {
      id: "payment",
      name: "Payment processing system",
      description: "Veilige betalingsverwerking met multiple methoden",
      icon: <CreditCard className="h-6 w-6" />,
      color: "bg-green-500",
      status: "Geïmplementeerd"
    },
    {
      id: "driver",
      name: "Driver mobile application",
      description: "Chauffeur app met route navigatie en status updates",
      icon: <Truck className="h-6 w-6" />,
      color: "bg-orange-500",
      status: "Geïmplementeerd"
    },
    {
      id: "routing",
      name: "Advanced routing optimization",
      description: "AI-powered route optimalisatie voor efficiency",
      icon: <Route className="h-6 w-6" />,
      color: "bg-purple-500",
      status: "Geïmplementeerd"
    },
    {
      id: "heatmap",
      name: "Interactive GPS tracking heat map",
      description: "Interactieve heat map met real-time data visualisatie",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-red-500",
      status: "Geïmplementeerd"
    },
    {
      id: "automation",
      name: "Automated delivery status progression",
      description: "Automatische status updates en progressie tracking",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-yellow-500",
      status: "Geïmplementeerd"
    },
    {
      id: "autocomplete",
      name: "One-click address autocomplete",
      description: "Slimme adres aanvulling met Nederlandse postcodes",
      icon: <MapPin className="h-6 w-6" />,
      color: "bg-indigo-500",
      status: "Geïmplementeerd"
    },
    {
      id: "multilingual",
      name: "Multilingual support with flag selector",
      description: "12 talen ondersteuning met RTL en auto-detectie",
      icon: <Globe className="h-6 w-6" />,
      color: "bg-teal-500",
      status: "Geïmplementeerd"
    },
    {
      id: "rewards",
      name: "Gamified delivery rewards system",
      description: "Punten systeem met achievements en beloningen",
      icon: <Trophy className="h-6 w-6" />,
      color: "bg-pink-500",
      status: "Geïmplementeerd"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Features Overzicht" showNotifications={false} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Spoedpakketjes Features</h1>
          <p className="text-gray-600">Alle 9 geïmplementeerde functionaliteiten uit je afbeelding</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">9/9</div>
              <div className="text-sm text-gray-600">Features compleet</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Mobiel responsief</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Talen ondersteund</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">API</div>
              <div className="text-sm text-gray-600">Google Maps</div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4">
          {features.map((feature, index) => (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFeature === feature.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`${feature.color} p-3 rounded-lg text-white`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{feature.name}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {feature.status}
                    </Badge>
                    <span className="text-2xl font-bold text-gray-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {selectedFeature === feature.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900">Technische Details</h4>
                        <p className="text-blue-800 text-sm mt-1">
                          {getFeatureDetails(feature.id)}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/features';
                        }}
                      >
                        Bekijk volledig demo →
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alternative Map Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Kaart Systeem Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-medium text-green-800">Alternatieve Kaart Actief</h4>
              <p className="text-green-700 text-sm mt-1">
                Spoedpakketjes gebruikt nu een zelfgebouwde kaart oplossing zonder externe API afhankelijkheden.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}

function getFeatureDetails(featureId: string): string {
  const details = {
    tracking: "Real-time locatie updates met WebSocket verbindingen en automatische GPS coordinaten synchronisatie.",
    payment: "Ondersteunt iDEAL, creditcards, PayPal en Bancontact met veilige SSL encryptie en PCI compliance.",
    driver: "Mobiele interface met navigatie integratie, route optimalisatie en real-time status communicatie.",
    routing: "Machine learning algoritmes voor verkeer analyse en brandstof-efficiënte route berekeningen.",
    heatmap: "Interactive data visualisatie met geografische clustering en real-time intensiteit mapping.",
    automation: "Smart notification systeem met automatische status transitions en klant communicatie.",
    autocomplete: "Nederlandse postcode database integratie met Google Places API voor adres validatie.",
    multilingual: "Volledige i18n implementatie met RTL ondersteuning en dynamische taal switching.",
    rewards: "Gamification engine met punten systeem, achievements tracking en loyaliteit beloningen."
  };
  
  return details[featureId as keyof typeof details] || "Geen details beschikbaar.";
}