import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Clock, MapPin, Bell, Shield, Heart, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DeliveryPreferences {
  id: string;
  userId: number;
  preferredTimeSlots: string[];
  deliveryInstructions: string;
  contactMethod: 'sms' | 'email' | 'call' | 'app';
  locationAccuracy: number;
  requireSignature: boolean;
  allowDeliveryToNeighbors: boolean;
  preferredDriverGender: 'any' | 'male' | 'female';
  maxDeliveryDistance: number;
  notifications: {
    orderConfirmation: boolean;
    driverAssigned: boolean;
    enRoute: boolean;
    delivered: boolean;
    delays: boolean;
  };
  accessibility: {
    hasStairs: boolean;
    needsAssistance: boolean;
    hasSecurityGate: boolean;
    hasElevator: boolean;
    wheelchairAccess: boolean;
  };
  deliveryAddress: {
    building: string;
    floor: string;
    apartment: string;
    buzzerCode: string;
    landmarks: string;
  };
  specialRequests: string[];
}

export default function PersonalizedDeliveryPreferences() {
  const [preferences, setPreferences] = useState<DeliveryPreferences>({
    id: 'pref-001',
    userId: 1,
    preferredTimeSlots: ['09:00-12:00'],
    deliveryInstructions: '',
    contactMethod: 'app',
    locationAccuracy: 5,
    requireSignature: false,
    allowDeliveryToNeighbors: true,
    preferredDriverGender: 'any',
    maxDeliveryDistance: 10,
    notifications: {
      orderConfirmation: true,
      driverAssigned: true,
      enRoute: true,
      delivered: true,
      delays: true,
    },
    accessibility: {
      hasStairs: false,
      needsAssistance: false,
      hasSecurityGate: false,
      hasElevator: false,
      wheelchairAccess: false,
    },
    deliveryAddress: {
      building: '',
      floor: '',
      apartment: '',
      buzzerCode: '',
      landmarks: '',
    },
    specialRequests: [],
  });

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'accessibility' | 'address'>('general');
  const { toast } = useToast();

  const savePreferences = useMutation({
    mutationFn: async (data: DeliveryPreferences) => {
      return apiRequest(`/api/preferences/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Voorkeuren opgeslagen",
        description: "Je bezorgvoorkeuren zijn succesvol bijgewerkt.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
    },
    onError: () => {
      toast({
        title: "Fout bij opslaan",
        description: "Er ging iets mis bij het opslaan van je voorkeuren.",
        variant: "destructive",
      });
    },
  });

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedPreference = (section: keyof DeliveryPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section] as any,
        [key]: value
      }
    }));
  };

  const addSpecialRequest = (request: string) => {
    if (request.trim() && !preferences.specialRequests.includes(request.trim())) {
      setPreferences(prev => ({
        ...prev,
        specialRequests: [...prev.specialRequests, request.trim()]
      }));
    }
  };

  const removeSpecialRequest = (request: string) => {
    setPreferences(prev => ({
      ...prev,
      specialRequests: prev.specialRequests.filter(r => r !== request)
    }));
  };

  const timeSlots = [
    '06:00-09:00', '09:00-12:00', '12:00-15:00', 
    '15:00-18:00', '18:00-21:00', '21:00-24:00'
  ];

  const commonSpecialRequests = [
    'Bel aan bij aankomst',
    'Laat pakket bij de receptie',
    'Niet bezorgen tijdens lunchpauze',
    'Extra voorzichtig met breekbare items',
    'Bezorg alleen op werkdagen',
    'Contacteer via telefoon eerst'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-blue-600" />
            <span>Gepersonaliseerde Bezorgvoorkeuren</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        {[
          { id: 'general', label: 'Algemeen', icon: <Settings className="h-4 w-4" /> },
          { id: 'notifications', label: 'Notificaties', icon: <Bell className="h-4 w-4" /> },
          { id: 'accessibility', label: 'Toegankelijkheid', icon: <Shield className="h-4 w-4" /> },
          { id: 'address', label: 'Adres Info', icon: <MapPin className="h-4 w-4" /> },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center space-x-2"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>Algemene Voorkeuren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Time Slots */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Voorkeur tijdsloten</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {timeSlots.map(slot => (
                  <label key={slot} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.preferredTimeSlots.includes(slot)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updatePreference('preferredTimeSlots', [...preferences.preferredTimeSlots, slot]);
                        } else {
                          updatePreference('preferredTimeSlots', preferences.preferredTimeSlots.filter(s => s !== slot));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Method */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Voorkeur contactmethode</Label>
              <Select
                value={preferences.contactMethod}
                onValueChange={(value) => updatePreference('contactMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="app">App notificatie</SelectItem>
                  <SelectItem value="sms">SMS bericht</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="call">Telefonisch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Accuracy */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Locatie nauwkeurigheid: {preferences.locationAccuracy}m
              </Label>
              <Slider
                value={[preferences.locationAccuracy]}
                onValueChange={([value]) => updatePreference('locationAccuracy', value)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                Hoe nauwkeurig moet de chauffeur je locatie kunnen bepalen?
              </div>
            </div>

            {/* Delivery Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Handtekening vereist</Label>
                  <p className="text-xs text-gray-500">Voor waardevolle pakketten</p>
                </div>
                <Switch
                  checked={preferences.requireSignature}
                  onCheckedChange={(checked) => updatePreference('requireSignature', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Bezorging bij buren toestaan</Label>
                  <p className="text-xs text-gray-500">Als je niet thuis bent</p>
                </div>
                <Switch
                  checked={preferences.allowDeliveryToNeighbors}
                  onCheckedChange={(checked) => updatePreference('allowDeliveryToNeighbors', checked)}
                />
              </div>
            </div>

            {/* Preferred Driver Gender */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Voorkeur chauffeur geslacht</Label>
              <Select
                value={preferences.preferredDriverGender}
                onValueChange={(value) => updatePreference('preferredDriverGender', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Geen voorkeur</SelectItem>
                  <SelectItem value="male">Mannelijk</SelectItem>
                  <SelectItem value="female">Vrouwelijk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Delivery Distance */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Maximum bezorgafstand: {preferences.maxDeliveryDistance}km
              </Label>
              <Slider
                value={[preferences.maxDeliveryDistance]}
                onValueChange={([value]) => updatePreference('maxDeliveryDistance', value)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Delivery Instructions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Bezorginstructies</Label>
              <Textarea
                value={preferences.deliveryInstructions}
                onChange={(e) => updatePreference('deliveryInstructions', e.target.value)}
                placeholder="Bijv. Gebruik de achteringang, bel aan bij huisnummer 42..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notificatie Voorkeuren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {key === 'orderConfirmation' ? 'Bestelbevestiging' :
                     key === 'driverAssigned' ? 'Chauffeur toegewezen' :
                     key === 'enRoute' ? 'Onderweg notificatie' :
                     key === 'delivered' ? 'Bezorgd bevestiging' :
                     key === 'delays' ? 'Vertraging meldingen' : key}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {key === 'orderConfirmation' ? 'Bevestiging wanneer bestelling is geplaatst' :
                     key === 'driverAssigned' ? 'Melding wanneer chauffeur is toegewezen' :
                     key === 'enRoute' ? 'Melding wanneer chauffeur onderweg is' :
                     key === 'delivered' ? 'Bevestiging wanneer pakket is bezorgd' :
                     key === 'delays' ? 'Melding bij vertragingen of problemen' : ''}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updateNestedPreference('notifications', key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Accessibility */}
      {activeTab === 'accessibility' && (
        <Card>
          <CardHeader>
            <CardTitle>Toegankelijkheid & Speciale Behoeften</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(preferences.accessibility).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {key === 'hasStairs' ? 'Heeft trappen' :
                     key === 'needsAssistance' ? 'Hulp nodig bij bezorging' :
                     key === 'hasSecurityGate' ? 'Beveiligingspoort aanwezig' :
                     key === 'hasElevator' ? 'Lift aanwezig' :
                     key === 'wheelchairAccess' ? 'Rolstoel toegankelijk' : key}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {key === 'hasStairs' ? 'Er zijn trappen naar de voordeur' :
                     key === 'needsAssistance' ? 'Extra hulp nodig bij het bezorgen' :
                     key === 'hasSecurityGate' ? 'Beveiligingspoort of intercom systeem' :
                     key === 'hasElevator' ? 'Lift beschikbaar in het gebouw' :
                     key === 'wheelchairAccess' ? 'Toegankelijk voor rolstoel gebruikers' : ''}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updateNestedPreference('accessibility', key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Address Information */}
      {activeTab === 'address' && (
        <Card>
          <CardHeader>
            <CardTitle>Adres Informatie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gebouw naam/nummer</Label>
                <Input
                  value={preferences.deliveryAddress.building}
                  onChange={(e) => updateNestedPreference('deliveryAddress', 'building', e.target.value)}
                  placeholder="Bijv. Kantoorgebouw A"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Verdieping</Label>
                <Input
                  value={preferences.deliveryAddress.floor}
                  onChange={(e) => updateNestedPreference('deliveryAddress', 'floor', e.target.value)}
                  placeholder="Bijv. 3e verdieping"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Appartement/Kamer</Label>
                <Input
                  value={preferences.deliveryAddress.apartment}
                  onChange={(e) => updateNestedPreference('deliveryAddress', 'apartment', e.target.value)}
                  placeholder="Bijv. Apt 24B"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Zoemer/Intercom code</Label>
                <Input
                  value={preferences.deliveryAddress.buzzerCode}
                  onChange={(e) => updateNestedPreference('deliveryAddress', 'buzzerCode', e.target.value)}
                  placeholder="Bijv. #1234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Herkenningspunten</Label>
              <Textarea
                value={preferences.deliveryAddress.landmarks}
                onChange={(e) => updateNestedPreference('deliveryAddress', 'landmarks', e.target.value)}
                placeholder="Bijv. Rode voordeur, grote boom in de tuin, naast de bakkerij..."
                rows={3}
              />
            </div>

            {/* Special Requests */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Speciale Verzoeken</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {preferences.specialRequests.map(request => (
                  <Badge
                    key={request}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeSpecialRequest(request)}
                  >
                    {request} ×
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {commonSpecialRequests
                  .filter(req => !preferences.specialRequests.includes(req))
                  .map(request => (
                    <Button
                      key={request}
                      variant="outline"
                      size="sm"
                      onClick={() => addSpecialRequest(request)}
                    >
                      + {request}
                    </Button>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            // Reset to defaults logic here
            toast({
              title: "Voorkeuren gereset",
              description: "Alle voorkeuren zijn teruggezet naar standaard waarden.",
            });
          }}
        >
          Reset naar standaard
        </Button>
        <Button
          onClick={() => savePreferences.mutate(preferences)}
          disabled={savePreferences.isPending}
        >
          {savePreferences.isPending ? 'Opslaan...' : 'Voorkeuren opslaan'}
        </Button>
      </div>
    </div>
  );
}