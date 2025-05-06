import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define country data with proper flag emojis and icons
const countries = [
  { 
    code: 'sa', 
    name: 'Saudi Arabia', 
    available: true, 
    flag: 'https://flagcdn.com/sa.svg',
    emoji: '🇸🇦'
  },
  { 
    code: 'ae', 
    name: 'UAE', 
    available: false, 
    flag: 'https://flagcdn.com/ae.svg',
    emoji: '🇦🇪'
  },
  { 
    code: 'qa', 
    name: 'Qatar', 
    available: false, 
    flag: 'https://flagcdn.com/qa.svg',
    emoji: '🇶🇦'
  },
  { 
    code: 'kw', 
    name: 'Kuwait', 
    available: false, 
    flag: 'https://flagcdn.com/kw.svg',
    emoji: '🇰🇼'
  },
  { 
    code: 'bh', 
    name: 'Bahrain', 
    available: false, 
    flag: 'https://flagcdn.com/bh.svg',
    emoji: '🇧🇭'
  },
  { 
    code: 'om', 
    name: 'Oman', 
    available: false, 
    flag: 'https://flagcdn.com/om.svg',
    emoji: '🇴🇲'
  },
];

interface CountrySelectorProps {
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ className }) => {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  // Extract current country code from URL
  const currentPath = location.split('/')[1].toLowerCase();
  const currentCountry = countries.find(c => c.code === currentPath) || countries[0];
  
  // Default to Saudi Arabia if no match
  const displayCountry = currentCountry || countries[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${className}`}>
        <div className="flex items-center justify-center w-6 h-6 overflow-hidden rounded-md shadow-sm bg-white">
          {displayCountry.flag ? (
            <img 
              src={displayCountry.flag} 
              alt={`${displayCountry.name} flag`} 
              className="w-full h-full object-cover" 
              loading="eager"
            />
          ) : (
            displayCountry.emoji
          )}
        </div>
        <span className="uppercase font-semibold">{displayCountry.code}</span>
        <i className="fas fa-chevron-down text-xs text-gray-500"></i>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1 border border-gray-200 shadow-lg rounded-lg">
        {countries.map((country) => (
          <DropdownMenuItem key={country.code} asChild>
            <Link 
              href={`/${country.code}`} 
              className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <div className="flex-shrink-0 w-7 h-5 overflow-hidden rounded mr-3 shadow-sm bg-white">
                {country.flag ? (
                  <img 
                    src={country.flag} 
                    alt={`${country.name} flag`} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                ) : (
                  <span className="text-base">{country.emoji}</span>
                )}
              </div>
              <span className="flex-1 font-medium">{country.name}</span>
              {country.available ? (
                <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full font-medium ml-2">
                  <i className="fas fa-check-circle mr-1"></i>
                  {t('common.available')}
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium ml-2">
                  {t('common.comingSoon')}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
