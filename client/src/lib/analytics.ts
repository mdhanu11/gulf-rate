// Environment-based analytics.ts implementation

/**
 * Gets the Google Analytics measurement ID from the environment variable
 * @returns The Google Analytics measurement ID with G- prefix
 */
export const getMeasurementId = (): string => {
  const envId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Make sure we have a value
  if (!envId) {
    console.warn("Missing GA Measurement ID in environment variables");
    return "G-MISSING";
  }

  // Add G- prefix if it's missing
  return envId.startsWith("G-") ? envId : `G-${envId}`;
};

/**
 * Initializes Google Analytics for the React app
 * @returns True if successful, false otherwise
 */
export const initGA = (): boolean => {
  if (typeof window === "undefined") return false;

  const measurementId = getMeasurementId();

  // Set the script src attribute to include the measurement ID
  const gaScript = document.getElementById("ga-script");
  if (gaScript) {
    gaScript.setAttribute(
      "src",
      `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    );
  }

  // Initialize gtag if not already initialized
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  // Initialize GA
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
  });

  // Track app initialization event
  window.gtag("event", "app_initialized", {
    event_category: "lifecycle",
    event_label: "app_start",
  });

  console.log(
    "React app GA4 initialization successful with ID:",
    measurementId
  );
  return true;
};

/**
 * Tracks a page view
 * @param url The URL/path being viewed
 */
export const trackPageView = (url: string): void => {
  if (typeof window === "undefined" || !window.gtag) {
    console.warn("Google Analytics not initialized - cannot track page view");
    return;
  }

  const measurementId = getMeasurementId();

  window.gtag("config", measurementId, {
    page_path: url,
    send_page_view: true,
  });

  console.log("Page view tracked:", url);
};

/**
 * Tracks a custom event
 * @param action The event action
 * @param category Optional event category
 * @param label Optional event label
 * @param value Optional event value
 */
export const trackEvent = (
  action: string,
  category?: string,
  label?: string,
  value?: number
): void => {
  if (typeof window === "undefined" || !window.gtag) {
    console.warn("Google Analytics not initialized - cannot track event");
    return;
  }

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  console.log("Event tracked:", { action, category, label, value });
};

/**
 * Checks if analytics is initialized
 * @returns True if analytics is initialized, false otherwise
 */
export const checkAnalytics = (): boolean => {
  if (typeof window === "undefined") return false;

  const isInitialized = typeof window.gtag === "function";
  console.log("Analytics check:", {
    isInitialized,
    measurementId: getMeasurementId(),
  });

  return isInitialized;
};

/**
 * Performs a debug check of analytics
 * @returns True if analytics is initialized and debugging succeeded
 */
export const debugAnalytics = (): boolean => {
  if (typeof window === "undefined") return false;

  const hasGtag = typeof window.gtag === "function";
  const hasDataLayer = Array.isArray(window.dataLayer);
  const measurementId = getMeasurementId();

  if (hasGtag && hasDataLayer) {
    // Send a debug event
    window.gtag("event", "debug_check", {
      event_category: "debugging",
      event_label: "manual_check",
      measurement_id: measurementId,
    });

    console.log("Analytics debug check:", {
      hasGtag,
      hasDataLayer,
      dataLayerLength: hasDataLayer ? window.dataLayer.length : 0,
      measurementId,
      location: window.location.href,
      timestamp: new Date().toISOString(),
    });

    return true;
  }

  console.error("Analytics not properly initialized for debugging");
  return false;
};

// Extend Window interface to include GA variables
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
