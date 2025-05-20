import { useQuery } from '@tanstack/react-query';
import { Country } from '@shared/schema';

// Interface for country selection
export interface CountryOption {
  value: string;
  label: string;
  flag?: string;
  available: boolean;
}

// Hook to fetch all countries
export function useCountries() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/countries'],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 60 minutes
  });

  // Transform country data into a format suitable for UI components
  const countryOptions: CountryOption[] = Array.isArray(data) 
    ? data.map((country: Country) => ({
        value: country.code.toLowerCase(),
        label: country.name,
        flag: country.flag || undefined,
        available: country.available || false,
      }))
    : [];

  return {
    countries: data || [],
    countryOptions,
    isLoading,
    isError,
    refetch,
  };
}