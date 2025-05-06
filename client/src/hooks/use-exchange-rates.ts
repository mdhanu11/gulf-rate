import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Provider } from '@shared/schema';

// Custom hook to fetch exchange rates
export function useExchangeRates(countryCode: string, currency: string) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [`/api/exchange-rates/${countryCode}/${currency}`],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data: data as Provider[],
    isLoading,
    isError,
    refetch,
    lastUpdated: data ? (data as any).lastUpdated : null,
  };
}

// Export a function to submit lead form data
export const submitLeadForm = async (formData: any) => {
  const response = await axios.post('/api/leads', formData);
  return response.data;
};
