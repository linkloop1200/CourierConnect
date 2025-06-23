import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import DeliveryForm from "@/pages/delivery-form";
import Tracking from "@/pages/tracking";
import Activity from "@/pages/activity";
import Account from "@/pages/account";
import NotFound from "@/pages/not-found";
import FeaturesOverview from "@/pages/features-overview";
import UberStyleHome from "@/pages/uber-style-home";
import BookingFlow from "@/pages/booking-flow";
import DriverDashboard from "@/pages/driver-dashboard";
import RealTimeTracking from "@/pages/real-time-tracking";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/uber" component={UberStyleHome} />
      <Route path="/book" component={BookingFlow} />
      <Route path="/driver" component={DriverDashboard} />
      <Route path="/live/:id" component={RealTimeTracking} />
      <Route path="/delivery" component={DeliveryForm} />
      <Route path="/tracking/:id" component={Tracking} />
      <Route path="/activity" component={Activity} />
      <Route path="/account" component={Account} />
      <Route path="/features" component={FeaturesOverview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="max-w-md mx-auto bg-white shadow-2xl h-screen relative overflow-hidden">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
