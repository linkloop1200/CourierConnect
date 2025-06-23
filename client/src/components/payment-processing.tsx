import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, Smartphone, Banknote, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentProcessingProps {
  amount: string;
  deliveryId: number;
  onPaymentComplete: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingTime: string;
}

export default function PaymentProcessing({ amount, deliveryId, onPaymentComplete }: PaymentProcessingProps) {
  const [selectedMethod, setSelectedMethod] = useState("ideal");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "ideal",
      name: "iDEAL",
      icon: <Banknote className="h-5 w-5 text-orange-600" />,
      description: "Direct betalen via je bank",
      processingTime: "Direct"
    },
    {
      id: "card",
      name: "Creditcard",
      icon: <CreditCard className="h-5 w-5 text-blue-600" />,
      description: "Visa, Mastercard, American Express",
      processingTime: "Direct"
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: <Smartphone className="h-5 w-5 text-blue-800" />,
      description: "Betaal met je PayPal account",
      processingTime: "Direct"
    },
    {
      id: "bancontact",
      name: "Bancontact",
      icon: <CreditCard className="h-5 w-5 text-purple-600" />,
      description: "Belgische banken",
      processingTime: "Direct"
    }
  ];

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      setProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return apiRequest({
        url: `/api/deliveries/${deliveryId}/payment`,
        method: "POST",
        body: paymentData
      });
    },
    onSuccess: () => {
      toast({
        title: "Betaling succesvol",
        description: "Je pakket wordt nu verwerkt voor bezorging.",
      });
      onPaymentComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Betaling mislukt",
        description: error.message || "Er is een fout opgetreden bij het verwerken van de betaling.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setProcessing(false);
    }
  });

  const handlePayment = () => {
    const paymentData = {
      method: selectedMethod,
      amount: amount,
      deliveryId: deliveryId,
      cardDetails: selectedMethod === "card" ? cardDetails : null
    };

    processPaymentMutation.mutate(paymentData);
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

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Veilige betaling</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Totaal te betalen:</span>
            <span className="text-brand-blue">€{amount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Kies je betaalmethode</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {method.icon}
                    <div>
                      <Label htmlFor={method.id} className="font-medium cursor-pointer">
                        {method.name}
                      </Label>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">{method.processingTime}</span>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Card Details (if card payment selected) */}
      {selectedMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle>Creditcard gegevens</CardTitle>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Vervaldatum</Label>
                <Input
                  id="expiry"
                  placeholder="MM/JJ"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    setCardDetails(prev => ({ ...prev, expiry: value }));
                  }}
                  maxLength={5}
                />
              </div>
              
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails(prev => ({ 
                    ...prev, 
                    cvv: e.target.value.replace(/\D/g, '') 
                  }))}
                  maxLength={4}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cardName">Naam op kaart</Label>
              <Input
                id="cardName"
                placeholder="Jan Jansen"
                value={cardDetails.name}
                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
        <Shield className="h-4 w-4 text-green-600" />
        <span>Je betaalgegevens worden veilig versleuteld en niet opgeslagen op onze servers.</span>
      </div>

      <Separator />

      {/* Payment Button */}
      <Button 
        onClick={handlePayment}
        disabled={processing || (selectedMethod === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name))}
        className="w-full h-12 text-lg bg-brand-blue hover:bg-brand-blue-dark"
      >
        {processing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Verwerken...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Betaal €{amount}</span>
          </div>
        )}
      </Button>
    </div>
  );
}