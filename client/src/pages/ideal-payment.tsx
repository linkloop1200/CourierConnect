import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Building2, CheckCircle, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Bank {
  id: string;
  name: string;
  logo: string;
  popular?: boolean;
}

export default function IdealPayment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const dutchBanks: Bank[] = [
    { id: 'ing', name: 'ING Bank', logo: '🟠', popular: true },
    { id: 'rabobank', name: 'Rabobank', logo: '🟡', popular: true },
    { id: 'abn', name: 'ABN AMRO', logo: '🟢', popular: true },
    { id: 'sns', name: 'SNS Bank', logo: '🟣' },
    { id: 'asn', name: 'ASN Bank', logo: '🟫' },
    { id: 'regiobank', name: 'RegioBank', logo: '🔵' },
    { id: 'triodos', name: 'Triodos Bank', logo: '🌱' },
    { id: 'knab', name: 'Knab', logo: '⚫' },
    { id: 'bunq', name: 'bunq', logo: '🌈' },
    { id: 'handelsbanken', name: 'Handelsbanken', logo: '🔷' }
  ];

  const popularBanks = dutchBanks.filter(bank => bank.popular);
  const otherBanks = dutchBanks.filter(bank => !bank.popular);

  const handlePayment = async () => {
    if (!selectedBank) {
      toast({
        title: "Selecteer een bank",
        description: "Kies je bank om door te gaan met betalen",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate redirect to bank
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Doorgestuurd naar je bank",
      description: "Je wordt nu doorgestuurd voor een veilige betaling",
    });

    // Simulate bank processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Betaling succesvol!",
      description: "Je bezorging is bevestigd en wordt verwerkt",
    });
    
    setIsProcessing(false);
    setLocation('/live/1');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/payment')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold">iDEAL Betaling</h1>
          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            NL
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Payment Amount */}
        <Card className="border-brand-blue bg-brand-blue-light">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-brand-blue">Te betalen bedrag</p>
              <p className="text-3xl font-bold text-brand-blue">€12.50</p>
              <p className="text-sm text-brand-blue/80">Spoedpakket Express</p>
            </div>
          </CardContent>
        </Card>

        {/* Bank Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Kies je bank</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Popular Banks */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Populaire banken</p>
              <div className="grid grid-cols-1 gap-2">
                {popularBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBank === bank.id
                        ? 'border-brand-blue bg-brand-blue-light'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBank(bank.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{bank.logo}</span>
                        <span className="font-medium">{bank.name}</span>
                      </div>
                      {selectedBank === bank.id && (
                        <CheckCircle className="h-5 w-5 text-brand-blue" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Banks */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Andere banken</p>
              <div className="grid grid-cols-2 gap-2">
                {otherBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBank === bank.id
                        ? 'border-brand-blue bg-brand-blue-light'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBank(bank.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{bank.logo}</span>
                      <span className="text-sm font-medium">{bank.name}</span>
                      {selectedBank === bank.id && (
                        <CheckCircle className="h-4 w-4 text-brand-blue ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* iDEAL Info */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Veilig betalen met iDEAL
                </p>
                <p className="text-xs text-green-700 mt-1">
                  iDEAL is de veilige betaalmethode van Nederlandse banken. 
                  Je wordt doorgestuurd naar de beveiligde omgeving van je bank.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Payment */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation('/payment')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Andere betaalmethode kiezen
            </Button>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button 
          className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold"
          onClick={handlePayment}
          disabled={isProcessing || !selectedBank}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Doorsturen naar bank...</span>
            </div>
          ) : (
            `Betaal €12.50 met iDEAL`
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          Door te betalen ga je akkoord met de{' '}
          <span className="text-brand-blue underline">voorwaarden van iDEAL</span> en{' '}
          <span className="text-brand-blue underline">Spoedpakketjes</span>
        </p>
      </div>
    </div>
  );
}