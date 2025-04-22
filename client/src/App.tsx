import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import InventoryPage from "@/pages/inventory-page";
import AnimalsPage from "@/pages/animals-page";
import VaccinesPage from "@/pages/vaccines-page";
import SettingsPage from "@/pages/settings-page";
import SubscriptionPage from "@/pages/subscription-page";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={() => (
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/inventory" component={() => (
        <MainLayout>
          <InventoryPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/animals" component={() => (
        <MainLayout>
          <AnimalsPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/vaccines" component={() => (
        <MainLayout>
          <VaccinesPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/settings" component={() => (
        <MainLayout>
          <SettingsPage />
        </MainLayout>
      )} />
      <ProtectedRoute path="/subscription" component={() => (
        <MainLayout>
          <SubscriptionPage />
        </MainLayout>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
