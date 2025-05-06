import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import HomePage from "@/pages/home";
import CountryPage from "@/pages/country-page";
import NotFound from "@/pages/not-found";
import "./lib/i18n"; // Import i18n configuration

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/:countryCode" component={CountryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Add Google Analytics page view tracking
  useEffect(() => {
    const handleLocationChange = () => {
      // Send page view to Google Analytics
      if (typeof window.gtag === "function") {
        window.gtag("config", "G-XXXXXXXXXX", {
          page_path: window.location.pathname + window.location.search,
        });
      }
    };

    // Track initial page load
    handleLocationChange();

    // Add any location change listener here if needed for SPA navigation
    
    return () => {
      // Clean up if needed
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

// Add gtag type to window
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

export default App;
