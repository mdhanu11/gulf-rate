import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCountries } from '@/hooks/use-countries';

// Fallback country data in case the API is still loading
const fallbackCountries = [
  { 
    value: 'sa', 
    label: 'Saudi Arabia', 
    available: true, 
    flag: 'https://flagcdn.com/sa.svg'
  }
];

interface CountrySelectorProps {
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ className }) => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { countryOptions, isLoading } = useCountries();
  
  // Use fallback countries if API data is still loading
  const availableCountries = countryOptions.length > 0 ? countryOptions : fallbackCountries;
  
  // Extract current country code from URL
  const currentPath = location.split('/')[1].toLowerCase();
  const currentCountry = availableCountries.find(c => c.value === currentPath) || availableCountries[0];
  
  // Default to Saudi Arabia if no match
  const displayCountry = currentCountry || availableCountries[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium shadow-sm transition-colors min-w-[60px] ${className}`}>
        <div className="flex items-center justify-center w-6 h-6 overflow-hidden rounded-md shadow-sm bg-white">
          {displayCountry.flag ? (
            <img 
              src={displayCountry.flag} 
              alt={`${displayCountry.label} flag`} 
              className="w-full h-full object-cover" 
              loading="eager"
            />
          ) : (
            '🏳️'
          )}
        </div>
        <span className="uppercase font-semibold">{displayCountry.value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1 border border-gray-200 shadow-lg rounded-lg">
        {isLoading ? (
          <div className="p-3 text-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-1">{t('common.loading')}</p>
          </div>
        ) : (
          availableCountries.map((country) => (
            <DropdownMenuItem key={country.value} asChild>
              <Link 
                href={`/${country.value}`} 
                className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => {
                  if (window.gtag) {
                    window.gtag('event', 'country_change', {
                      event_category: 'navigation',
                      event_label: country.value
                    });
                  }
                }}
              >
                <div className="flex-shrink-0 w-7 h-5 overflow-hidden rounded mr-3 shadow-sm bg-white">
                  {country.flag ? (
                    <img 
                      src={country.flag} 
                      alt={`${country.label} flag`} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-base">🏳️</span>
                  )}
                </div>
                <span className="flex-1 font-medium">{country.label}</span>
                {country.available ? (
                  <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full font-medium ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('common.available')}
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium ml-2">
                    {t('common.comingSoon')}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
