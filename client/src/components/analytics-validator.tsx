import { useEffect, useState } from 'react';

// This component doesn't render anything - it just validates Google Analytics
export function AnalyticsValidator() {
  const [validated, setValidated] = useState(false);
  
  useEffect(() => {
    // Check if GA is initialized
    const checkGA = () => {
      const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
      
      if (!measurementId) {
        console.error('Missing Google Analytics Measurement ID');
        return;
      }
      
      if (!window.gtag) {
        console.error('Google Analytics not initialized correctly (window.gtag missing)');
        return;
      }
      
      // Send a manual test event
      try {
        window.gtag('event', 'validation_test', {
          event_category: 'system',
          event_label: 'validation',
          value: Date.now()
        });
        console.log('Sent validation event to Google Analytics');
        setValidated(true);
      } catch (error) {
        console.error('Failed to send test event:', error);
      }
    };
    
    // Wait for GA to initialize
    const gaCheckInterval = setInterval(() => {
      if (window.gtag) {
        checkGA();
        clearInterval(gaCheckInterval);
      }
    }, 1000);
    
    // Cleanup
    return () => clearInterval(gaCheckInterval);
  }, []);
  
  return null; // This component doesn't render anything
}