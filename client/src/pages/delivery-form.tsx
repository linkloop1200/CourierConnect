import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Package, Mail, Zap, MapPin, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertDeliverySchema, type InsertDelivery } from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import EmbeddedOpenStreetMap from "@/components/embedded-openstreetmap";
import BottomNavigation from "@/components/bottom-navigation";

const deliveryTypes = [
  { id: "package", label: "Pakket", icon: Package },
  { id: "letter", label: "Brief", icon: Mail },
  { id: "express", label: "Express", icon: Zap },
];

export default function DeliveryForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("package");
  const [estimate, setEstimate] = useState<{ estimatedPrice: string; estimatedTime: number } | null>(null);

  const form = useForm<InsertDelivery>({
    resolver: zodResolver(insertDeliverySchema),
    defaultValues: {
      userId: 1, // Mock user ID
      type: "package",
      pickupStreet: "",
      pickupCity: "Amsterdam",
      pickupPostalCode: "",
      deliveryStreet: "",
      deliveryCity: "Amsterdam",
      deliveryPostalCode: "",
      estimatedPrice: "0",
      estimatedDeliveryTime: 45,
    },
  });

  const createDeliveryMutation = useMutation({
    mutationFn: async (data: InsertDelivery) => {
      const res = await apiRequest("POST", "/api/deliveries", data);
      return res.json();
    },
    onSuccess: (delivery) => {
      toast({
        title: "Bezorging aangevraagd!",
        description: `Je bestelling ${delivery.orderNumber} is in behandeling.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      setLocation(`/tracking/${delivery.id}`);
    },
    onError: (error) => {
      toast({
        title: "Fout bij aanvragen",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });

  const getEstimateMutation = useMutation({
    mutationFn: async (data: { type: string }) => {
      const res = await apiRequest("POST", "/api/estimate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setEstimate(data);
      form.setValue("estimatedPrice", data.estimatedPrice);
      form.setValue("estimatedDeliveryTime", data.estimatedTime);
    },
  });

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    form.setValue("type", type as "package" | "letter" | "express");
    getEstimateMutation.mutate({ type });
  };

  // Auto-calculate estimate when form fields change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "pickupPostalCode" || name === "deliveryPostalCode") {
        const pickup = form.getValues("pickupPostalCode");
        const delivery = form.getValues("deliveryPostalCode");
        const currentType = form.getValues("type");
        
        if (pickup && delivery && pickup.length >= 6 && delivery.length >= 6) {
          getEstimateMutation.mutate({ type: currentType });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, getEstimateMutation]);

  const onSubmit = (data: InsertDelivery) => {
    createDeliveryMutation.mutate(data);
  };

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <>
      <AppHeader />
      
      <EmbeddedOpenStreetMap height="256px" showDrivers={false} />
      
      {/* Delivery Form Bottom Sheet */}
      <div className="floating-panel bg-white rounded-t-3xl absolute bottom-0 left-0 right-0 z-10 overflow-hidden" style={{ height: "calc(100vh - 256px)" }}>
        {/* Handle Bar - Clickable Arrow */}
        <div className="flex justify-center py-2 cursor-pointer hover:bg-gray-50 transition-colors">
          <ChevronUp className="h-6 w-6 text-gray-400 hover:text-brand-blue transition-colors" />
        </div>

        <div className="px-6 pb-32 overflow-y-auto" style={{ height: "calc(100% - 40px)" }}>
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="w-8 h-8"
            >
              <ArrowLeft className="text-gray-600 h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold text-gray-900">Nieuwe bezorging</h2>
            <div></div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Package Type Selection */}
              <div>
                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Type verzending</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {deliveryTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        type="button"
                        variant="outline"
                        className={`p-3 h-auto flex flex-col items-center space-y-1 transition-colors ${
                          selectedType === type.id
                            ? "border-brand-blue bg-brand-blue-light"
                            : "border-gray-200 hover:border-brand-blue hover:bg-brand-blue-light"
                        }`}
                        onClick={() => handleTypeChange(type.id)}
                      >
                        <Icon className="text-brand-blue h-5 w-5" />
                        <span className="text-xs font-medium">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Pickup Address */}
              <FormField
                control={form.control}
                name="pickupStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Ophaaladres</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <Input
                          {...field}
                          placeholder="Voer ophaaladres in"
                          className="flex-1 bg-transparent border-none outline-none shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pickup Postal Code */}
              <FormField
                control={form.control}
                name="pickupPostalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Postcode ophaaladres"
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Address */}
              <FormField
                control={form.control}
                name="deliveryStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Bezorgadres</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                        <Input
                          {...field}
                          placeholder="Voer bezorgadres in"
                          className="flex-1 bg-transparent border-none outline-none shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Postal Code */}
              <FormField
                control={form.control}
                name="deliveryPostalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Postcode bezorgadres"
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Estimate */}
              {getEstimateMutation.isPending && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Berekenen prijs...</span>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-blue"></div>
                  </div>
                </div>
              )}
              
              {estimate && !getEstimateMutation.isPending && (
                <div className="bg-brand-blue-light p-4 rounded-xl border border-brand-blue/20">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-blue font-medium">Geschatte prijs</span>
                    <span className="text-brand-blue font-bold text-lg">{formatPrice(estimate.estimatedPrice)}</span>
                  </div>
                  <p className="text-xs text-brand-blue mt-1">
                    Geschatte levertijd: {estimate.estimatedTime} min
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-brand-blue text-white py-4 h-auto text-lg font-semibold hover:bg-brand-blue-dark transition-colors"
                  disabled={createDeliveryMutation.isPending}
                >
                  {createDeliveryMutation.isPending ? "Bezig..." : "Bezorging aanvragen"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}
