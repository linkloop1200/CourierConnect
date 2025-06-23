import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CreditCard, Smartphone, Wallet, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";

interface PaymentMethod {
  id: string;
  type: 'card' | 'ideal' | 'apple' | 'google';
  name: string;
  icon: React.ComponentType<any>;
  lastFour?: string;
  brand?: string;
}

interface DeliveryDetails {
  service: string;
  price: string;
  time: string;
  from: string;
  to: string;
}

export default function PaymentCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Mock delivery details
  const deliveryDetails: DeliveryDetails = {
    service: 'Spoedpakket Express',
    price: '€12.50',
    time: '30 minuten',
    from: 'Damrak 123, Amsterdam',
    to: 'Zuidas 456, Amsterdam'
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Creditcard / Debitcard',
      icon: CreditCard,
      lastFour: '4242',
      brand: 'Visa'
    },
    {
      id: 'ideal',
      type: 'ideal',
      name: 'iDEAL',
      icon: Wallet
    },
    {
      id: 'apple',
      type: 'apple', 
      name: 'Apple Pay',
      icon: Smartphone
    },
    {
      id: 'google',
      type: 'google',
      name: 'Google Pay',
      icon: Smartphone
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Betaling succesvol!",
      description: "Je bezorging is bevestigd en wordt verwerkt",
    });
    
    setIsProcessing(false);
    setLocation('/live/1');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/book')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Betaling</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overzicht bestelling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service</span>
              <span className="font-medium">{deliveryDetails.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Levertijd</span>
              <span className="font-medium">{deliveryDetails.time}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Van: {deliveryDetails.from}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Naar: {deliveryDetails.to}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Totaal</span>
              <span className="text-xl font-bold text-brand-blue">{deliveryDetails.price}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Betaalmethode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPayment === method.id
                      ? 'border-brand-blue bg-brand-blue-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (method.id === 'ideal') {
                      setLocation('/ideal');
                    } else {
                      setSelectedPayment(method.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{method.name}</span>
                    {method.lastFour && (
                      <span className="text-sm text-gray-500">•••• {method.lastFour}</span>
                    )}
                    {selectedPayment === method.id && method.id !== 'ideal' && (
                      <CheckCircle className="h-5 w-5 text-brand-blue ml-auto" />
                    )}
                    {method.id === 'ideal' && (
                      <span className="text-sm text-brand-blue">→</span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Card Details Form */}
        {selectedPayment === 'card' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kaartgegevens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Kaartnummer</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails(prev => ({ 
                    ...prev, 
                    number: formatCardNumber(e.target.value) 
                  }))}
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Vervaldatum</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails(prev => ({ 
                      ...prev, 
                      expiry: formatExpiry(e.target.value) 
                    }))}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails(prev => ({ 
                      ...prev, 
                      cvc: e.target.value.replace(/\D/g, '') 
                    }))}
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cardName">Naam op kaart</Label>
                <Input
                  id="cardName"
                  placeholder="J. de Vries"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ 
                    ...prev, 
                    name: e.target.value 
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Veilige betaling
                </p>
                <p className="text-xs text-green-700">
                  Je betaalgegevens worden veilig versleuteld en opgeslagen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button 
          className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold"
          onClick={handlePayment}
          disabled={isProcessing || (selectedPayment === 'card' && !cardDetails.number)}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Bezig met betalen...</span>
            </div>
          ) : (
            `Betaal ${deliveryDetails.price}`
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          Door je bestelling te plaatsen, ga je akkoord met onze{' '}
          <span className="text-brand-blue underline">Algemene voorwaarden</span> en{' '}
          <span className="text-brand-blue underline">Privacybeleid</span>
        </p>
      </div>

      <BottomNavigation onNavigate={setLocation} />
    </div>
  );
}