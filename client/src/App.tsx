// Updated App.tsx with simplified GA4 integration
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import HomePage from "@/pages/home";
import CountryPage from "@/pages/country-page";
import NotFound from "@/pages/not-found";

// Admin pages
import AdminLogin from "@/pages/admin/login";
import AdminExchangeRates from "@/pages/admin/exchange-rates";
import AdminProviders from "@/pages/admin/providers";
import AdminQuickUpdate from "@/pages/admin/quick-update";
import AccessDenied from "@/pages/admin/access-denied";

// Import analytics functions
import {
  initGA,
  trackPageView,
  trackEvent,
  checkAnalytics,
  debugAnalytics,
} from "./lib/analytics";

import "./lib/i18n"; // Import i18n configuration

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/:countryCode" component={CountryPage} />

      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/exchange-rates" component={AdminExchangeRates} />
      <Route path="/admin/providers" component={AdminProviders} />
      <Route path="/admin/quick-update" component={AdminQuickUpdate} />
      <Route path="/admin/access-denied" component={AccessDenied} />

      {/* 404 route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Separate component to use the analytics hook
function AnalyticsRouter() {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view whenever location changes
    if (window.gtag) {
      trackPageView(location);
      trackEvent("page_navigation", "navigation", location);
    }
  }, [location]);

  return <Router />;
}

function App() {
  const [analyticsReady, setAnalyticsReady] = useState(false);

  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Check if gtag is already available from HTML initialization
    if (typeof window.gtag === "function") {
      // Initialize our React app's analytics
      const success = initGA();
      setAnalyticsReady(success);

      // Force debug check after a delay
      setTimeout(() => {
        debugAnalytics();
      }, 3000);
    } else {
      console.warn("Google Analytics not available");
      setAnalyticsReady(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AnalyticsRouter />
        <Toaster />
        {!analyticsReady && process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "fixed",
              bottom: "10px",
              right: "10px",
              background: "#ffecb3",
              color: "#664d03",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              zIndex: 9999,
            }}
          >
            Analytics not initialized
          </div>
        )}
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

// Add gtag type to window
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    google_tag_manager?: Record<string, any>;
  }
}

export default App;
