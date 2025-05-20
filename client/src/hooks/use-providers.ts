import { useQuery } from "@tanstack/react-query";

// Hook to fetch all providers
export function useProviders() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/providers"],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    providers: data || [],
    isLoading,
    isError,
    refetch,
  };
}

// Provider interface for typing
export interface Provider {
  id: number;
  providerKey: string;
  name: string;
  logo: string | null;
  logoText: string | null;
  logoColor: string | null;
  url: string;
  type: string;
  badge: string | null;
  active: boolean;
  sortOrder: number | null;
  countryCode: string;
}

// Hook to fetch providers filtered by country
export function useProvidersByCountry(countryCode: string) {
  const { data, isLoading, isError, refetch } = useQuery<Provider[]>({
    queryKey: [`/api/countries/${countryCode}/providers`],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!countryCode, // Only fetch when countryCode is available
  });

  return {
    providers: Array.isArray(data) ? data : [],
    isLoading,
    isError,
    refetch,
  };
}
