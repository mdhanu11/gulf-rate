import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ExchangeRateWithProvider } from '@shared/schema';

// Define an interface that matches our API response for proper typing
interface ExchangeRateResponse {
  rates: any[];
  lastUpdated: string;
}

// Custom hook to fetch exchange rates
export function useExchangeRates(countryCode: string, currency: string) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [`/api/exchange-rates/${countryCode}/${currency}`],
    queryFn: async () => {
      // Add timestamp to bypass browser cache on deployed sites
      const timestamp = Date.now();
      const response = await axios.get(`/api/exchange-rates/${countryCode}/${currency}?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    },
    refetchOnWindowFocus: true, // Enable refetch on window focus for deployed sites
    staleTime: 0, // Always fetch fresh data, no stale time
    gcTime: 0, // Don't cache at all
    refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
  });

  return {
    // Extract rates from response or return empty array if not available
    data: data && Array.isArray((data as ExchangeRateResponse).rates) 
      ? (data as ExchangeRateResponse).rates 
      : [],
    isLoading,
    isError,
    refetch,
    lastUpdated: data ? (data as ExchangeRateResponse).lastUpdated : null,
  };
}

// Export a function to submit lead form data
export const submitLeadForm = async (formData: any) => {
  const response = await axios.post('/api/leads', formData);
  return response.data;
};
