import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

// Hook to get localized provider names based on the current language
export function useLocalizedProviderNames() {
  const { i18n } = useTranslation();
  const [providerNames, setProviderNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocalizedNames = async () => {
      setIsLoading(true);
      try {
        // Try to load provider names for the current language
        const names = await import(`../locales/${i18n.language}/providers.json`).catch(() => null);
        
        if (names) {
          setProviderNames(names.default || names);
        } else {
          // Fallback to empty object if no translations available
          setProviderNames({});
        }
      } catch (error) {
        console.error("Error loading localized provider names:", error);
        setProviderNames({});
      } finally {
        setIsLoading(false);
      }
    };

    loadLocalizedNames();
  }, [i18n.language]);

  // Function to get a localized provider name or return the original name if no translation exists
  const getLocalizedName = (providerKey: string, fallbackName: string): string => {
    return providerNames[providerKey] || fallbackName;
  };

  return { getLocalizedName, isLoading };
}