import { useQuery } from '@tanstack/react-query';

// Interface for currency data display
export interface CurrencyOption {
  value: string;
  label: string;
}

// Currency names mapping for display purposes
const currencyNames: Record<string, string> = {
  'INR': 'Indian Rupee',
  'PKR': 'Pakistani Rupee',
  'BDT': 'Bangladeshi Taka',
  'PHP': 'Philippine Peso',
  'NPR': 'Nepalese Rupee',
  'LKR': 'Sri Lankan Rupee',
  'IDR': 'Indonesian Rupiah',
  'EGP': 'Egyptian Pound',
  'MAD': 'Moroccan Dirham',
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
};

// Hook to fetch available currencies for a country
export function useAvailableCurrencies(countryCode: string) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [`/api/countries/${countryCode}/currencies`],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!countryCode, // Only fetch when countryCode is available
  });

  // Transform currency codes into label-value pairs for UI components
  const currencyOptions: CurrencyOption[] = Array.isArray(data) 
    ? data.map((currencyCode: string) => ({
        value: currencyCode,
        label: `${currencyCode} - ${currencyNames[currencyCode] || currencyCode}`
      })) 
    : [];

  return {
    currencies: data || [],
    currencyOptions,
    isLoading,
    isError,
    refetch,
  };
}