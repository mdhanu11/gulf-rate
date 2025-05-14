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
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
